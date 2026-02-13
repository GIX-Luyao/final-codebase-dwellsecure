# 🔍 Diagnosis: App Data Not Saved to MongoDB

## ✅ Good News: Database Connection Successful!

But data in the app was not saved. Let's diagnose the problem.

---

## 📋 Diagnostic Steps

### ✅ Step 1: Confirm Server Is Running

**Server must be running to receive app requests!**

**Open PowerShell:**

```bash
cd server
npm start
```

**Must see:**
```
✅ Successfully connected to MongoDB!
🚀 Server running on port 3000
📊 Database status: CONNECTED ✅
```

**⚠️ Keep this window open!**

---

### ✅ Step 2: Check App Status Indicator

**In the app, at the top of Shutoffs list page:**

- **Green "✅ MongoDB Connected"** = Normal ✅
- **Orange "⚠️ Local Storage Only"** = Server not connected ❌

**If showing orange:** Server is not running or cannot connect.

---

### ✅ Step 3: Add Data and Check Logs

**When you add Property:**

**Check app console (Expo terminal), should see:**
```
[Storage] Saving property: property-123
[Storage] API available: true
[Storage] Attempting to save to MongoDB via API...
[API] POST /api/properties
[API] Request successful: /api/properties
[Storage] ✅ Successfully saved to MongoDB
```

**If you see:**
```
[Storage] API not available, using AsyncStorage only
[Storage] Saving to AsyncStorage...
```

**This means:** API connection failed, data only saved locally.

---

**Check server terminal, should see:**
```
[HTTP] POST /api/properties
[number] ========== POST /api/properties ==========
[number] Database status: CONNECTED ✅
[number] ✅ VERIFIED: Document exists in MongoDB
[number] 📊 Total properties in database: 1
```

**If you don't see these logs:** Request didn't reach server.

---

### ✅ Step 4: Test API Health Check

**Open in browser:**
```
http://localhost:3000/health
```

**Should see:**
```json
{
  "status": "ok",
  "db": "connected"
}
```

**If you don't see or see error:** Server is not running or not accessible.

---

### ✅ Step 5: Check Network Connection (if using physical device)

**If you use physical device (not emulator):**

1. **Find your computer's IP address:**
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. **Create `.env` file (project root):**
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
   ```
   For example: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000`

3. **Restart Expo:**
   ```bash
   # Stop current server (Ctrl+C)
   npm start
   ```

---

## 🚨 Common Issues

### Issue 1: Server Not Running

**Symptoms:** App shows orange status, console shows "API not available"

**Solution:**
1. Open new terminal
2. `cd server`
3. `npm start`
4. Keep terminal open!

---

### Issue 2: Using Physical Device But API URL Wrong

**Symptoms:** Network request failed

**Solution:**
1. Find computer IP: `ipconfig`
2. Create `.env` file: `EXPO_PUBLIC_API_URL=http://YOUR_IP:3000`
3. Restart Expo

---

### Issue 3: Request Didn't Reach Server

**Symptoms:** Server terminal has no `[HTTP] POST` logs

**Possible causes:**
- API URL misconfigured
- Firewall blocking
- Network issue

**Solution:**
1. Check API URL in `src/services/apiClient.js`
2. Test if `http://localhost:3000/health` is accessible
3. Check firewall settings

---

## 🧪 Quick Tests

### Test 1: Manually Test API

**PowerShell:**
```powershell
$body = @{
    id = "test-manual-$(Get-Date -Format 'yyyyMMddHHmmss')"
    name = "Test Property"
    address = "Test Address"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/properties -Method POST -ContentType "application/json" -Body $body
```

**Then check server terminal, should see save logs!**

---

### Test 2: Check Database

**Run:**
```bash
cd server
node check-all-data.js
```

**Should display all data in database.**

---

## 💡 Information Needed

**Please tell me:**

1. ✅ **Is server running?** (Output of `cd server && npm start`)
2. ✅ **What color shows at top of app?** (Green or orange?)
3. ✅ **When adding Property, what does app console show?** (Copy all `[Storage]` and `[API]` logs)
4. ✅ **When adding Property, what does server terminal show?** (Any `[HTTP] POST` logs?)
5. ✅ **Can you access `http://localhost:3000/health`?** (From browser)
6. ✅ **What platform are you using?** (Android emulator, iOS simulator, physical device, Web)

---

## 🎯 Most Likely Problem

**90% of the time, the problem is: Server is not running!**

**Ensure:**
1. Server is running (`cd server && npm start`)
2. Server shows "Database status: CONNECTED ✅"
3. Server window stays open

**If server is not running, data will only be saved to local AsyncStorage, not to MongoDB!**
