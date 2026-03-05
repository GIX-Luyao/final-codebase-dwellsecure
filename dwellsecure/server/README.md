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
- `POST /api/auth/register` - Register (body: `email`, `password`, optional `name`, `photo`). Returns `{ user, token }`. Password stored hashed (bcrypt).
- `POST /api/auth/login` - Login (body: `email`, `password`). Returns `{ user, token }`.
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

**Note:** If the app shows "Voice note API not available" (404), redeploy this server so the deployed instance includes the `/api/ai/voice-note` route.

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
