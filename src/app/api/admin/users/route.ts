import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { successResponse, unauthorized, badRequest, forbidden, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/users')
    .withMethod('POST')
    .withRequestId(requestId);

  try {
    const session = await auth();

    if (!session?.user || session.user.email !== 'admin@bzion.shop') {
      errorLogger.warn('Unauthorized user creation attempt', context.withUserId(session?.user?.id).build());
      return forbidden('Only super admin can create users');
    }

    const body = await request.json();
    const { email, firstName, lastName, role, password } = body;

    if (!email || !password || !role) {
      return badRequest('email, password, and role are required');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, firstName, lastName, role, hashedPassword },
      select: { id: true, email: true, role: true }
    });

    errorLogger.info(
      `User created: ${email} (role: ${role})`,
      context.withUserId(session.user.id).build()
    );

    return successResponse(user, 201);
  } catch (error) {
    errorLogger.error(
      'Error creating user',
      error,
      context.build()
    );
    return internalServerError('Failed to create user');
  }
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/users')
    .withMethod('GET')
    .withRequestId(requestId);

  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      errorLogger.warn('Unauthorized users list access', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    errorLogger.info(
      `Fetched ${users.length} users`,
      context.withUserId(session.user.id).build()
    );

    return successResponse(users, 200);
  } catch (error) {
    errorLogger.error(
      'Error fetching users',
      error,
      context.build()
    );
    return internalServerError('Failed to fetch users');
  }
}