/**
 * API Route: /api/auth/verify-admin
 * 
 * Verifies if a user has admin role
 * Used by admin login form to validate credentials
 */

import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { USER_ROLES } from '@/lib/auth-constants';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Query database to verify admin role
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', isAdmin: false },
        { status: 404 }
      );
    }

    const isAdmin = user.role === USER_ROLES.ADMIN;

    if (!isAdmin) {
      console.log(`[VERIFY_ADMIN] Non-admin user attempted admin login: ${email}`);
    } else {
      console.log(`[VERIFY_ADMIN] Admin verified: ${email}`);
    }

    return NextResponse.json({
      isAdmin,
      email: user.email,
      userId: user.id,
    });
  } catch (error) {
    console.error('[VERIFY_ADMIN] Error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
