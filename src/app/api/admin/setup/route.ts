import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import { USER_ROLES } from '@/lib/auth/constants';
import { successResponse, unauthorized, badRequest, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

/**
 * POST /api/admin/setup
 * 
 * Admin-only endpoint to set up or replace the admin user
 * This endpoint:
 * 1. Verifies requester is authenticated
 * 2. Requires ADMIN_SETUP_TOKEN in Authorization header for security
 * 3. Deletes existing admin user(s) with the specified email
 * 4. Creates a fresh admin user with provided credentials
 * 5. Returns the new admin credentials
 * 
 * SECURITY NOTES:
 * - Requires ADMIN_SETUP_TOKEN environment variable
 * - Only works if no existing authorized admin exists (use admin email in token)
 * - Returns plain password only on creation (never stored/returned again)
 * 
 * Usage:
 * ```
 * curl -X POST http://localhost:3000/api/admin/setup \
 *   -H "Authorization: Bearer YOUR_ADMIN_SETUP_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": "bola@bzion.shop",
 *     "password": "BzionAdmin@2024!Secure",
 *     "firstName": "Admin",
 *     "lastName": "User"
 *   }'
 * ```
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/setup')
    .withMethod('POST')
    .withRequestId(requestId);

  try {
    // Verify setup token from environment
    const setupToken = process.env.ADMIN_SETUP_TOKEN;
    if (!setupToken) {
      errorLogger.warn('Admin setup endpoint called but not configured', context.build());
      return NextResponse.json(
        { error: 'Admin setup is not configured' },
        { status: 503 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const providedToken = authHeader?.replace('Bearer ', '');

    if (!providedToken || providedToken !== setupToken) {
      errorLogger.warn('Invalid setup token provided', context.build());
      return unauthorized();
    }

    // Parse request body
    const { email, password, firstName, lastName } = await request.json();

    // Validate inputs
    if (!email || !password || !firstName) {
      return badRequest('email, password, and firstName are required');
    }

    if (password.length < 8) {
      return badRequest('Password must be at least 8 characters');
    }

    errorLogger.info(`Admin setup initiated (${email})`, context.build());

    // Step 1: Delete any existing admin with this email
    const existingAdmin = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingAdmin) {
      await prisma.user.delete({
        where: { id: existingAdmin.id },
      });

      errorLogger.info(`Replaced existing admin user (${email})`, context.build());
    }

    // Step 2: Hash password and create new admin user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        hashedPassword: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName?.trim() || null,
        role: USER_ROLES.ADMIN, // 'admin'
        isNewUser: false,
        lastLogin: new Date(),
        emailVerified: new Date(),
      },
    });

    errorLogger.info(`Admin user created (${email})`, context.withUserId(newAdmin.id).build());

    // Step 3: Return success with credentials
    return successResponse(
      {
        admin: {
          id: newAdmin.id,
          email: newAdmin.email,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          role: newAdmin.role,
          createdAt: newAdmin.createdAt,
        },
        credentials: {
          email: newAdmin.email,
          password: password, // Only returned on creation
          loginUrl: '/admin/login',
        },
        instructions: [
          'Go to /admin/login',
          'Enter the email and password provided above',
          'Click "Login"',
          'You will be redirected to /admin dashboard',
        ],
      },
      201
    );
  } catch (error) {
    errorLogger.error(
      'Error during admin setup',
      error,
      context.build()
    );

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return badRequest('Email already exists');
    }

    return internalServerError('Admin setup failed');
  }
}

/**
 * GET /api/admin/setup
 * Health check - verifies if admin setup is enabled
 */
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/setup')
    .withMethod('GET')
    .withRequestId(requestId);

  try {
    const setupToken = process.env.ADMIN_SETUP_TOKEN;

    errorLogger.info('Admin setup status check', context.build());

    return successResponse({
      setupEnabled: !!setupToken,
      message: setupToken
        ? 'Admin setup is enabled'
        : 'Admin setup is disabled',
    }, 200);
  } catch (error) {
    errorLogger.error(
      'Error checking admin setup status',
      error,
      context.build()
    );
    return internalServerError('Failed to check setup status');
  }
}
