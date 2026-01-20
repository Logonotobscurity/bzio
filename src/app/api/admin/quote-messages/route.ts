import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/quote-messages?quoteId=...
 * Fetch all messages for a specific quote
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ CRITICAL: Verify admin access
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const quoteId = request.nextUrl.searchParams.get('quoteId');

    if (!quoteId) {
      return NextResponse.json(
        { error: 'quoteId is required' },
        { status: 400 }
      );
    }

    const messages = await prisma.quote_messages.findMany({
      where: { quoteId },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await prisma.quote_messages.updateMany({
      where: { quoteId, senderRole: 'customer' },
      data: { isRead: true },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('[QUOTE_MESSAGES_GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/quote-messages
 * Create a new message
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ CRITICAL: Verify admin access
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { quoteId, message, senderRole } = body;

    const newMessage = await prisma.quote_messages.create({
      data: {
        quoteId,
        message,
        senderRole: senderRole || 'admin',
        senderEmail: session.user?.email || 'system',
        senderName: session.user?.name || 'Admin',
      },
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('[QUOTE_MESSAGES_POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
