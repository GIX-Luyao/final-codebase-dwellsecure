# How to Check if MongoDB Connection is Working

## Quick Diagnostic Steps

### Step 1: Test MongoDB Connection Directly

```bash
cd server
node test-connection.js
```

**If this works:** Your MongoDB connection is good ✅  
**If this fails:** Check your MongoDB connection string and network access

### Step 2: Check if Server is Running

**Open a terminal and run:**
```bash
cd server
npm start
```

**You MUST see:**
```
✅ Successfully connected to MongoDB!
🚀 Server running on port 3000
```

**If you don't see this:** The server isn't running - that's why no data is saving!

### Step 3: Test API from Your Computer

**Open browser:** `http://localhost:3000/health`

**Or use curl:**
```bash
curl http://localhost:3000/health
```

**Expected:**
```json
{"status":"ok","db":"connected"}
```

**If this doesn't work:** Server isn't running or not accessible

### Step 4: Check App Console Logs

**When you save a shutoff, look for these logs:**

**✅ GOOD (saving to MongoDB):**
```
[Storage] Saving shutoff: shutoff-123
[Storage] API available: true
[Storage] Attempting to save to MongoDB via API...
[API] POST /api/shutoffs
[API] Request successful: /api/shutoffs
[Storage] ✅ Successfully saved to MongoDB
```

**❌ BAD (only saving to AsyncStorage):**
```
[Storage] Saving shutoff: shutoff-123
[Storage] API available: false
[Storage] API not available, using AsyncStorage only
[Storage] Saving to AsyncStorage...
```

### Step 5: Check Server Terminal

**When you save data, the SERVER terminal should show:**
```
[API] POST /api/shutoffs - Created shutoff: shutoff-123
```

**If you don't see this:** The request isn't reaching the server

## Most Common Problem

**The server isn't running!**

Make sure you have TWO terminals:
1. **Terminal 1:** `cd server && npm start` (keep this running!)
2. **Terminal 2:** `npm start` (your Expo app)

## Quick Test in App

Add this to test the connection. In your app console, you can run:

```javascript
// Import the diagnostic function
import { diagnoseConnection } from './src/utils/diagnoseConnection';

// Then call it
diagnoseConnection();
```

Or add a test button temporarily to a screen.

## Verify Data in MongoDB

**Option 1: MongoDB Atlas Web**
1. Go to https://cloud.mongodb.com
2. Browse Collections
3. Select `dwellsecure` database
4. Check `shutoffs` collection

**Option 2: Test Script**
```bash
cd server
node test-connection.js
```

This shows how many documents are in each collection.

## Still Not Working?

**Please check and share:**

1. ✅ Is the server running? (`cd server && npm start`)
2. ✅ Does `http://localhost:3000/health` work in your browser?
3. ✅ What does `[API] Platform: ...` show in your app console?
4. ✅ What does `[Storage] API available: ...` show when you save?
5. ✅ Do you see any `[API] POST` logs in the server terminal?
