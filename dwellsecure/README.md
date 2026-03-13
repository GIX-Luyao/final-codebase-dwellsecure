# Dwell Secure

A mobile-first app for property owners and renters to record and access utility shutoff locations and procedures, with emergency-mode quick access and optional cloud sync.

---

## Documentation compliance checklist

| Requirement | Where it is covered |
|-------------|----------------------|
| **README: Project structure** | Table below (*Project Structure*). |
| **README: How to run the code** | *How to Run the Code* (backend → frontend → run order). |
| **README: What to expect after running** | *What to Expect After Running*. |
| **PDF user manual in codebase** | Generate from `docs/USER_MANUAL.md` (see *User manual (PDF)* below) and add **`docs/USER_MANUAL.pdf`** to the repo. |
| **User manual:** Cover (title, version, team, instructor, sponsor, date, logo) | `docs/USER_MANUAL.md` — Cover Page. |
| **User manual:** Product overview (non-technical) | `docs/USER_MANUAL.md` — §1 Product Overview. |
| **User manual:** System requirements + Package contents | `docs/USER_MANUAL.md` — §2 System Requirements. |
| **User manual:** Installation/setup (step-by-step, screenshots) | `docs/USER_MANUAL.md` — §3 Installation and Setup. |
| **User manual:** Operating instructions (start, use, shut down) | `docs/USER_MANUAL.md` — §4 Operating Instructions. |
| **User manual:** Technical specifications | `docs/USER_MANUAL.md` — §5 Technical Specifications. |
| **User manual:** Safety (privacy, security, limitations) | `docs/USER_MANUAL.md` — §6 Safety, Data Privacy, and Security. |
| **User manual:** Troubleshooting | `docs/USER_MANUAL.md` — §7 Troubleshooting. |
| **User manual:** Limitations | `docs/USER_MANUAL.md` — §8 Limitations. |

---

## Project Structure

The repository is organized as follows:

| Path | Description |
|------|-------------|
| **`src/`** | Frontend: React Native (Expo) application source. |
| **`src/screens/`** | App screens (login, sign-up, properties, shutoffs, utilities, reminders, emergency mode, profile, etc.). |
| **`src/components/`** | Reusable UI components (e.g. PropertyCard, ApiStatusIndicator, FeatureTour, BottomNav). |
| **`src/services/`** | API client, storage (API + AsyncStorage fallback), auth storage, media upload, notifications, app mode (normal/emergency). |
| **`src/navigation/`** | Stack and tab navigation (AppNavigator). |
| **`src/contexts/`** | React contexts: Auth, Sync, Onboarding, Feature Tour. |
| **`src/config/`** | API base URL and endpoint constants. |
| **`src/constants/`** | Theme (colors, spacing, typography). |
| **`server/`** | Backend: Express.js API server. |
| **`server/index.js`** | Main server entry: routes, MongoDB, auth, Firebase Storage upload, optional AI and map proxies. |
| **`server/config.js`** | Server configuration from environment (MongoDB URI, PORT, CORS, JWT, Firebase, encryption key). |
| **`assets/`** | Static assets (images, icons, diagrams). |
| **`docs/`** | Documentation; includes user manual (Markdown and PDF). |
| **`backend/`** | Legacy/alternate backend (optional). |

---

## Technologies Used

- **Frontend:** React Native, Expo (SDK 54), React Navigation, AsyncStorage, Expo Image Picker / Notifications / File System  
- **Backend:** Node.js, Express, MongoDB (official driver), JWT, bcrypt, dotenv  
- **Media:** Firebase Storage (server-side: firebase-admin, multer)  
- **Optional:** OpenAI (voice-note, AI identify/ask), Mapbox (geocode, static map, token)

---

## How to Run the Code

### 1. Backend (server)

```bash
cd server
npm install
```

**Environment variables:** Copy the example file and edit with your values:

```bash
cp .env.example .env
# (Windows: copy .env.example .env)
```

Edit `server/.env`. At minimum set:

- `MONGODB_URI` – MongoDB connection string  
- `JWT_SECRET` – Secret for auth tokens (required in production)  
- `PORT` – Optional; default 3000  

