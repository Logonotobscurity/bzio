import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

async function testAdminAuth() {
  try {
    console.log('🔍 Testing Admin Authentication...\n');

    // Step 1: Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@bzion.shop' },
    });

    console.log('1️⃣  Checking for existing admin account:');
    if (existingAdmin) {
      console.log('   ✅ Admin account found:');
      console.log(`   - ID: ${existingAdmin.id}`);
      console.log(`   - Email: ${existingAdmin.email}`);
      console.log(`   - Role: ${existingAdmin.role}`);
      console.log(`   - isActive: ${existingAdmin.isActive}`);
      console.log(`   - hashedPassword exists: ${!!existingAdmin.hashedPassword}\n`);

      // Test password verification
      console.log('2️⃣  Testing password verification:');
      const testPassword = 'BzionAdmin@2024!Secure';
      const passwordMatch = await bcrypt.compare(testPassword, existingAdmin.hashedPassword!);
      console.log(`   - Test Password: ${testPassword}`);
      console.log(`   - Password Match: ${passwordMatch ? '✅ YES' : '❌ NO'}\n`);

      if (!passwordMatch) {
        console.log('3️⃣  Debugging password mismatch:');
        console.log(`   - Stored hash length: ${existingAdmin.hashedPassword?.length}`);
        console.log(`   - Test password length: ${testPassword.length}`);
        
        // Try to identify password strength issues
        const hasUppercase = /[A-Z]/.test(testPassword);
        const hasLowercase = /[a-z]/.test(testPassword);
        const hasNumbers = /[0-9]/.test(testPassword);
        const hasSpecial = /[!@#$%^&*]/.test(testPassword);
        
        console.log(`   - Uppercase letters: ${hasUppercase ? '✅' : '❌'}`);
        console.log(`   - Lowercase letters: ${hasLowercase ? '✅' : '❌'}`);
        console.log(`   - Numbers: ${hasNumbers ? '✅' : '❌'}`);
        console.log(`   - Special characters: ${hasSpecial ? '✅' : '❌'}\n`);
      }
    } else {
      console.log('   ❌ No admin account found at admin@bzion.shop\n');
      console.log('   To create admin account, run:');
      console.log('   curl -X POST http://localhost:3000/api/admin/setup \\');
      console.log('     -H "Authorization: Bearer YOUR_ADMIN_SETUP_TOKEN" \\');
      console.log('     -H "Content-Type: application/json" \\');
      console.log('     -d \'{\n' +
        '       "email": "admin@bzion.shop",\n' +
        '       "password": "BzionAdmin@2024!Secure",\n' +
        '       "firstName": "Bzionu",\n' +
        '       "lastName": "Admin"\n' +
        '     }\'\n');
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAuth();
