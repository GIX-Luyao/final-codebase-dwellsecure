# State Synchronization Guide

This document explains how state synchronization works in the Dwell Secure app to ensure data consistency between the backend and UI.

## ✅ Implemented Features

### 1. Automatic Data Refresh on Screen Focus

All list screens use `useFocusEffect` to automatically reload data when the screen gains focus:

- **ShutoffsListScreen**: Reloads shutoffs when screen is focused
- **UtilitiesListScreen**: Reloads utilities when screen is focused  
- **PropertyDetailScreen**: Reloads property, shutoffs, utilities, and people when screen is focused

This ensures that when you navigate back from creating/editing a record, the list automatically refreshes.

### 2. Safe Data Handling

All data fetching functions now include:

- **Null/Undefined Checks**: Data is always validated to be an array before use
- **Error Handling**: Errors are caught and logged, with safe fallbacks
- **Empty State Display**: When no data exists, a clear empty state is shown instead of crashing

### 3. Post-Operation Refresh

After create/delete operations:

- **Delete**: Immediately calls `loadShutoffs()` or `loadUtilities()` to refresh the list
- **Create/Edit**: Navigation back triggers `useFocusEffect`, which automatically reloads data

## Code Changes

### Storage Service (`src/services/storage.js`)

**`getShutoffs()`**:
- Ensures result is always an array
- Returns empty array on error

**`getAllShutoffsRaw()`**:
- Validates API response is an array before mapping
- Validates AsyncStorage data is an array before mapping
- Returns empty array on error

**`getUtilities()`**:
- Validates API response is an array
- Validates AsyncStorage data is an array
- Returns empty array on error

### List Screens

**`ShutoffsListScreen.js`**:
- `loadShutoffs()` wrapped in try-catch
- Ensures data is always an array
- Shows empty state when array is empty

**`UtilitiesListScreen.js`**:
- `loadUtilities()` wrapped in try-catch
- Ensures data is always an array
- Shows empty state when array is empty

**`PropertyDetailScreen.js`**:
- `loadData()` wrapped in try-catch
- Validates all arrays before use
- Safe array operations (checks `Array.isArray()` before `.slice()` or `.map()`)
- Filters out invalid items (null/undefined) before rendering

## Testing State Synchronization

### Test Case 1: Create and Verify Refresh

1. Open Shutoffs list screen
2. Create a new shutoff
3. Navigate back
4. **Expected**: New shutoff appears in the list (automatic refresh via `useFocusEffect`)

### Test Case 2: Delete and Verify Refresh

1. Open Shutoffs list screen
2. Delete a shutoff
3. **Expected**: Shutoff immediately disappears from list (manual refresh via `loadShutoffs()`)

### Test Case 3: Empty State

1. Delete all shutoffs
2. **Expected**: Empty state message appears ("No shutoffs recorded") instead of crash

### Test Case 4: Error Handling

1. Disconnect from network
2. Try to load shutoffs
3. **Expected**: Empty array returned, empty state shown (no crash)

### Test Case 5: Backend Data Change

1. Create shutoff via API directly (or another device)
2. Navigate to Shutoffs list screen
3. **Expected**: New shutoff appears (refreshed from backend)

## Integration Test Verification

The integration test (`server/integration-test.js`) verifies:

1. ✅ Data is created via POST
2. ✅ Data persists in MongoDB
3. ✅ Data is retrieved via GET
4. ✅ UI can display the data (location and technician name)

## Best Practices

1. **Always use `useFocusEffect`** for screens that display lists
2. **Always validate arrays** before using array methods (`.map()`, `.slice()`, `.filter()`)
3. **Always provide empty states** instead of showing errors
4. **Always handle errors gracefully** with try-catch and fallbacks
5. **Always refresh after mutations** (create/update/delete)

## Troubleshooting

### Data not refreshing after create

**Check**: Is `useFocusEffect` implemented in the list screen?
**Solution**: Ensure `useFocusEffect` calls the load function

### App crashes when data is null

**Check**: Are arrays validated before use?
**Solution**: Add `Array.isArray()` checks before array operations

### Empty state not showing

**Check**: Is empty state condition correct?
**Solution**: Ensure `data.length === 0` check is in place

### Stale data displayed

**Check**: Is `useFocusEffect` dependency array correct?
**Solution**: Ensure dependencies are included or use empty array `[]` for focus-only refresh
