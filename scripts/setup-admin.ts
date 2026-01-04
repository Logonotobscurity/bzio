import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables manually from .env file
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    }
  });
  console.log('✅ Environment variables loaded from .env');
} else {
  console.warn('⚠️  .env file not found, using existing environment variables');
}

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('   Please ensure .env file exists and contains DATABASE_URL');
  process.exit(1);
}

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Setup Admin User - Delete existing admin and create fresh one
 * This script ensures only one admin exists with a known password
 * 
 * Usage: npx tsx scripts/setup-admin.ts
 */
async function main() {
  try {
    const adminEmail = 'bola@bzion.shop';
    const adminPassword = 'BzionAdmin@2024!Secure';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    console.log('🔄 Setting up admin user...\n');

    // Step 1: Delete existing admin user if exists
    console.log('Step 1: Checking for existing admin users...');
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

    // Step 2: Create new admin user
    console.log('Step 2: Creating new admin user...');
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

    // Step 3: Display credentials
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
