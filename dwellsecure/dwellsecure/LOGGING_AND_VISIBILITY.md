# Logging and Visibility Guide

This document describes the logging and error visibility features added for integration testing and demo purposes.

## ✅ Frontend Logging

### API Request Logging

All outgoing API requests are logged with:
- **Request method** (GET, POST, DELETE)
- **Endpoint path**
- **Request timing** (duration in milliseconds)
- **Status code** and result (✓ success, ✗ error)

**Example logs:**
```
[API] → GET /api/shutoffs
[API] ✓ GET /api/shutoffs → 200 OK (45ms)

[API] → POST /api/shutoffs
[API] → POST body: { id: '123', type: 'water', description: 'Main water shutoff...' }
[API] ✓ POST /api/shutoffs → 200 OK (120ms)

[API] ✗ GET /api/shutoffs → Network Error (5000ms)
[API] Network error details: Network request failed
```

### Log Format

- **Outgoing requests**: `[API] → METHOD endpoint`
- **Successful responses**: `[API] ✓ METHOD endpoint → STATUS OK (duration)`
- **Failed responses**: `[API] ✗ METHOD endpoint → STATUS/Error (duration)`

### Location

All API logging is in `src/services/apiClient.js`:
- `apiRequest()` function logs all requests
- Includes request timing for performance monitoring
- Distinguishes between network errors and API errors

## ✅ Backend Logging

### Request/Response Logging

All incoming requests and outgoing responses are logged with:
- **Request method** (GET, POST, DELETE)
- **Endpoint path**
- **Status code**
- **Response timing** (duration in milliseconds)
- **Request body preview** (for POST requests)

**Example logs:**
```
[HTTP] ← GET /api/shutoffs
[HTTP] GET /api/shutoffs → 200 (45ms)

[HTTP] ← POST /api/shutoffs
[HTTP] Request body: { id: '123', type: 'water', description: 'Main water...' }
[HTTP] POST /api/shutoffs → 200 (120ms)

[HTTP] ← GET /api/shutoffs/999
[HTTP] GET /api/shutoffs/999 → 404 (12ms)
[HTTP] Error response: Shutoff not found
```

### Log Format

- **Incoming requests**: `[HTTP] ← METHOD path`
- **Outgoing responses**: `[HTTP] METHOD path → STATUS (duration)`
- **Errors**: Error response details logged for status codes >= 400

### Location

Backend logging is in `server/index.js`:
- Middleware logs all requests before routes
- Response interceptor logs status codes and timing
- Error responses include error details

## ✅ UI Error Messages

### Error Banner Component

Error messages are displayed in a dismissible banner at the top of list screens:
- **Red background** with alert icon
- **Clear error message** explaining the issue
- **Close button** to dismiss the banner

### Error Types Handled

1. **Network Errors**
   - Message: "Network error: Unable to load [resource]. Check your connection."
   - Triggered when: Network request fails or times out

2. **Server Unavailable**
   - Message: "Server unavailable: Using local data only."
   - Triggered when: API is marked as unavailable

3. **Generic Errors**
   - Message: "Error loading [resource]. Please try again."
   - Triggered when: Other errors occur

### Error Display Locations

- **ShutoffsListScreen**: Error banner for load/delete errors
- **UtilitiesListScreen**: Error banner for load/delete errors
- **AddEditShutoffScreen**: Alert dialog for save errors
- **AddEditUtilityScreen**: Alert dialog for save errors

### Error Handling Flow

1. **Try operation** (load, save, delete)
2. **Catch error** and log to console
3. **Show user-friendly message** in UI
4. **Set safe defaults** (empty array, etc.) to prevent crashes

## Example Logging Output

### Frontend Console (React Native)

```
[API] Platform: android, API URL: http://10.0.2.2:3000
[API] → GET /api/shutoffs
[API] ✓ GET /api/shutoffs → 200 OK (45ms)
[API] → POST /api/shutoffs
[API] → POST body: { id: '1234567890', type: 'water', description: 'Main water shutoff valve...' }
[API] ✓ POST /api/shutoffs → 200 OK (120ms)
```

### Backend Console (Node.js)

```
[HTTP] ← GET /api/shutoffs
[HTTP] GET /api/shutoffs → 200 (45ms)
[HTTP] ← POST /api/shutoffs
[HTTP] Request body: { id: '1234567890', type: 'water', description: 'Main water shutoff valve...' }
[HTTP] POST /api/shutoffs → 200 (120ms)
```

## Testing Integration

### View Frontend Logs

1. Open React Native debugger or Metro bundler console
2. Look for `[API]` prefixed logs
3. Check for request/response timing and status

### View Backend Logs

1. Check terminal where server is running (`npm start`)
2. Look for `[HTTP]` prefixed logs
3. Check for request/response timing and status codes

### Test Error Scenarios

1. **Network Error**: Disconnect network, try to load data
   - Frontend: Shows error banner
   - Console: Logs network error

2. **Server Down**: Stop server, try to save data
   - Frontend: Shows alert dialog
   - Console: Logs API_UNAVAILABLE

3. **Invalid Data**: Try to access non-existent resource
   - Backend: Logs 404 error
   - Frontend: Handles gracefully

## Best Practices

1. **Check logs first** when debugging integration issues
2. **Look for timing** to identify performance problems
3. **Check error messages** in UI for user-facing issues
4. **Use console logs** for detailed debugging information

## Notes

- Logging is **minimal and safe** - only essential information
- **No sensitive data** is logged (passwords, tokens, etc.)
- **Performance impact** is minimal (timing adds <1ms overhead)
- **For demo/testing only** - can be disabled in production if needed
