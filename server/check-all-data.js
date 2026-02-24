const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const password = 'jHTpcO0mULceeQtA';
const encodedPassword = encodeURIComponent(password);
const uri = process.env.MONGODB_URI || `mongodb+srv://sche753_db_user:${encodedPassword}@haven.ksoyo27.mongodb.net/dwellsecure?appName=Haven&retryWrites=true&w=majority`;

console.log('='.repeat(60));
console.log('🔍 检查 MongoDB 数据库中的所有数据');
console.log('='.repeat(60));
console.log('');

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function checkAllData() {
  try {
    await client.connect();
    console.log('✅ 已连接到 MongoDB\n');
    
    const db = client.db('dwellsecure');
    
    // Check properties
    console.log('📊 Properties 集合:');
    const propertiesCollection = db.collection('properties');
    const propertiesCount = await propertiesCollection.countDocuments();
    console.log(`   文档数量: ${propertiesCount}`);
    if (propertiesCount > 0) {
      const properties = await propertiesCollection.find({}).toArray();
      properties.forEach((p, i) => {
        console.log(`   ${i + 1}. ID: ${p.id}, Name: ${p.name || 'N/A'}, Address: ${p.address || 'N/A'}`);
      });
    } else {
      console.log('   ⚠️ 没有找到任何 properties');
    }
    console.log('');
    
    // Check shutoffs
    console.log('📊 Shutoffs 集合:');
    const shutoffsCollection = db.collection('shutoffs');
    const shutoffsCount = await shutoffsCollection.countDocuments();
    console.log(`   文档数量: ${shutoffsCount}`);
    if (shutoffsCount > 0) {
      const shutoffs = await shutoffsCollection.find({}).toArray();
      shutoffs.forEach((s, i) => {
        console.log(`   ${i + 1}. ID: ${s.id}, Type: ${s.type || 'N/A'}, Description: ${(s.description || 'N/A').substring(0, 50)}`);
      });
    } else {
      console.log('   ⚠️ 没有找到任何 shutoffs');
    }
    console.log('');
    
    // Check utilities
    console.log('📊 Utilities 集合:');
    const utilitiesCollection = db.collection('utilities');
    const utilitiesCount = await utilitiesCollection.countDocuments();
    console.log(`   文档数量: ${utilitiesCount}`);
    if (utilitiesCount > 0) {
      const utilities = await utilitiesCollection.find({}).toArray();
      utilities.forEach((u, i) => {
        console.log(`   ${i + 1}. ID: ${u.id}, Name: ${u.name || 'N/A'}, Type: ${u.type || 'N/A'}`);
      });
    } else {
      console.log('   ⚠️ 没有找到任何 utilities');
    }
    console.log('');
    
    console.log('='.repeat(60));
    console.log('📊 总结:');
    console.log(`   Properties: ${propertiesCount}`);
    console.log(`   Shutoffs: ${shutoffsCount}`);
    console.log(`   Utilities: ${utilitiesCount}`);
    console.log('='.repeat(60));
    
    if (propertiesCount === 0 && shutoffsCount === 0 && utilitiesCount === 0) {
      console.log('');
      console.log('⚠️ 数据库是空的！');
      console.log('可能的原因：');
      console.log('   1. 服务器没有运行');
      console.log('   2. 应用没有连接到服务器');
      console.log('   3. 数据只保存到了本地 AsyncStorage');
      console.log('');
      console.log('请检查：');
      console.log('   1. 服务器是否正在运行？(cd server && npm start)');
      console.log('   2. 应用控制台是否有 [Storage] ✅ Successfully saved to MongoDB 日志？');
      console.log('   3. 服务器终端是否有 [HTTP] POST 日志？');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.close();
  }
}

checkAllData();
