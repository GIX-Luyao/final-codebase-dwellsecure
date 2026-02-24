/**
 * Test Helpers for Emergency Mode MWS
 * 
 * These functions can be used to quickly set up test data
 * for demonstrating the Emergency Mode functionality.
 * 
 * Usage in console or React Native Debugger:
 * import { createTestShutoffs } from './src/utils/testHelpers';
 * await createTestShutoffs();
 */

import { saveShutoff } from '../services/storage';
import { setAppMode, NORMAL_MODE, EMERGENCY_MODE } from '../services/modeService';

/**
 * Create test shutoff records for demo purposes
 * Creates:
 * - 2 Gas shutoffs (1 verified, 1 unverified)
 * - 1 Water shutoff (verified)
 * - 1 Electric shutoff (unverified)
 */
export const createTestShutoffs = async () => {
  const now = new Date().toISOString();
  const testShutoffs = [
    {
      id: `test-gas-verified-${Date.now()}`,
      type: 'gas',
      location: 'Front exterior wall',
      description: 'Main gas shutoff valve - verified location',
      verification_status: 'verified',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `test-gas-unverified-${Date.now() + 1}`,
      type: 'gas',
      location: 'Backyard meter',
      description: 'Secondary gas shutoff - needs verification',
      verification_status: 'unverified',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `test-water-verified-${Date.now() + 2}`,
      type: 'water',
      location: 'Basement utility room',
      description: 'Main water valve - verified',
      verification_status: 'verified',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `test-electric-unverified-${Date.now() + 3}`,
      type: 'electric',
      location: 'Garage electrical panel',
      description: 'Main circuit breaker - needs verification',
      verification_status: 'unverified',
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const shutoff of testShutoffs) {
    await saveShutoff(shutoff);
  }

  console.log('✅ Created 4 test shutoff records:');
  console.log('  - Gas (verified)');
  console.log('  - Gas (unverified)');
  console.log('  - Water (verified)');
  console.log('  - Electric (unverified)');
  
  return testShutoffs;
};

/**
 * Set app to Normal Mode (for testing)
 */
export const setNormalMode = async () => {
  await setAppMode(NORMAL_MODE);
  console.log('✅ App set to Normal Mode');
};

/**
 * Set app to Emergency Mode (for testing)
 */
export const setEmergencyMode = async () => {
  await setAppMode(EMERGENCY_MODE);
  console.log('✅ App set to Emergency Mode');
};

/**
 * Reset all test data (use with caution)
 */
export const clearTestData = async () => {
  const { resetAllData } = require('../services/storage');
  await resetAllData();
  console.log('✅ All test data cleared');
};

/**
 * Complete test setup: Create data and set to Normal Mode
 */
export const setupTestEnvironment = async () => {
  await setNormalMode();
  await createTestShutoffs();
  console.log('✅ Test environment ready!');
};
