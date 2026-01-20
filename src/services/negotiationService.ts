import { prisma } from '@/lib/db';

// Negotiation message helpers — use `any` types to avoid generated type mismatches
export const createNegotiationMessage = async (quoteId: string, data: any): Promise<any> => {
  return (prisma as any).quote_messages.create({
    data: { ...data, quote: { connect: { id: Number(quoteId) } } },
  });
};

export const getQuoteMessages = async (quoteId: string): Promise<any[]> => {
  return (prisma as any).quote_messages.findMany({
    where: { quoteId: Number(quoteId) },
    orderBy: { createdAt: 'asc' },
  });
};

export const updateMessageStatus = async (id: string, status: string): Promise<any> => {
  return (prisma as any).quote_messages.update({
    where: { id: Number(id) },
    data: { status: (status as any) },
  });
};
