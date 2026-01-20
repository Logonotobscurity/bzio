/**
 * Quote Message Service
 *
 * Business logic layer for quote messages/communications.
 * Handles message threading, status tracking, and notifications.
 */

import { quoteMessageRepository } from '@/repositories';
import type { Prisma } from '@prisma/client';

// Use repository type directly
type QuoteMessage = Prisma.quote_messagesGetPayload<{}>;

interface CreateMessageInput {
  quoteId: string | number;
  senderRole: string;
  senderEmail: string;
  senderName: string;
  senderId?: number;
  message: string;
}

interface UpdateMessageInput {
  message?: string;
  isRead?: boolean;
}

export class QuoteMessageService {
  /**
   * Send a new message on a quote
   */
  async sendMessage(input: CreateMessageInput): Promise<QuoteMessage> {
    // Validate input
    this.validateMessageInput(input);

    return (await quoteMessageRepository.create({
      quoteId: Number(input.quoteId),
      senderRole: input.senderRole,
      senderEmail: input.senderEmail,
      senderName: input.senderName,
      senderId: input.senderId,
      message: input.message,
    })) as unknown as QuoteMessage;
  }

  /**
   * Get all messages for a quote
   */
  async getQuoteMessages(quoteId: string | number): Promise<QuoteMessage[]> {
    return (await quoteMessageRepository.findByQuoteId(String(quoteId))) as unknown as QuoteMessage[];
  }

  /**
   * Get a specific message
   */
  async getMessageById(id: string | number): Promise<QuoteMessage | null> {
    return (await quoteMessageRepository.findById(id)) as unknown as QuoteMessage | null;
  }

  /**
   * Mark message as read
   */
  async markAsRead(id: string | number): Promise<QuoteMessage> {
    return (await quoteMessageRepository.update(String(id), { isRead: true })) as unknown as QuoteMessage;
  }

  /**
   * Mark all messages on a quote as read
   */
  async markQuoteMessagesAsRead(quoteId: string | number): Promise<number> {
    const messages = await this.getQuoteMessages(quoteId);
    const unreadMessages = messages.filter(m => !(m as any).isRead);
    
    await Promise.all(
      unreadMessages.map(m => this.markAsRead((m as any).id))
    );
    
    return unreadMessages.length;
  }

  /**
   * Get unread message count for a quote
   */
  async getUnreadCount(quoteId: string | number): Promise<number> {
    return await quoteMessageRepository.countUnread(String(quoteId));
  }

  /**
   * Update a message
   */
  async updateMessage(id: string | number, input: UpdateMessageInput): Promise<QuoteMessage> {
    return (await quoteMessageRepository.update(String(id), input)) as unknown as QuoteMessage;
  }

  /**
   * Delete a message
   */
  async deleteMessage(id: string | number): Promise<boolean> {
    return await quoteMessageRepository.delete(id);
  }

  /**
   * Get all messages (admin view)
   */
  async getAllMessages(limit?: number, skip?: number): Promise<QuoteMessage[]> {
    return (await quoteMessageRepository.findAll(limit, skip)) as unknown as QuoteMessage[];
  }

  /**
   * Get message count
   */
  async getMessageCount(): Promise<number> {
    return (await quoteMessageRepository.count()) || 0;
  }

  /**
   * Get recent messages
   */
  async getRecentMessages(days: number = 7, limit?: number): Promise<QuoteMessage[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const all = await quoteMessageRepository.findAll(limit);
    return (all?.filter(m => new Date(m.createdAt) >= cutoffDate) || []) as unknown as QuoteMessage[];
  }

  /**
   * Get messages by sender email
   */
  async getMessagesBySender(senderEmail: string): Promise<QuoteMessage[]> {
    const all = await quoteMessageRepository.findAll();
    return (all?.filter(m => (m as any).senderEmail === senderEmail) || []) as unknown as QuoteMessage[];
  }

  /**
   * Get message statistics for a quote
   */
  async getQuoteMessageStats(quoteId: string | number): Promise<{
    total: number;
    unread: number;
    read: number;
  }> {
    const messages = await this.getQuoteMessages(quoteId);
    return {
      total: messages.length,
      unread: messages.filter(m => !(m as any).isRead).length,
      read: messages.filter(m => (m as any).isRead).length,
    };
  }

  /**
   * Validate message input
   */
  private validateMessageInput(input: CreateMessageInput): void {
    if (!input.quoteId) {
      throw new Error('Quote ID is required');
    }
    if (!input.senderEmail?.trim()) {
      throw new Error('Sender email is required');
    }
    if (!input.message?.trim()) {
      throw new Error('Message content is required');
    }
  }
}

export const quoteMessageService = new QuoteMessageService();
