# Configuration

## `api.js` – DwellSecure backend API config

All **backend API** configuration for this app lives here (excluding third parties like Builder.io).

- **getApiBaseUrl()** / **API_BASE_URL**: Base URL resolved from `__DEV__`, `Platform.OS`, and `EXPO_PUBLIC_API_URL`.
- **HEALTH_PATH**, **HEALTH_TIMEOUT_MS**: Health-check path and timeout.
- **API_ENDPOINTS**: Backend path constants (auth, shutoffs, utilities, reminders, properties, uploadMedia).

Change the backend URL or paths only in this file. `apiClient.js` and `AuthContext` read from here.

## `keys.js` – Third-party API keys (optional / legacy)

In release, **OpenAI and Mapbox are provided by the backend**; the app only needs `EXPO_PUBLIC_API_URL` pointing at the backend.  
`openai.js`, `geocode.js`, map thumbnails, and MapPicker use the backend proxy; no keys are used in the frontend.  
If code still imports `keys.js`, it is for compatibility only; new features should not rely on frontend env keys.
