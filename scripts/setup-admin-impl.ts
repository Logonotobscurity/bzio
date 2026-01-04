/**
 * Admin Setup Implementation
 * This file is called by setup-admin.mjs with proper environment setup
 * It uses the same database configuration as the application
 */

import { existsSync, readFileSync } from 'fs';
import path from 'path';

// Load environment variables manually BEFORE importing prisma
const envPath = path.resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex > -1) {
        const key = trimmed.substring(0, equalsIndex).trim();
        let value = trimmed.substring(equalsIndex + 1).trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    const adminEmail = 'bola@bzion.shop';
    const adminPassword = 'BzionAdmin@2024!Secure';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    console.log('🔄 Setting up admin user...\n');

    // Step 1: Test database connection
    console.log('Step 1: Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('   ✅ Database connected\n');

    // Step 2: Delete existing admin user if exists
    console.log('Step 2: Checking for existing admin users...');
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`   ❌ Found existing admin: ${existingAdmin.email}`);
      console.log(`   🗑️  Deleting existing admin user...`);
      
      await prisma.user.delete({
        where: { email: adminEmail },
      });
      
      console.log(`   ✅ Deleted admin user (${adminEmail})\n`);
    } else {
      console.log(`   ℹ️  No existing admin found\n`);
    }

    // Step 3: Create new admin user
    console.log('Step 3: Creating new admin user...');
    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        hashedPassword: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isNewUser: false,
        lastLogin: new Date(),
        emailVerified: new Date(),
      },
    });

    console.log(`   ✅ Created new admin user\n`);

    // Step 4: Display credentials
    console.log('━'.repeat(60));
    console.log('✅ ADMIN SETUP COMPLETE\n');
    console.log('📧 Admin Email:    bola@bzion.shop');
    console.log(`🔐 Admin Password: ${adminPassword}\n`);
    console.log('⚠️  LOGIN INSTRUCTIONS:');
    console.log('   1. Go to http://localhost:3000/admin/login');
    console.log('   2. Enter email: bola@bzion.shop');
    console.log(`   3. Enter password: ${adminPassword}`);
    console.log('   4. Click "Login"');
    console.log('   5. You will be redirected to /admin dashboard\n');
    console.log('━'.repeat(60));
    console.log('');
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
