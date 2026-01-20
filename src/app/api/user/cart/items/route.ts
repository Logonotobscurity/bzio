import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity-service';

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
    const { productId: rawProductId, quantity = 1, unitPrice } = body;
    const productId = Number(rawProductId);

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get or create active cart
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cart = await (prisma as any).cart.findFirst({
      where: { userId, status: 'active' },
    });

    if (!cart) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cart = await (prisma as any).cart.create({
        data: { userId },
      });
    }

    // Get product details for activity logging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await (prisma as any).products.findUnique({
      where: { id: Number(productId) },
      select: { id: true, name: true, price: true },
    });

    // Check if product already exists in cart
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingItem = await (prisma as any).cart_items.findFirst({
      where: { cartId: cart.id, productId: Number(productId) },
    });

    let cartItem;
    const isNewItem = !existingItem;

    if (existingItem) {
      // Update quantity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cartItem = await (prisma as any).cart_items.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
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
    } else {
      // Create new cart item
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cartItem = await (prisma as any).cart_items.create({
        data: {
          cartId: cart.id,
          userId,
          productId: Number(productId),
          quantity,
          unitPrice: unitPrice || undefined,
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
    }

    // Log activity
    if (product) {
      await logActivity(
        userId,
        'cart_add',
        {
          title: `Added: ${product.name}`,
          message: `Added ${quantity} × ${product.name} to cart`,
          referenceId: cartItem.id,
          referenceType: 'CartItem',
          productId: product.id,
          productName: product.name,
          quantity,
          price: product.price,
          isNewItem,
        }
      );
    }

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error('[CART_ITEMS_POST]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;

    // Get active cart with items
    const cart = await prisma.cart.findFirst({
      where: { userId, status: 'active' },
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
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({
        items: [],
        itemCount: 0,
        total: 0,
      });
    }

    const total = cart.items.reduce((sum, item) => sum + (item.unitPrice || item.product.price || 0) * item.quantity, 0);

    return NextResponse.json({
      cartId: cart.id,
      items: cart.items,
      itemCount: cart.items.length,
      total,
    });
  } catch (error) {
    console.error('[CART_ITEMS_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
