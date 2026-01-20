import { auth } from '@/lib/auth';
/**
 * Error Logging Endpoint
 * Client-side and server-side error logging for debugging and monitoring
 * Collects error information with context for analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';



interface ErrorLogPayload {
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  url: string;
  userAgent?: string;
  sessionId?: string;
  userId?: string;
  breadcrumbs?: unknown[];
  sourceMap?: Record<string, unknown>;
  environment?: string;
  version?: string;
}

interface AuthSession {
  user?: {
    id?: string;
  };
}

/**
 * POST /api/admin/errors
 * Log client-side errors or server errors
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ErrorLogPayload;

    // Validate required fields
    if (!body.message || !body.url || !body.severity) {
      return NextResponse.json(
        { error: 'Missing required fields: message, url, severity' },
        { status: 400 }
      );
    }

    // Get session info if available
    const session = (await getServerSession(auth)) as AuthSession | null;

    // Create error log in database
    const errorLog = await prisma.error_logs.create({
      data: {
        message: body.message,
        stack: body.stack || null,
        context: body.context ? JSON.stringify(body.context) : null,
        severity: body.severity,
        url: body.url,
        userAgent: body.userAgent || request.headers.get('user-agent') || 'unknown',
        sessionId: body.sessionId || request.cookies.get('next-auth.session-token')?.value || 'unknown',
        userId: body.userId || session?.user?.id || null,
        breadcrumbs: body.breadcrumbs ? JSON.stringify(body.breadcrumbs) : null,
        sourceMap: body.sourceMap ? JSON.stringify(body.sourceMap) : null,
        environment: body.environment || process.env.NODE_ENV || 'unknown',
        version: body.version || process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
        timestamp: new Date(),
      },
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Log]', {
        id: errorLog.id,
        severity: body.severity,
        message: body.message,
        url: body.url,
        timestamp: errorLog.timestamp,
      });
    }

    // Alert if critical error
    if (body.severity === 'critical') {
      console.error('🚨 CRITICAL ERROR LOGGED:', {
        id: errorLog.id,
        message: body.message,
        url: body.url,
        stack: body.stack?.slice(0, 500), // First 500 chars
      });
    }

    return NextResponse.json({
      success: true,
      errorId: errorLog.id,
      message: 'Error logged successfully',
    });
  } catch (error) {
    console.error('[Error Logging Handler Error]', error);
    return NextResponse.json(
      {
        error: 'Failed to log error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/errors?limit=50&severity=critical
 * Retrieve error logs (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = (await getServerSession(auth)) as AuthSession | null;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const severity = request.nextUrl.searchParams.get('severity');
    const hoursSince = parseInt(request.nextUrl.searchParams.get('hoursSince') || '24');

    const where = {
      timestamp: {
        gte: new Date(Date.now() - hoursSince * 60 * 60 * 1000),
      },
      ...(severity && { severity }),
    };

    const [errorLogs, total] = await Promise.all([
      prisma.error_logs.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: Math.min(limit, 500), // Cap at 500
      }),
      prisma.error_logs.count({ where }),
    ]);

    // Group by severity
    const grouped = {
      critical: errorLogs.filter(e => e.severity === 'critical').length,
      high: errorLogs.filter(e => e.severity === 'high').length,
      medium: errorLogs.filter(e => e.severity === 'medium').length,
      low: errorLogs.filter(e => e.severity === 'low').length,
    };

    return NextResponse.json({
      success: true,
      errors: errorLogs,
      grouped,
      total,
      limit,
      hoursSince,
    });
  } catch (error) {
    console.error('[Error Log Retrieval Error]', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve error logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/errors/:id
 * Delete a specific error log
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id?: string }> }
) {
  try {
    // Check authentication
    const session = (await getServerSession(auth)) as AuthSession | null;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const errorId = params?.id;

    if (!errorId) {
      return NextResponse.json(
        { error: 'Error ID is required' },
        { status: 400 }
      );
    }

    await prisma.error_logs.delete({
      where: { id: errorId },
    });

    return NextResponse.json({
      success: true,
      message: 'Error log deleted',
    });
  } catch (error) {
    console.error('[Error Log Delete Error]', error);
    return NextResponse.json(
      {
        error: 'Failed to delete error log',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
