# Quick Start: MongoDB Connection

## Step 1: Verify MongoDB Connection

Test if your MongoDB connection works:

```bash
cd server
node test-connection.js
```

**Expected output:**
```
✅ Successfully connected to MongoDB!
📝 Shutoffs in database: 0
🔧 Utilities in database: 0
✅ Test document inserted: test-...
✅ Verified: Document found in database
```

If this works, your MongoDB connection is good! ✅

## Step 2: Start the Backend Server

**Open a NEW terminal window** and run:

```bash
cd server
npm install
npm start
```

**You should see:**
```
✅ Successfully connected to MongoDB!
📊 Database: dwellsecure
🚀 Server running on port 3000
📍 Health check: http://localhost:3000/health
```

**Keep this terminal open!** The server must be running for the app to save to MongoDB.

## Step 3: Test the API

**In your browser or another terminal:**

```bash
curl http://localhost:3000/health
```

**Or open in browser:** `http://localhost:3000/health`

**Expected response:**
```json
{
  "status": "ok",
  "db": "connected"
}
```

## Step 4: Start Your App

**In a DIFFERENT terminal** (keep server running):

```bash
npm start
```

## Step 5: Check Console Logs

When you save a shutoff or utility, **check your app console** for:

**✅ Good signs:**
```
[API] Platform: android, API URL: http://10.0.2.2:3000
[API] Health check result: CONNECTED ✅
[Storage] Saving shutoff: shutoff-123
[Storage] API available: true
[Storage] Attempting to save to MongoDB via API...
[API] POST /api/shutoffs
[API] Request successful: /api/shutoffs
[Storage] ✅ Successfully saved to MongoDB
```

**❌ Bad signs (means it's using AsyncStorage only):**
```
[API] Health check failed, will use AsyncStorage fallback
[Storage] API not available, using AsyncStorage only
[Storage] Saving to AsyncStorage...
```

## Step 6: Verify Data in MongoDB

**Option A: MongoDB Atlas Web Interface**
1. Go to MongoDB Atlas
2. Browse Collections
3. Select `dwellsecure` database
4. Check `shutoffs` and `utilities` collections

**Option B: Test Script**
```bash
cd server
node test-connection.js
```

This will show you how many documents are in each collection.

## Common Issues

### Issue: "API not available" in logs

**Check:**
1. Is the server running? (`cd server && npm start`)
2. Can you access `http://localhost:3000/health` from your computer?
3. If using physical device, did you set `EXPO_PUBLIC_API_URL` in `.env`?

### Issue: Server shows "MongoDB connection error"

**Check:**
1. Run `node test-connection.js` to verify MongoDB connection
2. Check MongoDB Atlas network access allows your IP
3. Verify connection string is correct

### Issue: Data saves but doesn't appear in MongoDB

**Check:**
1. Look at server terminal - do you see `[API] POST /api/shutoffs` logs?
2. Check server terminal for any errors
3. Verify you're looking at the correct database (`dwellsecure`)

## Still Not Working?

**Share these details:**
1. What do you see when you run `node server/test-connection.js`?
2. What do you see in the server terminal when you save data?
3. What do you see in the app console when you save data?
4. Can you access `http://localhost:3000/health` from your browser?
