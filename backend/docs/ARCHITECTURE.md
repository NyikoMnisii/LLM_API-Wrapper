# Architecture — Agrilite AI Agronomist API

> Companion to [`PRD.md`](./PRD.md) (what/why) — this document is the how.
> Last updated: 2026-08-06.

## 1. System Context

```
[Client: web/mobile app]
      |  HTTPS JSON (ChatPayload / query params)
      v
[FastAPI app  (app/main.py)]
      |  CORS, rate limiting, request-ID middleware, exception handlers
      v
[API routes  (app/api/routes/*.py)]  -- thin, no business logic
      |
      +--> WeatherService --> OpenMeteoClient --> Open-Meteo API
      |
      +--> AgronomistService ---> builds a per-request ToolExecutor
                |                 (app/tools/weather.py, closed over this
                |                  request's lat/lon default — see §4)
                v
           GeminiService --> GeminiClient --> Gemini API
                |
                +--> ToolExecutor.execute() (provider-agnostic)
```

## 2. Layering Rules

Each directory has one job. A change that doesn't fit should prompt a design
discussion, not a workaround:

| Directory | Responsibility | Must NOT contain |
|---|---|---|
| `app/api/` | HTTP concerns: parse request, call one service method, return response model | Business logic, provider SDK imports |
| `app/services/` | Business logic and orchestration | HTTP framework code |
| `app/tools/` | Adapts a service's capability into a `ToolSpec` for LLM function calling | Provider-specific types |
| `app/clients/` | Thin wrappers around third-party HTTP APIs; retries, request/response shape translation | Business rules |
| `app/models/` | Pydantic schemas — the data contracts other layers depend on | Logic |
| `app/core/` | Cross-cutting: config, logging, exceptions, rate limiting | Feature-specific code |
| `app/prompts/` | System prompt text, reviewable/versioned independent of code | Logic |

## 3. The Provider Boundary

`ToolSpec` / `ToolExecutor` (`app/services/tool_executor.py`) are intentionally
Gemini-agnostic — `ToolSpec` is just `{name, description, JSON-schema parameters,
async handler}`. `app/services/gemini_service.py` is the **only** file allowed to
import `google.genai` types; it is the adapter that turns a list of `ToolSpec`s into
Gemini's `FunctionDeclaration` format and runs Gemini's specific tool-calling loop.

**Why this matters:** adding or swapping an LLM provider (Claude, GPT, etc.) means
writing one new `app/services/<provider>_service.py`. `app/tools/`,
`app/services/weather_service.py`, and every API route stay untouched.

## 4. Request Lifecycle — `POST /api/v1/chat`

1. `chat.py` receives a `ChatPayload` (`message`, `history`, optional `latitude`/
   `longitude` — see §4a), delegates to `AgronomistService.answer()`.
2. `AgronomistService` builds a **fresh `ToolExecutor` for this request**, via
   `build_weather_tool_spec(weather_service, default_latitude, default_longitude)`
   — cheap object construction, not a network call. The `WeatherService` instance
   it closes over is still the shared singleton (cache intact); only the
   thin `ToolExecutor`/`ToolSpec` wrapper is per-request, so it can carry this
   request's location default. See §4a for why this couldn't stay a startup
   singleton.
3. `AgronomistService` delegates to
   `GeminiService.generate_structured_reply(message, history, tool_executor)`.
   `GeminiService` itself stays generic — it still knows nothing about weather
   specifically, only the `ToolExecutor`/`ToolSpec` abstraction it's handed.
4. `GeminiService` converts chat history to Gemini `Content` objects, builds
   `FunctionDeclaration`s from the passed-in `ToolExecutor`'s specs, and calls
   Gemini with `response_schema=AgronomistResponse` for structured JSON output.
5. If Gemini requests a tool call, `ToolExecutor.execute()` dispatches to the
   matching handler by name and returns the result to the model.
6. This loop repeats until Gemini stops requesting tools or `max_tool_hops` (default
   5) is hit — a hard cap against runaway tool-calling loops.
7. The final response text is parsed leniently (`app/utils/parser.py` strips
   markdown code fences some models wrap JSON in) and validated into
   `AgronomistResponse`. A malformed or empty model response raises
   `LLMGenerationError` rather than crashing the request.

### 4a. Default location vs. named location (decision, 2026-08-06)

The weather tool's `location` parameter is declared **optional** in its
`FunctionDeclaration`. Gemini is instructed (see `app/prompts/agronomist.py`) to
omit it unless the user names a specific place; when omitted, the tool handler
falls back to the request's `default_latitude`/`default_longitude` (from
`ChatPayload`) instead of asking Gemini to know or repeat back numeric
coordinates. Coordinates are never exposed to Gemini as values it has to reason
about — this avoids transcription errors and keeps the prompt/response cheap.

