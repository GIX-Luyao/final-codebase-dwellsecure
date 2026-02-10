const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const password = 'jHTpcO0mULceeQtA';
const encodedPassword = encodeURIComponent(password);
const uri = process.env.MONGODB_URI || `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;

console.log('='.repeat(60));
console.log('🔍 检查 MongoDB 数据库中的当前数据');
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

async function checkData() {
  try {
    await client.connect();
    console.log('✅ 已连接到 MongoDB\n');
    
    const db = client.db('dwellsecure');
    
    // Check properties
    console.log('📊 Properties:');
    const properties = await db.collection('properties').find({}).toArray();
    console.log(`   总数: ${properties.length}`);
    properties.forEach((p, i) => {
      console.log(`   ${i + 1}. ID: ${p.id}, Name: ${p.name || 'N/A'}, Address: ${p.address || 'N/A'}`);
      console.log(`      创建时间: ${p.createdAt || 'N/A'}`);
      console.log(`      更新时间: ${p.updatedAt || 'N/A'}`);
    });
    console.log('');
    
    // Check shutoffs
    console.log('📊 Shutoffs:');
    const shutoffs = await db.collection('shutoffs').find({}).toArray();
    console.log(`   总数: ${shutoffs.length}`);
    shutoffs.forEach((s, i) => {
      console.log(`   ${i + 1}. ID: ${s.id}, Type: ${s.type || 'N/A'}, Description: ${(s.description || 'N/A').substring(0, 50)}`);
      console.log(`      创建时间: ${s.createdAt || 'N/A'}`);
      console.log(`      更新时间: ${s.updatedAt || 'N/A'}`);
    });
    console.log('');
    
    // Check utilities
    console.log('📊 Utilities:');
    const utilities = await db.collection('utilities').find({}).toArray();
    console.log(`   总数: ${utilities.length}`);
    utilities.forEach((u, i) => {
      console.log(`   ${i + 1}. ID: ${u.id}, Name: ${u.name || 'N/A'}, Type: ${u.type || 'N/A'}`);
      console.log(`      创建时间: ${u.createdAt || 'N/A'}`);
      console.log(`      更新时间: ${u.updatedAt || 'N/A'}`);
    });
    console.log('');
    
    // Check reminders
    console.log('📊 Reminders:');
    const reminders = await db.collection('reminders').find({}).toArray();
    console.log(`   总数: ${reminders.length}`);
    reminders.forEach((r, i) => {
      console.log(`   ${i + 1}. ID: ${r.id}, Title: ${r.title || 'N/A'}`);
      console.log(`      创建时间: ${r.createdAt || 'N/A'}`);
      console.log(`      更新时间: ${r.updatedAt || 'N/A'}`);
    });
    console.log('');
    
    console.log('='.repeat(60));
    console.log('📊 总结:');
    console.log(`   Properties: ${properties.length}`);
    console.log(`   Shutoffs: ${shutoffs.length}`);
    console.log(`   Utilities: ${utilities.length}`);
    console.log(`   Reminders: ${reminders.length}`);
    console.log('='.repeat(60));
    
    if (properties.length === 0 && shutoffs.length === 0 && utilities.length === 0 && reminders.length === 0) {
      console.log('');
      console.log('⚠️ 数据库是空的！');
      console.log('可能的原因：');
      console.log('   1. 服务器没有运行');
      console.log('   2. 应用没有连接到服务器');
      console.log('   3. 数据只保存到了本地 AsyncStorage');
    } else {
      console.log('');
      console.log('💡 如果应用中的数据没有出现在这里，说明：');
      console.log('   1. 应用没有连接到服务器');
      console.log('   2. 数据只保存到了本地 AsyncStorage');
      console.log('   3. 检查服务器是否在运行');
      console.log('   4. 检查应用控制台是否有 [Storage] ✅ Successfully saved to MongoDB 日志');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.close();
  }
}

checkData();
