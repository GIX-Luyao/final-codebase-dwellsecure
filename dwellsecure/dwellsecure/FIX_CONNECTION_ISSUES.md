# Fix Connection Issues - Code Improvements

## Problem Diagnosis

App shows `API available: false`, even though server is running. Possible causes:

1. **Health check timeout** - No timeout set by default, may hang
2. **Network error** - Fetch request failed but no detailed error info
3. **Incorrect API URL** - Platform-specific URL may be wrong
4. **No retry after health check failure** - One failure permanently marks as unavailable

## Code Improvements

### 1. Add Timeout Mechanism

Health check now has 5 second timeout to avoid infinite waiting.

### 2. Improved Error Logging

Now shows detailed error information, including:
- Error type (timeout, network error, etc.)
- Complete error object
- API URL information

### 3. Improved Initialization Logging

App startup will show:
- API URL
- Health check result
- Initialization status

## Testing Steps

### Step 1: Restart App

Restart Expo app to load new code.

### Step 2: Check Startup Logs

Should see:
```
[API] Platform: android, API URL: http://10.0.2.2:3000
[App] Initializing API connection...
[API] Initializing API connection...
[API] Target URL: http://10.0.2.2:3000
[API] Checking health at http://10.0.2.2:3000/health
```

### Step 3: Check Health Check Result

**If successful:**
```
[API] Health check result: CONNECTED ✅
[API] Initialization complete. Available: true
[App] API initialization complete. Available: true
```

**If failed:**
```
[API] Health check failed: [error message]
[API] Full error: [complete error object]
[API] Will use AsyncStorage fallback
```

### Step 4: Diagnose Based on Error Message

**"Request timeout"** - Server not responding
- Check if server is running
- Check if port is correct

**"Network request failed"** - Cannot connect to server
- Android emulator: Ensure using `http://10.0.2.2:3000`
- Physical device: Need to set `EXPO_PUBLIC_API_URL`

**"HTTP 503"** - Server running but MongoDB not connected
- Check server logs
- Check MongoDB Atlas status

## Manual Connection Test

Run in app console:

```javascript
// Test health check
import { checkApiHealth } from './src/services/apiClient';
checkApiHealth().then(result => console.log('Health check:', result));

// Test API URL
import { API_BASE_URL } from './src/services/apiClient';
console.log('API URL:', API_BASE_URL);

// Test API availability
import { getApiAvailability } from './src/services/apiClient';
console.log('API Available:', getApiAvailability());
```

## Common Issue Solutions

### Issue 1: Android Emulator Cannot Connect

**Solution:**
- Ensure API URL is `http://10.0.2.2:3000` (not `localhost`)
- Check if server listens on `0.0.0.0` (not `127.0.0.1`)

### Issue 2: Physical Device Cannot Connect

**Solution:**
1. Find your computer's IP address:
   - Windows: `ipconfig` to view IPv4 address
   - Mac/Linux: `ifconfig` or `ip addr`
2. Set environment variable:
   ```bash
   # Create .env file in project root
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
   ```
3. Restart Expo app

### Issue 3: Timeout Error

**Solution:**
- Check firewall settings
- Ensure server port 3000 is not occupied
- Try increasing timeout (modify in `apiClient.js`)

## Verify Fix

After fixing, you should see:

```
[API] Health check result: CONNECTED ✅
[Storage] API available flag: true
[Storage] Attempting to save to MongoDB via API...
[API] → POST /api/shutoffs
[API] ✓ POST /api/shutoffs → 200 OK
[Storage] ✅ Successfully saved to MongoDB
```

Instead of:
```
[Storage] API available: false
[Storage] API not available, using AsyncStorage only
```
