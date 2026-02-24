const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const password = 'jHTpcO0mULceeQtA';
const encodedPassword = encodeURIComponent(password);
const uri = process.env.MONGODB_URI || `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;

console.log('='.repeat(60));
console.log('🧪 测试：手动保存数据到 MongoDB');
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

async function testSave() {
  try {
    await client.connect();
    console.log('✅ 已连接到 MongoDB\n');
    
    const db = client.db('dwellsecure');
    
    // Test 1: Save a property
    console.log('📝 测试 1: 保存 Property...');
    const testProperty = {
      id: `test-property-${Date.now()}`,
      name: 'Test Property',
      address: '123 Test Street',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const propertiesCollection = db.collection('properties');
    const propertyResult = await propertiesCollection.updateOne(
      { id: testProperty.id },
      { $set: testProperty },
      { upsert: true }
    );
    console.log(`   ✅ Property saved: ${testProperty.id}`);
    console.log(`   📊 Result: ${propertyResult.upsertedCount > 0 ? 'Created' : 'Updated'}\n`);
    
    // Test 2: Save a shutoff
    console.log('📝 测试 2: 保存 Shutoff...');
    const testShutoff = {
      id: `test-shutoff-${Date.now()}`,
      type: 'electric',
      description: 'Test Shutoff',
      location: 'Test Location',
      verification_status: 'unverified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const shutoffsCollection = db.collection('shutoffs');
    const shutoffResult = await shutoffsCollection.updateOne(
      { id: testShutoff.id },
      { $set: testShutoff },
      { upsert: true }
    );
    console.log(`   ✅ Shutoff saved: ${testShutoff.id}`);
    console.log(`   📊 Result: ${shutoffResult.upsertedCount > 0 ? 'Created' : 'Updated'}\n`);
    
    // Test 3: Save a utility
    console.log('📝 测试 3: 保存 Utility...');
    const testUtility = {
      id: `test-utility-${Date.now()}`,
      name: 'Test Utility',
      type: 'electric',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const utilitiesCollection = db.collection('utilities');
    const utilityResult = await utilitiesCollection.updateOne(
      { id: testUtility.id },
      { $set: testUtility },
      { upsert: true }
    );
    console.log(`   ✅ Utility saved: ${testUtility.id}`);
    console.log(`   📊 Result: ${utilityResult.upsertedCount > 0 ? 'Created' : 'Updated'}\n`);
    
    // Verify all data
    console.log('🔍 验证数据...');
    const propertiesCount = await propertiesCollection.countDocuments();
    const shutoffsCount = await shutoffsCollection.countDocuments();
    const utilitiesCount = await utilitiesCollection.countDocuments();
    
    console.log(`   📊 Properties: ${propertiesCount}`);
    console.log(`   📊 Shutoffs: ${shutoffsCount}`);
    console.log(`   📊 Utilities: ${utilitiesCount}\n`);
    
    console.log('='.repeat(60));
    console.log('✅ 所有测试完成！');
    console.log('='.repeat(60));
    console.log('');
    console.log('💡 如果这个脚本能保存数据，但应用不能，说明：');
    console.log('   1. 数据库连接正常');
    console.log('   2. 问题在应用 → 服务器的连接');
    console.log('   3. 检查服务器是否在运行');
    console.log('   4. 检查应用是否连接到服务器');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.close();
  }
}

testSave();
