# How to Open the Project and Connect the Database (Terminal)

## 1. Open the project in the terminal

```bash
# Go to the project root
cd /Users/cherry/Downloads/psdwell-main/dwellsecure
```

---

## 2. Backend server + database (MongoDB)

The backend uses **MongoDB Atlas** (cloud). To connect the database and run the API:

### Option A: Use the built-in Atlas connection (default)

The server already has a MongoDB Atlas connection string in code. You only need to:

1. **Install dependencies** (once):
   ```bash
   cd server
   npm install
   cd ..
   ```

2. **Ensure MongoDB Atlas is reachable:**
   - Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
   - If the cluster **Haven** is **Paused**, click **Resume** and wait a few minutes
   - In **Network Access**, add your current IP (or `0.0.0.0/0` for testing)

3. **Start the server** (connects to DB automatically):
   ```bash
   cd server
   npm start
   ```
   When it works you’ll see something like:
   - `✅ MongoDB connection established and verified!`
   - `🚀 Server running on port 3000`

### Option B: Use your own MongoDB (local or Atlas) with `.env`

1. **Create a `.env` file** in the `server` folder:
   ```bash
   cd server
   touch .env
   ```
   Add one line (replace with your connection string):
   ```
   MONGODB_URI=mongodb://localhost:27017/dwellsecure
   ```
   Or for Atlas:
   ```
   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.xxxxx.mongodb.net/dwellsecure?retryWrites=true&w=majority
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

### Test database connection (optional)

From the `server` folder:

```bash
cd server
node test-mongodb-connection.js
```

---

## 3. Run the web app (optional)

In a **second terminal**:

```bash
cd /Users/cherry/Downloads/psdwell-main/dwellsecure/figma-generated
npm install
npm run dev
```

Then open: **http://localhost:5173**

---

## 4. Run the Expo mobile app (optional)

In another terminal:

```bash
cd /Users/cherry/Downloads/psdwell-main/dwellsecure
npm install
npm start
```

Then press `w` for web, or scan the QR code with Expo Go on your phone.

---

## Quick reference

| Task              | Directory              | Command        |
|-------------------|------------------------|----------------|
| Start API + DB    | `dwellsecure/server/`  | `npm start`    |
| Test DB only      | `dwellsecure/server/`  | `node test-mongodb-connection.js` |
| Start web app     | `dwellsecure/figma-generated/` | `npm run dev` |
| Start Expo app    | `dwellsecure/`         | `npm start`    |

**API base URL when server is running:** `http://localhost:3000`  
**Health check:** `http://localhost:3000/health`
