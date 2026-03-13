# Security notes

- **HTTPS**: Frontend-to-backend must use HTTPS (Render provides this by default). Use `https://...` for `EXPO_PUBLIC_API_URL`.
- **Backend to Atlas**: TLS is used (MongoDB Atlas default).
- **No secrets in GitHub**: `MONGO_URI`, `ADDRESS_ENCRYPTION_KEY`, etc. live only in Render environment variables; do not put them in code or commit them to the repo.
- **Address encryption**: Property address-related fields (address, addressLine1, addressLine2, city, state, zipCode, country) are encrypted by the backend with `ADDRESS_ENCRYPTION_KEY` (AES-256-GCM) before being written to the database; they are decrypted on the server when read and then returned to the frontend. The key exists only in server env; the frontend does not perform encryption or decryption.
- **No encryption in the frontend for DB**: If the encryption key were in the Expo app it could be obtained via reverse engineering; therefore encryption/decryption is done only on the backend.

## Can the displayed address be compromised?

- Addresses are **stored in the database as ciphertext**; a DB leak would not expose plaintext.
- The frontend **displays** addresses, so the API returns plaintext decrypted on the backend, sent over HTTPS to the logged-in client. This is required: legitimate users must see their own address.
- Risks and mitigations:
  - **Unauthorized access**: Use auth (login state) so only the owner can request their properties; the API should be scoped by user (add userId filtering if not already done).
  - **Traffic interception**: HTTPS prevents normal interception; on rooted/jailbroken devices or with a custom root CA, traffic may be visible, as with any mobile app.
  - **App reverse engineering**: Reverse engineering yields only frontend code and config, not `ADDRESS_ENCRYPTION_KEY` (only in Render env) or the MongoDB connection string.

Conclusion: Encrypting addresses at rest + keeping the key only on Render + HTTPS meets the “no secrets in GitHub, backend encrypts for DB” requirement; showing the address in the frontend is a normal need and should be paired with proper auth and authorization.

## When fully offline

**Current behavior**: When offline or when the server is unreachable, the frontend falls back to local **AsyncStorage** (in `src/services/storage.js`, when the API fails or `getApiAvailability()` is false it uses `AsyncStorage.getItem`/`setItem`); data is stored as **plain JSON** with **no** encryption.

If the device is **fully offline** and cannot reach the server, the app uses that local, unencrypted storage. In that case:

- The server-side key cannot be read (`ADDRESS_ENCRYPTION_KEY` is only in Render env; offline means no server).
- Locally stored data is **not** encrypted with that key; if the device is lost or accessed by someone else, the local store can be read.
- Addresses in the cloud (MongoDB) remain ciphertext; only the backend with the key can decrypt them. Offline and cloud are separate data boundaries.

To protect local data when offline, a separate design is needed (e.g. device-local key for local encryption), which is outside the current “backend-only encryption for DB” approach.
