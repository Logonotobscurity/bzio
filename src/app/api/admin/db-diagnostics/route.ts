/**
 * Database Diagnostics Endpoint
 * GET /api/admin/db-diagnostics
 * 
 * Provides detailed information about database setup status
 * Useful for debugging connection and migration issues
 * ADMIN-ONLY ENDPOINT
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { unauthorized, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

interface DiagnosticResult {
  timestamp: string;
  environment: {
    nodeEnv: string | undefined;
    databaseUrl: boolean;
  };
  connection: {
    status: 'connected' | 'disconnected';
    error?: string;
  };
  schema: {
    tables: string[];
    requiredTables: {
      User: boolean;
      passwordResetToken: boolean;
      emailVerificationToken: boolean;
    };
  };
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/db-diagnostics')
    .withMethod('GET')
    .withRequestId(requestId);

  try {
    const session = await getServerSession();
    if (!session || session.user?.role !== 'admin') {
      errorLogger.warn('Unauthorized db diagnostics access', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const result: DiagnosticResult = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: !!process.env.DATABASE_URL,
      },
      connection: {
        status: 'disconnected',
      },
      schema: {
        tables: [],
        requiredTables: {
          User: false,
          passwordResetToken: false,
          emailVerificationToken: false,
        },
      },
    };

    try {
      // Test connection
      await prisma.$queryRaw`SELECT 1`;
      result.connection.status = 'connected';

      // Get table list
      const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;

      result.schema.tables = tables.map((t: typeof tables[number]) => t.table_name);

      // Check for required tables
      const tableSet = new Set(result.schema.tables);
      result.schema.requiredTables.User = tableSet.has('User');
      result.schema.requiredTables.passwordResetToken = tableSet.has('passwordResetToken');
      result.schema.requiredTables.emailVerificationToken = tableSet.has('emailVerificationToken');

      errorLogger.info(
        `Database diagnostics: ${result.schema.tables.length} tables found`,
        context.withUserId(session.user.id).build()
      );
    } catch (error) {
      result.connection.status = 'disconnected';
      result.connection.error = error instanceof Error ? error.message : 'Unknown error';

      errorLogger.error(
        'Database connection failed during diagnostics',
        error,
        context.withUserId(session.user.id).build()
      );
    }

    const statusCode = result.connection.status === 'connected' && 
      Object.values(result.schema.requiredTables).every(v => v) 
      ? 200 
      : 503;

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    errorLogger.error(
      'Error in database diagnostics handler',
      error,
      context.build()
    );
    return internalServerError('Failed to run diagnostics');
  }
}
