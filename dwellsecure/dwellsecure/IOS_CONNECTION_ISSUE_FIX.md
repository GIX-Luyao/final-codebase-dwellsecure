# iOS Connection Issue Fix

## Problem Analysis

From the logs:
```
[API] Platform: ios, API URL: http://localhost:3000
[API] ✗ GET /api/properties → Network Error (26ms)
```

**Problem:** iOS simulator cannot connect to `localhost:3000`

## Possible Causes

1. **Server not running** - Most common cause
2. **iOS simulator localhost issue** - In some cases iOS simulator cannot access localhost
3. **Server listen address issue** - Server needs to listen on `0.0.0.0` instead of `127.0.0.1`

## Solutions

### Solution 1: Confirm Server is Running

Run in `server` directory:
```bash
cd server
npm start
```

**Should see:**
```
✅ Server started successfully!
🚀 Server running on port 3000
```

### Solution 2: Test if Server is Accessible

Access in browser:
```
http://localhost:3000/health
```

**Should return:**
```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "..."
}
```

### Solution 3: Check Server Listen Address

Server should listen on `0.0.0.0` (all network interfaces), not `127.0.0.1`.

Check in `server/index.js`:
```javascript
app.listen(PORT, '0.0.0.0', () => {
  // ...
});
```

### Solution 4: iOS Simulator Special Handling

If iOS simulator still cannot connect, try:

1. **Restart iOS simulator**
2. **Restart Expo app**
3. **Check firewall settings**

### Solution 5: Use Computer IP Address (if localhost doesn't work)

1. Find your computer's IP address:
   - Windows: `ipconfig` to view IPv4 address
   - Mac: `ifconfig` or `ip addr`

2. Create `.env` file in project root:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
   ```

3. Restart Expo app

## Verify Fix

After fixing, you should see:

```
[API] Platform: ios, API URL: http://localhost:3000
[API] Checking health at http://localhost:3000/health
[API] Health check result: CONNECTED ✅
[API] Initialization complete. Available: true
[App] API initialization complete. Available: true
```

Instead of:
```
[API] ✗ GET /api/properties → Network Error
[App] API initialization complete. Available: undefined
```

## Quick Checklist

- [ ] Backend server is running (`npm start`)
- [ ] Can access `http://localhost:3000/health` in browser
- [ ] Server logs show "Server running on port 3000"
- [ ] iOS simulator has been restarted
- [ ] Expo app has been restarted

## If It Still Fails

Please provide:
1. Server terminal logs (are there incoming requests?)
2. Browser access result for `http://localhost:3000/health`
3. Complete app logs (including detailed health check errors)
