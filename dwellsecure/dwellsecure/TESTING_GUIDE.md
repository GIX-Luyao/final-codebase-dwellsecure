# Testing Guide: Emergency Mode MWS

## Quick Start - How to Test/Demo

### Step 1: Prepare Test Data (Normal Mode) - 1 minute

1. **Start the app** (automatically in Normal Mode)

2. **Navigate to Shutoffs**:
   - Go to the Shutoffs/Property tab
   - Tap the Shutoffs list

3. **Create Multiple Test Records**:
   
   **Record 1 - Gas (Verified)**:
   - Tap the `+` button
   - Select or create Gas shutoff
   - Fill in:
     - Type: Gas (or will be auto-set)
     - Location: "Front exterior wall"
     - Description: "Main gas shutoff valve"
     - Verification Status: ✅ **Verified** (important!)
   - Save

   **Record 2 - Gas (Unverified)**:
   - Tap `+` again
   - Create another Gas shutoff
   - Location: "Backyard meter"
   - Verification Status: ❌ **Unverified**
   - Save

   **Record 3 - Water (Verified)**:
   - Tap `+`
   - Create Water shutoff
   - Location: "Basement"
   - Verification Status: ✅ **Verified**
   - Save

   **Record 4 - Electric (Unverified)**:
   - Tap `+`
   - Create Electric shutoff
   - Location: "Garage panel"
   - Verification Status: ❌ **Unverified**
   - Save

4. **Verify Normal Mode Behavior**:
   - You should see ALL 4 records in the list
   - ✅ Create/Edit works normally

---

### Step 2: Enter Emergency Mode - 30 seconds

1. **Find the Emergency Button**:
   - Look for the **red circular button** with alert icon (⚠️)
   - Usually in bottom-right corner (can be dragged)
   - **Tap it** (don't drag)

2. **Observe Emergency Mode Behavior**:
   - Screen changes to Emergency Mode UI (gray background)
   - You should see **only 1 option per utility type**:
     - Gas (shows the VERIFIED one, not unverified)
     - Water (shows verified)
     - Electric (shows unverified - only option)

---

### Step 3: Verify Emergency Mode Restrictions - 30 seconds

**While in Emergency Mode:**

1. **Go back to Shutoffs List** (if you can navigate):
   - Use back button or navigate from home
   - Look at the Shutoffs list

2. **Check Restrictions**:
   - ✅ Add button (`+`) should be **disabled/grayed out**
   - ✅ "Emergency Mode" badge should appear in header
   - ✅ If you try to edit a record, you'll get an alert: "Cannot edit in Emergency Mode"

---

### Step 4: Demonstrate Retrieval Logic - 30 seconds

**In Emergency Mode screen:**
- Only **3 shutoff options** shown (one per type)
- **Gas**: Shows the VERIFIED record (not the unverified one)
- This demonstrates the prioritization logic!

**Expected behavior:**
- Emergency Mode returns **max 1 record per utility type**
- **Verified records prioritized** over unverified
- If multiple verified records exist, shows most recent

---

### Step 5: Exit Emergency Mode - 15 seconds

1. **Complete or exit Emergency flow**:
   - In Emergency Mode screen, tap back button (←)
   - Or complete the shutoff instruction flow

2. **Verify Return to Normal Mode**:
   - Go back to Shutoffs list
   - ✅ All 4 records should be visible again
   - ✅ Add button should be enabled
   - ✅ No "Emergency Mode" badge

---

## Visual Checklist

### ✅ Normal Mode Indicators:
- [ ] All shutoff records visible in list
- [ ] Green/blue `+` add button enabled
- [ ] Can create/edit records
- [ ] No "Emergency Mode" badge

### ✅ Emergency Mode Indicators:
- [ ] Gray emergency screen background
- [ ] Only 1 record per utility type shown
- [ ] Verified records prioritized
- [ ] Disabled add/edit buttons
- [ ] "Emergency Mode" badge visible
- [ ] Cannot create/edit (alerts shown)

---

## Quick Demo Script (For Presentations)

**"Let me demonstrate the Emergency Mode Minimum Working System:"**

1. **"First, I'll create test data in Normal Mode"** (30s)
   - Create multiple shutoff records
   - Mark some as verified, some unverified
   - Show all records visible

2. **"Now I'll enter Emergency Mode"** (10s)
   - Tap red emergency button
   - Show mode change

3. **"Notice the system behavior change:"** (20s)
   - Only most relevant records shown (1 per type)
   - Verified records prioritized
   - Cannot create/edit (show disabled button)

4. **"When I exit Emergency Mode"** (10s)
   - All records visible again
   - Full functionality restored

**Total time: ~70 seconds**

---

## Troubleshooting

### Problem: Don't see Emergency button
- **Solution**: Look for red circular button, might be hidden behind nav or draggable
- Check bottom-right corner of screen

### Problem: Emergency Mode shows no shutoffs
- **Solution**: Create shutoff records first in Normal Mode
- Emergency Mode only shows existing records

### Problem: Can still create/edit in Emergency Mode
- **Solution**: Make sure you entered Emergency Mode (gray screen)
- Mode switches automatically when entering Emergency screen
- Check console logs if issues persist

### Problem: All records still visible in Emergency Mode
- **Solution**: This might be a display issue - check that `getShutoffs()` is being called after mode switch
- The Emergency screen should call `getShutoffs()` which filters automatically

---

## Console Logging (For Debugging)

To verify mode changes are happening, you can check:
- Mode is set when entering Emergency Mode
- Mode is reset when exiting
- Retrieval functions return filtered results

The system automatically logs mode changes - check React Native debugger or Metro bundler console.
