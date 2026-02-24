# Step-by-Step Testing in Expo App

## What You'll See and Do - Visual Guide

### 📱 STEP 1: Start Your Expo App

1. **Run your app** (if not already running):
   ```bash
   npm start
   # or
   expo start
   ```

2. **Open on device/emulator** - You should see your home screen

---

### 📱 STEP 2: Navigate to Shutoffs (Normal Mode)

1. **Look at bottom navigation bar** - You'll see tabs like:
   - Property / Shutoffs
   - Reminders
   - AI Assistant
   - Share

2. **Tap on "Property" or "Shutoffs" tab** (usually first tab)

3. **You should see**:
   - Header with "Shutoffs" title
   - Green/Blue `+` button in top-right corner
   - List of shutoffs (might be empty if first time)

---

### 📱 STEP 3: Create First Test Shutoff Record

1. **Tap the `+` button** in top-right corner

2. **You'll see a multi-step form**:
   - Step 1: "Find your Gas shutoff" (or similar)
   - Tap "Next" button

3. **Step 2: Fill in details**:
   - **Description**: Type "Main gas shutoff valve"
   - **Location**: Type "Front exterior wall"
   - (Optional: Add photo/video)
   - Tap "Next"

4. **Step 3: Set Verification Status**:
   - You'll see two buttons: "Verified" ✅ and "Unverified" ❌
   - **Tap "Verified"** button (should highlight/change color)
   - (Optional: Set maintenance reminder, notes, contacts)
   - Tap the checkmark (✓) button at bottom to save

5. **You'll return to Shutoffs list** - Should see your new record

---

### 📱 STEP 4: Create More Test Records

**Repeat STEP 3, but with different data:**

**Record 2 - Gas (Unverified):**
- Tap `+` again
- Description: "Backyard gas meter"
- Location: "Backyard"
- Tap "Unverified" ❌ (important!)
- Save

**Record 3 - Water (Verified):**
- Tap `+` again
- (If type selector: choose Water, or it auto-detects)
- Description: "Main water valve"
- Location: "Basement"
- Tap "Verified" ✅
- Save

**Record 4 - Electric (Unverified):**
- Tap `+` again
- Description: "Main circuit breaker"
- Location: "Garage electrical panel"
- Tap "Unverified" ❌
- Save

**✅ Expected Result:** You should now see **4 records** in your Shutoffs list

---

### 📱 STEP 5: Find the Emergency Button

1. **Look for a RED circular button** with an alert icon (⚠️)
   - Usually in **bottom-right corner** of screen
   - May be floating above other content
   - Can be dragged/moved (but don't drag for now)

2. **The button looks like**: Red circle with white alert icon

---

### 📱 STEP 6: Enter Emergency Mode

1. **Tap the red emergency button** (⚠️)
   - Don't drag it - just tap

2. **What you'll see**:
   - Screen background turns **GRAY** (dark gray)
   - Header says "Emergency mode" (white text)
   - Large text: "Choose the utility you need help with"
   - Three large cards: **Gas**, **Electric**, **Water** (or fewer if not all types exist)

3. **✅ This means Emergency Mode is ACTIVE**

---

### 📱 STEP 7: Verify Emergency Mode Filtering

**While on the Emergency Mode screen:**

1. **Count the utility cards shown**:
   - Should see **3 cards** (Gas, Electric, Water)
   - **NOT 4** - even though you created 4 records!

2. **This demonstrates**: 
   - Emergency Mode shows **only 1 record per utility type**
   - The filtering is working!

---

### 📱 STEP 8: Check Emergency Mode Restrictions

1. **Go back to Shutoffs list**:
   - Tap the back arrow (←) in Emergency Mode screen
   - Navigate to Shutoffs list

2. **Look at the header**:
   - Should see **red "Emergency Mode" badge** with alert icon
   - Next to "Shutoffs" title

3. **Look at the `+` button**:
   - Should be **grayed out** (not bright blue/green)
   - **Disabled** state

4. **Try to tap the `+` button**:
   - You'll see an alert: "Cannot create shutoff records in Emergency Mode"
   - This proves create is disabled!

5. **Try to edit a record** (if possible):
   - Tap on any shutoff record
   - Try to edit
   - Should show alert: "Cannot edit in Emergency Mode"

---

### 📱 STEP 9: Verify Prioritization Logic

**Go back to Emergency Mode screen:**

1. **Tap "Gas" card** (large card in Emergency Mode)

2. **Check which record it shows**:
   - Should show the **Verified** Gas record (not Unverified)
   - Description should say "Main gas shutoff valve" or "Front exterior wall"
   - **NOT** the unverified backyard one

3. **This proves**: Verified records are prioritized over unverified!

---

### 📱 STEP 10: Exit Emergency Mode

1. **In Emergency Mode screen**, tap the back arrow (←) in header

2. **What happens**:
   - Returns to previous screen
   - **Emergency Mode automatically turns off**

3. **Go back to Shutoffs list**:
   - **No more "Emergency Mode" badge**
   - **`+` button is bright/enabled again**
   - **All 4 records visible** in list

4. **✅ Success!** You've verified:
   - Normal Mode: All records visible, full functionality
   - Emergency Mode: Filtered records, restrictions active
   - Mode switching works automatically

---

## 📸 What to Look For (Visual Checklist)

### ✅ Normal Mode Indicators:
- [ ] Bright colored `+` button (blue/green)
- [ ] All 4 shutoff records visible in list
- [ ] No "Emergency Mode" badge
- [ ] Can tap records to edit
- [ ] Can create new records

### ✅ Emergency Mode Indicators:
- [ ] Gray background on Emergency Mode screen
- [ ] Only 3 utility options shown (1 per type)
- [ ] Red "Emergency Mode" badge in header
- [ ] Grayed out `+` button
- [ ] Cannot create/edit (alerts shown)
- [ ] Verified records prioritized

---

## 🐛 Troubleshooting

**Problem: Don't see the red emergency button**
- Look in bottom-right corner
- It might be behind other content
- Try scrolling or resizing window
- Button is draggable - check if it moved off-screen

**Problem: Emergency Mode shows all records**
- Make sure you actually entered Emergency Mode (gray screen)
- Check console logs for mode switching
- Try exiting and re-entering Emergency Mode

**Problem: Can still create/edit in Emergency Mode**
- Make sure Emergency Mode is active (check badge)
- Mode might not be set correctly - check console
- Try fully exiting and re-entering Emergency Mode

**Problem: Verification status not showing**
- Make sure you're on Step 3 of create form
- Look for "Verification Status" section
- Two buttons: Verified ✅ and Unverified ❌

---

## 🎯 Quick Test Summary

**What to demonstrate:**

1. ✅ **Create records in Normal Mode** (4 records, mix of verified/unverified)
2. ✅ **Enter Emergency Mode** (tap red button, see gray screen)
3. ✅ **See filtered results** (only 3 options, 1 per type)
4. ✅ **See restrictions** (disabled buttons, alerts)
5. ✅ **See prioritization** (verified records shown, not unverified)
6. ✅ **Exit Emergency Mode** (all records return, functionality restored)

**Total time:** ~3-5 minutes for full demo
