/**
 * Quick test to verify MongoDB connection
 * Run: node test-connection.js
 */

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || "mongodb+srv://sche753_db_user:AUXacLKPJb8Phpdx@cluster0.bjbz8jy.mongodb.net/?appName=Cluster0";

async function testConnection() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db('dwellsecure');
    await db.command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:`, collections.map(c => c.name));
    
    // Test shutoffs collection
    const shutoffsCollection = db.collection('shutoffs');
    const shutoffCount = await shutoffsCollection.countDocuments();
    console.log(`📝 Shutoffs in database: ${shutoffCount}`);
    
    if (shutoffCount > 0) {
      const sample = await shutoffsCollection.findOne();
      console.log('📄 Sample shutoff:', JSON.stringify(sample, null, 2));
    }
    
    // Test utilities collection
    const utilitiesCollection = db.collection('utilities');
    const utilityCount = await utilitiesCollection.countDocuments();
    console.log(`🔧 Utilities in database: ${utilityCount}`);
    
    if (utilityCount > 0) {
      const sample = await utilitiesCollection.findOne();
      console.log('📄 Sample utility:', JSON.stringify(sample, null, 2));
    }
    
    // Test insert
    console.log('\n🧪 Testing insert...');
    const testDoc = {
      id: `test-${Date.now()}`,
      type: 'gas',
      description: 'Test document',
      verification_status: 'unverified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await shutoffsCollection.insertOne(testDoc);
    console.log('✅ Test document inserted:', testDoc.id);
    
    // Verify it's there
    const found = await shutoffsCollection.findOne({ id: testDoc.id });
    if (found) {
      console.log('✅ Verified: Document found in database');
    } else {
      console.log('❌ Error: Document not found after insert');
    }
    
    // Clean up test document
    await shutoffsCollection.deleteOne({ id: testDoc.id });
    console.log('🧹 Test document cleaned up');
    
  } catch (error) {
    console.error('❌ Connection error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

testConnection();
