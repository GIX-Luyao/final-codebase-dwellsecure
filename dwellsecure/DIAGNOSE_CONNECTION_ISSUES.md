# Diagnose Connection Issues

## Current Problem

Logs show:
```
WARN  [Storage] API fetch failed, falling back to AsyncStorage: Network request failed
LOG  [Storage] API available: false
WARN  [Storage] API not available, using AsyncStorage only
```

**This means:** Frontend cannot connect to backend server, data is only saved locally and not synced to MongoDB.

## Diagnostic Steps

### Step 1: Check if Backend Server is Running

Run in `server` directory:
```bash
cd server
npm start
```

**Should see:**
```
✅ MongoDB connection established and verified!
🚀 Server running on port 3000
```

**If you don't see these messages:**
- Server is not started
- Need to start server first

### Step 2: Check MongoDB Connection

In server terminal, you should see:
```
✅ MongoDB client connected
✅ Ping successful - database is accessible
✅ MongoDB connection established and verified!
```

**If you see errors:**
- MongoDB Atlas cluster may be Paused
- Network connection issue
- IP address not added to whitelist

### Step 3: Check Frontend API URL

Check app startup logs:
```
[API] Platform: android, API URL: http://10.0.2.2:3000
```

**By platform:**
- **Android emulator**: Should be `http://10.0.2.2:3000`
- **iOS simulator**: Should be `http://localhost:3000`
- **Physical device**: Need to set `EXPO_PUBLIC_API_URL` to your computer's IP address

### Step 4: Test API Health Check

Access in browser (or use curl):
```
http://localhost:3000/health
```

**Should return:**
```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "2026-01-27T..."
}
```

**If cannot access:**
- Server is not running
- Port is occupied
- Firewall blocking connection

## Solutions

### Solution 1: Start Backend Server

```bash
cd server
npm start
```

Keep this terminal window open!

### Solution 2: Check MongoDB Atlas

1. Visit https://cloud.mongodb.com
2. Check cluster status (should be **Active**, not Paused)
3. Check Network Access (your IP should be in whitelist)

### Solution 3: Check Network Connection

**Android emulator:**
- Ensure using `http://10.0.2.2:3000` (not `localhost`)

**Physical device:**
- Need to set environment variable:
  ```bash
  # Find your computer IP address (Windows: ipconfig, Mac/Linux: ifconfig)
  # Then set in .env or expo config:
  EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000
  ```

### Solution 4: Verify Connection

After starting server, in the app:
1. Check app logs, should see:
   ```
   [API] Health check result: CONNECTED ✅
   ```

2. Try creating data, should see:
   ```
   [API] → POST /api/shutoffs
   [API] ✓ POST /api/shutoffs → 200 OK
   [Storage] ✅ Successfully saved to MongoDB
   ```

## Quick Checklist

- [ ] Backend server is running (`npm start`)
- [ ] Server shows "✅ MongoDB connection established"
- [ ] Server shows "🚀 Server running on port 3000"
- [ ] App logs show `[API] API available: true`
- [ ] Can access `http://localhost:3000/health`
- [ ] MongoDB Atlas cluster is Active
- [ ] IP address added to MongoDB Atlas whitelist

## Common Errors

### "Network request failed"
- **Cause**: Frontend cannot connect to backend
- **Solution**: Ensure backend server is running

### "API_UNAVAILABLE"
- **Cause**: Health check failed
- **Solution**: Check if server is running, MongoDB is connected

### "Database not connected"
- **Cause**: MongoDB connection failed
- **Solution**: Check MongoDB Atlas status and network access settings

## Verify Fix

After fixing, you should see:
```
[API] Health check result: CONNECTED ✅
[Storage] API available: true
[Storage] Attempting to save to MongoDB via API...
[Storage] ✅ Successfully saved to MongoDB
```

Instead of:
```
[Storage] API not available, using AsyncStorage only
```
