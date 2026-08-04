# Product Requirements Document — Agrilite AI Agronomist API

> This document is the source of truth for scope. If a feature isn't written here,
> it isn't in scope — propose a change to this file before building it, not after.
> Last updated: 2026-08-04.

## 1. Objective & Value Proposition

Give farmers fast, structured, science-grounded agronomy advice through natural-language
chat, automatically grounded in real-time weather-risk data (frost, precipitation,
humidity/fungal risk) for their specific location — without them having to cross-reference
a separate weather source themselves.

## 2. Target User & Deployment Context

- General and commercial farmers, accessed through a web or mobile client over normal
  connectivity (3G/4G/WiFi/broadband). No offline, low-bandwidth, or voice-first
  constraints for V1.
- This repository is the **backend API only**. No client application lives here; a
  future web/mobile/WhatsApp/SMS front end is expected to consume this API.

## 3. V1 Scope — What Is Actually Built

| Feature | Endpoint | Status |
|---|---|---|
| Structured agronomy chat, grounded via Gemini function calling | `POST /api/v1/chat` | Implemented |
| Weather-risk lookup (frost, precipitation, fungal-risk humidity) | `GET /api/v1/weather/forecast` | Implemented |
| Location disambiguation (rejects guessing on ambiguous place names) | via both above | Implemented |
| Health/readiness checks | `GET /api/v1/health`, `/health/ready` | Implemented |
| Rate limiting, structured logging, centralized config, typed errors | cross-cutting | Implemented |
| Dockerized deployment | `Dockerfile`, `docker-compose.yml` | Implemented |

Full request/response shapes are in [`API_CONTRACTS.md`](./API_CONTRACTS.md); the
system's internal structure is in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## 4. Out of Scope for V1 — Roadmap

The following have a reserved placeholder module (`app/tools/<name>.py`) but **no
implementation**. Their existence as empty files is not a commitment to a specific
design — it only marks where the work would plug in, following the same
`ToolSpec`/`ToolExecutor` pattern as the weather tool:

- Soil analysis
- Irrigation scheduling
- Spraying advisories
- Fertilizer recommendations
- Harvest timing

Mentioned during initial planning but not yet scaffolded at all:

- Crop disease diagnosis from images
- Satellite imagery
- Market price data
- IoT sensor integration
- Farm management / record-keeping

None of these should be started without first updating this PRD with their own
mini-scope (target user impact, MVP feature cut, non-goals) — the same discipline
applied to V1.

## 5. Non-Functional Requirements

| Concern | Current state | Notes |
|---|---|---|
| Availability | Single-instance FastAPI/Uvicorn | No HA/clustering requirement yet |
| Latency | No explicit SLA | Bounded by Gemini + Open-Meteo round trip; revisit once there's real traffic data |
| Reliability | Open-Meteo calls retry 3x w/ exponential backoff | Gemini calls are **not** retried — a transient Gemini failure surfaces as an error rather than silently retrying against a paid, rate-limited API. Flag if this assumption should change. |
| Rate limiting | Per-IP, configurable requests/minute (default 60) | Via `slowapi`, in-memory — see architecture note on scaling |
| Caching | Geocode results cached in-memory, 1h TTL (configurable) | Avoids redundant Open-Meteo calls for repeat locations |
| Observability | Structured logs with per-request `X-Request-ID` | No metrics/tracing backend wired yet |
| Security | CORS configurable via env; **no authentication/authorization** | Explicit gap — must be addressed before any public deployment |

## 6. Explicit Assumptions & Open Questions

Recorded so they aren't silently treated as decisions later:

- No persistence layer exists. The backend is stateless — the client resends full
  chat history on every `/chat` call rather than the server storing it.
- No API-key or user-auth layer protects the public endpoints yet.
- `GEMINI_MODEL` defaults to `gemini-3.5-flash`, inherited from the original
  prototype. Not independently verified against Gemini's current model catalog —
  confirm this is still a valid model id before relying on it in production.
- No client application is part of this repository.

## 7. Success Criteria for V1

- `POST /api/v1/chat` returns a valid, schema-conformant `AgronomistResponse` for a
  farming-related query, grounded in real weather data when relevant.
- Ambiguous locations (two genuinely distinct places sharing a name) are flagged for
  clarification rather than guessed; non-ambiguous duplicates (e.g. a town and a
  same-named mountain) resolve automatically.
- Non-farming queries are correctly deflected (`is_farming_related: false`) rather
  than answered off-topic.
- Automated test suite passes; `pyright` reports zero errors on `app/`.

## 8. Change Process

Any change to V1 scope, NFRs, or roadmap priority should be a diff to this file in
the same PR as the code change — not a verbal decision that only lives in chat
history. This is the mechanism that replaces "floating mode."
