import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { successResponse, unauthorized, badRequest, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

/**
 * GET /api/admin/quote-messages?quoteId=...
 * Fetch all messages for a specific quote
 */
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/quote-messages')
    .withMethod('GET')
    .withRequestId(requestId);

  try {
    const session = await getServerSession();
    if (!session || session.user?.role !== 'admin') {
      errorLogger.warn('Unauthorized quote messages access', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const quoteId = request.nextUrl.searchParams.get('quoteId');

    if (!quoteId) {
      return badRequest('quoteId is required');
    }

    const messages = await prisma.quoteMessage.findMany({
      where: { quoteId },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await prisma.quoteMessage.updateMany({
      where: { quoteId, senderRole: 'customer' },
      data: { isRead: true },
    });

    errorLogger.info(
      `Fetched ${messages.length} messages for quote ${quoteId}`,
      context.withUserId(session.user.id).build()
    );

    return successResponse({ messages }, 200);
  } catch (error) {
    errorLogger.error(
      'Error fetching quote messages',
      error,
      context.build()
    );
    return internalServerError('Failed to fetch messages');
  }
}

/**
 * POST /api/admin/quote-messages
 * Create a new message
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/quote-messages')
    .withMethod('POST')
    .withRequestId(requestId);

  try {
    const session = await getServerSession();
    if (!session || session.user?.role !== 'admin') {
      errorLogger.warn('Unauthorized quote message creation', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const body = await request.json();
    const { quoteId, message, senderRole } = body;

    if (!quoteId || !message) {
      return badRequest('quoteId and message are required');
    }

    const newMessage = await prisma.quoteMessage.create({
      data: {
        quoteId,
        message,
        senderRole: senderRole || 'admin',
        senderEmail: session.user?.email || 'system',
        senderName: session.user?.name || 'Admin',
      },
    });

    errorLogger.info(
      `Message created for quote ${quoteId}`,
      context.withUserId(session.user.id).build()
    );

    return successResponse({ message: newMessage }, 201);
  } catch (error) {
    errorLogger.error(
      'Error creating quote message',
      error,
      context.build()
    );
    return internalServerError('Failed to create message');
  }
}
