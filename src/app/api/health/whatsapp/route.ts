import { whatsappService } from '@/services/whatsappService';
import { NextResponse } from 'next/server';

// Prevent this route from being statically exported during build
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // During build time, gracefully return unavailable status
    // since WAHA service may not be accessible
    const isConnected = await whatsappService.checkConnection();
    
    return NextResponse.json({
      service: 'whatsapp',
      status: isConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Return 200 with unhealthy status rather than 500 to prevent build failure
    // This handles the case where WAHA is not accessible during build
    return NextResponse.json({
      service: 'whatsapp',
      status: 'unavailable',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  }
}
