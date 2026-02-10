/**
 * 通过 API 添加测试数据（如果服务器正在运行）
 * 这个方法不需要直接连接 MongoDB，而是通过 HTTP API
 */

const http = require('http');

// const API_BASE_URL = 'http://10.19.166.199:3000';
const API_BASE_URL = 'http://localhost:3000';
// const API_BASE_URL = 'http://172.20.10.3:3000';

// Test Case 1: Water Shutoff
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

// Test Case 2: Gas Shutoff
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

// Test Case 3: Incomplete Shutoff
const incompleteShutoff = {
  id: 'test-incomplete-shutoff-003',
  type: 'electric',
  verification_status: 'unverified',
  notes: 'Test Case 3: Missing data in database - Expected: app shows fallback message',
  createdAt: new Date('2024-03-01T12:00:00').toISOString(),
  updatedAt: new Date('2024-03-01T12:00:00').toISOString(),
};

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: responseData });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function addTestDataViaAPI() {
  console.log('='.repeat(60));
  console.log('🧪 通过 API 添加集成测试数据');
  console.log('='.repeat(60));
  console.log('');
  console.log('⚠️  注意：服务器必须正在运行！');
  console.log('   运行: cd server && npm start');
  console.log('');

  try {
    // Test Case 1
    console.log('📝 Test Case 1: 添加 Water Shutoff...');
    await makeRequest('/api/shutoffs', waterShutoff);
    console.log(`   ✅ Water shutoff added: ${waterShutoff.id}`);
    console.log(`   📅 Created: ${waterShutoff.createdAt}\n`);

    // Test Case 2
    console.log('📝 Test Case 2: 添加 Gas Shutoff...');
    await makeRequest('/api/shutoffs', gasShutoff);
    console.log(`   ✅ Gas shutoff added: ${gasShutoff.id}`);
    console.log(`   📅 Created: ${gasShutoff.createdAt}\n`);

    // Test Case 3
    console.log('📝 Test Case 3: 添加不完整 Shutoff...');
    await makeRequest('/api/shutoffs', incompleteShutoff);
    console.log(`   ✅ Incomplete shutoff added: ${incompleteShutoff.id}`);
    console.log(`   ⚠️  This record has missing fields for fallback testing`);
    console.log(`   📅 Created: ${incompleteShutoff.createdAt}\n`);

    console.log('='.repeat(60));
    console.log('✅ 所有测试数据添加完成！');
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
    console.error('Error:', error.message);
    console.error('');
    console.error('💡 可能的原因：');
    console.error('   1. 服务器没有运行');
    console.error('   2. 服务器无法访问 (http://localhost:3000)');
    console.error('');
    console.error('💡 解决步骤：');
    console.error('   1. 确保服务器正在运行: cd server && npm start');
    console.error('   2. 测试 API: 浏览器打开 http://localhost:3000/health');
    console.error('   3. 如果服务器运行正常，重新运行此脚本');
    console.error('='.repeat(60));
    process.exit(1);
  }
}

addTestDataViaAPI();
