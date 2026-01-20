/**
 * Newsletter Service
 *
 * Business logic layer for newsletter subscriptions.
 * Handles subscriber management and campaign logistics.
 */

import { newsletterSubscriberRepository } from '@/repositories';
import type { NewsletterSubscriber } from '@/lib/types/domain';
import type { Prisma } from '@prisma/client';

interface SubscribeInput {
  email: string;
  source?: string;
  status?: string;
  metadata?: Prisma.InputJsonValue;
}

interface UpdateSubscriberInput {
  status?: string;
  metadata?: Prisma.InputJsonValue;
  unsubscribedAt?: Date;
}

export class NewsletterService {
  /**
   * Subscribe a new email to newsletter
   */
  async subscribe(input: SubscribeInput): Promise<NewsletterSubscriber> {
    // Validate email
    this.validateEmail(input.email);

    // Check if already subscribed
    const existing = await newsletterSubscriberRepository.findByEmail(input.email);
    // support both legacy `status` field and newer `isActive` boolean
    const alreadyActive = existing && ((existing as any).status === 'active' || (existing as any).isActive === true);
    if (alreadyActive) {
      throw new Error('Email already subscribed');
    }

    // Create or reactivate subscription
    if (existing && !alreadyActive) {
      return (await newsletterSubscriberRepository.update(existing.id, {
        status: 'active',
        metadata: input.metadata,
        unsubscribedAt: null,
      })) as unknown as NewsletterSubscriber;
    }

    return (await newsletterSubscriberRepository.create({
      email: input.email,
      source: input.source || 'web',
      status: input.status || 'active',
      metadata: input.metadata,
    })) as unknown as NewsletterSubscriber;
  }

  /**
   * Unsubscribe an email from newsletter
   */
  async unsubscribe(email: string): Promise<NewsletterSubscriber> {
    const subscriber = await newsletterSubscriberRepository.findByEmail(email);
    if (!subscriber) {
      throw new Error('Subscriber not found');
    }

    return (await newsletterSubscriberRepository.unsubscribe(String((subscriber as any).id))) as unknown as NewsletterSubscriber;
  }

  /**
   * Get all subscribers
   */
  async getAllSubscribers(limit?: number, skip?: number): Promise<NewsletterSubscriber[]> {
    return (await newsletterSubscriberRepository.findAll(limit, skip)) as unknown as NewsletterSubscriber[];
  }

  /**
   * Get active subscribers only
   */
  async getActiveSubscribers(limit?: number, skip?: number): Promise<NewsletterSubscriber[]> {
    const all = await newsletterSubscriberRepository.findAll(limit, skip);
    return (all?.filter(s => (s as any).status === 'active' || (s as any).isActive === true) || []) as unknown as NewsletterSubscriber[];
  }

  /**
   * Get recent subscribers with limit
   */
  async getRecentSubscribers(limit: number = 50): Promise<NewsletterSubscriber[]> {
    const all = await newsletterSubscriberRepository.findAll(limit, 0);
    return (all || []) as unknown as NewsletterSubscriber[];
  }

  /**
   * Get subscriber count
   */
  async getSubscriberCount(): Promise<number> {
    return await this.getTotalSubscriberCount();
  }

  /**
   * Get subscriber by ID
   */
  async getSubscriberById(id: string | number): Promise<NewsletterSubscriber | null> {
    return (await newsletterSubscriberRepository.findById(id)) as unknown as NewsletterSubscriber | null;
  }

  /**
   * Get subscriber by email
   */
  async getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | null> {
    return (await newsletterSubscriberRepository.findByEmail(email)) as unknown as NewsletterSubscriber | null;
  }

  /**
   * Update subscriber details
   */
  async updateSubscriber(
    id: string | number,
    input: UpdateSubscriberInput
  ): Promise<NewsletterSubscriber> {
    return (await newsletterSubscriberRepository.update(id, input)) as unknown as NewsletterSubscriber;
  }

  /**
   * Delete a subscriber
   */
  async deleteSubscriber(id: string | number): Promise<boolean> {
    return await newsletterSubscriberRepository.delete(id);
  }

  /**
   * Get count of all subscribers
   */
  async getTotalSubscriberCount(): Promise<number> {
    return (await newsletterSubscriberRepository.count()) || 0;
  }

  /**
   * Get count of active subscribers
   */
  async getActiveSubscriberCount(): Promise<number> {
    return (await newsletterSubscriberRepository.countActive()) || 0;
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }
}

export const newsletterService = new NewsletterService();
