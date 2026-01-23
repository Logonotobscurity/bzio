import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { requireAuthRoute, getSession } from '@/lib/guards';
import { logActivity } from '@/lib/activity-service';
import { trackQuoteRequest } from '@/app/admin/_actions/tracking';
import { broadcastAdminNotification } from '@/app/admin/_actions/notifications';
import { USER_ROLES } from '@/lib/auth-constants';
import { generateQuoteRequestWhatsAppURL } from '@/lib/api/whatsapp';

export const dynamic = 'force-dynamic';

const quoteRequestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  company: z.string().optional(),
  address: z.string().optional().default('N/A'),
  message: z.string(),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number(),
    name: z.string(),
  })),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    
    const json = await req.json();
    const validated = quoteRequestSchema.parse(json);
    const {
      name,
      email,
      phone,
      company,
      address,
      message,
      items,
    } = validated;

    let quoteId: number | null = null;
    let quoteReference: string | null = null;
    try {
      const prismaData = {
        reference: `QR-${Date.now()}`,
        status: 'PENDING',
        userId: session?.user?.id ? Number(session.user.id) : null,
        totalAmount: 0,
        notes: message,
        quote_lines: {
          create: items.map(item => ({
            productId: Number(item.id),
            quantity: item.quantity,
          })),
        },
      };

      const quote = await prisma.quotes.create({ data: prismaData as any });
      quoteId = quote.id;
      quoteReference = quote.reference;
    } catch (dbError) {
      console.warn('[QUOTE_DB_SAVE_WARNING]', dbError);
    }

    // Generate WhatsApp URL
    const whatsappUrl = generateQuoteRequestWhatsAppURL({
        name,
        email,
        phone,
        company,
        address: address || 'N/A',
        items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity }))
    });

    try {
      if (quoteId && quoteReference) {
        await trackQuoteRequest({
          quoteId: String(quoteId),
          reference: quoteReference,
          email,
          itemCount: items.length,
        });
      }
    } catch (trackingError) {
      console.error('❌ Failed to track quote request:', trackingError);
    }

    try {
      if (quoteId && quoteReference) {
        await broadcastAdminNotification(
          'INFO',
          `New Quote Request: ${quoteReference}`,
          `Quote from ${name} (${email}) with ${items.length} items`,
          {
            quoteId: String(quoteId),
            quoteReference,
            customerName: name,
            customerEmail: email,
            itemCount: items.length,
          },
          `/admin?tab=quotes&id=${quoteId}`
        );
      }
    } catch (notificationError) {
      console.error('❌ Failed to send admin notifications:', notificationError);
    }

    if (session?.user?.id) {
      try {
        await logActivity(Number(session.user.id), 'quote_request', {
          itemCount: items.length,
          totalQty: items.reduce((sum, item) => sum + item.quantity, 0),
          company: company || null,
        });
      } catch (activityError) {
        console.warn('[ACTIVITY_LOG_ERROR]', activityError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully.',
      quoteId,
      quoteReference,
      whatsappUrl
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    console.error('[QUOTE_REQUESTS_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
    try {
      const { authenticated, user, response } = await requireAuthRoute();
      if (!authenticated || !user) return response!;

      const where = user.role === USER_ROLES.ADMIN ? {} : { userId: Number(user.id) };

      const quoteRequests = await prisma.quotes.findMany({
        where,
        include: {
          quote_lines: {
            include: {
                products: {
                    select: { name: true, sku: true, imageUrl: true }
                }
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    return NextResponse.json(quoteRequests);
  } catch (error) {
    console.error('[QUOTE_REQUESTS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
