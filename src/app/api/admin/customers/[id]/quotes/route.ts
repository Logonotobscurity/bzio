import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { prisma } from "@/lib/db";
import { USER_ROLES } from '@/lib/auth/constants';
import { errorLogger, createContext } from '@/lib/error-logger';
import { successResponse, unauthorized, badRequest, notFound, internalServerError } from '@/lib/api-response';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/customers/[id]/quotes')
    .withMethod('GET')
    .withRequestId(requestId);

  try {
    const session = await getServerSession();
    
    if (!session?.user?.id || session.user.role !== USER_ROLES.ADMIN) {
      errorLogger.warn('Unauthorized access attempt to customer quotes', context.build());
      return unauthorized('Admin access required');
    }

    context.withUserId(session.user.id);

    const { id } = await params;
    const customerId = parseInt(id);

    if (isNaN(customerId)) {
      errorLogger.warn(`Invalid customer ID format: ${id}`, context.build());
      return badRequest('Invalid customer ID format');
    }

    context.withCustom('customerId', customerId.toString());

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Validate pagination bounds
    if (limit < 1 || limit > 500) {
      errorLogger.warn(`Invalid limit parameter: ${limit}`, context.build());
      return badRequest('Limit must be between 1 and 500');
    }

    if (offset < 0) {
      errorLogger.warn(`Invalid offset parameter: ${offset}`, context.build());
      return badRequest('Offset must be non-negative');
    }

    errorLogger.info(`Fetching quotes for customer ID: ${customerId}`, context.build());

    // Verify customer exists
    const customer = await prisma.user.findFirst({
      where: { id: customerId, role: 'customer' },
      select: { id: true },
    });

    if (!customer) {
      errorLogger.info(`Customer not found: ${customerId}`, context.build());
      return notFound('Customer not found');
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where: { userId: customerId },
        include: {
          lines: true,
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.quote.count({
        where: { userId: customerId },
      }),
    ]);

    errorLogger.info(`Successfully retrieved ${quotes.length} quotes for customer ${customerId} (total: ${total})`, context.build());

    return successResponse({
      data: quotes,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    errorLogger.error('Failed to fetch customer quotes', error, context.build());
    return internalServerError('Failed to fetch customer quotes');
  }
}
