import { prisma } from './src/lib/db/index.js';

async function checkUsers() {
  try {
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
        lastName: true
      }
    });

    console.log('Users found:');
    console.log(JSON.stringify(users, null, 2));

    if (users.length === 0) {
      console.log('\nNo users found with those emails.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
