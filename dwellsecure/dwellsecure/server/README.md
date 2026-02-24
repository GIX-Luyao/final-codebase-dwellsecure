# DwellSecure Backend Server

Express.js backend server with MongoDB integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure MongoDB connection:
   - Option 1: Create a `.env` file in the `server` directory:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
     ```
   - Option 2: The connection string is hardcoded in `index.js` as a fallback

3. Test MongoDB connection:
```bash
node test-mongodb-connection.js
```

This will:
- Test the connection
- Verify collections exist
- Insert a test document
- Verify the document was saved
- Clean up the test document

4. Start the server:
```bash
npm start
```

The server will:
- Connect to MongoDB
- Create collections if they don't exist
- Start listening on port 3000

## API Endpoints

- `GET /health` - Health check
- `GET /api/shutoffs` - Get all shutoffs
- `GET /api/shutoffs/:id` - Get a specific shutoff
- `POST /api/shutoffs` - Create or update a shutoff
- `DELETE /api/shutoffs/:id` - Delete a shutoff
- `GET /api/utilities` - Get all utilities
- `GET /api/utilities/:id` - Get a specific utility
- `POST /api/utilities` - Create or update a utility
- `DELETE /api/utilities/:id` - Delete a utility

## Testing

### Test MongoDB Connection
```bash
node test-mongodb-connection.js
```

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

1. **Test the connection:**
   ```bash
   node test-mongodb-connection.js
   ```

2. **Check MongoDB Atlas:**
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
   - Run `node test-mongodb-connection.js` to verify

4. **Check MongoDB Atlas:**
   - Refresh the collections view
   - Verify you're looking at the correct database (`dwellsecure`)
   - Check the correct collection (`shutoffs` or `utilities`)
