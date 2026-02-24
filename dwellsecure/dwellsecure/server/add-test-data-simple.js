const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const password = 'jHTpcO0mULceeQtA';
const encodedPassword = encodeURIComponent(password);
const uri = process.env.MONGODB_URI || `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;

console.log('='.repeat(60));
console.log('🧪 添加集成测试数据（简化版）');
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
    
    // Test Case 1: Water shutoff - 简单数据，时间戳 2026-01-26
    console.log('📝 Test Case 1: 添加 Water Shutoff...');
    const waterShutoff = {
      id: 'test-water-shutoff-001',
      type: 'water',
      description: 'Water valve in basement',
      location: 'Basement',
      verification_status: 'verified',
      contacts: [
        {
          name: 'John',
          phone: '555-1234',
          role: 'Plumber'
        }
      ],
      photos: [],
      videos: [],
      createdAt: new Date('2026-01-26T10:30:00').toISOString(),
      updatedAt: new Date('2026-01-26T14:20:00').toISOString(),
    };
    
    const shutoffsCollection = db.collection('shutoffs');
    await shutoffsCollection.updateOne(
      { id: waterShutoff.id },
      { $set: waterShutoff },
      { upsert: true }
    );
    console.log(`   ✅ Water shutoff added: ${waterShutoff.id}`);
    console.log(`   📅 Created: ${waterShutoff.createdAt}\n`);
    
    // Test Case 2: Gas shutoff - 简单数据，时间戳 2026-01-27
    console.log('📝 Test Case 2: 添加 Gas Shutoff...');
    const gasShutoff = {
      id: 'test-gas-shutoff-002',
      type: 'gas',
      description: 'Gas meter outside',
      location: 'Outside wall',
      verification_status: 'verified',
      contacts: [
        {
          name: 'Mike',
          phone: '555-5678',
          role: 'Gas tech'
        }
      ],
      photos: [],
      videos: [],
      createdAt: new Date('2026-01-27T09:15:00').toISOString(),
      updatedAt: new Date('2026-01-27T16:45:00').toISOString(),
    };
    
    await shutoffsCollection.updateOne(
      { id: gasShutoff.id },
      { $set: gasShutoff },
      { upsert: true }
    );
    console.log(`   ✅ Gas shutoff added: ${gasShutoff.id}`);
    console.log(`   📅 Created: ${gasShutoff.createdAt}\n`);
    
    // Test Case 3: Incomplete shutoff - 缺失字段，时间戳 2026-01-26
    console.log('📝 Test Case 3: 添加不完整 Shutoff...');
    const incompleteShutoff = {
      id: 'test-incomplete-shutoff-003',
      type: 'electric',
      verification_status: 'unverified',
      createdAt: new Date('2026-01-26T15:00:00').toISOString(),
      updatedAt: new Date('2026-01-26T15:00:00').toISOString(),
    };
    
    await shutoffsCollection.updateOne(
      { id: incompleteShutoff.id },
      { $set: incompleteShutoff },
      { upsert: true }
    );
    console.log(`   ✅ Incomplete shutoff added: ${incompleteShutoff.id}`);
    console.log(`   ⚠️  Missing: description, location`);
    console.log(`   📅 Created: ${incompleteShutoff.createdAt}\n`);
    
    // Verify all data
    console.log('🔍 验证数据...');
    const shutoffsCount = await shutoffsCollection.countDocuments();
    console.log(`   📊 Total shutoffs: ${shutoffsCount}\n`);
    
    // List test data
    console.log('📋 测试用例数据:');
    const testShutoffs = await shutoffsCollection.find({ 
      id: { $in: ['test-water-shutoff-001', 'test-gas-shutoff-002', 'test-incomplete-shutoff-003'] } 
    }).toArray();
    
    testShutoffs.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.id}`);
      console.log(`      Type: ${s.type}, Status: ${s.verification_status || 'N/A'}`);
      console.log(`      Description: ${s.description || 'MISSING'}`);
      console.log(`      Location: ${s.location || 'MISSING'}`);
      console.log(`      Created: ${s.createdAt}`);
      console.log('');
    });
    
    console.log('='.repeat(60));
    console.log('✅ 测试数据添加完成！');
    console.log('='.repeat(60));
    console.log('');
    console.log('📝 测试用例:');
    console.log('   Test Case 1: test-water-shutoff-001 (water, verified, 2026-01-26)');
    console.log('   Test Case 2: test-gas-shutoff-002 (gas, verified, 2026-01-27)');
    console.log('   Test Case 3: test-incomplete-shutoff-003 (electric, incomplete, 2026-01-26)');
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
