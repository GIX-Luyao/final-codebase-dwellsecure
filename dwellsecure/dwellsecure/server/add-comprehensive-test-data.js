const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const password = 'jHTpcO0mULceeQtA';
const encodedPassword = encodeURIComponent(password);
const uri = process.env.MONGODB_URI || `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;

console.log('='.repeat(60));
console.log('🧪 添加完整测试数据（覆盖所有测试用例场景）');
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

async function addComprehensiveTestData() {
  try {
    await client.connect();
    console.log('✅ 已连接到 MongoDB\n');
    
    const db = client.db('dwellsecure');
    const shutoffsCollection = db.collection('shutoffs');
    
    // ==========================================
    // Test Case 1: Water Shutoff - 多个场景
    // ==========================================
    console.log('📝 Test Case 1: 添加多个 Water Shutoff 场景...\n');
    
    const waterShutoffs = [
      {
        id: 'test-water-shutoff-001',
        type: 'water',
        description: 'Water valve in basement',
        location: 'Basement',
        verification_status: 'verified',
        contacts: [{ name: 'John', phone: '555-1234', role: 'Plumber' }],
        photos: [],
        videos: [],
        createdAt: new Date('2026-01-26T10:30:00').toISOString(),
        updatedAt: new Date('2026-01-26T14:20:00').toISOString(),
      },
      {
        id: 'test-water-shutoff-002',
        type: 'water',
        description: 'Main water line',
        location: 'Garage',
        verification_status: 'verified',
        contacts: [{ name: 'Sarah', phone: '555-2345', role: 'Contractor' }],
        photos: [],
        videos: [],
        createdAt: new Date('2026-01-27T08:15:00').toISOString(),
        updatedAt: new Date('2026-01-27T11:30:00').toISOString(),
      },
      {
        id: 'test-water-shutoff-003',
        type: 'water',
        description: 'Outdoor spigot',
        location: 'Backyard',
        verification_status: 'unverified',
        contacts: [],
        photos: [],
        videos: [],
        createdAt: new Date('2026-01-26T16:45:00').toISOString(),
        updatedAt: new Date('2026-01-26T16:45:00').toISOString(),
      },
    ];
    
    for (const shutoff of waterShutoffs) {
      await shutoffsCollection.updateOne(
        { id: shutoff.id },
        { $set: shutoff },
        { upsert: true }
      );
      console.log(`   ✅ ${shutoff.id} - ${shutoff.description} (${shutoff.verification_status})`);
    }
    console.log('');
    
    // ==========================================
    // Test Case 2: Gas Shutoff - 多个场景
    // ==========================================
    console.log('📝 Test Case 2: 添加多个 Gas Shutoff 场景...\n');
    
    const gasShutoffs = [
      {
        id: 'test-gas-shutoff-001',
        type: 'gas',
        description: 'Gas meter outside',
        location: 'Outside wall',
        verification_status: 'verified',
        contacts: [{ name: 'Mike', phone: '555-5678', role: 'Gas tech' }],
        photos: [],
        videos: [],
        createdAt: new Date('2026-01-27T09:15:00').toISOString(),
        updatedAt: new Date('2026-01-27T16:45:00').toISOString(),
      },
      {
        id: 'test-gas-shutoff-002',
        type: 'gas',
        description: 'Kitchen gas line',
        location: 'Kitchen',
        verification_status: 'verified',
        contacts: [
          { name: 'Tom', phone: '555-6789', role: 'HVAC' },
          { name: 'Emergency', phone: '555-0000', role: 'Gas company' }
        ],
        photos: [],
        videos: [],
        createdAt: new Date('2026-01-26T13:20:00').toISOString(),
        updatedAt: new Date('2026-01-27T09:00:00').toISOString(),
      },
      {
        id: 'test-gas-shutoff-003',
        type: 'gas',
        description: 'Furnace gas valve',
        location: 'Utility room',
        verification_status: 'unverified',
        contacts: [{ name: 'Bob', phone: '555-3456', role: 'Technician' }],
        photos: [],
        videos: [],
        createdAt: new Date('2026-01-27T14:30:00').toISOString(),
        updatedAt: new Date('2026-01-27T14:30:00').toISOString(),
      },
    ];
    
    for (const shutoff of gasShutoffs) {
      await shutoffsCollection.updateOne(
        { id: shutoff.id },
        { $set: shutoff },
        { upsert: true }
      );
      console.log(`   ✅ ${shutoff.id} - ${shutoff.description} (${shutoff.verification_status})`);
    }
    console.log('');
    
    // ==========================================
    // Test Case 3: Missing/Incomplete Data - 多个场景
    // ==========================================
    console.log('📝 Test Case 3: 添加多个不完整数据场景...\n');
    
    const incompleteShutoffs = [
      {
        id: 'test-incomplete-shutoff-001',
        type: 'electric',
        verification_status: 'unverified',
        createdAt: new Date('2026-01-26T15:00:00').toISOString(),
        updatedAt: new Date('2026-01-26T15:00:00').toISOString(),
        // Missing: description, location
      },
      {
        id: 'test-incomplete-shutoff-002',
        type: 'water',
        description: 'Water line',
        verification_status: 'unverified',
        createdAt: new Date('2026-01-27T12:00:00').toISOString(),
        updatedAt: new Date('2026-01-27T12:00:00').toISOString(),
        // Missing: location
      },
      {
        id: 'test-incomplete-shutoff-003',
        type: 'gas',
        location: 'Garage',
        verification_status: 'unverified',
        createdAt: new Date('2026-01-26T18:30:00').toISOString(),
        updatedAt: new Date('2026-01-26T18:30:00').toISOString(),
        // Missing: description
      },
      {
        id: 'test-incomplete-shutoff-004',
        type: 'electric',
        description: 'Main breaker',
        location: 'Basement',
        createdAt: new Date('2026-01-27T10:00:00').toISOString(),
        updatedAt: new Date('2026-01-27T10:00:00').toISOString(),
        // Missing: verification_status
      },
    ];
    
    for (const shutoff of incompleteShutoffs) {
      await shutoffsCollection.updateOne(
        { id: shutoff.id },
        { $set: shutoff },
        { upsert: true }
      );
      const missing = [];
      if (!shutoff.description) missing.push('description');
      if (!shutoff.location) missing.push('location');
      if (!shutoff.verification_status) missing.push('verification_status');
      console.log(`   ✅ ${shutoff.id} - Missing: ${missing.join(', ') || 'none'}`);
    }
    console.log('');
    
    // ==========================================
    // 验证数据
    // ==========================================
    console.log('🔍 验证数据...\n');
    
    const allShutoffs = await shutoffsCollection.find({ id: { $regex: /^test-/ } }).toArray();
    const waterCount = allShutoffs.filter(s => s.type === 'water').length;
    const gasCount = allShutoffs.filter(s => s.type === 'gas').length;
    const electricCount = allShutoffs.filter(s => s.type === 'electric').length;
    const incompleteCount = allShutoffs.filter(s => !s.description || !s.location || !s.verification_status).length;
    
    console.log(`   📊 Total test shutoffs: ${allShutoffs.length}`);
    console.log(`   📊 Water shutoffs: ${waterCount}`);
    console.log(`   📊 Gas shutoffs: ${gasCount}`);
    console.log(`   📊 Electric shutoffs: ${electricCount}`);
    console.log(`   📊 Incomplete shutoffs: ${incompleteCount}\n`);
    
    // Group by test case
    console.log('📋 测试用例分组:');
    console.log('');
    console.log('   Test Case 1 (Water Shutoff):');
    const waterTestCases = allShutoffs.filter(s => s.type === 'water' && s.description && s.location);
    waterTestCases.forEach((s, i) => {
      console.log(`      ${i + 1}. ${s.id} - ${s.description} @ ${s.location} (${s.verification_status})`);
    });
    console.log('');
    console.log('   Test Case 2 (Gas Shutoff):');
    const gasTestCases = allShutoffs.filter(s => s.type === 'gas' && s.description && s.location);
    gasTestCases.forEach((s, i) => {
      console.log(`      ${i + 1}. ${s.id} - ${s.description} @ ${s.location} (${s.verification_status})`);
    });
    console.log('');
    console.log('   Test Case 3 (Missing Data):');
    const incompleteTestCases = allShutoffs.filter(s => !s.description || !s.location || !s.verification_status);
    incompleteTestCases.forEach((s, i) => {
      const missing = [];
      if (!s.description) missing.push('description');
      if (!s.location) missing.push('location');
      if (!s.verification_status) missing.push('verification_status');
      console.log(`      ${i + 1}. ${s.id} (${s.type}) - Missing: ${missing.join(', ')}`);
    });
    console.log('');
    
    console.log('='.repeat(60));
    console.log('✅ 完整测试数据添加完成！');
    console.log('='.repeat(60));
    console.log('');
    console.log('📝 测试用例覆盖:');
    console.log('   Test Case 1: 3 个 water shutoff 场景（verified/unverified，不同位置）');
    console.log('   Test Case 2: 3 个 gas shutoff 场景（verified/unverified，不同位置）');
    console.log('   Test Case 3: 4 个不完整数据场景（不同缺失字段组合）');
    console.log('');
    console.log('💡 现在可以在应用中全面测试这些场景了！');
    
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

addComprehensiveTestData();
