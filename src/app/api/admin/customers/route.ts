import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from "@/lib/db";
import { Prisma } from '@prisma/client';
import { successResponse, unauthorized, badRequest, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/customers')
    .withMethod('GET')
    .withRequestId(requestId);

  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      errorLogger.warn('Unauthorized customers API access', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search') || '';

    // Validate pagination params
    if (limit < 1 || limit > 1000) {
      return badRequest('Limit must be between 1 and 1000');
    }
    if (offset < 0) {
      return badRequest('Offset must be non-negative');
    }

    // Build search filter
    const whereClause: Prisma.UserWhereInput = search
      ? {
          role: 'customer',
          OR: [
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { companyName: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : { role: 'customer' };

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
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
              total: true,
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
                  product: {
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
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    errorLogger.info(
      `Fetched ${customers.length} customers (total: ${total})`,
      context.withUserId(session.user.id).build()
    );

    return successResponse({
      data: customers,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    }, 200);
  } catch (error) {
    errorLogger.error(
      'Error fetching customers',
      error,
      context.build()
    );
    return internalServerError('Failed to fetch customers');
  }
}
