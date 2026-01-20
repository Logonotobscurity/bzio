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
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Get user's cart with items and product details
    const carts = await prisma.cart.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                images: {
                  select: { url: true },
                  take: 1,
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Get the active cart or create if not exists
    let activeCart = carts.find(c => c.status === 'active');

    if (!activeCart) {
      activeCart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
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
          },
        },
      });
    }

    return NextResponse.json({
      activeCart,
      allCarts: carts,
      itemCount: activeCart.items.length,
      total: activeCart.items.reduce((sum, item) => sum + (item.unitPrice || item.product.price || 0) * item.quantity, 0),
    });
  } catch (error) {
    console.error('[CART_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
