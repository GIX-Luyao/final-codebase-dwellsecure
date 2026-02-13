# 🔍 Problem Diagnosis: Data Not Written to MongoDB

## ⚠️ Most Important: Backend Server Must Be Running!

**If the backend server is not running, data will only be saved to local AsyncStorage, not to MongoDB.**

---

## 📋 Required Steps

### Step 1: Start Backend Server

**Open new PowerShell or CMD window:**

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

**⚠️ Keep this window open!** Closing window = server stops = data cannot be saved to MongoDB

---

### Step 2: Verify Server Is Running

**Open in browser:**
```
http://localhost:3000/health
```

**Should see:**
```json
{"status":"ok","db":"connected"}
```

**If you don't see this:** Server is not running, go back to step 1

---

### Step 3: Check Status Indicator in App

**At the top of Shutoffs list page, you will see:**

- **Green "✅ MongoDB Connected"** = Working normally, data will be saved to MongoDB ✅
- **Orange "⚠️ Local Storage Only (MongoDB Not Connected)"** = Server not running or cannot connect ❌

**If you see orange:** Check steps 1 and 2

---

### Step 4: Check Logs When Saving Data

**When you save shutoff, check app console:**

**✅ Good (saved to MongoDB):**
```
[Storage] ✅ Successfully saved to MongoDB
[API] Request successful: /api/shutoffs
```

**❌ Bad (only saved locally):**
```
[Storage] API not available, using AsyncStorage only
[Storage] Saving to AsyncStorage...
```

---

### Step 5: Check Server Terminal

**When you save data, server terminal should show:**
```
[API] POST /api/shutoffs - Created shutoff: shutoff-123
```

**If you don't see this:** Request didn't reach server

---

## 🚨 Common Issues

### Issue 1: Server Not Running

**Symptoms:** App shows orange "Local Storage Only"

**Solution:**
1. Open new terminal
2. `cd server`
3. `npm start`
4. Keep terminal open!

---

### Issue 2: Using Real Phone/Tablet

**Symptoms:** Network request failed

**Solution:**
1. Find computer IP: `ipconfig` → "IPv4 Address"
2. Create `.env` file (project root):
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
   ```
   For example: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000`
3. Restart Expo

---

### Issue 3: MongoDB Connection Failed

**Symptoms:** Server shows "MongoDB connection error"

**Solution:**
1. Run `node server/test-connection.js` to test connection
2. Check MongoDB Atlas network access settings
3. Confirm connection string is correct

---

## 🧪 Quick Tests

### Test 1: Test in Browser (Simplest)

```bash
npm start
# Press 'w' to open browser
```

Browser can directly use `localhost:3000`, easiest to verify.

---

### Test 2: Manually Test API

**Create test shutoff:**
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/shutoffs -Method POST -ContentType "application/json" -Body '{"id":"test-123","type":"gas","description":"Test","verification_status":"unverified"}'
```

**View all shutoffs:**
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/shutoffs
```

If these commands work, API is normal, problem is in app connection.

---

## 📊 Verify Data

**In MongoDB Atlas:**
1. Visit https://cloud.mongodb.com
2. Browse Collections
3. Select `dwellsecure` database
4. View `shutoffs` collection
5. Should see your documents!

---

## 💡 Need Help?

**Please provide:**
1. ✅ Is server running? (Output of `cd server && npm start`)
2. ✅ What shows at top of app? (Green or orange status?)
3. ✅ What does app console show? (`[API]` and `[Storage]` logs)
4. ✅ What does server terminal show? (Any `[API] POST` logs?)
5. ✅ Can you access `http://localhost:3000/health`?
