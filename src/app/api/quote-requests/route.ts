
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateQuoteRequestWhatsAppURL } from '@/lib/api/whatsapp';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const quoteRequestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  company: z.string().optional(),
  message: z.string(),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number(),
    name: z.string(),
  })),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const {
      name,
      email,
      phone,
      company,
      message,
      items,
    } = quoteRequestSchema.parse(json);

    // Try to create quote record in database (non-blocking)
    try {
      await prisma.quote.create({
        data: {
          reference: `QR-${Date.now()}`,
          buyerContactEmail: email,
          buyerContactPhone: phone,
          buyerCompanyId: company || null,
          status: 'draft',
          lines: {
            create: items.map(item => ({
              productId: item.id,
              productName: item.name,
              qty: item.quantity,
            })),
          },
        },
      });
    } catch (dbError) {
      console.warn('[QUOTE_DB_SAVE_WARNING]', dbError);
      // Don't fail the request if database save fails - user can still proceed with WhatsApp
    }

    // Generate WhatsApp URLs (non-blocking)
    try {
      generateQuoteRequestWhatsAppURL({
        name,
        email,
        phone,
        company,
        address: message,
        items: items.map(item => ({
          id: item.id || '',
          name: item.name || '',
          quantity: item.quantity || 0,
        })),
      });
    } catch (whatsappError) {
      console.warn('[WHATSAPP_NOTIFICATION_ERROR]', whatsappError);
      // Don't fail the request if WhatsApp notification fails
    }

    // Return success response - user is redirected to WhatsApp on client side
    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully.'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[QUOTE_REQUESTS_VALIDATION_ERROR]', error.errors);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('[QUOTE_REQUESTS_POST]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const quoteRequests = await prisma.quote.findMany({
      include: {
        lines: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(quoteRequests);
  } catch (error) {
    console.error('[QUOTE_REQUESTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

