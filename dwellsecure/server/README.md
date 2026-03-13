# DwellSecure Backend Server

Express.js backend server with MongoDB integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. **Environment variables – how to use:**  
   Copy **`.env.example`** to **`.env`** in this folder (`server/`), then edit `.env` with your values. Do not commit `.env`.

   ```bash
   cp .env.example .env
   # Windows: copy .env.example .env
   ```

   All variables are documented in **`server/.env.example`**. Summary (from `config.js`; dotenv loads `.env` from project root or `server/`):
   - **MONGODB_URI** – full connection string (preferred). Example:
     ```
     MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dwellsecure?appName=...
     ```
   - **MONGODB_PASSWORD** – used only when `MONGODB_URI` is not set (with **MONGODB_USER**; optional **MONGODB_HOST**, **MONGODB_DB**).
   - **PORT** – server port (default 3000).
   - **CORS_ORIGIN** – comma-separated allowed origins (optional).
   - **JWT_SECRET** – secret for signing auth tokens (required in production; dev default exists).
   - **Firebase Storage (media uploads):** To enable `POST /api/upload-media`, set **FIREBASE_STORAGE_BUCKET** and one of **FIREBASE_SERVICE_ACCOUNT_JSON** or **FIREBASE_SERVICE_ACCOUNT_PATH**. See `.env.example`. If unset, upload-media returns 503.
   - **ADDRESS_ENCRYPTION_KEY** – 32-byte key (64-char hex) so address/geo are stored encrypted. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. See `.env.example`.
   - **OPENAI_API_KEY**, **MAPBOX_ACCESS_TOKEN** / **MAPBOX_TOKEN** – optional; see `.env.example`.

3. Start the server:
```bash
npm start
```

The server will:
- Connect to MongoDB
- Create collections if they don't exist
- Start listening on port 3000

## Simple deployment flow (switch to another server)

When you want to run the backend on a **different host** (Render, Railway, AWS, Fly.io, your VPS, etc.):

### 1. Deploy the `server/` folder

- Use **only the `server/`** directory as the deploy root (or ensure the app’s start command runs from `server/`).
- **Start command:** `npm start` (runs `node index.js`).
- **Node:** Use a recent Node LTS (e.g. 18 or 20). The host usually sets **`PORT`**; the app uses `process.env.PORT || 3000` and binds to `0.0.0.0`.

### 2. Set environment variables on the host

In the host’s dashboard (e.g. Render → Environment, Railway → Variables), add the same variables as in **`server/.env.example`**:

| Variable | Required | Notes |
|----------|----------|--------|
| `MONGODB_URI` | Yes | Full MongoDB connection string. |
| `JWT_SECRET` | Yes (production) | Long random string; do not use the dev default. |
| `PORT` | Often auto-set | Hosts like Render/Railway set this. |
| `CORS_ORIGIN` | Recommended | Comma-separated frontend URLs (e.g. `https://yourapp.web.app`). Omit to allow all (OK for testing only). |
| `FIREBASE_STORAGE_BUCKET` | Optional | For photo uploads. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH` | Optional | With bucket, for uploads. |
| `OPENAI_API_KEY` | Optional | For voice-note / AI. |
| `MAPBOX_ACCESS_TOKEN` or `MAPBOX_TOKEN` | Optional | For geocode and maps. |
| `ADDRESS_ENCRYPTION_KEY` | Optional | 64-char hex; encrypts address/geo in DB. |

Do **not** upload a `.env` file with secrets; use the platform’s environment UI.

### 3. Point the app at the new backend

- Set the app’s API base URL to your new server URL (e.g. `https://dwellsecure-xxxx.onrender.com`).
- **Option A:** In the project root `.env`, set `EXPO_PUBLIC_API_URL=https://your-backend-url` and rebuild/restart the app.
- **Option B:** In `src/config/api.js`, set the base URL and commit (or set `EXPO_PUBLIC_API_URL` in EAS/build env for production).

### 4. Verify

- Open **`https://your-backend-url/health`** in a browser. You should see: `{"status":"ok","db":"connected"}`.
- Open the app, log in; it should show “MongoDB connected” (or similar) and sync to the new server.

---

## Deploy to AWS (independent backend)

The backend is **independently deployable** (e.g. from the `server` folder only):

- **Port**: `process.env.PORT || 3000` (AWS/App Runner sets `PORT`).
- **Bind**: `app.listen(PORT, '0.0.0.0', ...)` so the server is reachable from the network.
- **Health check**: `GET /health` returns `{ status: 'ok', db: 'connected'|'disconnected' }`.

