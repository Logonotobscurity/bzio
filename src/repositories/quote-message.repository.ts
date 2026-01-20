/**
 * Quote Message Repository
 * 
 * Data access layer for Quote Message entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma } from '@prisma/client';

type QuoteMessage = Prisma.quote_messagesGetPayload<{}>;

interface CreateQuoteMessageInput {
  quoteId: number;
  senderRole: string;
  senderEmail: string;
  senderName: string;
  senderId?: number;
  message: string;
}

interface UpdateQuoteMessageInput {
  message?: string;
  isRead?: boolean;
}

export class QuoteMessageRepository extends BaseRepository<QuoteMessage, CreateQuoteMessageInput, UpdateQuoteMessageInput> {
  async findAll(limit?: number, skip?: number) {
    try {
      return await prisma.quote_messages.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number) {
    try {
      return await prisma.quote_messages.findUnique({
        where: { id: Number(id) },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByQuoteId(quoteId: string, limit?: number) {
    try {
      return await prisma.quote_messages.findMany({
        where: { quoteId: Number(quoteId) },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findByQuoteId');
    }
  }

  async create(data: CreateQuoteMessageInput) {
    try {
      return await prisma.quote_messages.create({
        data: {
          quoteId: data.quoteId,
          senderRole: data.senderRole,
          senderEmail: data.senderEmail,
          senderName: data.senderName,
          senderId: data.senderId,
          message: data.message,
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateQuoteMessageInput) {
    try {
      return await prisma.quote_messages.update({
        where: { id: Number(id) },
        data,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number) {
    try {
      await prisma.quote_messages.delete({
        where: { id: Number(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count() {
    try {
      return await prisma.quote_messages.count();
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(quoteId: string) {
    try {
      // `isRead` is not a guaranteed DB column in the generated schema.
      // Use dynamic access to avoid type errors when the column is absent.
      return await (prisma as any).quote_messages.updateMany({
        where: { quoteId: Number(quoteId), isRead: false },
        data: { isRead: true },
      });
    } catch (error) {
      this.handleError(error, 'markAsRead');
    }
  }

  /**
   * Count unread messages for quote
   */
  async countUnread(quoteId: string) {
    try {
      return await (prisma as any).quote_messages.count({ where: { quoteId: Number(quoteId), isRead: false } });
    } catch (error) {
      this.handleError(error, 'countUnread');
    }
  }
}

export const quoteMessageRepository = new QuoteMessageRepository();
