#!/usr/bin/env node
/**
 * Admin Authentication Verification Script
 * 
 * This script:
 * 1. Verifies ADMIN_SETUP_TOKEN is configured
 * 2. Tests admin account creation via /api/admin/setup
 * 3. Tests admin login via /api/admin/login
 * 4. Validates password strength
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@bzion.shop';
const ADMIN_PASSWORD = 'BzionAdmin@2024!Secure';
const ADMIN_SETUP_TOKEN = 'bzion-admin-setup-key-2024-secure';

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body ? JSON.parse(body) : null,
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Verify password strength
 */
function verifyPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  return { checks, passed, total };
}

/**
 * Main test flow
 */
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║           Admin Authentication Verification Script                 ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  // Test 1: Password Strength
  console.log('📋 TEST 1: Password Strength Verification');
  console.log('─'.repeat(70));
  const pwdStrength = verifyPasswordStrength(ADMIN_PASSWORD);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log(`Length: ${ADMIN_PASSWORD.length} chars (✓ ${pwdStrength.checks.length ? '✅' : '❌'})`);
  console.log(`Uppercase: ${pwdStrength.checks.uppercase ? '✅' : '❌'}`);
  console.log(`Lowercase: ${pwdStrength.checks.lowercase ? '✅' : '❌'}`);
  console.log(`Numbers: ${pwdStrength.checks.numbers ? '✅' : '❌'}`);
  console.log(`Special Chars: ${pwdStrength.checks.special ? '✅' : '❌'}`);
  console.log(`Overall: ${pwdStrength.passed}/${pwdStrength.total} requirements met`);
  
  if (pwdStrength.passed === pwdStrength.total) {
    console.log('✅ Password strength: VALID\n');
  } else {
    console.log('❌ Password strength: INVALID\n');
    return;
  }

  // Test 2: Setup Endpoint
  console.log('📋 TEST 2: Admin Account Creation (/api/admin/setup)');
  console.log('─'.repeat(70));
  try {
    const setupResponse = await makeRequest(
      'POST',
      '/api/admin/setup',
      {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        firstName: 'Bzionu',
        lastName: 'Admin',
      },
      {
        'Authorization': `Bearer ${ADMIN_SETUP_TOKEN}`,
      }
    );

    console.log(`Status: ${setupResponse.status}`);
    
    if (setupResponse.status === 201) {
      console.log('✅ Admin account creation: SUCCESS');
      console.log(`   - Admin ID: ${setupResponse.body.admin?.id}`);
      console.log(`   - Email: ${setupResponse.body.admin?.email}`);
      console.log(`   - Role: ${setupResponse.body.admin?.role}`);
      console.log(`   - Password Strength: ${setupResponse.body.passwordStrength?.strength} (${setupResponse.body.passwordStrength?.score}/100)\n`);
    } else if (setupResponse.status === 400) {
      console.log('❌ Admin account creation: INVALID INPUT');
      console.log(`   Error: ${setupResponse.body.error}`);
      console.log(`   Message: ${setupResponse.body.message}`);
      if (setupResponse.body.passwordErrors) {
        console.log(`   Password Errors:`, setupResponse.body.passwordErrors);
      }
      console.log();
      return;
    } else if (setupResponse.status === 401) {
      console.log('❌ Admin account creation: UNAUTHORIZED');
      console.log(`   Message: ${setupResponse.body.message}`);
      console.log(`   Verify ADMIN_SETUP_TOKEN is correct: ${ADMIN_SETUP_TOKEN}\n`);
      return;
    } else if (setupResponse.status === 503) {
      console.log('❌ Admin account creation: SERVICE UNAVAILABLE');
      console.log(`   Message: ${setupResponse.body.message}`);
      console.log(`   Verify ADMIN_SETUP_TOKEN is set in .env file\n`);
      return;
    } else {
      console.log(`❌ Unexpected status: ${setupResponse.status}`);
      console.log(JSON.stringify(setupResponse.body, null, 2));
      console.log();
    }
  } catch (error) {
    console.log(`❌ Connection Error: ${error.message}`);
    console.log(`   Is dev server running on ${BASE_URL}?`);
    console.log(`   Try: npm run dev\n`);
    return;
  }

  // Test 3: Login Endpoint
  console.log('📋 TEST 3: Admin Login (/api/admin/login)');
  console.log('─'.repeat(70));
  try {
    const loginResponse = await makeRequest(
      'POST',
      '/api/admin/login',
      {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }
    );

    console.log(`Status: ${loginResponse.status}`);

    if (loginResponse.status === 200) {
      console.log('✅ Admin login: SUCCESS');
      console.log(`   - Admin ID: ${loginResponse.body.admin?.id}`);
      console.log(`   - Email: ${loginResponse.body.admin?.email}`);
      console.log(`   - Role: ${loginResponse.body.admin?.role}`);
      console.log(`   - Login Time: ${loginResponse.body.sessionData?.loginTime}\n`);
    } else if (loginResponse.status === 400) {
      console.log('❌ Admin login: INVALID INPUT');
      console.log(`   Message: ${loginResponse.body.message}\n`);
    } else if (loginResponse.status === 401) {
      console.log('❌ Admin login: AUTHENTICATION FAILED');
      console.log(`   Message: ${loginResponse.body.message}`);
      console.log(`   Check email and password are correct\n`);
    } else if (loginResponse.status === 403) {
      console.log('❌ Admin login: FORBIDDEN');
      console.log(`   Message: ${loginResponse.body.message}`);
      console.log(`   Verify account has admin role\n`);
    } else {
      console.log(`❌ Unexpected status: ${loginResponse.status}`);
      console.log(JSON.stringify(loginResponse.body, null, 2));
      console.log();
    }
  } catch (error) {
    console.log(`❌ Connection Error: ${error.message}\n`);
  }

  // Summary
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                         Test Complete                               ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
