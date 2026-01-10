/**
 * Quote Message Service
 *
 * Business logic layer for quote messages/communications.
 * Handles message threading, status tracking, and notifications.
 */

import { quoteMessageRepository } from '@/repositories';
import type { QuoteMessage } from '@/lib/types/domain';

interface CreateMessageInput {
  quoteId: string | number;
  userId: string;
  message: string;
  messageType?: string;
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

    return quoteMessageRepository.create({
      quoteId: Number(input.quoteId),
      userId: input.userId,
      message: input.message,
      messageType: input.messageType || 'comment',
      isRead: false,
    });
  }

  /**
   * Get all messages for a quote
   */
  async getQuoteMessages(quoteId: string | number): Promise<QuoteMessage[]> {
    return quoteMessageRepository.findByQuoteId(Number(quoteId));
  }

  /**
   * Get a specific message
   */
  async getMessageById(id: string | number): Promise<QuoteMessage | null> {
    return quoteMessageRepository.findById(id);
  }

  /**
   * Mark message as read
   */
  async markAsRead(id: string | number): Promise<QuoteMessage> {
    return quoteMessageRepository.markAsRead(id);
  }

  /**
   * Mark all messages on a quote as read
   */
  async markQuoteMessagesAsRead(quoteId: string | number): Promise<number> {
    const messages = await this.getQuoteMessages(quoteId);
    await Promise.all(messages.filter(m => !m.isRead).map(m => this.markAsRead(m.id)));
    return messages.filter(m => !m.isRead).length;
  }

  /**
   * Get unread message count for a quote
   */
  async getUnreadCount(quoteId: string | number): Promise<number> {
    return quoteMessageRepository.countUnread(Number(quoteId));
  }

  /**
   * Update a message
   */
  async updateMessage(id: string | number, input: UpdateMessageInput): Promise<QuoteMessage> {
    return quoteMessageRepository.update(id, input);
  }

  /**
   * Delete a message
   */
  async deleteMessage(id: string | number): Promise<boolean> {
    return quoteMessageRepository.delete(id);
  }

  /**
   * Get all messages (admin view)
   */
  async getAllMessages(limit?: number, skip?: number): Promise<QuoteMessage[]> {
    return quoteMessageRepository.findAll(limit, skip);
  }

  /**
   * Get message count
   */
  async getMessageCount(): Promise<number> {
    return quoteMessageRepository.count();
  }

  /**
   * Get recent messages
   */
  async getRecentMessages(days: number = 7, limit?: number): Promise<QuoteMessage[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const all = await quoteMessageRepository.findAll(limit);
    return all.filter(m => new Date(m.createdAt) >= cutoffDate);
  }

  /**
   * Get messages by user
   */
  async getMessagesByUser(userId: string): Promise<QuoteMessage[]> {
    const all = await quoteMessageRepository.findAll();
    return all.filter(m => m.userId === userId);
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
      unread: messages.filter(m => !m.isRead).length,
      read: messages.filter(m => m.isRead).length,
    };
  }

  /**
   * Validate message input
   */
  private validateMessageInput(input: CreateMessageInput): void {
    if (!input.quoteId) {
      throw new Error('Quote ID is required');
    }
    if (!input.userId?.trim()) {
      throw new Error('User ID is required');
    }
    if (!input.message?.trim()) {
      throw new Error('Message content is required');
    }
  }
}

export const quoteMessageService = new QuoteMessageService();
