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
  // ✅ CRITICAL: Verify admin access
  const session = await getServerSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 403 }
    );
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
  } catch (error) {
    result.connection.status = 'disconnected';
    result.connection.error = error instanceof Error ? error.message : 'Unknown error';
  }

  const statusCode = result.connection.status === 'connected' && 
    Object.values(result.schema.requiredTables).every(v => v) 
    ? 200 
    : 503;

  return NextResponse.json(result, { status: statusCode });
}
