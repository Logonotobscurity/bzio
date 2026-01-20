import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = '7d';

export interface AuthUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  companyId?: number;
}

export interface JWTPayload extends AuthUser {
  iat: number;
  exp: number;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extract token from request headers or cookies
 */
export function extractToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const tokenCookie = request.cookies.get('auth-token');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}

/**
 * Get current user from request
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  const token = extractToken(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Verify user still exists and is active
  const user = await prisma.users.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      companyId: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
    role: user.role,
    companyId: user.companyId || undefined,
  };
}

/**
 * Require authentication middleware
 */
export async function requireAuth(request: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  const user = await getCurrentUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return { user };
}

/**
 * Require admin role middleware
 */
export async function requireAdmin(request: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (authResult.user.role !== UserRole.ADMIN) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  return authResult;
}

/**
 * Create auth response with token
 */
export function createAuthResponse(user: AuthUser, message: string = 'Success') {
  const token = generateToken(user);
  
  const response = NextResponse.json({
    message,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
    },
    token,
  });

  // Set httpOnly cookie for browser clients
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return response;
}

/**
 * Clear auth cookies
 */
export function clearAuthResponse(message: string = 'Logged out successfully') {
  const response = NextResponse.json({ message });
  
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}

/**
 * Generate email verification token
 */
export function generateVerificationToken(): string {
  return jwt.sign(
    { type: 'email_verification'},
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Generate password reset token
 */
export function generatePasswordResetToken(userId: number): string {
  return jwt.sign(
    { type: 'password_reset', userId},
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Verify password reset token
 */
export function verifyPasswordResetToken(token: string): { userId: number } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.type !== 'password_reset') return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}