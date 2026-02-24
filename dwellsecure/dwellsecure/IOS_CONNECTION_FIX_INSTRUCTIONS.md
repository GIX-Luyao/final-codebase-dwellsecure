# iOS Connection Fix Instructions

## Problem

iOS simulator cannot connect to `localhost` or `127.0.0.1`, even though the browser can access it.

## Solution

A `.env` file has been created using your computer's IP address: `192.168.1.166`

## Next Steps

### 1. Restart Expo App

**Important:** You must restart the Expo app to load the new environment variables!

```bash
# Stop current Expo (Ctrl+C)
# Then restart
npm start
```

### 2. Verify Connection

After restarting, you should see:

```
[API] Platform: ios, API URL: http://192.168.1.166:3000
[API] Checking health at http://192.168.1.166:3000/health
[API] Health check result: CONNECTED ✅
[API] Initialization complete. Available: true
[App] API initialization complete. Available: true
```

### 3. Test Data Sync

Try creating data, you should see:

```
[API] → POST /api/shutoffs
[API] ✓ POST /api/shutoffs → 200 OK
[Storage] ✅ Successfully saved to MongoDB
```

## If It Still Fails

### Check Firewall

Windows Firewall may be blocking port 3000. Check:
1. Windows Settings → Firewall
2. Allow apps through firewall
3. Ensure Node.js is allowed

### Check Server Logs

When the app tries to connect, the server terminal should show:

```
[HTTP] ← GET /health
[HTTP] GET /health → 200 (Xms)
```

If you don't see these logs, the request didn't reach the server.

### Try Other IP Addresses

If `192.168.1.166` doesn't work, try:
- `192.168.8.1`
- `192.168.56.1`

Modify the IP address in the `.env` file, then restart Expo.

## Verify Server Configuration

Ensure the server listens on `0.0.0.0` (all network interfaces):

```javascript
app.listen(PORT, '0.0.0.0', () => {
  // Should listen on 0.0.0.0, not 127.0.0.1
});
```

## Common Questions

**Q: Why can the browser access it but the iOS simulator cannot?**
A: iOS simulator network isolation - `localhost` points to the simulator itself, not the host machine.

**Q: Why do I need to restart Expo?**
A: Environment variables are loaded when the app starts, so a restart is required for them to take effect.

**Q: What if the IP address changes?**
A: Update `EXPO_PUBLIC_API_URL` in the `.env` file, then restart Expo.
