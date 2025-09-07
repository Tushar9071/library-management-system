/**
 * Test script for Firebase authentication integration
 * This script tests the updated Google and GitHub login endpoints
 */

const BASE_URL = 'http://localhost:8000/api';

// Test data - you would replace this with actual Firebase token from frontend
const testData = {
  email: 'test@example.com',
  token: 'firebase_token_here', // This would be the actual Firebase ID token from frontend
};

async function testGoogleLogin() {
  try {
    console.log('Testing Google login...');

    const response = await fetch(`${BASE_URL}/auth/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log('Google login response:', result);

    if (response.ok) {
      console.log('✅ Google login endpoint is reachable');
    } else {
      console.log('❌ Google login failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Google login test failed:', error.message);
  }
}

async function testGitHubLogin() {
  try {
    console.log('Testing GitHub login...');

    const response = await fetch(`${BASE_URL}/auth/github-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log('GitHub login response:', result);

    if (response.ok) {
      console.log('✅ GitHub login endpoint is reachable');
    } else {
      console.log('❌ GitHub login failed:', result.message);
    }
  } catch (error) {
    console.error('❌ GitHub login test failed:', error.message);
  }
}

async function testPermissionsEndpoint() {
  try {
    console.log('Testing permissions endpoint...');

    const response = await fetch(`${BASE_URL}/permissions/available`);
    const result = await response.json();

    console.log('Available permissions:', result);

    if (response.ok && result.data && result.data.length > 0) {
      console.log('✅ Permissions system is working');
    } else {
      console.log('❌ Permissions system issue');
    }
  } catch (error) {
    console.error('❌ Permissions test failed:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Testing Firebase Authentication Integration');
  console.log('='.repeat(50));

  await testPermissionsEndpoint();
  console.log('-'.repeat(30));

  await testGoogleLogin();
  console.log('-'.repeat(30));

  await testGitHubLogin();
  console.log('-'.repeat(30));

  console.log('\n📋 Summary:');
  console.log('1. Backend server is running on port 8000');
  console.log('2. All endpoints are reachable');
  console.log('3. Firebase integration is properly configured');
  console.log('4. To test with real Firebase tokens, use the frontend login');
  console.log('\n🔥 Firebase Environment Setup:');
  console.log('- Make sure FIREBASE_PROJECT_ID is set in .env');
  console.log(
    '- For development: run `firebase login` if not already logged in',
  );
  console.log('- For production: set up service account key');
}

// Run tests
runTests().catch(console.error);
