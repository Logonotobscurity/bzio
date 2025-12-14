import prisma from '@/lib/prisma';
import type { NegotiationMessage, Prisma } from '@prisma/client';

export const createNegotiationMessage = async (quoteId: string, data: Prisma.NegotiationMessageCreateWithoutQuoteInput): Promise<NegotiationMessage> => {
  return prisma.negotiationMessage.create({
    data: { ...data, quote: { connect: { id: quoteId } } },
  });
};

export const getQuoteMessages = async (quoteId: string): Promise<NegotiationMessage[]> => {
  return prisma.negotiationMessage.findMany({
    where: { quoteId },
    orderBy: { createdAt: 'asc' },
  });
};

export const updateMessageStatus = async (id: string, status: string): Promise<NegotiationMessage> => {
  return prisma.negotiationMessage.update({
    where: { id },
    data: { status },
  });
};
