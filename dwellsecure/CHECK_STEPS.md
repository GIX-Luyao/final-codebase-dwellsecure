# 🔍 Check Steps: Why Data Not Written to MongoDB

## ⚠️ Most Important: Backend Server Must Be Running!

**The most common reason data cannot be written to MongoDB is: Backend server is not running.**

---

## 📋 Quick Checklist

### 1️⃣ Is Backend Server Running?

**Open new PowerShell or CMD window:**

```bash
cd server
npm install
npm start
```

**Must see this information:**
```
✅ Successfully connected to MongoDB!
📊 Database: dwellsecure
🚀 Server running on port 3000
📍 Health check: http://localhost:3000/health
```

**⚠️ Keep this window open!** If closed, server stops, data cannot be saved.

---

### 2️⃣ Test MongoDB Connection

**Run in server directory:**

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

### 3️⃣ Test if API Is Working

**Open in browser:**
```
http://localhost:3000/health
```

**Should see:**
```json
{"status":"ok","db":"connected"}
```

**If you don't see this:** Server is not running.

---

### 4️⃣ Check App Console

**When app starts, check console logs:**

**✅ Good (connected):**
```
[API] Platform: android, API URL: http://10.0.2.2:3000
[API] Health check result: CONNECTED ✅
[App] API initialization complete. Available: true
```

**❌ Bad (not connected):**
```
[API] Health check failed
[App] API initialization failed
```

---

### 5️⃣ Check Logs When Saving Data

**When you save shutoff, check app console:**

**✅ Good (saving to MongoDB):**
```
[Storage] Saving shutoff: shutoff-123
[Storage] API available: true
[Storage] Attempting to save to MongoDB via API...
[API] POST /api/shutoffs
[API] Request successful: /api/shutoffs
[Storage] ✅ Successfully saved to MongoDB
```

**❌ Bad (only saving to AsyncStorage):**
```
[Storage] API available: false
[Storage] API not available, using AsyncStorage only
```

---

### 6️⃣ Check Server Terminal

**When you save data, server terminal should show:**
```
[API] POST /api/shutoffs - Created shutoff: shutoff-123
```

**If you don't see this:** Request didn't reach server.

---

## 🚨 Common Issue Solutions

### Issue 1: Server Not Running

**Symptoms:** App shows "API not available"

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

### Issue 3: MongoDB Connection Failed

**Symptoms:** Server shows connection error

**Solution:**
1. Run `node server/test-connection.js` to test connection
2. Check MongoDB Atlas network access settings
3. Confirm connection string is correct

---

## 🧪 Quick Test

### Simplest Method: Test in Browser

```bash
npm start
# Press 'w' to open browser
```

Browser can directly use `localhost:3000`, easiest to verify.

---

## 📊 Verify Data

**In MongoDB Atlas:**
1. Visit https://cloud.mongodb.com
2. Browse Collections
3. Select `dwellsecure` database
4. View `shutoffs` collection

---

## 💡 Need Help?

**Please provide:**
1. Is server running? (Output of `cd server && npm start`)
2. What does app console show? (`[API]` and `[Storage]` logs)
3. What does server terminal show? (Any `[API] POST` logs?)
4. Can you access `http://localhost:3000/health`?
