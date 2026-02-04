/**
 * Error Logging Endpoint
 * Client-side and server-side error logging for debugging and monitoring
 * Collects error information with context for analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { errorLoggingService } from '@/services/error-logging.service';
import { getServerSession } from 'next-auth/next';
import { auth } from '~/auth';
import { successResponse, badRequest, unauthorized, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

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
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/errors')
    .withMethod('POST')
    .withRequestId(requestId);

  try {
    const body = (await request.json()) as ErrorLogPayload;

    // Validate required fields
    if (!body.message || !body.url || !body.severity) {
      return badRequest('message, url, and severity are required');
    }

    // Get session info if available
    const session = (await getServerSession(auth)) as AuthSession | null;

    // Create error log using centralized service
    const errorLog = await errorLoggingService.logError({
      message: body.message,
      stack: body.stack,
      severity: body.severity,
      route: body.url,
      userAgent: body.userAgent || request.headers.get('user-agent') || undefined,
      sessionId: body.sessionId || request.cookies.get('next-auth.session-token')?.value || undefined,
      userId: body.userId || session?.user?.id || undefined,
      breadcrumbs: body.breadcrumbs,
      sourceMap: body.sourceMap,
      environment: body.environment,
      version: body.version,
      metadata: body.context as Record<string, unknown>,
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      errorLogger.info(
        `Error logged (severity: ${body.severity})`,
        context.withUserId(session?.user?.id).build()
      );
    }

    // Alert if critical error
    if (body.severity === 'critical') {
      errorLogger.error(
        'CRITICAL ERROR LOGGED',
        new Error(body.message),
        context.withUserId(session?.user?.id).build()
      );
    }

    return successResponse({
      errorId: errorLog.id,
      message: 'Error logged successfully',
    }, 201);
  } catch (error) {
    errorLogger.error(
      'Error in error logging handler',
      error,
      context.build()
    );
    return internalServerError('Failed to log error');
  }
}

/**
 * GET /api/admin/errors?limit=50&severity=critical
 * Retrieve error logs (admin only)
 */
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/errors')
    .withMethod('GET')
    .withRequestId(requestId);

  try {
    // Check authentication
    const session = (await getServerSession(auth)) as AuthSession | null;

    if (!session?.user?.id) {
      errorLogger.warn('Unauthorized error logs access', context.build());
      return unauthorized();
    }

    // Get query parameters
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const skip = parseInt(request.nextUrl.searchParams.get('skip') || '0');
    const severity = request.nextUrl.searchParams.get('severity');
    const hoursSince = parseInt(request.nextUrl.searchParams.get('hoursSince') || '24');

    if (limit < 1 || limit > 500) {
      return badRequest('Limit must be between 1 and 500');
    }
    if (skip < 0) {
      return badRequest('Skip must be non-negative');
    }

    const criteria = {
      severity: severity || undefined,
      hoursSince,
    };

    const errorLogs = await errorLoggingService.findErrors({
      ...criteria,
      limit,
      skip,
    });

    const total = await errorLoggingService.getCount(criteria);

    // Group by severity for the current timeframe (optimized)
    const grouped = {
      critical: await errorLoggingService.getCount({ ...criteria, severity: 'critical' }),
      high: await errorLoggingService.getCount({ ...criteria, severity: 'high' }),
      medium: await errorLoggingService.getCount({ ...criteria, severity: 'medium' }),
      low: await errorLoggingService.getCount({ ...criteria, severity: 'low' }),
    };

    errorLogger.info(
      `Error logs retrieved (${errorLogs.length} items)`,
      context.withUserId(session.user.id).build()
    );

    return successResponse({
      errors: errorLogs,
      grouped,
      total,
      limit,
      hoursSince,
    }, 200);
  } catch (error) {
    errorLogger.error(
      'Error retrieving error logs',
      error,
      context.build()
    );
    return internalServerError('Failed to retrieve error logs');
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
  const requestId = crypto.randomUUID();
  const ctx = createContext()
    .withEndpoint('/api/admin/errors')
    .withMethod('DELETE')
    .withRequestId(requestId);

  try {
    // Check authentication
    const session = (await getServerSession(auth)) as AuthSession | null;

    if (!session?.user?.id) {
      errorLogger.warn('Unauthorized error log deletion', ctx.build());
      return unauthorized();
    }

    const params = await context.params;
    const errorId = params?.id;

    if (!errorId) {
      return badRequest('Error ID is required');
    }

    await errorLoggingService.deleteError(errorId);

    errorLogger.info(
      `Error log ${errorId} deleted`,
      ctx.withUserId(session.user.id).build()
    );

    return successResponse({
      message: 'Error log deleted',
    }, 200);
  } catch (error) {
    errorLogger.error(
      'Error deleting error log',
      error,
      ctx.build()
    );
    return internalServerError('Failed to delete error log');
  }
}
