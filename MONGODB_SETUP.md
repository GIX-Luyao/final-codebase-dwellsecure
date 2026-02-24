# MongoDB Setup Guide

## ✅ Your MongoDB Connection

Your MongoDB connection string is already configured:
```
mongodb+srv://sche753_db_user:AUXacLKPJb8Phpdx@cluster0.bjbz8jy.mongodb.net/?appName=Cluster0
```

## 🚀 Setup Steps

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 2: Start the Backend Server

```bash
cd server
npm start
```

**Expected output:**
```
✅ Successfully connected to MongoDB!
📊 Database: dwellsecure
🚀 Server running on port 3000
📍 Health check: http://localhost:3000/health
```

### Step 3: Verify Connection

**Option A: Browser**
Open: `http://localhost:3000/health`

**Option B: Command Line**
```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "..."
}
```

### Step 4: Start Your Expo App

In a **separate terminal**:

```bash
npm start
```

The app will automatically:
- Try to connect to the API
- If successful, use MongoDB for all operations
- If failed, fall back to AsyncStorage

## 📱 Testing

### Test Saving to MongoDB

1. **Start the server** (Step 2)
2. **Start your app** (Step 4)
3. **Create a shutoff or utility** in the app
4. **Check the server terminal** - you should see:
   ```
   [API] POST /api/shutoffs - Created shutoff: shutoff-123
   ```
5. **Check MongoDB** - the data should appear in your database

### Check Console Logs

When you save data, you should see in your app console:
```
[Storage] Saving shutoff: shutoff-123
[Storage] API available: true
[Storage] Attempting to save to MongoDB via API...
[API] POST /api/shutoffs
[API] Request successful: /api/shutoffs
[Storage] ✅ Successfully saved to MongoDB
```

## 🔧 Troubleshooting

### Issue: "Network request failed"

**If using Android emulator:**
- Should automatically use `http://10.0.2.2:3000` ✅

**If using iOS simulator:**
- Should automatically use `http://localhost:3000` ✅

**If using physical device:**
1. Find your computer's IP:
   - Windows: `ipconfig` → "IPv4 Address"
   - Mac/Linux: `ifconfig` → `inet` address
2. Create `.env` in project root:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
   ```
3. Restart Expo

### Issue: "MongoDB connection error"

- Check your MongoDB connection string is correct
- Verify MongoDB Atlas network access allows your IP
- Check MongoDB Atlas cluster is running

### Issue: Data not appearing in MongoDB

1. Check server logs for errors
2. Check app console for `[Storage]` and `[API]` logs
3. Verify server is running and accessible
4. Test health endpoint: `curl http://localhost:3000/health`

## 📊 Database Collections

Your data will be stored in:
- **Database:** `dwellsecure`
- **Collections:**
  - `shutoffs` - All shutoff records
  - `utilities` - All utility records

## ✅ Success Indicators

You'll know it's working when:
- ✅ Server shows "Successfully connected to MongoDB!"
- ✅ Health endpoint returns `"db": "connected"`
- ✅ App console shows `[API] Health check result: CONNECTED ✅`
- ✅ Saving data shows `[Storage] ✅ Successfully saved to MongoDB`
- ✅ Data appears in MongoDB Atlas
