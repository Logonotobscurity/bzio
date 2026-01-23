import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const eventType = url.searchParams.get('type');

    // Build where filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId };
    if (eventType) {
      where.eventType = eventType;
    }

    // Get total count
    const total = await prisma.analytics_events.count({ where });

    // Get paginated activities
    const activities = await prisma.analytics_events.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      activities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[USER_ACTIVITIES_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;
    const body = await req.json();

    const { eventType, title, description, referenceId, referenceType, metadata } = body;

    if (!eventType || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, description' },
        { status: 400 }
      );
    }

    const activity = await prisma.analytics_events.create({
      data: {
        userId,
        eventType,
        title: title || null,
        description,
        referenceId: referenceId || null,
        referenceType: referenceType || null,
        metadata: metadata || null,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('[USER_ACTIVITIES_POST]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
