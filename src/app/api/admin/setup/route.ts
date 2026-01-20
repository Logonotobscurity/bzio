import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import { USER_ROLES } from '@/lib/auth-constants';

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
  try {
    // Verify setup token from environment
    const setupToken = process.env.ADMIN_SETUP_TOKEN;
    if (!setupToken) {
      return NextResponse.json(
        {
          error: 'Admin setup is not configured',
          message: 'ADMIN_SETUP_TOKEN environment variable is not set',
        },
        { status: 503 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const providedToken = authHeader?.replace('Bearer ', '');

    if (!providedToken || providedToken !== setupToken) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or missing ADMIN_SETUP_TOKEN',
        },
        { status: 401 }
      );
    }

    // Parse request body
    const { email, password, firstName, lastName } = await request.json();

    // Validate inputs
    if (!email || !password || !firstName) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          message: 'email, password, and firstName are required',
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error: 'Invalid password',
          message: 'Password must be at least 8 characters',
        },
        { status: 400 }
      );
    }

    console.log('[ADMIN_SETUP] Starting admin user setup', {
      email,
      firstName,
      lastName,
      timestamp: new Date().toISOString(),
    });

    // Step 1: Delete any existing admin with this email
    const existingAdmin = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingAdmin) {
      console.log('[ADMIN_SETUP] Deleting existing admin user', {
        email,
        userId: existingAdmin.id,
      });

      await prisma.user.delete({
        where: { id: existingAdmin.id },
      });
    }

    // Step 2: Hash password and create new admin user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName?.trim() || null,
        role: USER_ROLES.ADMIN, // 'admin'
        isNewUser: false,
        lastLogin: new Date(),
        emailVerified: new Date(),
      },
    });

    console.log('[ADMIN_SETUP] Admin user created successfully', {
      userId: newAdmin.id,
      email: newAdmin.email,
      timestamp: new Date().toISOString(),
    });

    // Step 3: Return success with credentials
    return NextResponse.json(
      {
        success: true,
        message: 'Admin user created successfully',
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
          password: hashedPassword, // Only returned on creation
          loginUrl: '/admin/login',
        },
        instructions: [
          'Go to /admin/login',
          'Enter the email and password provided above',
          'Click "Login"',
          'You will be redirected to /admin dashboard',
        ],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[ADMIN_SETUP] Error:', error);

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        {
          error: 'Email already exists',
          message: 'Another user already has this email address',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Setup failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/setup
 * Health check - verifies if admin setup is enabled
 */
export async function GET() {
  const setupToken = process.env.ADMIN_SETUP_TOKEN;

  return NextResponse.json({
    setupEnabled: !!setupToken,
    message: setupToken
      ? 'Admin setup is enabled. Send POST request with token.'
      : 'Admin setup is disabled. Set ADMIN_SETUP_TOKEN environment variable.',
  });
}
