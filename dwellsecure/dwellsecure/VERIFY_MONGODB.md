# Verify MongoDB Connection - Step by Step

## ⚠️ Most Common Issue: Server Not Running!

**The backend server MUST be running for data to save to MongoDB.**

## Step-by-Step Verification

### ✅ Step 1: Test MongoDB Connection

```bash
cd server
node test-connection.js
```

**Expected output:**
```
✅ Successfully connected to MongoDB!
📝 Shutoffs in database: X
🔧 Utilities in database: Y
✅ Test document inserted: test-...
✅ Verified: Document found in database
```

**If this fails:** Your MongoDB connection string might be wrong or network access is blocked.

---

### ✅ Step 2: Start Backend Server

**Open a NEW terminal window** (keep it open!):

```bash
cd server
npm install  # Only needed first time
npm start
```

**You MUST see:**
```
✅ Successfully connected to MongoDB!
📊 Database: dwellsecure
🚀 Server running on port 3000
📍 Health check: http://localhost:3000/health
🌐 Server listening on all interfaces
```

**⚠️ Keep this terminal open!** If you close it, the server stops and no data will save to MongoDB.

---

### ✅ Step 3: Test API from Computer

**Open your browser:**
```
http://localhost:3000/health
```

**Or use PowerShell:**
```powershell
Invoke-WebRequest -Uri http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "..."
}
```

**If this doesn't work:** Server isn't running or there's a port conflict.

---

### ✅ Step 4: Check App Console Logs

**When your app starts, look for:**
```
[API] Platform: android, API URL: http://10.0.2.2:3000
[API] Checking health at http://10.0.2.2:3000/health
[API] Health check result: CONNECTED ✅
[App] API initialization complete. Available: true
```

**If you see:**
```
[API] Health check failed, will use AsyncStorage fallback
[App] API initialization failed
```

**This means:** The app can't reach the server. Check:
- Is server running? (Step 2)
- Are you on a physical device? (Need to set IP in `.env`)
- Is firewall blocking?

---

### ✅ Step 5: Test Saving Data

**When you save a shutoff, check your APP console:**

**✅ GOOD (saving to MongoDB):**
```
[Storage] Saving shutoff: shutoff-123
[Storage] API available: true
[Storage] Attempting to save to MongoDB via API...
[API] POST /api/shutoffs
[API] Request successful: /api/shutoffs
[Storage] ✅ Successfully saved to MongoDB
```

**❌ BAD (only AsyncStorage):**
```
[Storage] Saving shutoff: shutoff-123
[Storage] API available: false
[Storage] API not available, using AsyncStorage only
[Storage] Saving to AsyncStorage...
```

**If you see "BAD":** The API connection failed. Check Step 4.

---

### ✅ Step 6: Check Server Terminal

**When you save data, the SERVER terminal should show:**
```
[API] POST /api/shutoffs - Created shutoff: shutoff-123
```

**If you DON'T see this:** The request isn't reaching the server. Check:
- Is server running?
- Is the URL correct for your platform?
- Check firewall settings

---

### ✅ Step 7: Verify Data in MongoDB

**Option A: MongoDB Atlas Web**
1. Go to https://cloud.mongodb.com
2. Click "Browse Collections"
3. Select `dwellsecure` database
4. Check `shutoffs` collection
5. You should see your documents!

**Option B: Test Script**
```bash
cd server
node test-connection.js
```

This shows how many documents are in each collection.

---

## Quick Checklist

Before saying "it's not working", verify:

- [ ] Backend server is running (`cd server && npm start`)
- [ ] Server shows "Successfully connected to MongoDB!"
- [ ] `http://localhost:3000/health` works in browser
- [ ] App console shows `[API] Health check result: CONNECTED ✅`
- [ ] When saving, you see `[Storage] ✅ Successfully saved to MongoDB`
- [ ] Server terminal shows `[API] POST /api/shutoffs` logs
- [ ] Data appears in MongoDB Atlas

---

## If Still Not Working

**Share these details:**

1. **What platform?** (Android emulator, iOS simulator, physical device, web)
2. **Is server running?** (What do you see in `cd server && npm start`?)
3. **What does app console show?** (Copy the `[API]` and `[Storage]` logs)
4. **What does server terminal show?** (Any errors or incoming requests?)
5. **Can you access `http://localhost:3000/health`?** (From your computer's browser)

---

## Quick Fix: Test on Web First

The easiest way to verify everything works:

```bash
npm start
# Press 'w' to open in web browser
```

Web browser can use `localhost:3000` directly, so it's the easiest to test.

If web works but mobile doesn't, it's a network/URL issue.
