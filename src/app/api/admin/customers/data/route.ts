import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/customers/data
 * Fetches comprehensive customer data including profiles, addresses, cart items, and quotes
 * Admin endpoint with filtering and pagination
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search') || '';
    const exportFormat = url.searchParams.get('export'); // 'csv' or 'json'

    // If specific customer requested
    if (customerId) {
      const customerIdNum = parseInt(customerId);
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
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }

      // Calculate totals for carts
      const cartsWithTotals = customer.carts.map(cart => ({
        ...cart,
        itemCount: cart.items.length,
        total: cart.items.reduce(
          (sum, item) => sum + (item.unitPrice || item.product.price || 0) * item.quantity,
          0
        ),
      }));

      // Calculate quote totals
      const quotesSummary = customer.quotes.map(quote => ({
        id: quote.id,
        reference: quote.reference,
        status: quote.status,
        total: quote.total,
        itemCount: quote.lines?.length || 0,
        createdAt: quote.createdAt,
      }));

      return NextResponse.json({
        customer: {
          ...customer,
          carts: cartsWithTotals,
          quotes: quotesSummary,
        },
      });
    }

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

    // Transform and enhance customer data
    const customersWithTotals = customers.map(customer => {
      const cartTotal = customer.carts[0]?.items.reduce(
        (sum, item) => sum + (item.unitPrice || item.product.price || 0) * item.quantity,
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
      const csv = convertToCsv(customersWithTotals);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="customers.csv"',
        },
      });
    }

    return NextResponse.json({
      data: customersWithTotals,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      summary: {
        totalCustomers: total,
        activeCount: customers.filter(c => c.isActive).length,
        totalAddresses: customers.reduce((sum, c) => sum + c._count.addresses, 0),
        totalQuotes: customers.reduce((sum, c) => sum + c._count.quotes, 0),
        totalCartValue: customersWithTotals.reduce((sum, c) => sum + (c.cartTotal || 0), 0),
      },
    });
  } catch (error) {
    console.error('[ADMIN_CUSTOMERS_DATA_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
