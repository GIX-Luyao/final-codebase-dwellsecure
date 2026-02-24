# Integration Test Guide for Dwell Secure

This guide explains how to run the integration test to verify the complete flow of creating, persisting, and retrieving water utility/shutoff data.

## Test Requirements

The integration test verifies:

1. ✅ **Create a new water utility/shutoff from UI** → Sends POST request to backend
2. ✅ **Persist the data in MongoDB** → Verifies data is saved in database
3. ✅ **Retrieve the data via GET request by utility type** → Fetches water shutoffs using `?type=water`
4. ✅ **Display location and technician name in UI** → Verifies data structure contains required fields

## Prerequisites

1. **Backend server must be running:**
   ```bash
   cd server
   npm start
   ```

2. **MongoDB connection must be active** (server should show "✅ MongoDB connection established")

3. **Node.js** with `fetch` support (Node 18+ or install `node-fetch`)

## Running the Integration Test

### Option 1: Run the test script directly

```bash
cd server
node integration-test.js
```

### Option 2: Run with custom API URL

```bash
cd server
API_BASE_URL=http://localhost:3000 node integration-test.js
```

For Android emulator:
```bash
cd server
API_BASE_URL=http://10.0.2.2:3000 node integration-test.js
```

## Test Flow

### Step 1: Create Water Shutoff (POST)

The test creates a water shutoff with:
- **Type**: `water`
- **Description**: "Main water shutoff valve"
- **Location**: "Basement utility room"
- **Technician**: "John Plumber" (in contacts array)
- **Verification Status**: `verified`

**Expected Result**: POST request succeeds, returns created shutoff object.

### Step 2: Verify MongoDB Persistence

The test directly queries MongoDB to verify:
- Shutoff document exists in `shutoffs` collection
- Document has correct `id` and `type`

**Expected Result**: Document found in MongoDB with matching ID.

### Step 3: Retrieve by Type (GET)

The test makes a GET request:
```
GET /api/shutoffs?type=water
```

**Expected Result**: Returns array of water shutoffs, including the one just created.

### Step 4: Verify Display Data

The test verifies each shutoff has:
- **Location**: Non-empty string
- **Technician Name**: At least one contact with a name

**Expected Result**: All shutoffs have location and technician name.

## Expected Output

```
============================================================
🧪 Dwell Secure Integration Test
============================================================

✅ Server is running: ok
✅ Database status: connected

📝 Test 1: Create a new water utility/shutoff via POST
------------------------------------------------------------
✅ POST /api/shutoffs: Successfully created shutoff: integration-test-water-1234567890

💾 Test 2: Verify data persisted in MongoDB
------------------------------------------------------------
✅ MongoDB Persistence: Shutoff integration-test-water-1234567890 found in database

📥 Test 3: Retrieve data via GET request by utility type (water)
------------------------------------------------------------
✅ GET /api/shutoffs?type=water: Retrieved 5 water shutoffs

🖥️  Test 4: Verify location and technician name are present
------------------------------------------------------------
✅ Location for integration-test-water-1234567890: Location: Basement utility room
✅ Technician for integration-test-water-1234567890: Technician: John Plumber

============================================================
📊 Test Summary
============================================================
✅ Passed: 6
❌ Failed: 0
📝 Total: 6

🎉 All integration tests passed!
```

## Manual Testing in UI

After running the integration test, you can also verify in the app:

1. **Create a water shutoff:**
   - Navigate to Shutoffs screen
   - Tap "+" to add new shutoff
   - Select "Water" type
   - Enter location (e.g., "Basement utility room")
   - Add contact/technician (e.g., "John Plumber", "555-1234", "Plumber")
   - Save

2. **Verify in MongoDB:**
   - Check MongoDB Atlas or run: `node server/check-current-data.js`
   - Verify the shutoff appears in the `shutoffs` collection

3. **Retrieve and display:**
   - View the shutoff in the app
   - Verify location is displayed
   - Verify technician name is displayed (from contacts array)

## API Endpoints Used

### POST /api/shutoffs
Creates or updates a shutoff record.

**Request Body:**
```json
{
  "id": "unique-id",
  "type": "water",
  "description": "Main water shutoff valve",
  "location": "Basement utility room",
  "verification_status": "verified",
  "contacts": [
    {
      "name": "John Plumber",
      "phone": "555-1234",
      "role": "Plumber"
    }
  ]
}
```

### GET /api/shutoffs?type=water
Retrieves all shutoffs of a specific type.

**Response:**
```json
[
  {
    "id": "unique-id",
    "type": "water",
    "description": "Main water shutoff valve",
    "location": "Basement utility room",
    "contacts": [
      {
        "name": "John Plumber",
        "phone": "555-1234",
        "role": "Plumber"
      }
    ]
  }
]
```

## Troubleshooting

### Server not running
**Error**: `Cannot connect to server at http://localhost:3000`

**Solution**: Start the server:
```bash
cd server
npm start
```

### MongoDB not connected
**Error**: `Database not connected`

**Solution**: 
1. Check MongoDB Atlas cluster is active
2. Verify IP address is whitelisted
3. Check connection string in `server/index.js`

### No shutoffs returned
**Error**: `Retrieved 0 water shutoffs`

**Solution**: 
1. Verify test shutoff was created (check MongoDB)
2. Check type field is exactly "water" (case-sensitive)
3. Verify GET endpoint supports `?type=water` query parameter

## Cleanup

The integration test automatically cleans up the test data it creates. If you need to manually clean up:

```bash
cd server
node -e "
const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://sche753_db_user:jHTpcO0mULceeQtA@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven';
const client = new MongoClient(uri);
(async () => {
  await client.connect();
  const db = client.db('dwellsecure');
  await db.collection('shutoffs').deleteMany({ id: /^integration-test-/ });
  console.log('Cleaned up test data');
  await client.close();
})();
"
```
