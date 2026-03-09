/**
 * Central server configuration (MongoDB, PORT, CORS).
 * No credentials in code: user/password only from env.
 *
 * Env (one of):
 *   MONGODB_URI     - full connection string (preferred), or
 *   MONGODB_USER + MONGODB_PASSWORD (+ optional MONGODB_HOST, MONGODB_DB)
 *   PORT            - server port (default 3000)
 *   CORS_ORIGIN     - comma-separated allowed origins (optional)
 */

require('dotenv').config();

const PORT = Number(process.env.PORT) || 3000;

function getMongoUri() {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const user = process.env.MONGODB_USER;
  const password = process.env.MONGODB_PASSWORD;
  if (user && password) {
    const host = process.env.MONGODB_HOST || 'cluster.mongodb.net';
    const db = process.env.MONGODB_DB || 'dwellsecure';
    return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${db}?retryWrites=true&w=majority`;
  }
  throw new Error('Set MONGODB_URI or both MONGODB_USER and MONGODB_PASSWORD in env. Do not put credentials in code.');
}

const mongoUri = getMongoUri();

const corsOptions = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN.split(',').map(s => s.trim()) }
  : {};

/** JWT secret for auth tokens. Set JWT_SECRET in production. */
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';

module.exports = {
  PORT,
  mongoUri,
  corsOptions,
  jwtSecret,
};
