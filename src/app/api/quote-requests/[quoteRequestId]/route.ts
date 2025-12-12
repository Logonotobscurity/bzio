import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ quoteRequestId: string }> }
) {
  try {
    const { quoteRequestId } = await params;
    const quoteRequest = await prisma.quote.findUnique({
      where: {
        id: quoteRequestId,
      },
      include: {
        lines: true,
      },
    });

    if (!quoteRequest) {
      return new NextResponse('Not found', { status: 404 });
    }

    return NextResponse.json(quoteRequest);
  } catch (error) {
    console.error('[QUOTE_REQUEST_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ quoteRequestId: string }> }
) {
  try {
    const { quoteRequestId } = await params;
    const { ...values } = await req.json();

    const quoteRequest = await prisma.quote.update({
      where: {
        id: quoteRequestId,
      },
      data: {
        ...values,
      },
    });

    return NextResponse.json(quoteRequest);
  } catch (error) {
    console.error('[QUOTE_REQUEST_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ quoteRequestId: string }> }
) {
  try {
    const { quoteRequestId } = await params;
    const quoteRequest = await prisma.quote.delete({
      where: {
        id: quoteRequestId,
      },
    });

    return NextResponse.json(quoteRequest);
  } catch (error) {
    console.error('[QUOTE_REQUEST_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
