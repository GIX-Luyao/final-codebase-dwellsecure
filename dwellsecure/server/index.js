const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// #region agent log
const DEBUG_LOG_PATH = path.join(__dirname, '..', '.cursor', 'debug.log');
function debugLog(location, message, data, hypothesisId) {
  const payload = { location, message, data: data || {}, timestamp: Date.now(), hypothesisId, runId: 'mongo-connect' };
  fetch('http://127.0.0.1:7242/ingest/14f14bef-012d-49c5-bc8a-a091927f7e62', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
  try { fs.appendFileSync(DEBUG_LOG_PATH, JSON.stringify(payload) + '\n'); } catch (_) {}
}
// #endregion

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - production: set CORS_ORIGIN to comma-separated frontend URLs
const corsOptions = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN.split(',').map(s => s.trim()) }
  : {};
app.use(cors(corsOptions));
app.use(express.json());

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

// MongoDB connection
// If password has special characters, encode it: encodeURIComponent('password')
const password = 'jHTpcO0mULceeQtA';
const encodedPassword = encodeURIComponent(password);
// Add database name to connection string
const uri = process.env.MONGODB_URI || `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
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
    uriHasSrv: uri.includes('mongodb+srv'),
    uriHost: uri.includes('@') ? uri.split('@')[1].split('/')[0].split('?')[0] : 'unknown',
  }, 'A,B,C');
  // #endregion
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`📡 URI: ${uri.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs
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
    
    // Count existing documents
    const shutoffsCount = await db.collection('shutoffs').countDocuments();
    const utilitiesCount = await db.collection('utilities').countDocuments();
    const propertiesCount = await db.collection('properties').countDocuments();
    const remindersCount = await db.collection('reminders').countDocuments();
    console.log(`📝 Current documents: ${shutoffsCount} shutoffs, ${utilitiesCount} utilities, ${propertiesCount} properties, ${remindersCount} reminders`);
    
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

// Properties routes
app.get('/api/properties', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const collection = db.collection('properties');
    const properties = await collection.find({}).toArray();
    console.log(`[API] GET /api/properties - Found ${properties.length} properties`);
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties', details: error.message });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const collection = db.collection('properties');
    const property = await collection.findOne({ id: req.params.id });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
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
      address: property.address,
      addressLine1: property.addressLine1,
      addressLine2: property.addressLine2,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      country: property.country,
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
    
    console.log(`[${requestId}] Saving to MongoDB collection: properties`);
    console.log(`[${requestId}] Property ID: ${property.id}`);
    
    // Upsert: update if exists, insert if not
    const result = await collection.updateOne(
      { id: property.id },
      { $set: property },
      { upsert: true }
    );
    
    console.log(`[${requestId}] ✅ MongoDB operation result:`, {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      upsertedId: result.upsertedId
    });
    
    // Verify the document was saved
    const saved = await collection.findOne({ id: property.id });
    if (saved) {
      console.log(`[${requestId}] ✅ VERIFIED: Document exists in MongoDB with ID: ${property.id}`);
      console.log(`[${requestId}] Document preview:`, {
        id: saved.id,
        name: saved.name,
        address: saved.address,
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
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const collection = db.collection('properties');
    const result = await collection.deleteOne({ id: req.params.id });
    
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

// Start server (MongoDB optional: if connection fails, server still starts and /health returns db: 'disconnected'; app uses AsyncStorage)
async function startServer() {
  console.log('='.repeat(60));
  console.log('🚀 Starting DwellSecure API Server...');
  console.log('='.repeat(60));
  console.log(`📡 MongoDB URI: ${uri.replace(/:[^:@]+@/, ':****@')}`); // Hide password
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
    console.log('='.repeat(60));
    console.log(`✅ Server started successfully!`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
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
