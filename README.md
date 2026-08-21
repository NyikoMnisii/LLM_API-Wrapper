# AgriLite AI

Structured, LLM-backed agronomy advice — grounded in real weather-risk data — through
a FastAPI backend and an Expo/React Native app, with Supabase (Postgres + Auth) as the
persistence layer.

```
backend/     FastAPI API (Gemini function calling + Open-Meteo weather risk)
frontend/    Expo (React Native + TypeScript) app — web export deployable to Vercel
supabase/    Database schema (migrations) — farms, fields, crops, alerts, chat history
```

These are independent projects with their own dependencies, env files, and
lifecycles — see each folder's own README for setup:

- [`backend/README.md`](backend/README.md) — API setup, running, testing, Docker
- [`frontend/README.md`](frontend/README.md) — app setup, running, backend integration

## Quick start (local dev)

```bash
# Terminal 1 — backend
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env    # fill in GEMINI_API_KEY and SUPABASE_URL
uvicorn app.main:app --reload --host 0.0.0.0

# Terminal 2 — frontend
cd frontend
npm install
copy .env.example .env    # set EXPO_PUBLIC_API_BASE_URL to reach the backend above,
                           # and EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
npx expo start
```

Auth, database, and every screen (farms, fields, crops, alerts, chat history, profile)
are wired to the live Supabase project — there is no mock/local-only data path anymore.

## Planning & design docs

Scope, architecture, and API contracts for the **backend** live in
[`backend/docs/`](backend/docs/) and are the source of truth for what's actually
implemented server-side.

## Deployment

- **Backend → [Render](https://render.com)**, via the [`render.yaml`](render.yaml)
  Blueprint at the repo root (Docker runtime, points at `backend/`).
- **Frontend → [Vercel](https://vercel.com)**, via [`frontend/vercel.json`](frontend/vercel.json)
  — deploys Expo's static web export (`expo export -p web`). Native iOS/Android builds
  are a separate, later step (EAS Build) — Vercel only hosts the web build.

See each service's own setup checklist for the exact dashboard steps and required
environment variables.
