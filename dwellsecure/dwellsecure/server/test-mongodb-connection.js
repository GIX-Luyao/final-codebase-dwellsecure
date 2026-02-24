const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// Use the same connection string as the server
// If password has special characters, encode it: encodeURIComponent('password')
const password = 'jHTpcO0mULceeQtA';
const encodedPassword = encodeURIComponent(password);
// Add database name to connection string
const uri = process.env.MONGODB_URI || `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;

console.log('='.repeat(60));
console.log('🧪 Testing MongoDB Connection');
console.log('='.repeat(60));
console.log(`📡 Connection URI: ${uri.replace(/:[^:@]+@/, ':****@')}`); // Hide password
console.log('');

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function testConnection() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    
    // Test ping
    console.log('📡 Sending ping...');
    await client.db("admin").command({ ping: 1 });
    console.log('✅ Ping successful!');
    
    // Connect to the database
    const db = client.db('dwellsecure');
    console.log(`📊 Using database: dwellsecure`);
    
    // Test collections
    console.log('📦 Checking collections...');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`, collections.map(c => c.name));
    
    // Test shutoffs collection
    const shutoffsCollection = db.collection('shutoffs');
    const shutoffsCount = await shutoffsCollection.countDocuments();
    console.log(`📝 Shutoffs collection: ${shutoffsCount} documents`);
    
    // Test utilities collection
    const utilitiesCollection = db.collection('utilities');
    const utilitiesCount = await utilitiesCollection.countDocuments();
    console.log(`📝 Utilities collection: ${utilitiesCount} documents`);
    
    // Test: Insert a test document
    console.log('');
    console.log('🧪 Testing document insertion...');
    const testDoc = {
      id: `test-connection-${Date.now()}`,
      type: 'electric',
      description: 'Test document from connection test',
      location: 'Test Location',
      verification_status: 'unverified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: 'This is a test document to verify MongoDB connection and write permissions',
    };
    
    const insertResult = await shutoffsCollection.insertOne(testDoc);
    console.log(`✅ Test document inserted! ID: ${insertResult.insertedId}`);
    
    // Verify the document exists
    const found = await shutoffsCollection.findOne({ id: testDoc.id });
    if (found) {
      console.log(`✅ Verified: Document exists in database`);
      console.log(`   Document ID: ${found.id}`);
      console.log(`   Description: ${found.description}`);
    } else {
      console.error(`❌ ERROR: Document not found after insertion!`);
    }
    
    // Count again
    const newCount = await shutoffsCollection.countDocuments();
    console.log(`📊 New shutoffs count: ${newCount} (was ${shutoffsCount})`);
    
    // Clean up: Delete the test document
    console.log('');
    console.log('🧹 Cleaning up test document...');
    const deleteResult = await shutoffsCollection.deleteOne({ id: testDoc.id });
    if (deleteResult.deletedCount > 0) {
      console.log('✅ Test document deleted');
    } else {
      console.warn('⚠️ Test document not found for deletion');
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ All tests passed! MongoDB connection is working correctly.');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ Connection test failed!');
    console.error('='.repeat(60));
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    console.error('='.repeat(60));
    process.exit(1);
  } finally {
    console.log('');
    console.log('🔌 Closing connection...');
    await client.close();
    console.log('✅ Connection closed');
  }
}

testConnection();
