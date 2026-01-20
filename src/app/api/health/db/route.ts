import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Diagnostic endpoint to check database connectivity
 * GET /api/health/db
 */
export async function GET() {
  const startTime = Date.now();

  try {
    console.log('[DB_HEALTH] Checking database connection...');

    // Test 1: Simple SELECT 1
    await prisma.$queryRaw`SELECT 1`;
    console.log('[DB_HEALTH] ✓ SELECT 1 succeeded');

    // Test 2: Count users
    const userCount = await prisma.users.count();
    console.log('[DB_HEALTH] ✓ User count:', userCount);

    // Test 3: Count quotes
    const quoteCount = await prisma.quotes.count();
    console.log('[DB_HEALTH] ✓ Quote count:', quoteCount);

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'healthy',
        database: 'connected',
        userCount,
        quoteCount,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[DB_HEALTH] ✗ Error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
