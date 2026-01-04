import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Prevent this route from being statically exported during build
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    await prisma.errorLog.create({
      data: {
        message: body.message || 'Unknown error',
        stack: body.stack || null,
        context: body.context || {},
        severity: body.severity || 'error',
        url: body.url || '',
        userAgent: request.headers.get('user-agent') || null,
        sessionId: body.sessionId || 'unknown',
        userId: body.userId || null,
        breadcrumbs: body.breadcrumbs || [],
        environment: process.env.NODE_ENV || 'development',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
