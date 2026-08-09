npm# AgriLite AI

Structured, LLM-backed agronomy advice — grounded in real weather-risk data — through
a FastAPI backend and an Expo/React Native mobile app.

```
backend/     FastAPI API (Gemini function calling + Open-Meteo weather risk)
frontend/    Expo (React Native + TypeScript) mobile app
```

The two are independent projects with their own dependencies, env files, and
lifecycles — see each folder's own README for setup:

- [`backend/README.md`](backend/README.md) — API setup, running, testing, Docker
- [`frontend/README.md`](frontend/README.md) — app setup, running, backend integration,
  which screens use real data vs. local mock data

## Quick start (both, local dev)

```bash
# Terminal 1 — backend
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env    # fill in GEMINI_API_KEY
uvicorn app.main:app --reload

# Terminal 2 — frontend
cd frontend
npm install
copy .env.example .env    # set EXPO_PUBLIC_API_BASE_URL to reach the backend above
npx expo start
```

## Planning & design docs

Scope, architecture, and API contracts for the **backend** live in
[`backend/docs/`](backend/docs/) and are the source of truth for what's actually
implemented server-side — the frontend's "My Farm" / "Alerts" / "Profile" screens
currently render local mock data because there is no backend API for farms, fields,
crops, or alerts yet (see `backend/docs/PRD.md` §4, Out of Scope for V1).
