#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@bzion.shop";
const TEST_PASSWORD = "BzionAdmin@2024!Secure";

async function verifyAdmin() {
  try {
    console.log(`🔍 Checking admin account: ${ADMIN_EMAIL}\n`);

    const user = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (!user) {
      console.log("❌ Admin account NOT found in database");
      console.log("\n💡 Run this to create it:");
      console.log("   node scripts/create-admin-account.mjs");
      return;
    }

    console.log("✅ Admin account found:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Has Password: ${!!user.hashedPassword}`);
    console.log(`   Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);

    if (user.hashedPassword) {
      console.log(`\n🔐 Testing password: "${TEST_PASSWORD}"`);
      const isValid = await bcrypt.compare(TEST_PASSWORD, user.hashedPassword);
      
      if (isValid) {
        console.log("✅ Password is CORRECT");
      } else {
        console.log("❌ Password is INCORRECT");
        console.log("\n💡 To reset password, run:");
        console.log("   ADMIN_PASSWORD='BzionAdmin@2024!Secure' node scripts/create-admin-account.mjs");
      }
    } else {
      console.log("\n❌ No password set for this account");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdmin();
