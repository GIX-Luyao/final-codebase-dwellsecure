# iOS Simulator Connection Fix

## Problem

Browser can access `http://localhost:3000/health`, but the Expo app in iOS simulator cannot connect, showing "Network request failed".

## Cause

`localhost` in iOS simulator may point to the simulator itself, not the host machine's localhost. This is a known issue with iOS simulator.

## Solution

### Solution 1: Use 127.0.0.1 (Fixed)

Code has been updated to use `http://127.0.0.1:3000` instead of `http://localhost:3000`.

**It should work after restarting the Expo app.**

### Solution 2: If 127.0.0.1 Still Doesn't Work

Use the host machine's IP address:

1. **Find your computer's IP address:**
   - Windows: Run `ipconfig`, look for "IPv4 Address"
   - Mac: Run `ifconfig` or `ip addr`

2. **Set environment variable:**
   Create `.env` file in project root:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
   ```
   For example: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000`

3. **Restart Expo app**

### Solution 3: Check Server Listen Address

Ensure the server listens on `0.0.0.0` (all network interfaces), not `127.0.0.1`.

Check `server/index.js`:
```javascript
app.listen(PORT, '0.0.0.0', () => {
  // Should listen on 0.0.0.0
});
```

## Verify Fix

After fixing, you should see:

```
[API] Platform: ios, API URL: http://127.0.0.1:3000
[API] Checking health at http://127.0.0.1:3000/health
[API] Health check result: CONNECTED ✅
[API] Initialization complete. Available: true
[App] API initialization complete. Available: true
```

Instead of:
```
[API] Health check failed: Network request failed
[API] Initialization complete. Available: false
```

## Testing Steps

1. **Restart Expo app** (Important!)
2. **Check logs** to confirm API URL is `http://127.0.0.1:3000`
3. **Try creating data**, you should see:
   ```
   [API] → POST /api/shutoffs
   [API] ✓ POST /api/shutoffs → 200 OK
   [Storage] ✅ Successfully saved to MongoDB
   ```

## If It Still Fails

Please check:
1. Is the server running (`npm start`)
2. Does the server terminal show incoming requests
3. Is the firewall blocking the connection
4. Try using computer IP address (Solution 2)
