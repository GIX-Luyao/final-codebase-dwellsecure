# DwellSecure Backend Server

Express.js backend server with MongoDB integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure MongoDB and server (all in `config.js`; env loaded via dotenv):
   - **MONGODB_URI** – full connection string (preferred). Example:
     ```
     MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dwellsecure?appName=...
     ```
   - **MONGODB_PASSWORD** – used only when `MONGODB_URI` is not set (default dev user/password in `config.js`).
   - **PORT** – server port (default 3000).
   - **CORS_ORIGIN** – comma-separated allowed origins (optional).
   - **JWT_SECRET** – secret for signing auth tokens (required in production; dev default exists).
   - **Firebase Storage (media uploads):** To enable `POST /api/upload-media`, set **FIREBASE_STORAGE_BUCKET** (e.g. `project-28a12e1f-d31f-47d3-834.firebasestorage.app`) and one of: **FIREBASE_SERVICE_ACCOUNT_JSON** (stringified JSON key) or **FIREBASE_SERVICE_ACCOUNT_PATH** (path to the JSON key file). If unset, upload-media returns 503.
   - **ADDRESS_ENCRYPTION_KEY** – 32-byte key so address/geo are stored **encrypted** in MongoDB (API still returns plain text for map/UI). If unset, addresses are stored in **plain**. Generate one with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
     Use the 64-character hex string as the env value. On Render: Dashboard → your service → Environment → Add `ADDRESS_ENCRYPTION_KEY` = that value, then redeploy.
   - Create a `.env` file in the project root (or `server`) for local overrides.

3. Start the server:
```bash
npm start
```

The server will:
- Connect to MongoDB
- Create collections if they don't exist
- Start listening on port 3000

## Deploy to AWS (Step 1 – independent backend)

The backend is **independently deployable** (e.g. from the `server` folder only):

- **Port**: `process.env.PORT || 3000` (AWS/App Runner sets `PORT`).
- **Bind**: `app.listen(PORT, '0.0.0.0', ...)` so the server is reachable from the network.
- **Health check**: `GET /health` returns `{ status: 'ok', db: 'connected'|'disconnected' }`.

For production, set in your environment: `PORT`, `MONGODB_URI`, and optionally `CORS_ORIGIN` (comma-separated frontend URLs).

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
