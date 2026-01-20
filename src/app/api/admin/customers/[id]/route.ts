import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import prisma from '@/lib/prisma';
import { USER_ROLES } from '@/lib/auth-constants';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== USER_ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const customerId = parseInt(id);

    const customer = await prisma.users.findFirst({
      where: {
        id: customerId,
        role: 'customer',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        companyPhone: true,
        businessType: true,
        businessRegistration: true,
        addresses: true,
        quotes: {
          include: {
            lines: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        carts: {
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
        },
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Calculate cart totals
    const cartsWithTotals = customer.carts.map(cart => ({
      ...cart,
      total: cart.items.reduce((sum, item) => sum + (item.unitPrice || item.product.price || 0) * item.quantity, 0),
    }));

    return NextResponse.json({
      ...customer,
      carts: cartsWithTotals,
    });
  } catch (error) {
    console.error('[ADMIN_CUSTOMER_DETAIL_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
