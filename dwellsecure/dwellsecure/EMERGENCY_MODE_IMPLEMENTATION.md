# Emergency Mode MWS Implementation

## Overview
This document describes the Minimum Working System (MWS) implementation for Emergency Mode, which validates that user-created shutoff records can be created in Normal Mode and reliably retrieved in Emergency Mode.

## System Behavior vs UI Behavior

### SYSTEM BEHAVIOR (Mode-Aware Logic)

**Location: `src/services/modeService.js`, `src/services/storage.js`**

1. **Mode State Management** (`modeService.js`)
   - Maintains app mode state (Normal vs Emergency) in persistent storage
   - Provides functions to get/set/check mode state
   - **This is system behavior** - controls how the app operates, not how it looks

2. **Mode-Aware Data Retrieval** (`storage.js`)
   - `getShutoffs()` - Returns different data based on mode:
     - **Normal Mode**: Returns ALL shutoff records
     - **Emergency Mode**: Returns only the MOST RELEVANT record per utility type (prioritizes verified records)
   - `getEmergencyModeShutoffs()` - Implements retrieval logic:
     - Groups by utility type (gas, water, electric)
     - Prioritizes verified records over unverified
     - Returns most recently updated if verification status is equal
     - Returns maximum of 1 record per utility type
   - **This is system behavior** - the data returned changes based on mode, not the UI

3. **Automatic Mode Switching**
   - `EmergencyModeScreen` sets mode to Emergency when entering
   - `EmergencyModeScreen` resets mode to Normal when exiting
   - **This is system behavior** - mode changes affect data retrieval automatically

4. **Permission Checks** (`storage.js`, screen components)
   - Create/Edit operations check mode before allowing action
   - **This is system behavior** - permission logic, not UI styling

### UI BEHAVIOR (Visual/Interaction)

**Location: Screen components**

1. **Visual Indicators**
   - Emergency Mode badge in `ShutoffsListScreen` header
   - Disabled state styling for buttons
   - Empty state messages
   - **This is UI behavior** - only affects appearance, not data logic

2. **Button States**
   - Add/Edit buttons disabled visually in Emergency Mode
   - **This is UI behavior** - visual feedback, but permission is enforced by system logic

3. **Screen Layout**
   - Emergency Mode screen shows filtered utility options
   - **This is UI behavior** - displays what system logic returns

## Data Model

### ShutoffRecord Schema
- `id`: Unique identifier
- `type`: `'gas' | 'water' | 'electric'` (normalized from old types: `fire` → `gas`, `power` → `electric`)
- `location`: String or lat/lng coordinates
- `description`: Text description
- `verification_status`: `'verified' | 'unverified'` (defaults to `'unverified'`)
- Additional fields: `photos`, `videos`, `notes`, `contacts`, etc.

## Key Features

### Normal Mode Behavior
1. **Create/Edit**: Enabled - users can create and edit shutoff records
2. **Retrieval**: Returns all shutoff records
3. **Display**: Shows all records in list view

### Emergency Mode Behavior
1. **Create/Edit**: Disabled - system prevents creating/editing shutoff records
2. **Retrieval**: Returns only most relevant record per utility type
   - Prioritizes verified records
   - Falls back to most recently updated if no verified records
   - Maximum 1 record per utility type (gas, water, electric)
3. **Display**: Shows filtered, emergency-focused view

## Implementation Details

### Files Modified
1. `src/services/modeService.js` - NEW: Mode state management
2. `src/services/storage.js` - UPDATED: Mode-aware retrieval functions
3. `src/screens/AddEditShutoffScreen.js` - UPDATED: Added verification_status field, mode checks
4. `src/screens/ShutoffsListScreen.js` - UPDATED: Disabled create/edit in Emergency Mode
5. `src/screens/EmergencyModeScreen.js` - UPDATED: Mode switching, uses Emergency retrieval logic

### Backward Compatibility
- Old shutoff types (`fire`, `power`) are automatically normalized to new types (`gas`, `electric`)
- Existing records without `verification_status` default to `'unverified'`
- Migration happens transparently on read operations

## Testing the MWS

### Normal Mode Flow
1. Create shutoff records in Normal Mode
2. Mark some as verified, some as unverified
3. Create multiple records per utility type
4. Verify all records are visible in list

### Emergency Mode Flow
1. Enter Emergency Mode (via Emergency FAB button)
2. Verify create/edit buttons are disabled
3. Verify only most relevant record per type is shown
4. Verify verified records are prioritized
5. Exit Emergency Mode
6. Verify app returns to Normal Mode behavior

## Demo Script (Under 2 Minutes)

1. **Normal Mode - Create Records** (30s)
   - Open app (Normal Mode)
   - Create 2-3 shutoff records (gas, water, electric)
   - Mark some as verified in the form
   - Verify all records appear in list

2. **Emergency Mode - Retrieve Records** (30s)
   - Tap Emergency Mode button (red FAB)
   - Observe only one record per utility type is shown
   - Verify verified records are prioritized
   - Verify create/edit buttons disabled in list view

3. **Mode Switching** (30s)
   - Complete emergency flow with shutoff instructions
   - Exit Emergency Mode
   - Verify app returns to Normal Mode
   - Verify all records visible again
