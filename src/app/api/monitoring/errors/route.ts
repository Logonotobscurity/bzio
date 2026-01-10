import { NextRequest, NextResponse } from 'next/server';
import { errorLoggingService } from '@/services/error-logging.service';
import { ErrorLogReport } from '@/lib/schema';

/**
 * POST /api/monitoring/errors
 * Receive and process error logs from clients
 */
export async function POST(request: NextRequest) {
  try {
    const errorLog: ErrorLogReport = await request.json();

    if (!errorLog.message || !errorLog.sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const shouldLog =
      errorLog.severity === 'critical' ||
      errorLog.severity === 'error' ||
      (process.env.NODE_ENV === 'development' && errorLog.severity === 'warning');

    if (shouldLog) {
      const storedError = await errorLoggingService.logError({
        message: errorLog.message,
        stack: errorLog.stack,
        severity: errorLog.severity as 'low' | 'medium' | 'high' | 'critical',
        userId: errorLog.userId,
        metadata: errorLog.context as Record<string, unknown>,
      });
      if (storedError && errorLog.severity === 'critical') {
        console.log(`[Alert] Critical Error: ${errorLog.message}`);
      }
    }

    return NextResponse.json(
      { success: true, id: errorLog.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Error Logging API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/monitoring/errors
 * Retrieve error logs (with authentication)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.MONITORING_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const severity = searchParams.get('severity') || undefined;
    const sessionId = searchParams.get('sessionId') || undefined;
    const cursor = searchParams.get('cursor') || undefined;

    const errors = await errorLoggingService.getAllErrors(limit, cursor ? parseInt(cursor) : undefined);

    return NextResponse.json({ total: errors.length, limit, errors }, { status: 200 });
  } catch (error) {
    console.error('[Error Logging API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/monitoring/errors/:id
 * Delete an error log (with authentication)
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.MONITORING_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Missing error ID' }, { status: 400 });
    }

    await errorLoggingService.deleteError(id);

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error) {
    console.error('[Error Logging API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}