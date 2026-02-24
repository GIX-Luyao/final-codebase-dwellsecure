# 🧪 Testing Steps: Verify MongoDB Data Save

## ⚠️ Prerequisite: Server Must Be Running

**Before starting tests, ensure backend server is running:**

```bash
cd server
npm start
```

**Must see:**
```
✅ Successfully connected to MongoDB!
🚀 Server running on port 3000
```

---

## 📋 Testing Steps

### Step 1: Check App Status

1. Open app
2. Go to Shutoffs list page
3. **Check status indicator at top of page:**
   - ✅ Green = MongoDB connected
   - ⚠️ Orange = Local storage only (server not running)

**If you see orange:** Stop testing, start server first!

---

### Step 2: Save a Shutoff

1. Click "+" button to add new shutoff
2. Fill in information (type, description, location, etc.)
3. Click save

---

### Step 3: Check App Console Logs

**In app console (Expo terminal), should see:**

```
[Storage] Saving shutoff: 1234567890
[Storage] API available: true
[Storage] Attempting to save to MongoDB via API...
[API] POST /api/shutoffs
[API] Request successful: /api/shutoffs
[Storage] ✅ Successfully saved to MongoDB
```

**If you see:**
```
[Storage] API not available, using AsyncStorage only
```

**This means:** Server is not running or cannot connect!

---

### Step 4: Check Server Terminal Logs

**In server terminal (`cd server && npm start`), should see:**

```
[SERVER] Received POST /api/shutoffs request
[SERVER] Request body: { ... }
[SERVER] Saving to MongoDB collection: shutoffs
[SERVER] Shutoff ID: 1234567890
[SERVER] ✅ MongoDB operation result: { upsertedCount: 1, ... }
[SERVER] ✅ Verified: Document exists in MongoDB with ID: 1234567890
[SERVER] POST /api/shutoffs - Created shutoff: 1234567890
```

**If you don't see these logs:** Request didn't reach server!

---

### Step 5: Verify MongoDB Atlas

1. Visit https://cloud.mongodb.com
2. Log in to your account
3. Select your Cluster
4. Click "Browse Collections"
5. Select `dwellsecure` database
6. View `shutoffs` collection
7. **Should see the document you just saved!**

---

### Step 6: Verify Using Command Line

**Run:**

```bash
cd server
node test-connection.js
```

**Should show:**
```
✅ Successfully connected to MongoDB!
📝 Shutoffs in database: X
```

**X should be greater than 0 (if you've already saved data)**

---

## 🚨 If Data Was Not Saved

### Checklist:

1. ✅ **Is server running?**
   - Run `cd server && npm start`
   - Must see "Server running on port 3000"

2. ✅ **Does app show green status?**
   - If showing orange, server is not connected

3. ✅ **Are there errors in app console?**
   - Check `[Storage]` and `[API]` logs
   - If there are errors, copy error messages

4. ✅ **Are there logs in server terminal?**
   - When saving data, should see `[SERVER]` logs
   - If not, request didn't reach server

5. ✅ **Is API accessible?**
   - Open in browser: `http://localhost:3000/health`
   - Should see: `{"status":"ok","db":"connected"}`

---

## 💡 Common Issues

### Issue 1: Server Not Running

**Symptoms:** App shows orange status

**Solution:** Start server and keep it running

---

### Issue 2: Using Physical Device

**Symptoms:** Network request failed

**Solution:**
1. Find computer IP: `ipconfig`
2. Create `.env` file: `EXPO_PUBLIC_API_URL=http://YOUR_IP:3000`
3. Restart Expo

---

### Issue 3: MongoDB Connection Failed

**Symptoms:** Server shows connection error

**Solution:**
1. Run `node server/test-connection.js`
2. Check MongoDB Atlas network access settings
3. Confirm connection string is correct

---

## 📊 Information Needed

**If still not working, please provide:**

1. Is server running? (Output of `cd server && npm start`)
2. What color shows at top of app? (Green or orange?)
3. When saving data, what does app console show? (Copy all `[Storage]` and `[API]` logs)
4. When saving data, what does server terminal show? (Copy all `[SERVER]` logs)
5. Can you access `http://localhost:3000/health`?
