const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./config');
const { encryptAddressFields, decryptAddressFields, isEncryptionEnabled } = require('./addressCrypto');

const { jwtSecret } = config;
const BCRYPT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = '7d';

const { jwtSecret } = config;
const BCRYPT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = '7d';

// #region agent log
const DEBUG_LOG_PATH = path.join(__dirname, '..', '.cursor', 'debug.log');
function debugLog(location, message, data, hypothesisId) {
  const payload = { location, message, data: data || {}, timestamp: Date.now(), hypothesisId, runId: 'mongo-connect' };
  fetch('http://127.0.0.1:7242/ingest/14f14bef-012d-49c5-bc8a-a091927f7e62', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
  try { fs.appendFileSync(DEBUG_LOG_PATH, JSON.stringify(payload) + '\n'); } catch (_) {}
}
// #endregion

const app = express();
const { PORT, mongoUri, corsOptions } = config;

app.use(cors(corsOptions));
// Allow larger JSON body for voice-note (base64 audio); default is 100kb which causes 413
const JSON_BODY_LIMIT = 15 * 1024 * 1024; // 15 MB
app.use(express.json({ limit: JSON_BODY_LIMIT }));

// Request logging middleware - MUST be before routes
app.use((req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  // Override res.send to log status code
  res.send = function(data) {
    const duration = Date.now() - startTime;
    console.log(`[HTTP] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
    if (res.statusCode >= 400) {
      console.error(`[HTTP] Error response:`, typeof data === 'string' ? data.substring(0, 200) : data);
    }
    originalSend.call(this, data);
  };
  
  // Log incoming request
  console.log(`[HTTP] ← ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyPreview = {};
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string' && req.body[key].length > 50) {
        bodyPreview[key] = req.body[key].substring(0, 50) + '...';
      } else {
        bodyPreview[key] = req.body[key];
      }
    });
    console.log(`[HTTP] Request body:`, bodyPreview);
  }
  
  next();
});

app.use(optionalAuth);

// MongoDB connection (uri from config)
const client = new MongoClient(mongoUri, {
  // Omit serverApi to use legacy wire protocol; can avoid TLS handshake path that triggers Atlas SSL alert 80 on Node 22/Windows
  tls: true,
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
});

let db = null;