Optional: `CORS_ORIGIN`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH`, `OPENAI_API_KEY`, `ADDRESS_ENCRYPTION_KEY`, `MAPBOX_TOKEN`. See **`server/.env.example`** and **`server/README.md`** for all options and usage.

Start the server:

```bash
npm start
```

The server listens on the configured port (default 3000), connects to MongoDB, and creates collections if they do not exist.

### 2. Frontend (Expo app)

From the **project root** (same level as `package.json` and `src/`):

```bash
npm install
npm start
```

Then:

- **Physical device:** Install Expo Go, scan the QR code from the terminal (device and computer must be on the same network).  
- **Simulator/emulator:** Press `i` (iOS) or `a` (Android) in the terminal.  
- **Web:** Press `w` to open in the browser.

**Frontend environment (optional):** To point the app at your own backend, copy the root **`.env.example`** to **`.env`** in the project root, then set `EXPO_PUBLIC_API_URL` (e.g. `http://your-machine-ip:3000` for a real device). You can also set the API base URL directly in `src/config/api.js`. Restart Expo after changing `.env` (`npx expo start`).

### 3. Run order

1. Start the backend: `cd server && npm start`.  
2. Start the frontend: from project root, `npm start`, then choose platform.  
3. In the app: sign up or log in, add a property, add shutoff/utility records. Use the red floating button to open Emergency Mode.

---

## What to Expect After Running

- **Backend running and reachable:** The app shows a “MongoDB connected” (or similar) status. Data is synced to the server; photos can upload to Firebase if the server has Firebase Storage configured.  
- **Backend down or unreachable:** The app falls back to local storage (AsyncStorage). You can still view and add data on the device; it will sync when the API becomes available again.  
- **Emergency Mode:** Tapping the red floating button opens Emergency Mode: select property (if more than one) → select shutoff type (Gas, Electric, Water) → follow the step-by-step instructions. An option to call emergency services (e.g. 911) is available. Exiting Emergency Mode returns the app to normal (editing allowed).  
- **First-time flow:** After sign-up or login, you can add a property, then add shutoff and utility records with location, photos, and instructions. Reminders can be created from shutoff/utility detail screens.

For API details and server configuration, see **`server/README.md`**.

---

## Switching to a different server (simple deployment)

If you want to run the backend on another host (e.g. Render, Railway, AWS, or your own VPS), use this flow:

1. **Deploy the backend**  
   Use the **`server/`** folder only. On your chosen platform, connect the repo (or upload the `server/` directory), set **Node** as runtime, and use `npm start` as the start command. The server reads `process.env.PORT` (most hosts set it automatically).

2. **Set environment variables** on the new host  
   Use the same variables as in **`server/.env.example`**. At minimum: **`MONGODB_URI`**, **`JWT_SECRET`**. Also set **`CORS_ORIGIN`** to your app’s URL(s) (e.g. `https://yourapp.web.app`, or `*` for testing). Optional: Firebase, OpenAI, Mapbox, `ADDRESS_ENCRYPTION_KEY` — see `server/README.md`.

3. **Point the app at the new backend**  
   Set the app’s API base URL to the new server (e.g. `https://your-backend.onrender.com`). Either set **`EXPO_PUBLIC_API_URL`** in the root `.env` (or in your build/deploy environment), or change **`src/config/api.js`**, then rebuild or restart the app.

4. **Verify**  
   Open `https://your-new-server-url/health` in a browser; you should see `{ "status": "ok", "db": "connected" }`. Then log in from the app; it should show “connected” and sync to the new server.

Detailed steps per platform (Render, Railway, etc.) are in **`server/README.md`** under *Simple deployment flow*.

---

### User manual (PDF)

The codebase includes a user manual in Markdown: **`docs/USER_MANUAL.md`**. A **PDF user manual** should be included in the repo as **`docs/USER_MANUAL.pdf`**. To generate it:

- **Option A:** From the project root: `pandoc docs/USER_MANUAL.md -o docs/USER_MANUAL.pdf` (requires [pandoc](https://pandoc.org/) and a LaTeX engine, or `pandoc` with `--pdf-engine=wkhtmltopdf`).
- **Option B:** Open `docs/USER_MANUAL.md` in a Markdown viewer or VS Code, then use **Print → Save as PDF**.
- **Option C:** Convert the Markdown to HTML, then print to PDF from a browser.

After generating, add `docs/USER_MANUAL.pdf` to the repository so it is part of the codebase.
