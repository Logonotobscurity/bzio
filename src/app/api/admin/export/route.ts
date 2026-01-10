/**
 * CSV Export Endpoint
 * Provides CSV exports for admin dashboard data
 * Protected by admin role check
 */

import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '~/auth';

interface AuthSession {
  user?: {
    id?: string;
    role?: string;
  };
}

/**
 * Helper function to convert data to CSV
 */
function convertToCSV<T extends Record<string, unknown>>(data: T[]): string {
  if (data.length === 0) {
    return '';
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV header row
  const csvHeaders = headers.map(h => `"${h}"`).join(',');

  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers
      .map(header => {
        const value = row[header];

        // Handle different value types
        if (value === null || value === undefined) {
          return '';
        }

        if (typeof value === 'string') {
          // Escape quotes in strings
          return `"${value.replace(/"/g, '""')}"`;
        }

        if (value instanceof Date) {
          return `"${value.toISOString()}"`;
        }

        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }

        return `"${value}"`;
      })
      .join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * GET /api/admin/export?type=users|quotes|products|login-attempts|email-logs
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = (await getServerSession(auth)) as AuthSession | null;

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get export type from query params
    const type = request.nextUrl.searchParams.get('type') || 'users';

    let data: unknown[] = [];
    let filename = '';

    switch (type) {
      case 'users':
        data = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            companyName: true,
            role: true,
            isActive: true,
            emailVerified: true,
            lastLogin: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        filename = `users-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'quotes':
        data = await prisma.quote.findMany({
          select: {
            id: true,
            userId: true,
            reference: true,
            total: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        filename = `quotes-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'products':
        data = await prisma.product.findMany({
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            isActive: true,
            brandId: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        filename = `products-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'login-attempts':
        data = await prisma.loginAttempt.findMany({
          select: {
            id: true,
            email: true,
            success: true,
            failureReason: true,
            ipAddress: true,
            userId: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1000, // Limit to last 1000 for performance
        });
        filename = `login-attempts-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'email-logs':
        data = await prisma.emailLog.findMany({
          select: {
            id: true,
            to: true,
            subject: true,
            status: true,
            emailType: true,
            recipientRole: true,
            sentAt: true,
            openedAt: true,
            clickedAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1000, // Limit to last 1000 for performance
        });
        filename = `email-logs-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid export type. Valid types: users, quotes, products, login-attempts, email-logs' },
          { status: 400 }
        );
    }

    // Generate CSV
    const csv = convertToCSV(data as Record<string, unknown>[]);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[CSV Export Error]', error);
    return NextResponse.json(
      {
        error: 'Failed to generate export',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/export (for batch exports)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = (await getServerSession(auth)) as AuthSession | null;

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json() as { types?: string[] };
    const types = body.types || ['users', 'quotes', 'products'];

    // Generate all requested exports
    const exports: Record<string, string> = {};

    for (const type of types) {
      const searchParams = new URLSearchParams({ type });
      const getRequest = new NextRequest(
        new URL(`http://localhost/api/admin/export?${searchParams}`),
        { method: 'GET' }
      );

      const response = await GET(getRequest);

      if (response.ok) {
        exports[type] = await response.text();
      }
    }

    return NextResponse.json({
      success: true,
      exports,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Batch Export Error]', error);
    return NextResponse.json(
      {
        error: 'Failed to generate batch export',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
