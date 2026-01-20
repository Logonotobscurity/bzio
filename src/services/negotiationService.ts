import { prisma } from '@/lib/db';
import type { NegotiationMessage, Prisma } from '@prisma/client';

export const createNegotiationMessage = async (quoteId: string, data: Prisma.NegotiationMessageCreateWithoutQuoteInput): Promise<NegotiationMessage> => {
  return prisma.quote_messages.create({
    data: { ...data, quote: { connect: { id: quoteId } } },
  });
};

export const getQuoteMessages = async (quoteId: string): Promise<NegotiationMessage[]> => {
  return prisma.quote_messages.findMany({
    where: { quoteId },
    orderBy: { createdAt: 'asc' },
  });
};

export const updateMessageStatus = async (id: string, status: string): Promise<NegotiationMessage> => {
  return prisma.quote_messages.update({
    where: { id },
    data: { status },
  });
};
