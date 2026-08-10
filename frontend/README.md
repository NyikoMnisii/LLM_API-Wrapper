# AgriLite AI — Frontend

React Native (Expo + TypeScript) mobile app for the AgriLite AI agronomist platform.
Talks to the backend in [`../backend`](../backend) for weather and AI chat; farm/field/crop
data (My Farm, Alerts, Profile) is currently local mock data — see
[Backend integration](#backend-integration) below.

## Stack

- [Expo](https://docs.expo.dev/) (SDK 57) + React Native + TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
  (`app/`), including the headless `expo-router/ui` primitives (`Tabs`/`TabList`/`TabTrigger`/
  `TabSlot`) for the fully custom bottom tab bar
- `expo-location` for device GPS, `react-native-svg` for the weather gauge

## Project layout

```
app/                  Routes (expo-router file-based navigation)
  (tabs)/              Bottom-tab group: Home, My Farm, Alerts, Profile
  chat/                Full-screen AI chat
  field/[id].tsx        Field detail (mock data)
  crop/[id].tsx          Crop detail (mock data)
  farm/edit.tsx           Edit farm form (mock, local state only)
  forecast.tsx              7-day forecast (real backend data)
  add.tsx                     Quick-actions modal (center "+" tab button)
src/
  api/                Backend client: fetch wrapper, /chat and /weather/forecast calls,
                       TypeScript types mirroring the backend's Pydantic models
  components/         Shared UI (Card, Badge, Button, WeatherGauge, ChatBubble, TabButton, ...)
  data/               Mock data for farm/fields/crops/alerts/profile
  hooks/              useDeviceLocation, useWeather
  theme/              Colors, spacing, typography
  utils/              Date formatting helpers
```

## Setup

```bash
cd frontend
npm install
cp .env.example .env     # set EXPO_PUBLIC_API_BASE_URL — see below
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), `w` (web), or scan the QR code
with Expo Go on a physical device.

### Backend integration

The backend (see [`../backend/README.md`](../backend/README.md)) must be running for
the Home screen's weather widget, the 7-day forecast screen, and the AI chat screen to
work — those are the only screens wired to real endpoints (`GET /weather/forecast`,
`POST /chat`).

`EXPO_PUBLIC_API_BASE_URL` in `.env` must point at a host your Expo runtime can actually
reach:

| Target | Value |
|---|---|
| iOS simulator / web | `http://localhost:8000` |
| Android emulator | `http://10.0.2.2:8000` |
| Physical device | `http://<your-machine-LAN-IP>:8000` (same network as the backend) |

The backend's `CORS_ORIGINS` defaults to `*`, so no backend config changes are needed
for local development.

### Location

The app requests foreground location permission on first load (Home screen and Chat).
If denied, or unavailable, it falls back to Stellenbosch, South Africa coordinates so
the weather widget and chat still have a sensible default location — the same city
used in the reference designs.

## Mock vs. real data

Per current backend scope (see `../backend/docs/PRD.md`), there is no API for farms,
fields, crops, or alerts yet. Those screens (`My Farm`, `Alerts`, `Profile`, field/crop
detail, edit farm) render from `src/data/mock*.ts` so the full app is navigable and
visually complete. Swapping them for real endpoints later just means replacing the
`mock*.ts` imports with `src/api` calls — the screens already consume typed data
shapes, not the mock module directly re-exported.

## Scripts

```bash
npx expo start          # dev server
npx tsc --noEmit        # typecheck
npx expo export         # production bundle
```