For production, set in your environment: `PORT`, `MONGODB_URI`, `JWT_SECRET`, and optionally `CORS_ORIGIN` (comma-separated frontend URLs).

## API Endpoints

- `GET /health` - Health check
- `POST /api/auth/register` - Register (body: `email`, `password`, optional `name`, `photo`). Returns `{ user, token }`. Password stored hashed (bcrypt). **Validation:** email required and valid format; password required and min 6 chars; **400** invalid email format; **409** if email already registered.
- `POST /api/auth/login` - Login (body: `email`, `password`). Returns `{ user, token }`. **Validation:** email and password required, email must be valid format; **400** invalid email format; **401** if invalid email or password.
- `POST /api/auth/forgot-password` - Forgot password (body: `email`). **Validation:** email required and valid format; **400** invalid email format. If the email exists in the database, a reset token is created and stored (expires in 1 hour); the API always returns 200 with a generic message (does not reveal whether the email exists). **Email service is not yet connected** — see *Forgot password / Reset password* below.
- `POST /api/auth/reset-password` - Reset password (body: `token`, `newPassword`). Validates the token (must exist and not be expired), updates the user's password in the database, then deletes the token. **400** if token missing, password missing, password &lt; 6 chars, or invalid/expired token.
- `GET /api/shutoffs` - Get all shutoffs
- `GET /api/shutoffs/:id` - Get a specific shutoff
- `POST /api/shutoffs` - Create or update a shutoff
- `DELETE /api/shutoffs/:id` - Delete a shutoff
- `GET /api/properties` - Get properties (when `Authorization: Bearer <token>` present, returns only that user's properties).
- `GET /api/utilities` - Get all utilities
- `GET /api/utilities/:id` - Get a specific utility
- `POST /api/utilities` - Create or update a utility
- `DELETE /api/utilities/:id` - Delete a utility
- `POST /api/ai/voice-note` - Transcribe and summarize a voice note (requires `OPENAI_API_KEY`)
- `POST /api/upload-media` - Upload a file to Firebase Storage (multipart: `file`, `path`; requires auth and Firebase env). Returns `{ url }`.

**Note:** If the app shows "Voice note API not available" (404), redeploy this server so the deployed instance includes the `/api/ai/voice-note` route.

### Forgot password / Reset password

- **Forgot password** (`POST /api/auth/forgot-password`): The server checks whether the given email exists in the `users` collection. If it does, a reset token is generated, stored in the `password_reset_tokens` collection with an expiry (e.g. 1 hour), and can later be used to change the password. The API always returns the same success response so that attackers cannot discover valid email addresses. If the email is not in the database, no token is created and the response is still success.
- **Reset password** (`POST /api/auth/reset-password`): The client sends the `token` (obtained from the user, e.g. via a link) and the new `newPassword`. The server verifies the token (exists and not expired), updates the user’s password in the database, and then deletes the token.
- **Email service (to be connected later):** Currently, the server does **not** send any email. When a user requests a password reset, the token is only stored in the database. To complete the flow in production, an email service (e.g. SendGrid, nodemailer with SMTP) must be connected so that the server can send the user a reset link (e.g. `https://yourapp.com/reset-password?token=...`) containing the token. Until then, the reset flow can be tested by obtaining the token from the database or by building a separate client screen that accepts the token (e.g. from email sent by another tool) and calls `POST /api/auth/reset-password`.

## Testing

### Test API Health
```bash
# In browser or PowerShell:
Invoke-WebRequest -Uri http://localhost:3000/health
```

### Test API Endpoint
```powershell
$body = @{
    id = "test-123"
    type = "gas"
    description = "Test shutoff"
    verification_status = "unverified"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/shutoffs -Method POST -ContentType "application/json" -Body $body
```

## Troubleshooting

### Connection Issues

1. **Check MongoDB Atlas:**
   - Ensure your IP address is whitelisted
   - Verify the connection string is correct
   - Check database user permissions

3. **Check server logs:**
   - Look for connection errors
   - Verify collections are created
   - Check document counts

### No Data in MongoDB

1. **Verify server is running:**
   - Check terminal for "Server running on port 3000"
   - Test `/health` endpoint

2. **Check request logs:**
   - Server should log all incoming requests
   - Look for `[HTTP] POST /api/shutoffs` logs
   - Check for any errors

3. **Verify database connection:**
   - Server should show "Database status: CONNECTED ✅"

4. **Check MongoDB Atlas:**
   - Refresh the collections view
   - Verify you're looking at the correct database (`dwellsecure`)
   - Check the correct collection (`shutoffs` or `utilities`)
