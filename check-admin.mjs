import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const admin = await prisma.user.findUnique({
  where: { email: 'admin@bzion.shop' },
  select: {
    id: true,
    email: true,
    role: true,
    hashedPassword: true,
    isActive: true,
    createdAt: true,
  }
});

console.log('Admin account:', JSON.stringify(admin, null, 2));
prisma.$disconnect();