async function connectDB() {
  // #region agent log
  debugLog('server/index.js:connectDB:entry', 'connectDB entry', {
    nodeVersion: process.version,
    uriSource: process.env.MONGODB_URI ? 'env' : 'default',
    uriHasSrv: mongoUri.includes('mongodb+srv'),
    uriHost: mongoUri.includes('@') ? mongoUri.split('@')[1].split('/')[0].split('?')[0] : 'unknown',
  }, 'A,B,C');
  // #endregion
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`📡 URI: ${mongoUri.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs
    console.log(`📡 Cluster: haven.ksoyo27.mongodb.net`);
    console.log(`📡 Database: dwellsecure`);
    console.log('');
    
    // Add detailed error handling
    try {
      // #region agent log
      debugLog('server/index.js:connectDB:beforeConnect', 'about to client.connect()', {}, 'D');
      // #endregion
      await client.connect();
      console.log('✅ MongoDB client connected');
    } catch (connectError) {
      // #region agent log
      debugLog('server/index.js:connectDB:connectError', 'MongoDB connect failed', {
        errorName: connectError.name,
        errorCode: connectError.code,
        errorMessage: (connectError.message || '').substring(0, 400),
        hasCause: !!connectError.cause,
        causeMessage: connectError.cause ? String(connectError.cause).substring(0, 200) : undefined,
      }, 'D,E');
      // #endregion
      console.error('');
      console.error('='.repeat(60));
      console.error('❌ MongoDB Connection Failed!');
      console.error('='.repeat(60));
      console.error('Error:', connectError.message);
      console.error('');
      console.error('🔍 可能的原因：');
      console.error('   1. MongoDB Atlas Cluster 可能是 Paused 状态');
      console.error('   2. 网络连接问题或防火墙阻止');
      console.error('   3. Node.js 版本问题（建议使用 Node.js 18+）');
      console.error('   4. MongoDB Atlas 服务问题');
      console.error('');
      console.error('💡 解决步骤：');
      console.error('   1. 访问 https://cloud.mongodb.com');
      console.error('   2. 检查 Cluster "Haven" 的状态（应该是 Active）');
      console.error('   3. 如果 Cluster 是 Paused，点击 "Resume" 恢复它');
      console.error('   4. 等待几分钟让 Cluster 完全启动');
      console.error('   5. 检查 Network Access 设置（IP 应该在白名单中）');
      console.error('   6. 如果仍然失败，尝试更新 Node.js 到最新版本');
      console.error('='.repeat(60));
      console.error('');
      throw connectError;
    }
    
    db = client.db('dwellsecure');
    console.log(`📊 Using database: dwellsecure`);
    
    // Test connection with ping
    await db.command({ ping: 1 });
    console.log('✅ Ping successful - database is accessible');
    
    // Verify collections exist (create if they don't)
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log(`📦 Available collections: ${collectionNames.length > 0 ? collectionNames.join(', ') : 'none'}`);
    
    // Ensure shutoffs, utilities, properties, and reminders collections exist
    if (!collectionNames.includes('shutoffs')) {
      await db.createCollection('shutoffs');
      console.log('📦 Created collection: shutoffs');
    }
    if (!collectionNames.includes('utilities')) {
      await db.createCollection('utilities');
      console.log('📦 Created collection: utilities');
    }
    if (!collectionNames.includes('properties')) {
      await db.createCollection('properties');
      console.log('📦 Created collection: properties');
    }
    if (!collectionNames.includes('reminders')) {
      await db.createCollection('reminders');
      console.log('📦 Created collection: reminders');
    }
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('📦 Created collection: users');
    }
    // Unique index on email for users (one account per email)
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
    } catch (e) {
      if (e.code !== 85 && e.code !== 86) console.warn('Users email index:', e.message);
    }

    // Count existing documents
    const shutoffsCount = await db.collection('shutoffs').countDocuments();
    const utilitiesCount = await db.collection('utilities').countDocuments();
    const propertiesCount = await db.collection('properties').countDocuments();
    const remindersCount = await db.collection('reminders').countDocuments();
    const usersCount = await db.collection('users').countDocuments();
    console.log(`📝 Current documents: ${shutoffsCount} shutoffs, ${utilitiesCount} utilities, ${propertiesCount} properties, ${remindersCount} reminders, ${usersCount} users`);

    if (!isEncryptionEnabled()) {
      const keyRaw = process.env.ADDRESS_ENCRYPTION_KEY;
      const len = keyRaw ? String(keyRaw).trim().length : 0;
      console.warn('⚠️  ADDRESS_ENCRYPTION_KEY is missing or invalid — address/geo stored in PLAIN. Key must be 64 hex chars (no quotes/spaces). Current length: ' + len);
    } else {
      console.log('🔐 Address/geo encryption enabled (ADDRESS_ENCRYPTION_KEY valid).');
    }
    
    console.log('✅ MongoDB connection established and verified!');
  } catch (error) {
    console.error('='.repeat(60));
    console.error('❌ MongoDB connection error!');
    console.error('='.repeat(60));
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    console.error('='.repeat(60));
    throw error;
  }
}

// Routes
app.get('/health', (req, res) => {
  // #region agent log
  debugLog('server/index.js:/health', 'health endpoint hit', {
    ip: req.ip,
    userAgent: req.headers['user-agent'] || null,
    method: req.method,
    path: req.path,
  }, 'H1');
  // #endregion

  res.json({ 
    status: 'ok', 
    db: db ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ----- Auth: optional middleware (sets req.userId when valid Bearer token present) -----
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, jwtSecret);
    if (payload.userId) req.userId = payload.userId;
  } catch (_) {
    // Invalid or expired token; leave req.userId unset
  }
  next();
}

// ----- Auth routes (email + password; password stored hashed with bcrypt) -----
app.post('/api/auth/register', async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: 'Database not connected' });
    const { email, password, name, photo } = req.body || {};
    const emailNorm = (email && typeof email === 'string') ? email.trim().toLowerCase() : '';
    if (!emailNorm) return res.status(400).json({ error: 'Email is required' });
    if (!password || typeof password !== 'string') return res.status(400).json({ error: 'Password is required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const collection = db.collection('users');
    const existing = await collection.findOne({ email: emailNorm });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const user = {
      id,
      name: (name && typeof name === 'string') ? name.trim() : emailNorm.split('@')[0] || 'User',
      email: emailNorm,
      photo: (photo && typeof photo === 'string') ? photo : null,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    await collection.insertOne(user);
    const token = jwt.sign({ userId: id }, jwtSecret, { expiresIn: TOKEN_EXPIRES_IN });
    const safeUser = { id: user.id, name: user.name, email: user.email, photo: user.photo };
    console.log(`[API] POST /api/auth/register - Created user: ${emailNorm}`);
    res.status(201).json({ user: safeUser, token });
  } catch (error) {
    console.error('Error /api/auth/register:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: 'Database not connected' });
    const { email, password } = req.body || {};
    const emailNorm = (email && typeof email === 'string') ? email.trim().toLowerCase() : '';
    if (!emailNorm || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const collection = db.collection('users');
    const user = await collection.findOne({ email: emailNorm });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: TOKEN_EXPIRES_IN });
    const safeUser = { id: user.id, name: user.name, email: user.email, photo: user.photo };
    console.log(`[API] POST /api/auth/login - User: ${emailNorm}`);
    res.json({ user: safeUser, token });
  } catch (error) {
    console.error('Error /api/auth/login:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Shutoffs routes
app.get('/api/shutoffs', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const collection = db.collection('shutoffs');
    
    // Support filtering by type query parameter
    const query = {};
    if (req.query.type) {
      query.type = req.query.type;
      console.log(`[API] GET /api/shutoffs?type=${req.query.type} - Filtering by type`);
    }
    
    const shutoffs = await collection.find(query).toArray();
    console.log(`[API] GET /api/shutoffs - Found ${shutoffs.length} shutoffs`);
    res.json(shutoffs);
  } catch (error) {
    console.error('Error fetching shutoffs:', error);
    res.status(500).json({ error: 'Failed to fetch shutoffs', details: error.message });
  }
});

app.get('/api/shutoffs/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const collection = db.collection('shutoffs');
    const shutoff = await collection.findOne({ id: req.params.id });
    if (!shutoff) {
      return res.status(404).json({ error: 'Shutoff not found' });
    }
    res.json(shutoff);
  } catch (error) {
    console.error('Error fetching shutoff:', error);
    res.status(500).json({ error: 'Failed to fetch shutoff', details: error.message });
  }
});

app.post('/api/shutoffs', async (req, res) => {
  const requestId = Date.now();
  try {
    console.log('');
    console.log(`[${requestId}] ========== POST /api/shutoffs ==========`);
    console.log(`[${requestId}] Timestamp: ${new Date().toISOString()}`);
    console.log(`[${requestId}] Database status: ${db ? 'CONNECTED ✅' : 'DISCONNECTED ❌'}`);
    
    if (!db) {
      console.error(`[${requestId}] ❌ ERROR: Database not connected!`);
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const collection = db.collection('shutoffs');
    const shutoff = req.body;
    
    console.log(`[${requestId}] Received shutoff data:`, {
      id: shutoff.id,
      type: shutoff.type,
      description: shutoff.description?.substring(0, 50) + '...',
    });
    
    // Ensure timestamps
    if (!shutoff.createdAt) {
      shutoff.createdAt = new Date().toISOString();
    }
    shutoff.updatedAt = new Date().toISOString();
    
    console.log(`[${requestId}] Saving to MongoDB collection: shutoffs`);
    console.log(`[${requestId}] Shutoff ID: ${shutoff.id}`);
    
    // Upsert: update if exists, insert if not
    const result = await collection.updateOne(
      { id: shutoff.id },
      { $set: shutoff },
      { upsert: true }
    );
    
    console.log(`[${requestId}] ✅ MongoDB operation result:`, {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      upsertedId: result.upsertedId
    });
    
    // Verify the document was saved
    const saved = await collection.findOne({ id: shutoff.id });
    if (saved) {
      console.log(`[${requestId}] ✅ VERIFIED: Document exists in MongoDB with ID: ${shutoff.id}`);
      console.log(`[${requestId}] Document preview:`, {
        id: saved.id,
        type: saved.type,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      });
    } else {
      console.error(`[${requestId}] ❌ CRITICAL ERROR: Document not found after save! ID: ${shutoff.id}`);
    }
    
    // Count total documents in collection
    const totalCount = await collection.countDocuments();
    console.log(`[${requestId}] 📊 Total shutoffs in database: ${totalCount}`);
    
    console.log(`[${requestId}] ✅ ${result.upsertedCount > 0 ? 'Created' : 'Updated'} shutoff: ${shutoff.id}`);
    console.log(`[${requestId}] ==========================================`);
    console.log('');
    
    res.json(shutoff);
  } catch (error) {
    console.error(`[${requestId}] ❌ ERROR saving shutoff:`, error);
    console.error(`[${requestId}] Error message:`, error.message);
    console.error(`[${requestId}] Error stack:`, error.stack);
    console.log(`[${requestId}] ==========================================`);
    console.log('');
    res.status(500).json({ error: 'Failed to save shutoff', details: error.message });
  }
});

app.delete('/api/shutoffs/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const collection = db.collection('shutoffs');
    const result = await collection.deleteOne({ id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Shutoff not found' });
    }
    
    console.log(`[API] DELETE /api/shutoffs/${req.params.id} - Deleted`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting shutoff:', error);
    res.status(500).json({ error: 'Failed to delete shutoff', details: error.message });
  }
});

// Utilities routes
app.get('/api/utilities', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const collection = db.collection('utilities');
    const utilities = await collection.find({}).toArray();
    console.log(`[API] GET /api/utilities - Found ${utilities.length} utilities`);
    res.json(utilities);
  } catch (error) {
    console.error('Error fetching utilities:', error);
    res.status(500).json({ error: 'Failed to fetch utilities', details: error.message });
  }
});

app.get('/api/utilities/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const collection = db.collection('utilities');
    const utility = await collection.findOne({ id: req.params.id });
    if (!utility) {
      return res.status(404).json({ error: 'Utility not found' });
    }
    res.json(utility);
  } catch (error) {
    console.error('Error fetching utility:', error);
    res.status(500).json({ error: 'Failed to fetch utility', details: error.message });
  }
});

app.post('/api/utilities', async (req, res) => {
  const requestId = Date.now();
  try {
    console.log('');
    console.log(`[${requestId}] ========== POST /api/utilities ==========`);
    console.log(`[${requestId}] Timestamp: ${new Date().toISOString()}`);
    console.log(`[${requestId}] Database status: ${db ? 'CONNECTED ✅' : 'DISCONNECTED ❌'}`);
    
    if (!db) {
      console.error(`[${requestId}] ❌ ERROR: Database not connected!`);
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const collection = db.collection('utilities');
    const utility = req.body;
    
    console.log(`[${requestId}] Received utility data:`, {
      id: utility.id,
      name: utility.name,
      type: utility.type,
    });
    
    // Ensure timestamps
    if (!utility.createdAt) {
      utility.createdAt = new Date().toISOString();
    }
    utility.updatedAt = new Date().toISOString();
    
    console.log(`[${requestId}] Saving to MongoDB collection: utilities`);
    console.log(`[${requestId}] Utility ID: ${utility.id}`);
    
    // Upsert: update if exists, insert if not
    const result = await collection.updateOne(
      { id: utility.id },
      { $set: utility },
      { upsert: true }
    );
    
    console.log(`[${requestId}] ✅ MongoDB operation result:`, {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      upsertedId: result.upsertedId
    });
    
    // Verify the document was saved
    const saved = await collection.findOne({ id: utility.id });
    if (saved) {
      console.log(`[${requestId}] ✅ VERIFIED: Document exists in MongoDB with ID: ${utility.id}`);
      console.log(`[${requestId}] Document preview:`, {
        id: saved.id,
        name: saved.name,
        type: saved.type,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      });
    } else {
      console.error(`[${requestId}] ❌ CRITICAL ERROR: Document not found after save! ID: ${utility.id}`);
    }
    
    // Count total documents in collection
    const totalCount = await collection.countDocuments();
    console.log(`[${requestId}] 📊 Total utilities in database: ${totalCount}`);
    
    console.log(`[${requestId}] ✅ ${result.upsertedCount > 0 ? 'Created' : 'Updated'} utility: ${utility.id}`);
    console.log(`[${requestId}] ==========================================`);
    console.log('');
    
    res.json(utility);
  } catch (error) {
    console.error(`[${requestId}] ❌ ERROR saving utility:`, error);
    console.error(`[${requestId}] Error message:`, error.message);
    console.error(`[${requestId}] Error stack:`, error.stack);
    console.log(`[${requestId}] ==========================================`);
    console.log('');
    res.status(500).json({ error: 'Failed to save utility', details: error.message });
  }
});

app.delete('/api/utilities/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const collection = db.collection('utilities');
    const result = await collection.deleteOne({ id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Utility not found' });
    }
    
    console.log(`[API] DELETE /api/utilities/${req.params.id} - Deleted`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting utility:', error);
    res.status(500).json({ error: 'Failed to delete utility', details: error.message });
  }
});

// Properties routes (one user can have many properties; when authenticated, filter by userId)
app.get('/api/properties', async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: 'Database not connected' });
    const collection = db.collection('properties');
    const query = req.userId ? { userId: req.userId } : {};
    const properties = await collection.find(query).toArray();
    const decrypted = properties.map(decryptAddressFields);
    console.log(`[API] GET /api/properties - Found ${properties.length} properties${req.userId ? ` (user: ${req.userId})` : ''}`);
    res.json(decrypted);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties', details: error.message });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: 'Database not connected' });
    const collection = db.collection('properties');
    const property = await collection.findOne({ id: req.params.id });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    if (req.userId && property.userId && property.userId !== req.userId) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(decryptAddressFields(property));
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property', details: error.message });
  }
});

app.post('/api/properties', async (req, res) => {
  const requestId = Date.now();
  try {
    console.log('');
    console.log(`[${requestId}] ========== POST /api/properties ==========`);
    console.log(`[${requestId}] Timestamp: ${new Date().toISOString()}`);
    console.log(`[${requestId}] Database status: ${db ? 'CONNECTED ✅' : 'DISCONNECTED ❌'}`);
    
    if (!db) {
      console.error(`[${requestId}] ❌ ERROR: Database not connected!`);
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const collection = db.collection('properties');
    const property = req.body;
    
    console.log(`[${requestId}] Received property data:`, {
      id: property.id,
      name: property.name,
      address: property.address ? '***' : property.address,
      addressLine1: property.addressLine1 ? '***' : property.addressLine1,
      addressLine2: property.addressLine2 ? '***' : property.addressLine2,
      city: property.city ? '***' : property.city,
      state: property.state ? '***' : property.state,
      zipCode: property.zipCode ? '***' : property.zipCode,
      country: property.country ? '***' : property.country,
      propertyType: property.propertyType,
      imageUri: property.imageUri ? (property.imageUri.substring(0, 50) + '...') : null,
      latitude: property.latitude,
      longitude: property.longitude,
    });
    
    // Ensure timestamps
    if (!property.createdAt) {
      property.createdAt = new Date().toISOString();
    }
    property.updatedAt = new Date().toISOString();
    // Link to user when authenticated
    if (req.userId) property.userId = req.userId;

    const toSave = encryptAddressFields(property);
    
    console.log(`[${requestId}] Saving to MongoDB collection: properties`);
    console.log(`[${requestId}] Property ID: ${property.id}`);
    
    // Upsert: update if exists, insert if not (address fields stored encrypted)
    const result = await collection.updateOne(
      { id: toSave.id },
      { $set: toSave },
      { upsert: true }
    );
    
    console.log(`[${requestId}] ✅ MongoDB operation result:`, {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      upsertedId: result.upsertedId
    });
    
    // Verify the document was saved
    const saved = await collection.findOne({ id: toSave.id });
    if (saved) {
      console.log(`[${requestId}] ✅ VERIFIED: Document exists in MongoDB with ID: ${toSave.id}`);
      console.log(`[${requestId}] Document preview:`, {
        id: saved.id,
        name: saved.name,
        address: '(encrypted)',
        imageUri: saved.imageUri ? (saved.imageUri.substring(0, 50) + '...') : null,
        latitude: saved.latitude,
        longitude: saved.longitude,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      });
    } else {
      console.error(`[${requestId}] ❌ CRITICAL ERROR: Document not found after save! ID: ${property.id}`);
    }
    
    // Count total documents in collection
    const totalCount = await collection.countDocuments();
    console.log(`[${requestId}] 📊 Total properties in database: ${totalCount}`);
    
    console.log(`[${requestId}] ✅ ${result.upsertedCount > 0 ? 'Created' : 'Updated'} property: ${property.id}`);
    console.log(`[${requestId}] ==========================================`);
    console.log('');
    
    res.json(property);
  } catch (error) {
    console.error(`[${requestId}] ❌ ERROR saving property:`, error);
    console.error(`[${requestId}] Error message:`, error.message);
    console.error(`[${requestId}] Error stack:`, error.stack);
    console.log(`[${requestId}] ==========================================`);
    console.log('');
    res.status(500).json({ error: 'Failed to save property', details: error.message });
  }
});

app.delete('/api/properties/:id', async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: 'Database not connected' });
    const collection = db.collection('properties');
    const filter = { id: req.params.id };
    if (req.userId) filter.userId = req.userId;
    const result = await collection.deleteOne(filter);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    console.log(`[API] DELETE /api/properties/${req.params.id} - Deleted`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property', details: error.message });
  }
});

// Reminders routes
app.get('/api/reminders', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const collection = db.collection('reminders');
    
    // Support filtering by shutoffId query parameter
    const query = {};
    if (req.query.shutoffId) {
      query.shutoffId = req.query.shutoffId;
      console.log(`[API] GET /api/reminders?shutoffId=${req.query.shutoffId} - Filtering by shutoffId`);
    }
    
    const reminders = await collection.find(query).toArray();
    console.log(`[API] GET /api/reminders - Found ${reminders.length} reminders`);
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders', details: error.message });
  }
});

app.get('/api/reminders/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const collection = db.collection('reminders');
    const reminder = await collection.findOne({ id: req.params.id });
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ error: 'Failed to fetch reminder', details: error.message });
  }
});

app.post('/api/reminders', async (req, res) => {
  const requestId = Date.now();
  try {
    console.log('');
    console.log(`[${requestId}] ========== POST /api/reminders ==========`);
    console.log(`[${requestId}] Timestamp: ${new Date().toISOString()}`);
    console.log(`[${requestId}] Database status: ${db ? 'CONNECTED ✅' : 'DISCONNECTED ❌'}`);
    
    if (!db) {
      console.error(`[${requestId}] ❌ ERROR: Database not connected!`);
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const collection = db.collection('reminders');
    const reminder = req.body;
    
    console.log(`[${requestId}] Received reminder data:`, {
      id: reminder.id,
      title: reminder.title,
      date: reminder.date,
    });
    
    // Ensure timestamps
    if (!reminder.createdAt) {
      reminder.createdAt = new Date().toISOString();
    }
    reminder.updatedAt = new Date().toISOString();
    
    console.log(`[${requestId}] Saving to MongoDB collection: reminders`);
    console.log(`[${requestId}] Reminder ID: ${reminder.id}`);
    
    // Upsert: update if exists, insert if not
    const result = await collection.updateOne(
      { id: reminder.id },
      { $set: reminder },
      { upsert: true }
    );
    
    console.log(`[${requestId}] ✅ MongoDB operation result:`, {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      upsertedId: result.upsertedId
    });
    
    // Verify the document was saved
    const saved = await collection.findOne({ id: reminder.id });
    if (saved) {
      console.log(`[${requestId}] ✅ VERIFIED: Document exists in MongoDB with ID: ${reminder.id}`);
    } else {
      console.error(`[${requestId}] ❌ CRITICAL ERROR: Document not found after save! ID: ${reminder.id}`);
    }
    
    // Count total documents in collection
    const totalCount = await collection.countDocuments();
    console.log(`[${requestId}] 📊 Total reminders in database: ${totalCount}`);
    
    console.log(`[${requestId}] ✅ ${result.upsertedCount > 0 ? 'Created' : 'Updated'} reminder: ${reminder.id}`);
    console.log(`[${requestId}] ==========================================`);
    console.log('');
    
    res.json(reminder);
  } catch (error) {
    console.error(`[${requestId}] ❌ ERROR saving reminder:`, error);
    console.error(`[${requestId}] Error message:`, error.message);
    console.error(`[${requestId}] Error stack:`, error.stack);
    console.log(`[${requestId}] ==========================================`);
    console.log('');
    res.status(500).json({ error: 'Failed to save reminder', details: error.message });
  }
});

app.delete('/api/reminders/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const collection = db.collection('reminders');
    const result = await collection.deleteOne({ id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    console.log(`[API] DELETE /api/reminders/${req.params.id} - Deleted`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Failed to delete reminder', details: error.message });
  }
});

// --- AI & Mapbox proxy (keys only on server) ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_TOKEN || process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';

app.post('/api/ai/identify-shutoff', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(503).json({ error: 'OpenAI API key not configured on server' });
    }
    const { imageBase64, question } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 required' });
    }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that helps residents identify utility shutoffs (fire/gas, power/electrical, and water shutoffs) in their homes. When analyzing images, help users identify: 1) What type of shutoff they're looking at 2) Key identifying features 3) Safety information 4) How to locate it in their home. IMPORTANT: Respond in plain text only. Do NOT use markdown. Write in clear, simple sentences. Be concise and safety-focused.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: question || 'What type of shutoff is this? Help me identify this utility shutoff.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ],
        max_tokens: 500,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'OpenAI request failed' });
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'Unable to identify. Please try again.';
    res.json({ text });
  } catch (error) {
    console.error('Error /api/ai/identify-shutoff:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

app.post('/api/ai/ask', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(503).json({ error: 'OpenAI API key not configured on server' });
    }
    const { question } = req.body || {};
    if (!question) {
      return res.status(400).json({ error: 'question required' });
    }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that helps residents find and identify utility shutoffs (fire/gas, power/electrical, water) in their homes. Provide helpful, concise, safety-focused answers. Respond in plain text only. Do NOT use markdown. Write in clear, simple sentences.`
          },
          { role: 'user', content: question }
        ],
        max_tokens: 500,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'OpenAI request failed' });
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'Unable to answer. Please try again.';
    res.json({ text });
  } catch (error) {
    console.error('Error /api/ai/ask:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

app.post('/api/ai/voice-note', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(503).json({ error: 'OpenAI API key not configured on server' });
    }
    const { audioBase64, context } = req.body || {};
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 required' });
    }

    // Decode base64 audio
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // 1) Transcribe audio with OpenAI Whisper (axios handles multipart correctly with form-data)
    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'audio.m4a', contentType: 'audio/mp4' });
    form.append('model', 'whisper-1');

    try {
      const transcribeResponse = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        form,
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            ...form.getHeaders(),
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          validateStatus: () => true,
        }
      );

      if (transcribeResponse.status !== 200) {
        const err = transcribeResponse.data?.error?.message || transcribeResponse.statusText || 'OpenAI transcription failed';
        return res.status(transcribeResponse.status).json({ error: err });
      }

      const transcript = transcribeResponse.data?.text || '';

      // Use transcript as description only (no GPT rewrite), so we never add or invent content
      const description = transcript;
      res.json({ transcript, description });
    } catch (innerErr) {
      console.error('Error in voice-note transcription/summary:', innerErr);
      throw innerErr;
    }
  } catch (error) {
    console.error('Error /api/ai/voice-note:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

app.get('/api/geocode', async (req, res) => {
  try {
    if (!MAPBOX_TOKEN) {
      return res.status(503).json({ error: 'Mapbox token not configured on server' });
    }
    const address = req.query.address;
    if (!address || typeof address !== 'string' || !address.trim()) {
      return res.status(400).json({ error: 'address query required' });
    }
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address.trim())}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    const feature = data.features && data.features[0];
    if (!feature?.geometry?.coordinates) {
      return res.json({ latitude: null, longitude: null });
    }
    const [lng, lat] = feature.geometry.coordinates;
    res.json({ latitude: lat, longitude: lng });
  } catch (error) {
    console.error('Error /api/geocode:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

app.get('/api/map-static', async (req, res) => {
  try {
    if (!MAPBOX_TOKEN) {
      return res.status(503).send('Mapbox not configured');
    }
    const lat = req.query.lat;
    const lng = req.query.lng;
    const width = req.query.width || 120;
    const height = req.query.height || 120;
    const zoom = req.query.zoom || 15;
    if (lat == null || lng == null) {
      return res.status(400).send('lat and lng required');
    }
    const styleId = 'mapbox/satellite-streets-v12';
    const markerColor = '1095EE';
    const mapUrl = `https://api.mapbox.com/styles/v1/${styleId}/static/pin-s+${markerColor}(${lng},${lat})/${lng},${lat},${zoom}/${width}x${height}?access_token=${MAPBOX_TOKEN}`;
    const imageResponse = await fetch(mapUrl);
    if (!imageResponse.ok) {
      return res.status(imageResponse.status).send('Map image failed');
    }
    const contentType = imageResponse.headers.get('content-type') || 'image/png';
    res.set('Content-Type', contentType);
    res.send(Buffer.from(await imageResponse.arrayBuffer()));
  } catch (error) {
    console.error('Error /api/map-static:', error);
    res.status(500).send('Server error');
  }
});

app.get('/api/mapbox-token', (req, res) => {
  if (!MAPBOX_TOKEN) {
    return res.status(503).json({ error: 'Mapbox token not configured on server' });
  }
  res.json({ token: MAPBOX_TOKEN });
});

// Start server (MongoDB optional: if connection fails, server still starts and /health returns db: 'disconnected'; app uses AsyncStorage)
async function startServer() {
  console.log('='.repeat(60));
  console.log('🚀 Starting DwellSecure API Server...');
  console.log('='.repeat(60));
  console.log(`📡 MongoDB URI: ${mongoUri.replace(/:[^:@]+@/, ':****@')}`); // Hide password
  console.log('🔌 Connecting to MongoDB...');

  try {
    await connectDB();
    console.log('✅ Database connection established!');
    console.log(`📊 Using database: dwellsecure`);
    console.log(`📦 Collections available: shutoffs, utilities`);
  } catch (error) {
    db = null;
    console.warn('='.repeat(60));
    console.warn('⚠️ MongoDB connection failed — server will run without database.');
    console.warn('   App will use local storage. Error:', error.message?.split('\n')[0] || error.message);
    console.warn('='.repeat(60));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('listening', PORT); // AWS / App Runner: must bind to 0.0.0.0 and log listening port
    console.log('='.repeat(60));
    console.log(`✅ Server started successfully!`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: https://dwellsecuregix.onrender.com:${PORT}/health`);
    console.log(`🌐 Server listening on all interfaces (accessible from network)`);
    console.log(`📊 Database status: ${db ? 'CONNECTED ✅' : 'DISCONNECTED ❌ (using local storage)'}`);
    console.log('='.repeat(60));
    console.log('📝 Ready to receive requests...');
    console.log('');
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  if (client) {
    await client.close();
    console.log('✅ MongoDB connection closed');
  }
  process.exit(0);
});

startServer();
