# 🧪 Complete Integration Test Guide

## ✅ Test Data Added

All test case data has been added to MongoDB, including multiple scenarios for comprehensive verification.

**⏱️ Timestamp Characteristics:**
- All test data timestamps are **randomly generated** (not round hour times)
- All tests completed within **1 hour** (usually 50-60 minutes)
- Timestamp **order is meaningful** (earlier created data has earlier timestamps)
- Timestamps are on 2026-01-26 or 2026-01-27, randomly selected

---

## 📋 Test Case 1: User requests water shutoff

**Expected:** backend returns water shutoff info  
**Pass if:** data is shown correctly in UI

### Test Data (3 scenarios):

1. **test-water-shutoff-001**
   - Description: Water valve in basement
   - Location: Basement
   - Status: verified
   - Created: Random timestamp (base time + 0-5 minutes)

2. **test-water-shutoff-002**
   - Description: Main water line
   - Location: Garage
   - Status: verified
   - Created: Random timestamp (base time + 5-15 minutes)

3. **test-water-shutoff-003**
   - Description: Outdoor spigot
   - Location: Backyard
   - Status: unverified
   - Created: Random timestamp (base time + 15-20 minutes)

### Verification Steps:

1. **View each water shutoff in the app**
2. **Verify UI display:**
   - ✅ Description displays correctly
   - ✅ Location displays correctly
   - ✅ Status displays correctly (verified/unverified)
   - ✅ Contact information displays correctly (if present)
   - ✅ Timestamp displays correctly

---

## 📋 Test Case 2: User requests gas shutoff

**Expected:** correct gas data returned  
**Pass if:** no crash, correct utility shown

### Test Data (3 scenarios):

1. **test-gas-shutoff-001**
   - Description: Gas meter outside
   - Location: Outside wall
   - Status: verified
   - Contacts: 1
   - Created: Random timestamp (base time + 25-30 minutes)

2. **test-gas-shutoff-002**
   - Description: Kitchen gas line
   - Location: Kitchen
   - Status: verified
   - Contacts: 2
   - Created: Random timestamp (base time + 30-35 minutes)

3. **test-gas-shutoff-003**
   - Description: Furnace gas valve
   - Location: Utility room
   - Status: unverified
   - Contacts: 1
   - Created: Random timestamp (base time + 35-40 minutes)

### Verification Steps:

1. **View each gas shutoff in the app**
2. **Verify:**
   - ✅ App does not crash
   - ✅ Gas utility displays correctly
   - ✅ Description displays correctly
   - ✅ Location displays correctly
   - ✅ Contacts display correctly
   - ✅ Multiple contacts display correctly (test-gas-shutoff-002)

---

## 📋 Test Case 3: Missing data in database

**Expected:** app shows fallback message  
**Pass if:** app does not break

### Test Data (4 scenarios, different missing field combinations):

1. **test-incomplete-shutoff-001**
   - Type: electric
   - **Missing:** description, location
   - Created: Random timestamp (base time + 45-48 minutes)

2. **test-incomplete-shutoff-002**
   - Type: water
   - Description: Water line
   - **Missing:** location
   - Created: Random timestamp (base time + 48-51 minutes)

3. **test-incomplete-shutoff-003**
   - Type: gas
   - Location: Garage
   - **Missing:** description
   - Created: Random timestamp (base time + 51-54 minutes)

4. **test-incomplete-shutoff-004**
   - Type: electric
   - Description: Main breaker
   - Location: Basement
   - **Missing:** verification_status
   - Created: Random timestamp (base time + 54-60 minutes)

### Verification Steps:

1. **View each incomplete data in the app**
2. **Verify:**
   - ✅ App does not crash
   - ✅ Shows fallback message (e.g., "No description available")
   - ✅ Shows fallback when description is missing
   - ✅ Shows fallback when location is missing
   - ✅ Uses default value or shows fallback when verification_status is missing

---

## 🧪 Complete Test Flow

### Step 1: Start Server

```bash
cd server
npm start
```

**Must see:**
```
✅ Successfully connected to MongoDB!
🚀 Server running on port 3000
```

**⚠️ Keep this window open!**

---

### Step 2: Verify Test Data

```bash
cd server
node verify-test-cases.js
```

**Should display all test case data, including:**
- Data details for each test case
- Time range (should be within 1 hour)
- Earliest and latest timestamps

---

### Step 3: Test in App

#### Test Case 1: Water Shutoff

1. View `test-water-shutoff-001`
   - ✅ Verify UI displays all fields
2. View `test-water-shutoff-002`
   - ✅ Verify different locations display correctly
3. View `test-water-shutoff-003`
   - ✅ Verify unverified status displays correctly

#### Test Case 2: Gas Shutoff

1. View `test-gas-shutoff-001`
   - ✅ Verify app does not crash
   - ✅ Verify gas utility displays correctly
2. View `test-gas-shutoff-002`
   - ✅ Verify multiple contacts display correctly
3. View `test-gas-shutoff-003`
   - ✅ Verify unverified status handling

#### Test Case 3: Missing Data

1. View `test-incomplete-shutoff-001`
   - ✅ Verify fallback when description and location are missing
2. View `test-incomplete-shutoff-002`
   - ✅ Verify fallback when location is missing
3. View `test-incomplete-shutoff-003`
   - ✅ Verify fallback when description is missing
4. View `test-incomplete-shutoff-004`
   - ✅ Verify handling when verification_status is missing

---

## 📊 Test Data Statistics

- **Total test shutoffs:** 10
- **Water shutoffs:** 4 (3 complete + 1 incomplete)
- **Gas shutoffs:** 4 (3 complete + 1 incomplete)
- **Electric shutoffs:** 2 (all incomplete)
- **Incomplete shutoffs:** 4 (different missing field combinations)
- **Time range:** All tests completed within 1 hour (usually 50-60 minutes)

---

## ✅ Test Case Coverage

| Test Case | Scenarios | Coverage | Time Range |
|-----------|-----------|----------|------------|
| Test Case 1 | 3 | verified/unverified, different locations | base time + 0-20 minutes |
| Test Case 2 | 3 | verified/unverified, different locations, multiple contacts | base time + 25-45 minutes |
| Test Case 3 | 4 | different missing field combinations | base time + 45-60 minutes |

---

## 💡 Verification Points

### Test Case 1 Verification Points:
- ✅ Description displays correctly
- ✅ Location displays correctly
- ✅ Status displays correctly
- ✅ Contact information displays correctly
- ✅ Timestamp displays correctly

### Test Case 2 Verification Points:
- ✅ App does not crash
- ✅ Gas utility displays correctly
- ✅ Multiple contacts handled correctly
- ✅ Different statuses handled correctly

### Test Case 3 Verification Points:
- ✅ App does not crash
- ✅ Shows fallback message
- ✅ All different missing field combinations handled correctly
- ✅ UI gracefully handles missing data

---

## 🎯 Complete!

**All test data has been added, including multiple scenarios for comprehensive verification!**

**You can now fully test these cases in the app!**
