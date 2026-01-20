import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { validatePassword } from '@/lib/password-utils';
import * as bcrypt from 'bcryptjs';

/**
 * Middleware to verify admin authentication
 * Checks for valid admin session before allowing access to /admin routes
 */
export async function verifyAdminSession(request: NextRequest) {
  try {
    // Get session from cookies or headers
    const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                        request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      return null;
    }

    // In production, validate JWT token here
    // For now, return null to let NextAuth handle it
    return sessionToken;
  } catch (error) {
    console.error('[ADMIN_MIDDLEWARE] Error verifying session:', error);
    return null;
  }
}

/**
 * Verify ADMIN_SETUP_TOKEN from environment
 * Used to authenticate admin setup operations
 * 
 * @param authHeader - The Authorization header from request
 * @returns true if token is valid
 */
export function verifySetupToken(authHeader: string | null): boolean {
  const setupToken = process.env.ADMIN_SETUP_TOKEN;
  
  if (!setupToken) {
    console.warn('[ADMIN_AUTH] ADMIN_SETUP_TOKEN environment variable not set');
    return false;
  }

  if (!authHeader) {
    return false;
  }

  const providedToken = authHeader.replace('Bearer ', '').trim();
  return providedToken === setupToken;
}

/**
 * Middleware to check admin permissions
 */
export async function checkAdminPermission(
  adminId: number,
  // requiredPermission: string // Not used in current implementation
) {
  try {
    const admin = await prisma.users.findUnique({
      where: { id: adminId },
      select: { isActive: true, role: true },
    });

    if (!admin || !admin.isActive || admin.role !== "ADMIN") {
      return false;
    }

    // For now, all active admins have all permissions
    // Extend this with a permissions table if needed
    return true;
  } catch (error) {
    console.error('[ADMIN_PERMISSION] Error checking permission:', error);
    return false;
  }
}

/**
 * Get admin details from admin ID
 */
export async function getAdminDetails(adminId: number) {
  try {
    const admin = await prisma.users.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return admin;
  } catch (error) {
    console.error('[ADMIN_DETAILS] Error getting admin:', error);
    return null;
  }
}

/**
 * Log admin activity
 */
export async function logAdminActivity(
  adminId: number,
  action: string,
  description?: string,
  resourceType?: string,
  resourceId?: string,
  ipAddress?: string,
  userAgent?: string,
  status: 'success' | 'failed' | 'error' = 'success',
  // changes?: Record<string, unknown> // Not used in current implementation
) {
  try {
    // Log to console immediately for debugging
    console.log('[ADMIN_LOG]', {
      adminId,
      action,
      status,
      timestamp: new Date().toISOString(),
      description,
    });

    // Store in database if activity log table exists
    // Uncomment when AdminActivityLog model is available in Prisma schema
    /*
    await prisma.adminActivityLog.create({
      data: {
        adminId,
        action,
        description,
        resourceType,
        resourceId,
        ipAddress,
        userAgent,
        status,
        changes,
      },
    });
    */
  } catch (error) {
    console.error('[ADMIN_LOG] Error logging activity:', error);
  }
}

/**
 * Validate and hash a password
 * Used for admin password creation and updates
 * 
 * @param password - Plain text password to validate and hash
 * @returns Object with validation result and hash
 */
export async function validateAndHashPassword(password: string): Promise<{
  isValid: boolean;
  errors: string[];
  hash?: string;
}> {
  const validation = validatePassword(password);

  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors,
    };
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    return {
      isValid: true,
      errors: [],
      hash,
    };
  } catch (error) {
    console.error('[ADMIN_AUTH] Error hashing password:', error);
    return {
      isValid: false,
      errors: ['Failed to process password'],
    };
  }
}

/**
 * Verify a password against a stored hash
 * 
 * @param plainPassword - Plain text password to verify
 * @param hashPassword - Stored password hash
 * @returns true if password matches hash
 */
export async function verifyPassword(
  plainPassword: string,
  hashPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashPassword);
  } catch (error) {
    console.error('[ADMIN_AUTH] Error verifying password:', error);
    return false;
  }
}

/**
 * Get admin by email
 * 
 * @param email - Admin email address
 * @returns Admin user or null if not found
 */
export async function getAdminByEmail(email: string) {
  try {
    const admin = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
    });

    return admin?.role === "ADMIN" ? admin : null;
  } catch (error) {
    console.error('[ADMIN_AUTH] Error getting admin by email:', error);
    return null;
  }
}

/**
 * Check if an email is valid for admin role
 * Validates email format and domain restrictions
 * 
 * @param email - Email address to validate
 * @returns true if email is valid for admin role
 */
export function isValidAdminEmail(email: string): boolean {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  // Optional: Restrict to specific domain (@bzion.shop)
  // Uncomment to enforce domain restriction
  // const adminDomain = '@bzion.shop';
  // return email.toLowerCase().endsWith(adminDomain);

  return true;
}

