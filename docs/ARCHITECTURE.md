# Architecture — Agrilite AI Agronomist API

> Companion to [`PRD.md`](./PRD.md) (what/why) — this document is the how.
> Last updated: 2026-08-04.

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
      +--> AgronomistService --> GeminiService --> GeminiClient --> Gemini API
                                      |
                                      +--> ToolExecutor (provider-agnostic)
                                               |
                                               +--> ToolSpec built from WeatherService
                                                    (app/tools/weather.py)
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

1. `chat.py` receives a `ChatPayload`, delegates to `AgronomistService.answer()`.
2. `AgronomistService` delegates to `GeminiService.generate_structured_reply()`.
3. `GeminiService` converts chat history to Gemini `Content` objects, builds
   `FunctionDeclaration`s from the registered `ToolSpec`s (currently just
   `get_agricultural_weather`), and calls Gemini with
   `response_schema=AgronomistResponse` for structured JSON output.
4. If Gemini requests a tool call, `ToolExecutor.execute()` dispatches to the
   matching handler by name and returns the result to the model.
5. This loop repeats until Gemini stops requesting tools or `max_tool_hops` (default
   5) is hit — a hard cap against runaway tool-calling loops.
6. The final response text is parsed leniently (`app/utils/parser.py` strips
   markdown code fences some models wrap JSON in) and validated into
   `AgronomistResponse`. A malformed or empty model response raises
   `LLMGenerationError` rather than crashing the request.

## 5. Request Lifecycle — `GET /api/v1/weather/forecast`

Bypasses Gemini entirely and calls `WeatherService` directly. This route exists to
prove the weather logic is reusable outside the LLM path — e.g. a future dashboard
or the irrigation-scheduling tool (roadmap) could call the same service without
going through chat.

### Location resolution logic (`WeatherService.get_agricultural_forecast`)

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

## 6. State & Lifetime

- `httpx.AsyncClient`, `GeminiClient`, and `WeatherService` (with its in-memory
  geocode cache) are constructed **once** in `app.main.lifespan` and stored on
  `app.state` — shared across all requests, not rebuilt per request. This is what
  makes the geocode cache and HTTP connection pooling actually effective.
- No database. No server-side chat-history storage — per PRD §6, the client resends
  full history each turn.

## 7. Known Constraints / Deliberate Non-Goals for V1

- No auth layer (see PRD gap — must close before public deployment).
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
