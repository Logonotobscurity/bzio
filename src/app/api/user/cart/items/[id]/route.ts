import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;
    const itemId = id;
    const body = await req.json();
    const { quantity, unitPrice } = body;

    // Verify the item belongs to the user
    const existingItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem || existingItem.userId !== userId) {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404 }
      );
    }

    if (quantity !== undefined && quantity <= 0) {
      // Delete if quantity is 0 or negative
      await prisma.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ success: true, deleted: true });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(unitPrice !== undefined && { unitPrice }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            images: { take: 1 },
          },
        },
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('[CART_ITEM_PUT]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: itemId } = await params;
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;

    // Verify the item belongs to the user
    const existingItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem || existingItem.userId !== userId) {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CART_ITEM_DELETE]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
