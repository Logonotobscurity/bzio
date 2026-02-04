import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from "@/lib/db";
import { USER_ROLES } from '@/lib/auth/constants';
import { successResponse, unauthorized, notFound, badRequest, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/customers/[id]')
    .withMethod('GET')
    .withRequestId(requestId);

  const { id } = await params;
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id || session.user.role !== USER_ROLES.ADMIN) {
      errorLogger.warn('Unauthorized customer detail access', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return badRequest('Customer ID must be a valid number');
    }

    const customer = await prisma.user.findFirst({
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
      errorLogger.warn(`Customer not found (id: ${customerId})`, context.withUserId(session.user.id).build());
      return notFound('Customer not found');
    }

    // Calculate cart totals
    const cartsWithTotals = customer.carts.map((cart: typeof customer.carts[number]) => ({
      ...cart,
      total: cart.items.reduce((sum: number, item: typeof cart.items[number]) => sum + (item.unitPrice || item.product.price || 0) * item.quantity, 0),
    }));

    errorLogger.info(
      `Customer detail retrieved (id: ${customerId})`,
      context.withUserId(session.user.id).build()
    );

    return successResponse({
      ...customer,
      carts: cartsWithTotals,
    }, 200);
  } catch (error) {
    errorLogger.error(
      'Error fetching customer detail',
      error,
      context.build()
    );
    return internalServerError('Failed to fetch customer');
  }
}
