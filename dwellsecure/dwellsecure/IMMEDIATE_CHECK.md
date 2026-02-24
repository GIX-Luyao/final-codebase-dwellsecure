# 🚨 Immediate Check: Why MongoDB Has No Changes

## ⚠️ Most Important: Backend Server Must Be Running!

**If the backend server is not running, data will only be saved locally, not to MongoDB.**

---

## 📋 3 Required Steps

### ✅ Step 1: Start Backend Server

**Open new PowerShell window:**

```bash
cd server
npm install
npm start
```

**Must see:**
```
✅ Successfully connected to MongoDB!
📊 Database: dwellsecure
🚀 Server running on port 3000
```

**⚠️ Keep this window open!** Closing = server stops = data cannot be saved

---

### ✅ Step 2: Check App Status Indicator

**At the top of Shutoffs list page, you will see:**

- **Green "✅ MongoDB Connected"** = Normal ✅
- **Orange "⚠️ Local Storage Only"** = Server not running ❌

**If you see orange:** Go back to step 1, ensure server is running

---

### ✅ Step 3: Save Data and Check Logs

**When you save shutoff:**

**Check app console (should see):**
```
[Storage] Saving shutoff: shutoff-123
[Storage] API available: true
[Storage] Attempting to save to MongoDB via API...
[API] POST /api/shutoffs
[API] Request successful: /api/shutoffs
[Storage] ✅ Successfully saved to MongoDB
```

**Check server terminal (should see):**
```
[SERVER] Received POST /api/shutoffs request
[SERVER] Saving to MongoDB collection: shutoffs
[SERVER] ✅ MongoDB operation result: { upsertedCount: 1, ... }
[SERVER] ✅ Verified: Document exists in MongoDB
[SERVER] POST /api/shutoffs - Created shutoff: shutoff-123
```

**If you don't see these logs:** Server is not running or request didn't reach it

---

## 🔍 Diagnostic Steps

### 1. Test MongoDB Connection

```bash
cd server
node test-connection.js
```

**Should see:**
```
✅ Successfully connected to MongoDB!
📝 Shutoffs in database: X
```

---

### 2. Test API

**Open in browser:**
```
http://localhost:3000/health
```

**Should see:**
```json
{"status":"ok","db":"connected"}
```

---

### 3. Manually Test Save

**PowerShell:**
```powershell
$body = @{
    id = "test-manual-123"
    type = "gas"
    description = "Manual test"
    verification_status = "unverified"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/shutoffs -Method POST -ContentType "application/json" -Body $body
```

**Then check MongoDB Atlas, should see this document!**

---

## 🚨 Most Likely Problems

### Issue 1: Server Not Running ⭐⭐⭐

**Symptoms:** App shows orange status, console shows "API not available"

**Solution:**
1. Open new terminal
2. `cd server`
3. `npm start`
4. Keep terminal open!

---

### Issue 2: Using Physical Device

**Symptoms:** Network request failed

**Solution:**
1. Find computer IP: `ipconfig` → "IPv4 Address"
2. Create `.env` file (project root):
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
   ```
3. Restart Expo

---

## 📊 Verify Data

**In MongoDB Atlas:**
1. Visit https://cloud.mongodb.com
2. Browse Collections
3. Select `dwellsecure` database
4. View `shutoffs` collection
5. Should see your documents!

**Or run:**
```bash
cd server
node test-connection.js
```

This will show how many documents are in the database.

---

## 💡 Information Needed

**Please tell me:**

1. ✅ Is server running? (Output of `cd server && npm start`)
2. ✅ What shows at top of app? (Green or orange?)
3. ✅ When saving data, what does app console show? (Copy `[Storage]` and `[API]` logs)
4. ✅ When saving data, what does server terminal show? (Any `[SERVER]` logs?)
5. ✅ Can you access `http://localhost:3000/health`?

---

## 🎯 Quick Test

**Simplest method: Test in browser**

```bash
npm start
# Press 'w' to open browser
```

Browser can directly use `localhost:3000`, easiest to verify.
