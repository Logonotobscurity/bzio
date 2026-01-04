import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Optional API key validation
    if (process.env.WAHA_API_KEY) {
      const apiKey = request.headers.get('x-api-key');
      if (apiKey !== process.env.WAHA_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const webhook = await request.json();
    
    console.log('WhatsApp webhook received:', webhook.event);

    switch (webhook.event) {
      case 'message':
        await handleIncomingMessage(webhook);
        break;
      case 'message.ack':
        console.log('Message acknowledged:', webhook.payload?.id);
        break;
      default:
        console.log('Unhandled webhook event:', webhook.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function handleIncomingMessage(webhook: Record<string, unknown>): Promise<void> {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('Database not configured, skipping message storage');
      return;
    }

    // Safely extract payload with null checks
    const payload = webhook.payload as Record<string, unknown> | undefined;
    
    // Validate payload exists before proceeding
    if (!payload || typeof payload !== 'object') {
      console.warn('Invalid or missing payload in webhook:', webhook);
      return;
    }

    await prisma.negotiationMessage.create({
      data: {
        quoteId: (payload.quoteId as string) || 'unknown',
        direction: 'inbound',
        channel: 'whatsapp',
        fromNumber: (payload.from as string) || '',
        body: (payload.body as string) || '',
        vendorMessageId: (payload.id as string) || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: payload as any,
        status: 'received',
      },
    });
  } catch (error) {
    console.error('Failed to store incoming message:', error);
  }
}
