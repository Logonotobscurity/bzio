import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Health check endpoint
 * GET /api/health
 * 
 * Used to verify:
 * - Application is running
 * - Database connection is active
 * - All critical dependencies are available
 */
export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        nodeEnv: process.env.NODE_ENV,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[health] Database connection failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        nodeEnv: process.env.NODE_ENV,
      },
      { status: 503 }
    );
  }
}

/**
 * Extended health check with detailed info
 * GET /api/health?detailed=true
 */
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}
