#!/usr/bin/env node

/**
 * Script to create the dedicated admin@bzion.shop account
 * This account is specifically for admin dashboard access only
 * 
 * Usage: node scripts/create-admin-account.mjs
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bzion.shop";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminPassword@123"; // Change this in production!
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || "Admin";
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || "Account";

async function createAdminAccount() {
  try {
    console.log("🔐 Creating dedicated admin account...\n");

    // Check if admin account already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log(`✅ Admin account already exists: ${ADMIN_EMAIL}`);
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Active: ${existingAdmin.isActive}`);
      return;
    }

    // Hash password
    console.log(`📝 Hashing password...`);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create admin account
    console.log(`\n🚀 Creating admin account: ${ADMIN_EMAIL}`);
    const adminUser = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        hashedPassword: hashedPassword,
        firstName: ADMIN_FIRST_NAME,
        lastName: ADMIN_LAST_NAME,
        role: "admin",
        isActive: true,
        emailVerified: new Date(), // Mark as verified since it's the admin account
      },
    });

    console.log(`\n✅ Admin account created successfully!\n`);
    console.log(`📊 Account Details:`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Active: ${adminUser.isActive}`);
    console.log(`   Created: ${adminUser.createdAt}`);
    console.log(`\n⚠️  IMPORTANT SECURITY NOTES:`);
    console.log(`   1. Default password: ${ADMIN_PASSWORD}`);
    console.log(`   2. Change password immediately after first login`);
    console.log(`   3. This account should ONLY be used for admin access`);
    console.log(`   4. Do NOT share this account with other users`);
    console.log(`\n🔗 Login at: http://localhost:3000/auth/admin/login`);
  } catch (error) {
    console.error("❌ Error creating admin account:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminAccount();
