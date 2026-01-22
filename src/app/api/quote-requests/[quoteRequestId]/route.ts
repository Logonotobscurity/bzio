import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuthRoute } from '@/lib/guards';
import { USER_ROLES } from '@/lib/auth-constants';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ quoteRequestId: string }> }
) {
  try {
    const { authenticated, user, response } = await requireAuthRoute();
    if (!authenticated || !user) return response!;

    const { quoteRequestId } = await params;
    const id = Number(quoteRequestId);

    const quoteRequest = await prisma.quotes.findUnique({
      where: { id },
      include: {
        quote_lines: {
            include: { products: true }
        },
      },
    });

    if (!quoteRequest) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Ownership check
    if (user.role !== USER_ROLES.ADMIN && quoteRequest.userId !== Number(user.id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(quoteRequest);
  } catch (error) {
    console.error('[QUOTE_REQUEST_GET]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ quoteRequestId: string }> }
) {
  try {
    const { authenticated, user, response } = await requireAuthRoute();
    if (!authenticated || !user) return response!;

    const { quoteRequestId } = await params;
    const id = Number(quoteRequestId);
    const { ...values } = await req.json();

    // Check existence and ownership first
    const existing = await prisma.quotes.findUnique({
        where: { id },
        select: { userId: true }
    });

    if (!existing) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (user.role !== USER_ROLES.ADMIN && existing.userId !== Number(user.id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const quoteRequest = await prisma.quotes.update({
      where: { id },
      data: {
        ...values,
      },
    });

    return NextResponse.json(quoteRequest);
  } catch (error) {
    console.error('[QUOTE_REQUEST_PATCH]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ quoteRequestId: string }> }
) {
  try {
    const { authenticated, user, response } = await requireAuthRoute();
    if (!authenticated || !user) return response!;

    const { quoteRequestId } = await params;
    const id = Number(quoteRequestId);

    // Check existence and ownership first
    const existing = await prisma.quotes.findUnique({
        where: { id },
        select: { userId: true }
    });

    if (!existing) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (user.role !== USER_ROLES.ADMIN && existing.userId !== Number(user.id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const quoteRequest = await prisma.quotes.delete({
      where: { id },
    });

    return NextResponse.json(quoteRequest);
  } catch (error) {
    console.error('[QUOTE_REQUEST_DELETE]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
