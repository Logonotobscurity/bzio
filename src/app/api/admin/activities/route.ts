import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/jwt-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get recent analytics events
    const events = await prisma.analytics_events.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            companies: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Transform events to activity format
    const activities = events.map(event => {
      const eventData = event.eventData as Record<string, unknown> | null;
      return {
        id: event.id.toString(),
        type: event.eventType,
        actor: {
          email: event.user?.email || 'Anonymous',
          name: event.user ? `${event.user.firstName || ''} ${event.user.lastName || ''}`.trim() : undefined,
        },
        data: {
          reference: eventData?.reference,
          amount: eventData?.totalAmount || eventData?.amount,
          items: eventData?.items,
          formType: eventData?.formType,
        },
        status: getEventStatus(event.eventType, eventData),
      };
    });

    return Response.json(activities);

  } catch (error) {
    console.error('[ADMIN_ACTIVITIES_GET]', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getEventStatus(eventType: string, eventData: Record<string, unknown> | null): string {
  switch (eventType) {
    case 'user_registered':
      return 'Pending Verification';
    case 'quote_requested':
      return 'Pending Review';
    case 'checkout_completed':
      return 'Completed';
    case 'newsletter_signup':
      return 'Subscribed';
    case 'form_submitted':
      return 'New';
    case 'product_viewed':
      return 'Viewed';
    case 'search_performed':
      return `${eventData?.results || 0} results`;
    default:
      return 'Active';
  }
}