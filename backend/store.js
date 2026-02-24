/**
 * Simple user store: in-memory with JSON file persistence.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadUsers() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('[Store] Failed to load users:', e.message);
    return [];
  }
}

function saveUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

let users = loadUsers();

function hashPassword(password) {
  return crypto.scryptSync(password, 'dwellsecure-salt', 64).toString('hex');
}

function verifyPassword(password, hash) {
  const h = crypto.scryptSync(password, 'dwellsecure-salt', 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(hash, 'hex'));
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/** Get all users (for admin). Passwords are never returned. */
function getAllUsers() {
  return users.map(({ passwordHash, ...u }) => ({ ...u }));
}

/** Find user by id */
function findUserById(id) {
  const u = users.find((x) => x.id === id);
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

/** Find user by email */
function findUserByEmail(email) {
  const norm = (email || '').trim().toLowerCase();
  return users.find((u) => u.email === norm) || null;
}

/** Register: email, password, name. Returns { user, token }. */
function registerUser(email, password, name) {
  const norm = (email || '').trim().toLowerCase();
  if (!norm || !password) {
    throw new Error('Email and password are required');
  }
  if (findUserByEmail(norm)) {
    throw new Error('User with this email already exists');
  }
  const id = `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const user = {
    id,
    email: norm,
    name: (name || norm.split('@')[0]).trim(),
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password),
  };
  users.push(user);
  saveUsers(users);
  const { passwordHash, ...publicUser } = user;
  return { user: publicUser, token: generateToken() };
}

/** Login: email, password. Returns { user, token } or throws. */
function loginUser(email, password) {
  const norm = (email || '').trim().toLowerCase();
  const user = users.find((u) => u.email === norm);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error('Invalid email or password');
  }
  const token = generateToken();
  const { passwordHash, ...publicUser } = user;
  return { user: publicUser, token };
}

module.exports = {
  getAllUsers,
  findUserById,
  findUserByEmail,
  registerUser,
  loginUser,
  loadUsers: () => { users = loadUsers(); return users; },
};
module.exports._users = () => users;
