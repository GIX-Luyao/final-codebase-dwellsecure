const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const password = 'jHTpcO0mULceeQtA';
const encodedPassword = encodeURIComponent(password);
const uri = process.env.MONGODB_URI || `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;

console.log('='.repeat(60));
console.log('🧪 添加随机时间戳测试数据');
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

// 生成随机时间戳（在指定日期范围内，随机时间）
function randomTimestamp(date, minHour = 8, maxHour = 20) {
  const hour = Math.floor(Math.random() * (maxHour - minHour + 1)) + minHour;
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  const dateStr = `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}.${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}Z`;
  return dateStr;
}

// 生成更新时间（在创建时间之后，随机延迟几分钟到几小时）
function randomUpdateTime(createdAt, minMinutes = 15, maxHours = 4) {
  const created = new Date(createdAt);
  const delayMs = Math.floor(Math.random() * (maxHours * 60 - minMinutes + 1) + minMinutes) * 60 * 1000;
  const updated = new Date(created.getTime() + delayMs);
  return updated.toISOString();
}

async function addRandomTestData() {
  try {
    await client.connect();
    console.log('✅ 已连接到 MongoDB\n');
    
    const db = client.db('dwellsecure');
    const shutoffsCollection = db.collection('shutoffs');
    
    // 先删除旧的测试数据
    console.log('🧹 清理旧的测试数据...');
    await shutoffsCollection.deleteMany({ id: { $regex: /^test-/ } });
    console.log('   ✅ 旧数据已清理\n');
    
    // ==========================================
    // 生成基础时间：2026-01-26 或 2026-01-27，随机时间
    // 所有测试在一个小时内完成，所以时间戳都在一个小时内
    // ==========================================
    const baseDate = Math.random() > 0.5 ? '2026-01-26' : '2026-01-27';
    const baseHour = Math.floor(Math.random() * 8) + 10; // 10-17 点之间
    const baseMinute = Math.floor(Math.random() * 60);
    const baseSecond = Math.floor(Math.random() * 60);
    const baseTime = new Date(`${baseDate}T${String(baseHour).padStart(2, '0')}:${String(baseMinute).padStart(2, '0')}:${String(baseSecond).padStart(2, '0')}.000Z`);
    
    console.log(`📅 基础时间: ${baseTime.toISOString()}`);
    console.log(`⏱️  所有测试将在 1 小时内完成\n`);
    
    // 生成时间戳（在基础时间后的随机分钟数，最多60分钟）
    function generateTimestamp(minutesOffset) {
      const timestamp = new Date(baseTime.getTime() + minutesOffset * 60 * 1000);
      // 添加随机的秒和毫秒
      const randomSeconds = Math.floor(Math.random() * 60);
      const randomMs = Math.floor(Math.random() * 1000);
      timestamp.setSeconds(randomSeconds);
      timestamp.setMilliseconds(randomMs);
      return timestamp.toISOString();
    }
    
    // ==========================================
    // Test Case 1: Water Shutoff - 随机时间戳（在1小时内）
    // ==========================================
    console.log('📝 Test Case 1: 添加 Water Shutoff（随机时间戳）...\n');
    
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
      },
    ];
    
    // 为每个 water shutoff 生成时间戳（0-20分钟，按顺序）
    const waterOffsets = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 10) + 5, Math.floor(Math.random() * 10) + 15];
    waterOffsets.sort((a, b) => a - b); // 确保顺序
    
    for (let i = 0; i < waterShutoffs.length; i++) {
      const createdAt = generateTimestamp(waterOffsets[i]);
      const updatedAt = generateTimestamp(waterOffsets[i] + Math.floor(Math.random() * 15) + 5); // 5-20分钟后更新
      waterShutoffs[i].createdAt = createdAt;
      waterShutoffs[i].updatedAt = updatedAt;
      
      await shutoffsCollection.updateOne(
        { id: waterShutoffs[i].id },
        { $set: waterShutoffs[i] },
        { upsert: true }
      );
      console.log(`   ✅ ${waterShutoffs[i].id}`);
      console.log(`      Created: ${createdAt}`);
      console.log(`      Updated: ${updatedAt}\n`);
    }
    
    // ==========================================
    // Test Case 2: Gas Shutoff - 随机时间戳（在1小时内）
    // ==========================================
    console.log('📝 Test Case 2: 添加 Gas Shutoff（随机时间戳）...\n');
    
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
      },
    ];
    
    // 为每个 gas shutoff 生成时间戳（25-45分钟，在 water 之后，按顺序）
    const gasOffsets = [
      Math.floor(Math.random() * 5) + 25,
      Math.floor(Math.random() * 5) + 30,
      Math.floor(Math.random() * 5) + 35
    ];
    gasOffsets.sort((a, b) => a - b); // 确保顺序
    
    for (let i = 0; i < gasShutoffs.length; i++) {
      const createdAt = generateTimestamp(gasOffsets[i]);
      const updatedAt = generateTimestamp(gasOffsets[i] + Math.floor(Math.random() * 10) + 3); // 3-13分钟后更新
      gasShutoffs[i].createdAt = createdAt;
      gasShutoffs[i].updatedAt = updatedAt;
      
      await shutoffsCollection.updateOne(
        { id: gasShutoffs[i].id },
        { $set: gasShutoffs[i] },
        { upsert: true }
      );
      console.log(`   ✅ ${gasShutoffs[i].id}`);
      console.log(`      Created: ${createdAt}`);
      console.log(`      Updated: ${updatedAt}\n`);
    }
    
    // ==========================================
    // Test Case 3: Missing Data - 随机时间戳（在1小时内）
    // ==========================================
    console.log('📝 Test Case 3: 添加不完整数据（随机时间戳）...\n');
    
    const incompleteShutoffs = [
      {
        id: 'test-incomplete-shutoff-001',
        type: 'electric',
        verification_status: 'unverified',
        // Missing: description, location
      },
      {
        id: 'test-incomplete-shutoff-002',
        type: 'water',
        description: 'Water line',
        verification_status: 'unverified',
        // Missing: location
      },
      {
        id: 'test-incomplete-shutoff-003',
        type: 'gas',
        location: 'Garage',
        verification_status: 'unverified',
        // Missing: description
      },
      {
        id: 'test-incomplete-shutoff-004',
        type: 'electric',
        description: 'Main breaker',
        location: 'Basement',
        // Missing: verification_status
      },
    ];
    
    // 为每个不完整数据生成时间戳（45-60分钟，在完整数据之后）
    const incompleteOffsets = [
      Math.floor(Math.random() * 3) + 45,
      Math.floor(Math.random() * 3) + 48,
      Math.floor(Math.random() * 3) + 51,
      Math.floor(Math.random() * 3) + 54
    ];
    incompleteOffsets.sort((a, b) => a - b); // 确保顺序
    
    for (let i = 0; i < incompleteShutoffs.length; i++) {
      const createdAt = generateTimestamp(incompleteOffsets[i]);
      incompleteShutoffs[i].createdAt = createdAt;
      incompleteShutoffs[i].updatedAt = createdAt; // 不完整数据通常不更新
      
      await shutoffsCollection.updateOne(
        { id: incompleteShutoffs[i].id },
        { $set: incompleteShutoffs[i] },
        { upsert: true }
      );
      
      const missing = [];
      if (!incompleteShutoffs[i].description) missing.push('description');
      if (!incompleteShutoffs[i].location) missing.push('location');
      if (!incompleteShutoffs[i].verification_status) missing.push('verification_status');
      
      console.log(`   ✅ ${incompleteShutoffs[i].id}`);
      console.log(`      Missing: ${missing.join(', ') || 'none'}`);
      console.log(`      Created: ${createdAt}\n`);
    }
    
    // ==========================================
    // 验证和总结
    // ==========================================
    console.log('🔍 验证数据...\n');
    
    const allTestShutoffs = await shutoffsCollection.find({ id: { $regex: /^test-/ } })
      .sort({ createdAt: 1 })
      .toArray();
    
    console.log('📋 所有测试数据（按创建时间排序）:');
    console.log('');
    allTestShutoffs.forEach((s, i) => {
      const missing = [];
      if (!s.description) missing.push('description');
      if (!s.location) missing.push('location');
      if (!s.verification_status) missing.push('verification_status');
      
      console.log(`   ${i + 1}. ${s.id} (${s.type})`);
      console.log(`      Created: ${s.createdAt}`);
      if (s.updatedAt !== s.createdAt) {
        console.log(`      Updated: ${s.updatedAt}`);
      }
      if (missing.length > 0) {
        console.log(`      Missing: ${missing.join(', ')}`);
      }
      console.log('');
    });
    
    // 计算时间范围
    const firstCreated = new Date(allTestShutoffs[0].createdAt);
    const lastCreated = new Date(allTestShutoffs[allTestShutoffs.length - 1].createdAt);
    const timeDiffMs = lastCreated - firstCreated;
    const timeDiffMinutes = (timeDiffMs / (1000 * 60)).toFixed(1);
    const timeDiffHours = (timeDiffMs / (1000 * 60 * 60)).toFixed(2);
    
    console.log('='.repeat(60));
    console.log('✅ 测试数据添加完成！');
    console.log('='.repeat(60));
    console.log('');
    console.log(`📊 统计:`);
    console.log(`   Total test shutoffs: ${allTestShutoffs.length}`);
    console.log(`   时间范围: ${timeDiffMinutes} 分钟 (${timeDiffHours} 小时)`);
    console.log(`   最早: ${allTestShutoffs[0].createdAt}`);
    console.log(`   最晚: ${allTestShutoffs[allTestShutoffs.length - 1].createdAt}`);
    console.log('');
    console.log('📝 测试用例:');
    console.log('   Test Case 1: 3 个 water shutoff（随机时间戳，0-20分钟）');
    console.log('   Test Case 2: 3 个 gas shutoff（随机时间戳，25-45分钟）');
    console.log('   Test Case 3: 4 个不完整数据（随机时间戳，45-60分钟）');
    console.log('');
    console.log('💡 所有测试数据的时间戳都是随机的，在1小时内完成，保持先后顺序有意义！');
    
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

addRandomTestData();
