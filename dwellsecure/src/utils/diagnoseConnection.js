/**
 * Diagnostic tool to check API connection
 * Call this from your app console or add a button to test
 */

import { checkApiHealth, getApiAvailability } from '../services/apiClient';
import { apiGet, apiPost } from '../services/apiClient';
import { API_BASE_URL } from '../services/apiClient';

export const diagnoseConnection = async () => {
  console.log('🔍 Starting connection diagnosis...');
  console.log('---');
  
  // 1. Check API URL
  console.log('1. API URL:', API_BASE_URL);
  
  // 2. Check API availability flag
  console.log('2. API Available Flag:', getApiAvailability());
  
  // 3. Test health endpoint
  console.log('3. Testing health endpoint...');
  try {
    const healthResult = await checkApiHealth();
    console.log('   Health check result:', healthResult);
  } catch (error) {
    console.error('   Health check failed:', error.message);
  }
  
  // 4. Test GET request
  console.log('4. Testing GET /api/shutoffs...');
  try {
    const shutoffs = await apiGet('/api/shutoffs');
    console.log(`   ✅ Success! Found ${shutoffs.length} shutoffs`);
  } catch (error) {
    console.error('   ❌ Failed:', error.message);
  }
  
  // 5. Test POST request
  console.log('5. Testing POST /api/shutoffs...');
  try {
    const testShutoff = {
      id: `diagnostic-test-${Date.now()}`,
      type: 'gas',
      description: 'Diagnostic test',
      verification_status: 'unverified',
    };
    
    const result = await apiPost('/api/shutoffs', testShutoff);
    console.log('   ✅ Success! Created test shutoff:', result.id);
    
    // Clean up
    console.log('   🧹 Cleaning up test document...');
    // Note: You'd need to implement delete or just leave it for verification
  } catch (error) {
    console.error('   ❌ Failed:', error.message);
  }
  
  console.log('---');
  console.log('✅ Diagnosis complete!');
};

// Make it available globally for easy testing
if (typeof global !== 'undefined') {
  global.diagnoseConnection = diagnoseConnection;
}
