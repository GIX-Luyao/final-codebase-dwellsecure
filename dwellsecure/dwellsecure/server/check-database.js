const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const password = 'jHTpcO0mULceeQtA';
const encodedPassword = encodeURIComponent(password);
const uri = process.env.MONGODB_URI || `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;

console.log('='.repeat(60));
console.log('🔍 Checking MongoDB Databases');
console.log('='.repeat(60));
console.log(`📡 Connection URI: ${uri.replace(/:[^:@]+@/, ':****@')}`);
console.log('');

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function checkDatabases() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    
    // List all databases
    console.log('');
    console.log('📊 Listing all databases:');
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    
    databases.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Check if dwellsecure exists
    const dwellsecureExists = databases.databases.some(db => db.name === 'dwellsecure');
    console.log('');
    if (dwellsecureExists) {
      console.log('✅ dwellsecure database exists!');
      
      // Check collections in dwellsecure
      const db = client.db('dwellsecure');
      const collections = await db.listCollections().toArray();
      console.log(`📦 Collections in dwellsecure: ${collections.length}`);
      
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
      
      // Count documents in each collection
      console.log('');
      console.log('📝 Document counts:');
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   - ${col.name}: ${count} documents`);
      }
      
      // Show sample documents
      if (collections.length > 0) {
        console.log('');
        console.log('📄 Sample documents:');
        for (const col of collections) {
          const sample = await db.collection(col.name).findOne({});
          if (sample) {
            console.log(`   ${col.name}:`, JSON.stringify(sample, null, 2).substring(0, 200) + '...');
          }
        }
      }
    } else {
      console.log('⚠️ dwellsecure database does NOT exist');
      console.log('   It will be created automatically when you save the first document.');
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Check complete!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ Error checking databases!');
    console.error('='.repeat(60));
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    console.error('='.repeat(60));
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

checkDatabases();
