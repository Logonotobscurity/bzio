#!/usr/bin/env node

/**
 * Admin Dashboard Verification Script
 * 
 * Quickly verify that the admin dashboard is working correctly
 * Run with: node scripts/verify-admin.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:9003';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bzion.com';

console.log('🔍 BZION Admin Dashboard Verification');
console.log('=====================================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Admin Email: ${ADMIN_EMAIL}`);
console.log('');

async function checkEndpoint(path, expectedStatus = 200) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${path}`;
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      const status = res.statusCode;
      const success = status === expectedStatus;
      
      console.log(`${success ? '✅' : '❌'} ${path} - Status: ${status} (expected: ${expectedStatus})`);
      resolve({ path, status, success, expected: expectedStatus });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${path} - Error: ${error.message}`);
      resolve({ path, status: 0, success: false, error: error.message });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`⏰ ${path} - Timeout (5s)`);
      resolve({ path, status: 0, success: false, error: 'Timeout' });
    });
  });
}

async function runVerification() {
  console.log('🚀 Starting verification...\n');
  
  // First check database connection
  console.log('🔍 Database Connection Check:');
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('❌ DATABASE_URL not set in environment');
      console.log('   Add DATABASE_URL to your .env file');
    } else {
      console.log('✅ DATABASE_URL is configured');
    }
  } catch (error) {
    console.log('❌ Environment check failed:', error.message);
  }
  
  console.log('\n🌐 HTTP Endpoint Checks:');
  
  const checks = [
    // Public endpoints
    { path: '/', expected: 200, name: 'Homepage' },
    { path: '/admin/login', expected: 200, name: 'Admin Login Page' },
    
    // Admin endpoints (should redirect to login if not authenticated)
    { path: '/admin', expected: 302, name: 'Admin Dashboard (redirect expected)' },
    { path: '/admin/dashboard', expected: 302, name: 'Admin Dashboard Page (redirect expected)' },
    
    // API endpoints (should return 401/403 without auth)
    { path: '/api/admin/dashboard-data', expected: 403, name: 'Dashboard Data API (auth required)' },
    { path: '/api/admin/login', expected: 405, name: 'Admin Login API (method not allowed for GET)' },
  ];
  
  const results = [];
  
  for (const check of checks) {
    console.log(`Checking: ${check.name}`);
    const result = await checkEndpoint(check.path, check.expected);
    results.push({ ...result, name: check.name });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('=======================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All checks passed! Admin dashboard appears to be working correctly.');
    console.log('\n📝 Next steps:');
    console.log(`   1. Visit ${BASE_URL}/admin/login`);
    console.log(`   2. Login with admin credentials`);
    console.log(`   3. Verify dashboard loads with data`);
    console.log('\n🔧 If you see database errors in admin dashboard:');
    console.log('   Run: node scripts/db-diagnostic.js');
  } else {
    console.log('\n⚠️  Some checks failed. Please review the results above.');
    console.log('\n🔧 Common issues:');
    console.log('   - Server not running (npm run dev)');
    console.log('   - Database not connected (run: node scripts/db-diagnostic.js)');
    console.log('   - Environment variables missing');
    console.log('   - Admin user not seeded');
    console.log('\n🔍 Database Issues:');
    console.log('   If admin dashboard shows empty data or errors:');
    console.log('   1. Run: node scripts/db-diagnostic.js');
    console.log('   2. Check DATABASE_URL in .env');
    console.log('   3. Run: npx prisma migrate dev');
    console.log('   4. Run: npx prisma db seed (if available)');
  }
  
  console.log('\n🔗 Useful URLs:');
  console.log(`   Admin Login: ${BASE_URL}/admin/login`);
  console.log(`   Admin Dashboard: ${BASE_URL}/admin`);
  console.log(`   Products: ${BASE_URL}/admin/products`);
  console.log(`   Customers: ${BASE_URL}/admin/customers`);
}

// Run verification
runVerification().catch(console.error);