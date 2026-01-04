import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function checkUsers() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Check both admin users
    const users = await prisma.user.findMany({
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
        lastName: true,
        createdAt: true
      }
    });

    console.log('Users found:');
    console.log(JSON.stringify(users, null, 2));

    if (users.length === 0) {
      console.log('\nNo users found with those emails.');
      console.log('Checking all users in database...');
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true
        },
        take: 10
      });
      console.log('First 10 users:', JSON.stringify(allUsers, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
