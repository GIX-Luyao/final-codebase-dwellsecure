const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const password = 'jHTpcO0mULceeQtA';
const encodedPassword = encodeURIComponent(password);
const uri = process.env.MONGODB_URI || `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;

console.log('='.repeat(60));
console.log('🔍 验证测试用例数据');
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

async function verifyTestCases() {
  try {
    await client.connect();
    console.log('✅ 已连接到 MongoDB\n');
    
    const db = client.db('dwellsecure');
    const shutoffsCollection = db.collection('shutoffs');
    
    // ==========================================
    // Test Case 1: Water Shutoff 验证
    // ==========================================
    console.log('='.repeat(60));
    console.log('Test Case 1: User requests water shutoff');
    console.log('='.repeat(60));
    console.log('预期: backend returns water shutoff info');
    console.log('Pass if: data is shown correctly in UI\n');
    
    const waterShutoffs = await shutoffsCollection.find({ 
      type: 'water',
      description: { $exists: true },
      location: { $exists: true }
    }).toArray();
    
    console.log(`✅ 找到 ${waterShutoffs.length} 个 water shutoff:\n`);
    waterShutoffs.forEach((s, i) => {
      console.log(`   ${i + 1}. ID: ${s.id}`);
      console.log(`      Description: ${s.description}`);
      console.log(`      Location: ${s.location}`);
      console.log(`      Status: ${s.verification_status || 'N/A'}`);
      console.log(`      Created: ${s.createdAt}`);
      console.log(`      ✅ 数据完整，可用于测试\n`);
    });
    
    // ==========================================
    // Test Case 2: Gas Shutoff 验证
    // ==========================================
    console.log('='.repeat(60));
    console.log('Test Case 2: User requests gas shutoff');
    console.log('='.repeat(60));
    console.log('预期: correct gas data returned');
    console.log('Pass if: no crash, correct utility shown\n');
    
    const gasShutoffs = await shutoffsCollection.find({ 
      type: 'gas',
      description: { $exists: true },
      location: { $exists: true }
    }).toArray();
    
    console.log(`✅ 找到 ${gasShutoffs.length} 个 gas shutoff:\n`);
    gasShutoffs.forEach((s, i) => {
      console.log(`   ${i + 1}. ID: ${s.id}`);
      console.log(`      Description: ${s.description}`);
      console.log(`      Location: ${s.location}`);
      console.log(`      Status: ${s.verification_status || 'N/A'}`);
      console.log(`      Contacts: ${s.contacts?.length || 0}`);
      console.log(`      Created: ${s.createdAt}`);
      console.log(`      ✅ 数据完整，可用于测试\n`);
    });
    
    // ==========================================
    // Test Case 3: Missing Data 验证
    // ==========================================
    console.log('='.repeat(60));
    console.log('Test Case 3: Missing data in database');
    console.log('='.repeat(60));
    console.log('预期: app shows fallback message');
    console.log('Pass if: app does not break\n');
    
    const incompleteShutoffs = await shutoffsCollection.find({
      $or: [
        { description: { $exists: false } },
        { location: { $exists: false } },
        { verification_status: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`✅ 找到 ${incompleteShutoffs.length} 个不完整数据:\n`);
    incompleteShutoffs.forEach((s, i) => {
      const missing = [];
      if (!s.description) missing.push('description');
      if (!s.location) missing.push('location');
      if (!s.verification_status) missing.push('verification_status');
      
      console.log(`   ${i + 1}. ID: ${s.id}`);
      console.log(`      Type: ${s.type}`);
      console.log(`      Missing fields: ${missing.join(', ') || 'none'}`);
      console.log(`      Description: ${s.description || 'MISSING'}`);
      console.log(`      Location: ${s.location || 'MISSING'}`);
      console.log(`      Status: ${s.verification_status || 'MISSING'}`);
      console.log(`      Created: ${s.createdAt}`);
      console.log(`      ✅ 可用于测试 fallback 处理\n`);
    });
    
    // ==========================================
    // 总结
    // ==========================================
    console.log('='.repeat(60));
    console.log('📊 测试用例验证总结');
    console.log('='.repeat(60));
    console.log('');
    console.log(`✅ Test Case 1 (Water): ${waterShutoffs.length} 个完整数据`);
    console.log(`✅ Test Case 2 (Gas): ${gasShutoffs.length} 个完整数据`);
    console.log(`✅ Test Case 3 (Missing): ${incompleteShutoffs.length} 个不完整数据`);
    
    // 计算时间范围
    const allShutoffs = [...waterShutoffs, ...gasShutoffs, ...incompleteShutoffs];
    if (allShutoffs.length > 0) {
      const sortedByTime = allShutoffs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const firstCreated = new Date(sortedByTime[0].createdAt);
      const lastCreated = new Date(sortedByTime[sortedByTime.length - 1].createdAt);
      const timeDiffMs = lastCreated - firstCreated;
      const timeDiffMinutes = (timeDiffMs / (1000 * 60)).toFixed(1);
      const timeDiffHours = (timeDiffMs / (1000 * 60 * 60)).toFixed(2);
      
      console.log('');
      console.log(`⏱️  时间范围: ${timeDiffMinutes} 分钟 (${timeDiffHours} 小时)`);
      console.log(`   最早: ${sortedByTime[0].createdAt}`);
      console.log(`   最晚: ${sortedByTime[sortedByTime.length - 1].createdAt}`);
    }
    
    console.log('');
    console.log('💡 测试建议:');
    console.log('   1. 在应用中查看每个 water shutoff，验证 UI 正确显示');
    console.log('   2. 在应用中查看每个 gas shutoff，验证应用不崩溃');
    console.log('   3. 在应用中查看每个不完整数据，验证显示 fallback 消息');
    console.log('');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ 验证失败！');
    console.error('='.repeat(60));
    console.error('Error message:', error.message);
    console.error('='.repeat(60));
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 连接已关闭');
  }
}

verifyTestCases();
