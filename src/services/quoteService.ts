import { prisma } from '@/lib/db';

interface CreateQuotePayload {
  actorId?: string;
  userId?: number;
  buyerContactEmail: string;
  buyerContactPhone?: string;
  buyerCompanyId?: string;
  quote_lines: {
    productId?: string;
    productName: string;
    productSku?: string;
    qty: number;
    unitPrice?: number;
    description?: string;
  }[];
}

/**
 * Creates a new quote, its line items, and an initial event in a single transaction.
 *
 * @param {CreateQuotePayload} payload - The data for creating the quote.
 * @returns {Promise<Quote & { quote_lines: QuoteLine[] }>} The created quote with its lines.
 */
export async function createQuote(payload: CreateQuotePayload) {
  const { actorId, userId, buyerContactEmail, buyerContactPhone, buyerCompanyId, lines } = payload;

  // Generate a unique, human-readable reference for the quote
  const quoteReference = `Q-${Date.now()}-${String(Math.random()).substring(2, 6)}`;

  return prisma.$transaction(async (tx) => {
    // 1. Create the Quote
    const quote = await tx.quotes.create({
      data: {
        reference: quoteReference,
        userId: userId,
        buyerContactEmail: buyerContactEmail,
        buyerContactPhone: buyerContactPhone,
        buyerCompanyId: buyerCompanyId,
        status: "DRAFT",
        quote_lines: {
          create: lines.map(line => ({
            productId: line.productId,
            productName: line.productName,
            productSku: line.productSku,
            qty: line.qty,
            unitPrice: line.unitPrice,
            description: line.description,
          })),
        },
      },
      include: {
        quote_lines: true, // Include the created lines in the return value
      },
    });

    // 2. Create the initial QuoteEvent for audit purposes
    await tx.quote_events.create({
      data: {
        quoteId: quote.id,
        actorId: actorId || (userId ? String(userId) : 'system'),
        eventType: 'quote.created',
        payload: {
          ...payload,
          reference: quote.reference,
        },
      },
    });

    // 3. Return the complete quote object
    return quote;
  });
}
