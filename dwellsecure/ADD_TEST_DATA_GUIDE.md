# 🧪 Add Integration Test Data Guide

## 📋 Test Case Data

I have prepared data for three test cases:

### Test Case 1: Water Shutoff
- **ID:** `test-water-shutoff-001`
- **Type:** water
- **Status:** verified
- **Created:** 2024-01-15T08:30:00.000Z
- **Updated:** 2024-01-20T14:22:00.000Z

### Test Case 2: Gas Shutoff
- **ID:** `test-gas-shutoff-002`
- **Type:** gas
- **Status:** verified
- **Created:** 2024-02-10T11:15:00.000Z
- **Updated:** 2024-02-18T16:45:00.000Z

### Test Case 3: Incomplete Shutoff
- **ID:** `test-incomplete-shutoff-003`
- **Type:** electric
- **Status:** unverified
- **Missing:** description, location
- **Created:** 2024-03-01T12:00:00.000Z

---

## 🚀 Methods to Add Data

### Method 1: Via API (Recommended, if server is running)

**Prerequisite:** Server must be running

```bash
cd server
node add-test-data-via-api.js
```

**This method does not require direct MongoDB connection, but uses HTTP API instead, so you won't encounter SSL errors.**

---

### Method 2: Direct MongoDB Connection (if connection is normal)

```bash
cd server
node add-test-data.js
```

**Note:** If you encounter SSL errors, use Method 1.

---

### Method 3: Manually Add in App

1. **Start server** (`cd server && npm start`)
2. **Start app**
3. **Add three shutoffs in app:**
   - Water shutoff (using Test Case 1 data)
   - Gas shutoff (using Test Case 2 data)
   - Electric shutoff (using Test Case 3 data, don't fill description and location)

---

## 📝 Detailed Data

### Test Case 1: Water Shutoff

```json
{
  "id": "test-water-shutoff-001",
  "type": "water",
  "description": "Main water shutoff valve located in basement utility room",
  "location": "Basement Utility Room, Near Water Heater",
  "verification_status": "verified",
  "notes": "Test Case 1: User requests water shutoff - Expected: backend returns water shutoff info",
  "contacts": [
    {
      "name": "Plumber John",
      "phone": "555-0101",
      "role": "Emergency Plumber"
    }
  ],
  "createdAt": "2024-01-15T08:30:00.000Z",
  "updatedAt": "2024-01-20T14:22:00.000Z"
}
```

### Test Case 2: Gas Shutoff

```json
{
  "id": "test-gas-shutoff-002",
  "type": "gas",
  "description": "Main gas shutoff valve located outside near meter",
  "location": "Exterior Wall, Near Gas Meter",
  "verification_status": "verified",
  "notes": "Test Case 2: User requests gas shutoff - Expected: correct gas data returned",
  "contacts": [
    {
      "name": "Gas Company Emergency",
      "phone": "555-0202",
      "role": "Gas Utility Provider"
    },
    {
      "name": "HVAC Technician",
      "phone": "555-0303",
      "role": "Certified Gas Technician"
    }
  ],
  "createdAt": "2024-02-10T11:15:00.000Z",
  "updatedAt": "2024-02-18T16:45:00.000Z"
}
```

### Test Case 3: Incomplete Shutoff

```json
{
  "id": "test-incomplete-shutoff-003",
  "type": "electric",
  "verification_status": "unverified",
  "notes": "Test Case 3: Missing data in database - Expected: app shows fallback message",
  "createdAt": "2024-03-01T12:00:00.000Z",
  "updatedAt": "2024-03-01T12:00:00.000Z"
}
```

---

## 🧪 Testing Steps

### Step 1: Add Data

**If server is running, use:**
```bash
cd server
node add-test-data-via-api.js
```

**If server is not running:**
1. Start server: `cd server && npm start`
2. Then run: `node add-test-data-via-api.js`

---

### Step 2: Verify Data

**Run:**
```bash
cd server
node check-current-data.js
```

**Should see data for all three test cases.**

---

### Step 3: Test in App

1. **Test Case 1:** View `test-water-shutoff-001` in app
   - Should display complete water shutoff information

2. **Test Case 2:** View `test-gas-shutoff-002` in app
   - Should display complete gas shutoff information
   - App should not crash

3. **Test Case 3:** View `test-incomplete-shutoff-003` in app
   - Should display fallback message (e.g., "No description available")
   - App should not crash

---

## 💡 Tips

- **Recommended to use Method 1 (via API)** - Won't encounter SSL errors
- **Ensure server is running** - This is most important
- **Timestamps are set** - All data have reasonable createdAt and updatedAt

---

## 🎯 Quick Start

1. **Start server:**
   ```bash
   cd server
   npm start
   ```

2. **Add test data:**
   ```bash
   node add-test-data-via-api.js
   ```

3. **Verify data:**
   ```bash
   node check-current-data.js
   ```

4. **Test in app!**
