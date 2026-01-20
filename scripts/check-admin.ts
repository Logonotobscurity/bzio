import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAndFixAdmin() {
  try {
    console.log('🔍 Checking for admin user...\n');
    
    // Find admin user
    const admin = await prisma.users.findUnique({
      where: { email: 'admin@bzion.shop' },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        firstName: true,
        lastName: true,
      }
    });

    if (!admin) {
      console.log('❌ Admin user NOT found. Creating...\n');
      const hashedPassword = await hash('BzionAdmin@2024!Secure', 12);
      
      const newAdmin = await prisma.users.create({
        data: {
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
      
      console.log('✅ Admin user created:', newAdmin.email);
      return;
    }

    console.log('✅ Admin user found:');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   isActive:', admin.isActive);
    console.log('   Name:', `${admin.firstName} ${admin.lastName}`);
    
    // Test password
    const testPassword = 'BzionAdmin@2024!Secure';
    const passwordValid = await compare(testPassword, admin.password);
    console.log('   Password valid:', passwordValid);

    if (!passwordValid) {
      console.log('\n⚠️ Password mismatch! Resetting password...');
      const hashedPassword = await hash(testPassword, 12);
      await prisma.users.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Password reset successfully');
    }

    if (admin.role !== 'ADMIN') {
      console.log('\n⚠️ Role is not ADMIN! Fixing...');
      await prisma.users.update({
        where: { id: admin.id },
        data: { role: 'ADMIN' }
      });
      console.log('✅ Role updated to ADMIN');
    }

    if (!admin.isActive) {
      console.log('\n⚠️ User is not active! Activating...');
      await prisma.users.update({
        where: { id: admin.id },
        data: { isActive: true }
      });
      console.log('✅ User activated');
    }

    console.log('\n✅ Admin user is ready to use');
    console.log('   Email: admin@bzion.shop');
    console.log('   Password: BzionAdmin@2024!Secure');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixAdmin();
