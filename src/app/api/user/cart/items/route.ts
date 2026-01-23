import { NextResponse } from 'next/server';
import { requireAuthRoute } from '@/lib/guards';
import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/activity-service';

export async function POST(req: Request) {
  try {
    const { authenticated, user, response } = await requireAuthRoute();
    if (!authenticated || !user) return response!;

    const userId = Number(user.id);
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
    let cart = await prisma.carts.findFirst({
      where: { userId, status: 'active' },
    });

    if (!cart) {
      cart = await prisma.carts.create({
        data: { userId },
      });
    }

    // Get product details for activity logging
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, name: true, price: true },
    });

    // Check if product already exists in cart
    const existingItem = await prisma.cart_items.findFirst({
      where: { cartId: cart.id, productId },
    });

    let cartItem;
    const isNewItem = !existingItem;

    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              images: true,
            },
          },
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cart_items.create({
        data: {
          cartId: cart.id,
          userId,
          productId,
          quantity,
          unitPrice: unitPrice ? Number(unitPrice) : undefined,
        },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              images: true,
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
          referenceId: String(cartItem.id),
          referenceType: 'CartItem',
          productId: product.id,
          productName: product.name,
          quantity,
          price: Number(product.price),
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
    const { authenticated, user, response } = await requireAuthRoute();
    if (!authenticated || !user) return response!;

    const userId = Number(user.id);

    // Get active cart with items
    const cart = await prisma.carts.findFirst({
      where: { userId, status: 'active' },
      include: {
        items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                images: true,
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

    const total = cart.items.reduce((sum, item) => sum + (Number(item.unitPrice) || Number(item.products.price) || 0) * item.quantity, 0);

    return NextResponse.json({
      cartId: cart.id,
      items: cart.items.map(item => ({
          ...item,
          product: item.products
      })),
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
