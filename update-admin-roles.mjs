#!/usr/bin/env node

import dotenv from 'dotenv';

// Load environment variables from .env and .env.local
dotenv.config({ path: '.env.local' });
dotenv.config();

console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function updateAdminRoles() {
  try {
    console.log('Checking current users...');
    const usersToUpdate = await prisma.user.findMany({
      where: {
        email: {
          in: ['ade@bzion', 'bola@bzion.shop']
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    });

    console.log('\nUsers found before update:');
    console.log(JSON.stringify(usersToUpdate, null, 2));

    if (usersToUpdate.length === 0) {
      console.log('\n❌ No users found with emails: ade@bzion, bola@bzion.shop');
      console.log('\nShowing all users in database:');
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true
        },
        take: 20
      });
      console.log(JSON.stringify(allUsers, null, 2));
      return;
    }

    console.log('\n📝 Updating roles to ADMIN...');
    const updated = await prisma.user.updateMany({
      where: {
        email: {
          in: ['ade@bzion', 'bola@bzion.shop']
        }
      },
      data: {
        role: 'ADMIN'
      }
    });

    console.log(`\n✅ Updated ${updated.count} users to ADMIN role`);

    console.log('\nUsers after update:');
    const updatedUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['ade@bzion', 'bola@bzion.shop']
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    });
    console.log(JSON.stringify(updatedUsers, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminRoles();
