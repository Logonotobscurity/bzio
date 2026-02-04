import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/auth/config';
import { prisma } from "@/lib/db";
import { Prisma } from '@prisma/client';
import { errorLogger, createContext } from '@/lib/error-logger';
import { successResponse, unauthorized, badRequest, notFound, internalServerError } from '@/lib/api-response';

/**
 * GET /api/admin/customers/data
 * Fetches comprehensive customer data including profiles, addresses, cart items, and quotes
 * Admin endpoint with filtering and pagination
 */
export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/customers/data')
    .withMethod('GET')
    .withRequestId(requestId);

  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      errorLogger.warn('Unauthorized access attempt to customer data', context.build());
      return unauthorized('Admin access required');
    }

    context.withUserId(session.user.id);

    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search') || '';
    const exportFormat = url.searchParams.get('export'); // 'csv' or 'json'

    // Validate pagination bounds
    if (limit < 1 || limit > 500) {
      errorLogger.warn(`Invalid limit parameter: ${limit}`, context.build());
      return badRequest('Limit must be between 1 and 500');
    }

    if (offset < 0) {
      errorLogger.warn(`Invalid offset parameter: ${offset}`, context.build());
      return badRequest('Offset must be non-negative');
    }

    // If specific customer requested
    if (customerId) {
      errorLogger.info(`Fetching customer detail for ID: ${customerId}`, context.build());

      const customerIdNum = parseInt(customerId);
      if (isNaN(customerIdNum)) {
        errorLogger.warn(`Invalid customer ID format: ${customerId}`, context.build());
        return badRequest('Invalid customer ID format');
      }

      const customer = await prisma.user.findFirst({
        where: {
          id: customerIdNum,
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
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          // Addresses
          addresses: {
            orderBy: { createdAt: 'desc' },
          },
          // Cart Items
          carts: {
            where: { status: 'active' },
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      sku: true,
                      price: true,
                      stock: true,
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
          },
          // Quotes
          quotes: {
            include: {
              lines: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });

      if (!customer) {
        errorLogger.info(`Customer not found: ${customerIdNum}`, context.build());
        return notFound('Customer not found');
      }

      errorLogger.info(`Successfully retrieved customer detail for ID: ${customerIdNum}`, context.build());

      // Calculate totals for carts
      const cartsWithTotals = customer.carts.map((cart: typeof customer.carts[number]) => ({
        ...cart,
        itemCount: cart.items.length,
        total: cart.items.reduce(
          (sum: number, item: typeof cart.items[number]) => sum + (item.unitPrice || item.product.price || 0) * item.quantity,
          0
        ),
      }));

      // Calculate quote totals
      const quotesSummary = customer.quotes.map((quote: typeof customer.quotes[number]) => ({
        id: quote.id,
        reference: quote.reference,
        status: quote.status,
        total: quote.total,
        itemCount: quote.lines?.length || 0,
        createdAt: quote.createdAt,
      }));

      return successResponse({
        customer: {
          ...customer,
          carts: cartsWithTotals,
          quotes: quotesSummary,
        },
      });
    }

    errorLogger.info(`Fetching customer list with limit: ${limit}, offset: ${offset}${search ? `, search: ${search}` : ''}`, context.build());

    // Fetch multiple customers with search
    const whereClause: Prisma.UserWhereInput = search
      ? {
          AND: [
            { role: 'customer' },
            {
              OR: [
                { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { companyName: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { phone: { contains: search, mode: Prisma.QueryMode.insensitive } },
              ],
            },
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
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          // Count cart items
          _count: {
            select: {
              addresses: true,
              carts: true,
              quotes: true,
            },
          },
          // Get active cart total
          carts: {
            where: { status: 'active' },
            select: {
              items: {
                select: {
                  quantity: true,
                  unitPrice: true,
                  product: {
                    select: { price: true },
                  },
                },
              },
            },
            take: 1,
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    errorLogger.info(`Retrieved ${customers.length} customers from ${total} total`, context.build());

    // Transform and enhance customer data
    const customersWithTotals = customers.map((customer: typeof customers[number]) => {
      const cartTotal = customer.carts[0]?.items.reduce(
        (sum: number, item: typeof customer.carts[0]['items'][number]): number => sum + (item.unitPrice || item.product.price || 0) * item.quantity,
        0
      ) || 0;

      const cartItemCount = customer.carts[0]?.items.length || 0;

      return {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        fullName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        phone: customer.phone,
        companyName: customer.companyName,
        businessType: customer.businessType,
        role: customer.role,
        isActive: customer.isActive,
        lastLogin: customer.lastLogin,
        createdAt: customer.createdAt,
        // Summary counts
        addressCount: customer._count.addresses,
        cartCount: customer._count.carts,
        quoteCount: customer._count.quotes,
        // Current cart details
        cartItemCount,
        cartTotal,
      };
    });

    // If export format requested
    if (exportFormat === 'csv') {
      errorLogger.info('Exporting customer data as CSV', context.build());
      const csv = convertToCsv(customersWithTotals);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="customers.csv"',
        },
      });
    }

    return successResponse({
      data: customersWithTotals,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      summary: {
        totalCustomers: total,
        activeCount: customers.filter((c: typeof customers[number]) => c.isActive).length,
        totalAddresses: customers.reduce((sum: number, c: typeof customers[number]): number => sum + c._count.addresses, 0),
        totalQuotes: customers.reduce((sum: number, c: typeof customers[number]): number => sum + c._count.quotes, 0),
        totalCartValue: customersWithTotals.reduce((sum: number, c: typeof customersWithTotals[number]): number => sum + (c.cartTotal || 0), 0),
      },
    });
  } catch (error) {
    errorLogger.error('Failed to fetch customer data', error, context.build());
    return internalServerError('Failed to fetch customer data');
  }
}

// Helper function to convert data to CSV
function convertToCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return 'No data to export';

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          // Handle special cases
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        })
        .join(',')
    ),
  ].join('\n');

  return csv;
}
