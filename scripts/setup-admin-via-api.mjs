#!/usr/bin/env node

/**
 * Admin Setup via API
 * 
 * This script sets up an admin user by calling the /api/admin/setup endpoint.
 * The development server must be running at http://localhost:3000
 * 
 * Usage: node scripts/setup-admin-via-api.mjs
 */

const adminEmail = 'bola@bzion.shop';
const adminPassword = 'BzionAdmin@2024!Secure';
const setupToken = 'bzion-admin-setup-key-2024-secure'; // Must match ADMIN_SETUP_TOKEN in .env
const apiUrl = 'http://localhost:3000/api/admin/setup';

async function setupAdmin() {
  try {
    console.log('🔄 Setting up admin user via API...\n');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔐 Password: ${adminPassword}`);
    console.log(`📡 Endpoint: ${apiUrl}\n`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${setupToken}`,
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Setup failed:', data.error || data.message);
      process.exit(1);
    }

    console.log('✅ ADMIN SETUP COMPLETE\n');
    console.log('━'.repeat(50));
    console.log('📋 Admin Credentials:');
    console.log('━'.repeat(50));
    console.log(`📧 Email:    ${data.data.email}`);
    console.log(`🔐 Password: ${data.data.password}`);
    console.log(`👤 Name:     ${data.data.firstName} ${data.data.lastName}`);
    console.log(`🎭 Role:     ${data.data.role}`);
    console.log('━'.repeat(50));
    console.log('\n📌 Login Instructions:');
    console.log('1. Go to http://localhost:3000/admin/login');
    console.log(`2. Enter email: ${adminEmail}`);
    console.log(`3. Enter password: ${adminPassword}`);
    console.log('4. Click "Sign In"');
    console.log('5. You will be redirected to /admin dashboard\n');
    console.log('⚠️  Note: Save these credentials in a secure location!');
    console.log('🔒 Recommendation: Change password after first login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('fetch')) {
      console.error('\n💡 Hint: Make sure the development server is running:');
      console.error('   npm run dev');
    }
    process.exit(1);
  }
}

setupAdmin();
