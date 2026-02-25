/**
 * Central server configuration (MongoDB, PORT, CORS).
 * Load .env via dotenv; use env vars for production.
 *
 * Env:
 *   MONGODB_URI     - full connection string (preferred)
 *   MONGODB_PASSWORD - used only when MONGODB_URI is not set (default dev user)
 *   PORT            - server port (default 3000)
 *   CORS_ORIGIN     - comma-separated allowed origins (optional)
 */

require('dotenv').config();

const PORT = Number(process.env.PORT) || 3000;

const defaultPassword = 'jHTpcO0mULceeQtA';
const defaultUri = `mongodb+srv://sche753_db_user:${encodeURIComponent(process.env.MONGODB_PASSWORD || defaultPassword)}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;

const mongoUri = process.env.MONGODB_URI || defaultUri;

const corsOptions = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN.split(',').map(s => s.trim()) }
  : {};

module.exports = {
  PORT,
  mongoUri,
  corsOptions,
};
