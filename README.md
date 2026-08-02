# Agrilite AI Agronomist API

A modular FastAPI backend that provides structured, LLM-backed agricultural advice
(via Gemini function calling) with a reusable weather-risk service.

## Architecture

```
app/
├── api/          # HTTP routes only — no business logic
├── clients/      # Thin wrappers around third-party APIs (Gemini, Open-Meteo)
├── core/         # Config, logging, exceptions, rate limiting
├── models/       # Pydantic schemas
├── prompts/      # System prompts, kept out of application code
├── services/     # Business logic; gemini_service.py is the only Gemini-aware layer
├── tools/        # Adapts services into provider-agnostic ToolSpecs for function calling
├── utils/        # Small, reusable helpers
├── dependencies.py
└── main.py       # App factory + lifespan (shared HTTP client, service wiring)
```

Swapping LLM providers later means writing a new `services/<provider>_service.py`
adapter — `tools/`, `services/weather_service.py`, and `services/tool_executor.py`
have no Gemini-specific code.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env         # then fill in GEMINI_API_KEY
```

## Run

```bash
uvicorn app.main:app --reload
```

The API is served under `/api/v1` (e.g. `POST /api/v1/chat`, `GET /api/v1/weather/forecast`,
`GET /api/v1/health`).

## Test

```bash
pytest
```

## Docker

```bash
docker compose up --build
```
