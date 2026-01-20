import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Admin credentials: admin@bzion.shop / BzionAdmin@2024!Secure
    const hashedPassword = await hash('BzionAdmin@2024!Secure', 12);
    
    // Use upsert to create or update the admin user
    const admin = await prisma.users.upsert({
      where: { email: 'admin@bzion.shop' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        emailVerified: new Date(),
      },
      create: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@bzion.shop',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        emailVerified: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('✅ Admin user created/updated:', admin.email);
    console.log('   Email: admin@bzion.shop');
    console.log('   Password: BzionAdmin@2024!Secure');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();