/**
 * Integration Test for Dwell Secure
 * 
 * Tests the complete flow:
 * 1. Create a new water utility/shutoff from UI (simulated via POST)
 * 2. Persist the data in MongoDB
 * 3. Retrieve the data via GET request by utility type (water)
 * 4. Verify location and technician name are present
 */

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const password = 'jHTpcO0mULceeQtA';
const encodedPassword = encodeURIComponent(password);
const uri = process.env.MONGODB_URI || `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

console.log('='.repeat(60));
console.log('🧪 Dwell Secure Integration Test');
console.log('='.repeat(60));
console.log('');

let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name, passed, message) {
  testResults.tests.push({ name, passed, message });
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}: ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: ${message}`);
  }
}

async function testCreateWaterShutoff() {
  console.log('\n📝 Test 1: Create a new water utility/shutoff via POST');
  console.log('-'.repeat(60));
  
  const testShutoff = {
    id: `integration-test-water-${Date.now()}`,
    type: 'water',
    description: 'Main water shutoff valve',
    location: 'Basement utility room',
    verification_status: 'verified',
    contacts: [
      {
        name: 'John Plumber',
        phone: '555-1234',
        role: 'Plumber'
      }
    ],
    photos: [],
    videos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/shutoffs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testShutoff),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logTest('POST /api/shutoffs', false, `HTTP ${response.status}: ${errorText}`);
      return null;
    }

    const saved = await response.json();
    logTest('POST /api/shutoffs', true, `Successfully created shutoff: ${saved.id}`);
    return saved;
  } catch (error) {
    logTest('POST /api/shutoffs', false, `Error: ${error.message}`);
    return null;
  }
}

async function testPersistInMongoDB(shutoffId) {
  console.log('\n💾 Test 2: Verify data persisted in MongoDB');
  console.log('-'.repeat(60));
  
  if (!shutoffId) {
    logTest('MongoDB Persistence', false, 'No shutoff ID to verify');
    return false;
  }

  try {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: false,
      },
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
    });

    await client.connect();
    const db = client.db('dwellsecure');
    const collection = db.collection('shutoffs');
    
    const found = await collection.findOne({ id: shutoffId });
    
    if (!found) {
      logTest('MongoDB Persistence', false, `Shutoff ${shutoffId} not found in database`);
      await client.close();
      return false;
    }

    logTest('MongoDB Persistence', true, `Shutoff ${shutoffId} found in database`);
    await client.close();
    return found;
  } catch (error) {
    logTest('MongoDB Persistence', false, `Error: ${error.message}`);
    return false;
  }
}

async function testGetByType() {
  console.log('\n📥 Test 3: Retrieve data via GET request by utility type (water)');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/shutoffs?type=water`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logTest('GET /api/shutoffs?type=water', false, `HTTP ${response.status}: ${errorText}`);
      return null;
    }

    const shutoffs = await response.json();
    
    if (!Array.isArray(shutoffs)) {
      logTest('GET /api/shutoffs?type=water', false, 'Response is not an array');
      return null;
    }

    const waterShutoffs = shutoffs.filter(s => s.type === 'water');
    logTest('GET /api/shutoffs?type=water', true, `Retrieved ${waterShutoffs.length} water shutoffs`);
    return waterShutoffs;
  } catch (error) {
    logTest('GET /api/shutoffs?type=water', false, `Error: ${error.message}`);
    return null;
  }
}

async function testDisplayLocationAndTechnician(shutoffs) {
  console.log('\n🖥️  Test 4: Verify location and technician name are present');
  console.log('-'.repeat(60));
  
  if (!shutoffs || shutoffs.length === 0) {
    logTest('Display Location & Technician', false, 'No shutoffs to verify');
    return false;
  }

  let allPassed = true;
  
  for (const shutoff of shutoffs) {
    const hasLocation = shutoff.location && shutoff.location.trim() !== '';
    const hasTechnician = shutoff.contacts && 
                         Array.isArray(shutoff.contacts) && 
                         shutoff.contacts.length > 0 &&
                         shutoff.contacts.some(c => c.name && c.name.trim() !== '');

    if (!hasLocation) {
      logTest(`Location for ${shutoff.id}`, false, 'Location is missing or empty');
      allPassed = false;
    } else {
      logTest(`Location for ${shutoff.id}`, true, `Location: ${shutoff.location}`);
    }

    if (!hasTechnician) {
      logTest(`Technician for ${shutoff.id}`, false, 'Technician name is missing or empty');
      allPassed = false;
    } else {
      const technicianNames = shutoff.contacts
        .filter(c => c.name && c.name.trim() !== '')
        .map(c => c.name)
        .join(', ');
      logTest(`Technician for ${shutoff.id}`, true, `Technician: ${technicianNames}`);
    }
  }

  return allPassed;
}

async function cleanupTestData(shutoffId) {
  console.log('\n🧹 Cleaning up test data...');
  console.log('-'.repeat(60));
  
  if (!shutoffId) return;

  try {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: false,
      },
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
    });

    await client.connect();
    const db = client.db('dwellsecure');
    const collection = db.collection('shutoffs');
    
    const result = await collection.deleteOne({ id: shutoffId });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Cleaned up test shutoff: ${shutoffId}`);
    } else {
      console.log(`⚠️  Test shutoff not found for cleanup: ${shutoffId}`);
    }
    
    await client.close();
  } catch (error) {
    console.error(`❌ Error cleaning up: ${error.message}`);
  }
}

async function runIntegrationTest() {
  try {
    // Test 1: Create water shutoff via POST
    const createdShutoff = await testCreateWaterShutoff();
    const shutoffId = createdShutoff?.id;

    // Test 2: Verify persistence in MongoDB
    const persistedShutoff = await testPersistInMongoDB(shutoffId);

    // Test 3: Retrieve by type
    const waterShutoffs = await testGetByType();

    // Test 4: Verify location and technician display
    await testDisplayLocationAndTechnician(waterShutoffs);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📝 Total: ${testResults.tests.length}`);
    console.log('');

    if (testResults.failed === 0) {
      console.log('🎉 All integration tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Please review the output above.');
    }

    // Cleanup
    if (shutoffId) {
      await cleanupTestData(shutoffId);
    }

    console.log('\n' + '='.repeat(60));
    process.exit(testResults.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Integration test failed with error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Server is running: ${data.status}`);
      console.log(`✅ Database status: ${data.db}`);
      console.log('');
      return true;
    } else {
      console.error(`❌ Server health check failed: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Cannot connect to server at ${API_BASE_URL}`);
    console.error(`   Error: ${error.message}`);
    console.error('');
    console.error('💡 Make sure the server is running:');
    console.error('   cd server && npm start');
    console.error('');
    return false;
  }
}

// Main execution
(async () => {
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log(`📡 MongoDB URI: ${uri.replace(/:[^:@]+@/, ':****@')}`);
  console.log('');

  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    console.error('❌ Server is not available. Please start the server first.');
    process.exit(1);
  }

  await runIntegrationTest();
})();