This is *why* the tool registry moved from an `app.state` singleton (built once at
startup) to something `AgronomistService` assembles per request: the default
location is request-scoped data (this user's current device position), and a
singleton built at process startup has no way to carry that. `GeminiClient`,
`WeatherService`, and the shared `httpx.AsyncClient` are unaffected — they remain
startup singletons (see §6).

## 5. Request Lifecycle — `GET /api/v1/weather/forecast`

Bypasses Gemini entirely and calls `WeatherService` directly. This route exists to
prove the weather logic is reusable outside the LLM path — e.g. a future dashboard
or the irrigation-scheduling tool (roadmap) could call the same service without
going through chat.

Accepts **either** `location` (free text) **or** `latitude`+`longitude` — the route
requires at least one (`InvalidRequestError`, 422, otherwise). This is the same
`get_agricultural_forecast` / `get_agricultural_forecast_by_coordinates` pair the
chat tool uses internally (§4a), so a home-screen client gets identical data to
what the LLM would ground its advice in.

### Location resolution logic — name path (`WeatherService.get_agricultural_forecast`)

1. Geocode the free-text location via Open-Meteo (cached, 1h TTL).
2. Filter results to populated places (`feature_code` starting `PPL`) before
   ranking — Open-Meteo's geocoder returns mountains, airports, and parks under the
   same name as real towns (e.g. "Stellenbosch" the town vs. the mountain), which
   previously caused false "which one did you mean?" clarifications on almost every
   query. See `app/services/weather_service.py::_is_populated_place`.
3. If the top two populated-place candidates share a name (e.g. two distinct towns
   both called "Iowa City" in different states), return
   `REQUIRES_CLARIFICATION` with up to 3 options rather than guessing.
4. Otherwise fetch the forecast for the top candidate and compute
   `frost_warning` (min temp <= 2°C) and `high_humidity_fungal_risk` (max humidity
   >= 85%) from the raw daily values.

### Location resolution logic — coordinate path (`WeatherService.get_agricultural_forecast_by_coordinates`)

No geocoding step at all — coordinates are unambiguous by construction, so this
path can never return `REQUIRES_CLARIFICATION`. It calls Open-Meteo's forecast
endpoint directly and builds the same `WeatherForecast` shape via a shared
`_forecast_from_daily` helper (the only piece of logic actually duplicated between
the two paths is "how to turn Open-Meteo's daily payload into our schema", which is
why it's factored out rather than copy-pasted). `resolved_location` is populated
from an optional client-supplied label, or left `null` — reverse geocoding is
explicitly out of scope (see PRD's Location Resolution Strategy decision).

## 6. State & Lifetime

- `httpx.AsyncClient`, `GeminiClient`, and `WeatherService` (with its in-memory
  geocode cache) are constructed **once** in `app.main.lifespan` and stored on
  `app.state` — shared across all requests, not rebuilt per request. This is what
  makes the geocode cache and HTTP connection pooling actually effective.
- The `ToolExecutor`/`ToolSpec` list, by contrast, is rebuilt on every `/chat` call
  (see §4a) — it's a lightweight wrapper carrying request-scoped defaults, not a
  connection or cache, so rebuilding it costs nothing meaningful.
- No database. No server-side chat-history storage — per PRD §6, the client resends
  full history each turn.

## 7. Known Constraints / Deliberate Non-Goals for V1

- `/chat` and `/weather/forecast` require a Supabase bearer token (`app/core/auth.py`,
  verified via JWKS — see PRD §5/§6), but there's no authorization beyond that: any
  authenticated user can call any endpoint, and identity isn't consumed for anything
  yet (no per-user data access, no persistence tied to `sub`).
- No horizontal-scaling story: the in-memory geocode cache and the `slowapi` rate
  limiter are per-process. Running more than one instance would need both moved to
  shared storage (e.g. Redis) — not needed until there's a reason to scale out.
- No metrics/tracing backend — structured logs with request-ID correlation only.
- No database migrations tooling, because there is no database yet. When
  persistence becomes an actual requirement (not before), add it with a real
  migration tool (e.g. Alembic) rather than hand-editing schema.

## 8. Testing Strategy

- `tests/test_weather.py` — `WeatherService` against a mocked Open-Meteo (via
  `respx`), covering success, not-found, and ambiguous-location paths.
- `tests/test_tools.py` — `ToolExecutor` dispatch and unknown-tool error handling,
  independent of any LLM provider.
- `tests/test_chat.py` — `/chat` route via FastAPI's `TestClient`, with
  `AgronomistService` swapped for a stub via dependency override so tests don't
  depend on a live Gemini call.
- Type correctness is enforced separately via `pyright` (not yet wired into CI —
  see Roadmap in PRD).
