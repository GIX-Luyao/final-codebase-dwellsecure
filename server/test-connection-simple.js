const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// Try different connection string formats
const password = 'jHTpcO0mULceeQtA';
const encodedPassword = encodeURIComponent(password);

// Format 1: With database name in connection string
const uri1 = `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;

// Format 2: Without database name (default)
const uri2 = `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/?appName=Haven&retryWrites=true&w=majority`;

// Format 3: Minimal format
const uri3 = `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/`;

console.log('='.repeat(60));
console.log('🧪 Testing MongoDB Connection (Multiple Formats)');
console.log('='.repeat(60));
console.log('');

async function testConnection(uri, formatName) {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    // Add connection timeout
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    console.log(`🔌 Testing ${formatName}...`);
    console.log(`   URI: ${uri.replace(/:[^:@]+@/, ':****@')}`);
    
    await client.connect();
    console.log(`✅ ${formatName}: Connected successfully!`);
    
    // Test ping
    await client.db("admin").command({ ping: 1 });
    console.log(`✅ ${formatName}: Ping successful!`);
    
    // List databases
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    console.log(`✅ ${formatName}: Found ${databases.databases.length} databases`);
    
    // Check dwellsecure
    const db = client.db('dwellsecure');
    const collections = await db.listCollections().toArray();
    console.log(`✅ ${formatName}: dwellsecure has ${collections.length} collections`);
    
    await client.close();
    console.log(`✅ ${formatName}: Connection closed`);
    console.log('');
    
    return true;
  } catch (error) {
    console.log(`❌ ${formatName}: Failed`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
    console.log('');
    await client.close().catch(() => {});
    return false;
  }
}

async function runTests() {
  const results = [];
  
  results.push(await testConnection(uri1, 'Format 1 (with database)'));
  results.push(await testConnection(uri2, 'Format 2 (without database)'));
  results.push(await testConnection(uri3, 'Format 3 (minimal)'));
  
  console.log('='.repeat(60));
  console.log('📊 Test Results:');
  console.log('='.repeat(60));
  results.forEach((result, index) => {
    console.log(`Format ${index + 1}: ${result ? '✅ SUCCESS' : '❌ FAILED'}`);
  });
  console.log('='.repeat(60));
  
  if (results.some(r => r)) {
    console.log('✅ At least one format works!');
  } else {
    console.log('❌ All formats failed. This might be a network/DNS issue.');
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Try accessing https://cloud.mongodb.com in your browser');
    console.log('   3. Check if firewall is blocking Node.js');
    console.log('   4. Try using a VPN or different network');
  }
}

runTests().catch(console.error);
