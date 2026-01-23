import { NextResponse } from 'next/server';
import { requireAdminRoute } from '@/lib/guards';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    await requireAdminRoute();

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search') || '';

    // Build search filter
    const whereClause: Prisma.usersWhereInput = search
      ? {
          role: 'CUSTOMER',
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : { role: 'CUSTOMER' };

    const [customers, total] = await Promise.all([
      prisma.users.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          companyName: true,
          businessType: true,
          addresses: true,
          quotes: {
            select: {
              id: true,
              reference: true,
              status: true,
              totalAmount: true,
              createdAt: true,
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          carts: {
            select: {
              id: true,
              status: true,
              items: {
                select: {
                  id: true,
                  quantity: true,
                  unitPrice: true,
                  products: {
                    select: {
                      id: true,
                      name: true,
                      sku: true,
                      price: true,
                    },
                  },
                },
              },
            },
          },
          createdAt: true,
          lastLogin: true,
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.users.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      data: customers,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('[ADMIN_CUSTOMERS_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
