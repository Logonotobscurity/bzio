#!/usr/bin/env node

/**
 * Admin Management Script
 * Remove unauthorized admin and set up proper admin role management
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const DB_URL = process.env.DATABASE_URL;

async function manageAdmins() {
  console.log('Admin Management Script');
  console.log('======================\n');

  const pool = new Pool({ connectionString: DB_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Check current admins
    console.log('1. Current admin users:');
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, email: true, role: true }
    });
    console.log(admins);

    // 2. Remove bola@bzion.shop admin role
    console.log('\n2. Removing admin role from bola@bzion.shop...');
    const removed = await prisma.user.updateMany({
      where: { email: 'bola@bzion.shop' },
      data: { role: 'customer' }
    });
    console.log(`Updated ${removed.count} user(s)`);

    // 3. Ensure admin@bzion.shop is admin
    console.log('\n3. Ensuring admin@bzion.shop has admin role...');
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@bzion.shop' },
      update: { role: 'admin' },
      create: {
        email: 'admin@bzion.shop',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        hashedPassword: '$2b$10$placeholder', // Change password via reset
      }
    });
    console.log('Admin user:', adminUser.email);

    // 4. Final check
    console.log('\n4. Final admin list:');
    const finalAdmins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, email: true, role: true }
    });
    console.log(finalAdmins);

    console.log('\n✅ Admin management complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

manageAdmins();