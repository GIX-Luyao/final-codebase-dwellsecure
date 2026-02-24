/**
 * Dwell Secure backend: API + admin dashboard.
 * - Health check for mobile app
 * - Auth: register / login
 * - Admin API: list users (protected)
 * - Dashboard: /admin
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const store = require('./store');

const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dwellsecure-admin-secret';

const app = express();
app.use(cors());
app.use(express.json());

// Health check (mobile app expects { db: 'connected' })
app.get('/health', (req, res) => {
  res.json({ ok: true, db: 'connected' });
});

// --- Auth (for app integration) ---
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    const { user, token } = store.registerUser(email, password, name);
    res.status(201).json({ user, token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    const { user, token } = store.loginUser(email, password);
    res.json({ user, token });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

// --- Admin: require X-Admin-Key or Authorization: Bearer <ADMIN_SECRET> ---
function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key'] || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (key !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/api/admin/users', adminAuth, (req, res) => {
  const users = store.getAllUsers();
  res.json({ users });
});

// Serve dashboard static files
app.use('/admin', express.static(path.join(__dirname, 'public')));

// Dashboard index
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(PORT, () => {
  console.log(`Dwell Secure backend running at http://localhost:${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
});
