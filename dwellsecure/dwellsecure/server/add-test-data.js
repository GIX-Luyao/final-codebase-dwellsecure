const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const password = 'jHTpcO0mULceeQtA';
const encodedPassword = encodeURIComponent(password);
const uri = process.env.MONGODB_URI || `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;

console.log('='.repeat(60));
console.log('🧪 添加集成测试数据到 MongoDB');
console.log('='.repeat(60));
console.log('');

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
  },
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
});

async function addTestData() {
  try {
    await client.connect();
    console.log('✅ 已连接到 MongoDB\n');
    
    const db = client.db('dwellsecure');
    
    // Test Case 1: Water shutoff data
    console.log('📝 Test Case 1: 添加 Water Shutoff 数据...');
    const waterShutoff = {
      id: 'test-water-shutoff-001',
      type: 'water',
      description: 'Main water shutoff valve located in basement utility room',
      location: 'Basement Utility Room, Near Water Heater',
      verification_status: 'verified',
      notes: 'Test Case 1: User requests water shutoff - Expected: backend returns water shutoff info',
      contacts: [
        {
          name: 'Plumber John',
          phone: '555-0101',
          role: 'Emergency Plumber'
        }
      ],
      photos: [],
      videos: [],
      maintenanceDate: new Date('2024-03-15').toISOString(),
      maintenanceTime: new Date('2024-03-15T10:00:00').toISOString(),
      createdAt: new Date('2024-01-15T08:30:00').toISOString(),
      updatedAt: new Date('2024-01-20T14:22:00').toISOString(),
    };
    
    const shutoffsCollection = db.collection('shutoffs');
    await shutoffsCollection.updateOne(
      { id: waterShutoff.id },
      { $set: waterShutoff },
      { upsert: true }
    );
    console.log(`   ✅ Water shutoff added: ${waterShutoff.id}`);
    console.log(`   📅 Created: ${waterShutoff.createdAt}`);
    console.log(`   📅 Updated: ${waterShutoff.updatedAt}\n`);
    
    // Test Case 2: Gas shutoff data
    console.log('📝 Test Case 2: 添加 Gas Shutoff 数据...');
    const gasShutoff = {
      id: 'test-gas-shutoff-002',
      type: 'gas',
      description: 'Main gas shutoff valve located outside near meter',
      location: 'Exterior Wall, Near Gas Meter',
      verification_status: 'verified',
      notes: 'Test Case 2: User requests gas shutoff - Expected: correct gas data returned',
      contacts: [
        {
          name: 'Gas Company Emergency',
          phone: '555-0202',
          role: 'Gas Utility Provider'
        },
        {
          name: 'HVAC Technician',
          phone: '555-0303',
          role: 'Certified Gas Technician'
        }
      ],
      photos: [],
      videos: [],
      maintenanceDate: new Date('2024-04-20').toISOString(),
      maintenanceTime: new Date('2024-04-20T09:00:00').toISOString(),
      createdAt: new Date('2024-02-10T11:15:00').toISOString(),
      updatedAt: new Date('2024-02-18T16:45:00').toISOString(),
    };
    
    await shutoffsCollection.updateOne(
      { id: gasShutoff.id },
      { $set: gasShutoff },
      { upsert: true }
    );
    console.log(`   ✅ Gas shutoff added: ${gasShutoff.id}`);
    console.log(`   📅 Created: ${gasShutoff.createdAt}`);
    console.log(`   📅 Updated: ${gasShutoff.updatedAt}\n`);
    
    // Test Case 3: Missing/incomplete data (for fallback testing)
    console.log('📝 Test Case 3: 添加不完整数据（用于测试 fallback）...');
    const incompleteShutoff = {
      id: 'test-incomplete-shutoff-003',
      type: 'electric',
      // Missing description - should trigger fallback
      // Missing location - should trigger fallback
      verification_status: 'unverified',
      notes: 'Test Case 3: Missing data in database - Expected: app shows fallback message',
      // Missing contacts
      // Missing photos/videos
      createdAt: new Date('2024-03-01T12:00:00').toISOString(),
      updatedAt: new Date('2024-03-01T12:00:00').toISOString(),
    };
    
    await shutoffsCollection.updateOne(
      { id: incompleteShutoff.id },
      { $set: incompleteShutoff },
      { upsert: true }
    );
    console.log(`   ✅ Incomplete shutoff added: ${incompleteShutoff.id}`);
    console.log(`   ⚠️  This record has missing fields for fallback testing`);
    console.log(`   📅 Created: ${incompleteShutoff.createdAt}\n`);
    
    // Add additional test data for completeness
    console.log('📝 添加额外的测试数据...');
    
    // Additional water utility
    const waterUtility = {
      id: 'test-water-utility-001',
      name: 'Main Water Supply',
      type: 'water',
      description: 'Primary water utility connection',
      location: 'Front Yard, Near Street',
      contact: '555-0101',
      createdAt: new Date('2024-01-15T08:30:00').toISOString(),
      updatedAt: new Date('2024-01-20T14:22:00').toISOString(),
    };
    
    const utilitiesCollection = db.collection('utilities');
    await utilitiesCollection.updateOne(
      { id: waterUtility.id },
      { $set: waterUtility },
      { upsert: true }
    );
    console.log(`   ✅ Water utility added: ${waterUtility.id}\n`);
    
    // Additional gas utility
    const gasUtility = {
      id: 'test-gas-utility-002',
      name: 'Natural Gas Supply',
      type: 'gas',
      description: 'Primary gas utility connection',
      location: 'Exterior Wall',
      contact: '555-0202',
      createdAt: new Date('2024-02-10T11:15:00').toISOString(),
      updatedAt: new Date('2024-02-18T16:45:00').toISOString(),
    };
    
    await utilitiesCollection.updateOne(
      { id: gasUtility.id },
      { $set: gasUtility },
      { upsert: true }
    );
    console.log(`   ✅ Gas utility added: ${gasUtility.id}\n`);
    
    // Test property
    const testProperty = {
      id: 'test-property-001',
      name: 'Test Property for Integration Tests',
      address: '123 Test Street, Test City, TC 12345',
      propertyType: 'house',
      createdAt: new Date('2024-01-01T10:00:00').toISOString(),
      updatedAt: new Date('2024-01-15T08:30:00').toISOString(),
    };
    
    const propertiesCollection = db.collection('properties');
    await propertiesCollection.updateOne(
      { id: testProperty.id },
      { $set: testProperty },
      { upsert: true }
    );
    console.log(`   ✅ Test property added: ${testProperty.id}\n`);
    
    // Verify all data
    console.log('🔍 验证数据...');
    const shutoffsCount = await shutoffsCollection.countDocuments();
    const utilitiesCount = await utilitiesCollection.countDocuments();
    const propertiesCount = await propertiesCollection.countDocuments();
    
    console.log(`   📊 Shutoffs: ${shutoffsCount}`);
    console.log(`   📊 Utilities: ${utilitiesCount}`);
    console.log(`   📊 Properties: ${propertiesCount}\n`);
    
    // List test data
    console.log('📋 测试数据列表:');
    const testShutoffs = await shutoffsCollection.find({ id: { $regex: /^test-/ } }).toArray();
    testShutoffs.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.id} - Type: ${s.type}, Status: ${s.verification_status || 'N/A'}`);
    });
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ 测试数据添加完成！');
    console.log('='.repeat(60));
    console.log('');
    console.log('📝 测试用例数据:');
    console.log('   Test Case 1: test-water-shutoff-001 (water, verified)');
    console.log('   Test Case 2: test-gas-shutoff-002 (gas, verified)');
    console.log('   Test Case 3: test-incomplete-shutoff-003 (electric, incomplete)');
    console.log('');
    console.log('💡 现在可以在应用中测试这些数据了！');
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ 错误添加测试数据！');
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
    console.log('🔌 连接已关闭');
  }
}

addTestData();
