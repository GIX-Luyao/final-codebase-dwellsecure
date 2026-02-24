# Diagnosis: Why Data Not Written to MongoDB

## 🔍 Problem Checklist

### ✅ Step 1: Confirm Backend Server Is Running

**Open new terminal window, run:**

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

**⚠️ Important: Keep this terminal window open!** If closed, server stops, data cannot be saved to MongoDB.

---

### ✅ Step 2: Test MongoDB Connection

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

**If failed:** MongoDB connection string may have issues.

---

### ✅ Step 3: Test if API Is Accessible

**Open in browser:**
```
http://localhost:3000/health
```

**Or use PowerShell:**
```powershell
Invoke-WebRequest -Uri http://localhost:3000/health
```

**Should see:**
```json
{
  "status": "ok",
  "db": "connected"
}
```

**If you don't see this:** Server is not running or port is occupied.

---

### ✅ Step 4: Check App Console Logs

**When app starts, check console:**

**✅ Good (connected):**
```
[API] Platform: android, API URL: http://10.0.2.2:3000
[API] Checking health at http://10.0.2.2:3000/health
[API] Health check result: CONNECTED ✅
[App] API initialization complete. Available: true
```

**❌ Bad (not connected):**
```
[API] Health check failed, will use AsyncStorage fallback
[App] API initialization failed
```

---

### ✅ Step 5: Check Logs When Saving Data

**When you save a shutoff, check app console:**

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
[Storage] Saving shutoff: shutoff-123
[Storage] API available: false
[Storage] API not available, using AsyncStorage only
[Storage] Saving to AsyncStorage...
```

**If you see "bad":** API connection failed, check step 4.

---

### ✅ Step 6: Check Server Terminal

**When you save data, server terminal should show:**
```
[API] POST /api/shutoffs - Created shutoff: shutoff-123
```

**If you don't see this:** Request didn't reach server. Check:
- Is server running?
- Is URL correct?
- Firewall settings

---

### ✅ Step 7: Verify in MongoDB Atlas

1. Visit https://cloud.mongodb.com
2. Click "Browse Collections"
3. Select `dwellsecure` database
4. View `shutoffs` collection
5. Should see your documents!

---

## 🚨 Most Common Issues

### Issue 1: Server Not Running

**Symptoms:** App console shows "API not available"

**Solution:**
```bash
cd server
npm start
```
Keep terminal open!

---

### Issue 2: Using Physical Device for Testing

**Symptoms:** Network request failed

**Solution:**
1. Find your computer's IP address:
   - Windows: `ipconfig` → Look for "IPv4 Address"
   - Mac/Linux: `ifconfig` → Look for `inet` address

2. Create `.env` file in project root:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000
   ```
   For example: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000`

3. Restart Expo:
   ```bash
   # Stop current server (Ctrl+C)
   npm start
   ```

---

### Issue 3: MongoDB Connection Failed

**Symptoms:** Server shows "MongoDB connection error"

**Solution:**
1. Check MongoDB Atlas network access settings
2. Ensure your IP address is allowed access
3. Verify connection string is correct

---

## 🧪 Quick Tests

### Test 1: Test in Web Browser

Simplest method:

```bash
npm start
# Press 'w' to open in browser
```

Browser can directly use `localhost:3000`, easiest to test.

---

### Test 2: Manually Test API

**Create test shutoff:**
```bash
curl -X POST http://localhost:3000/api/shutoffs ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"test-123\",\"type\":\"gas\",\"description\":\"Test\",\"verification_status\":\"unverified\"}"
```

**View all shutoffs:**
```bash
curl http://localhost:3000/api/shutoffs
```

If these commands work, API is normal, problem is in app connection.

---

## 📋 Information Needed

If still not working, please provide:

1. ✅ Is server running? (What is the output of `cd server && npm start`?)
2. ✅ What does app console show? (Copy `[API]` and `[Storage]` logs)
3. ✅ What does server terminal show? (Any errors or incoming requests?)
4. ✅ Can you access `http://localhost:3000/health`? (From your computer's browser)
5. ✅ What platform are you using? (Android emulator, iOS simulator, physical device, Web)

---

## 🎯 Quick Fix

**Most likely problem: Server is not running!**

Ensure you have **two terminal windows**:
1. **Terminal 1:** `cd server && npm start` (Keep running!)
2. **Terminal 2:** `npm start` (Your Expo app)

If server is not running, data will only be saved to AsyncStorage, not to MongoDB!
