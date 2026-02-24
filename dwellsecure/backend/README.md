# Dwell Secure Backend

Node/Express API and admin dashboard for user tracking.

## Quick start

```bash
cd backend
npm install
npm start
```

- **API:** http://localhost:3000  
- **Health:** http://localhost:3000/health  
- **Admin dashboard:** http://localhost:3000/admin  

## Admin dashboard

1. Open http://localhost:3000/admin  
2. Enter the **admin secret** (default: `dwellsecure-admin-secret`)  
3. View the list of registered users (email, name, ID, joined date)  
4. Use **Refresh** to reload; **Log out** to clear the session  

## Environment

| Variable       | Description                    | Default                      |
|----------------|--------------------------------|------------------------------|
| `PORT`         | Server port                    | `3000`                       |
| `ADMIN_SECRET` | Secret for dashboard /admin API | `dwellsecure-admin-secret` |

Example:

```bash
export ADMIN_SECRET=your-secure-secret
npm start
```

## API

- `GET /health` — Health check (returns `{ ok: true, db: 'connected' }`).
- `POST /api/auth/register` — Register: `{ email, password, name? }` → `{ user, token }`.
- `POST /api/auth/login` — Login: `{ email, password }` → `{ user, token }`.
- `GET /api/admin/users` — List users (header: `X-Admin-Key: <ADMIN_SECRET>` or `Authorization: Bearer <ADMIN_SECRET>`).

User data is stored in `backend/data/users.json`. Passwords are hashed with scrypt; never stored in plain text.
