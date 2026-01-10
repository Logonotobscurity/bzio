/**
 * Newsletter Service
 *
 * Business logic layer for newsletter subscriptions.
 * Handles subscriber management and campaign logistics.
 */

import { newsletterSubscriberRepository } from '@/repositories';
import type { NewsletterSubscriber } from '@/lib/types/domain';

interface SubscribeInput {
  email: string;
  firstName?: string;
  lastName?: string;
  interests?: string[];
}

interface UpdateSubscriberInput {
  firstName?: string;
  lastName?: string;
  interests?: string[];
  isActive?: boolean;
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
    if (existing && existing.isActive) {
      throw new Error('Email already subscribed');
    }

    // Create or reactivate subscription
    if (existing && !existing.isActive) {
      return newsletterSubscriberRepository.update(existing.id, {
        isActive: true,
        firstName: input.firstName,
        lastName: input.lastName,
        interests: input.interests,
      });
    }

    return newsletterSubscriberRepository.create({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      interests: input.interests,
      isActive: true,
    });
  }

  /**
   * Unsubscribe an email from newsletter
   */
  async unsubscribe(email: string): Promise<boolean> {
    const subscriber = await newsletterSubscriberRepository.findByEmail(email);
    if (!subscriber) {
      throw new Error('Subscriber not found');
    }

    return newsletterSubscriberRepository.unsubscribe(subscriber.id);
  }

  /**
   * Get all subscribers
   */
  async getAllSubscribers(limit?: number, skip?: number): Promise<NewsletterSubscriber[]> {
    return newsletterSubscriberRepository.findAll(limit, skip);
  }

  /**
   * Get active subscribers only
   */
  async getActiveSubscribers(limit?: number, skip?: number): Promise<NewsletterSubscriber[]> {
    const all = await newsletterSubscriberRepository.findAll(limit, skip);
    return all.filter(s => s.isActive);
  }

  /**
   * Get recent subscribers with limit
   */
  async getRecentSubscribers(limit: number = 50): Promise<NewsletterSubscriber[]> {
    const all = await newsletterSubscriberRepository.findAll(limit, 0);
    return all || [];
  }

  /**
   * Get subscriber count
   */
  async getSubscriberCount(): Promise<number> {
    return this.getTotalSubscriberCount();
  }

  /**
   * Get subscriber by ID
   */
  async getSubscriberById(id: string | number): Promise<NewsletterSubscriber | null> {
    return newsletterSubscriberRepository.findById(id);
  }

  /**
   * Get subscriber by email
   */
  async getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | null> {
    return newsletterSubscriberRepository.findByEmail(email);
  }

  /**
   * Update subscriber details
   */
  async updateSubscriber(
    id: string | number,
    input: UpdateSubscriberInput
  ): Promise<NewsletterSubscriber> {
    return newsletterSubscriberRepository.update(id, input);
  }

  /**
   * Delete a subscriber
   */
  async deleteSubscriber(id: string | number): Promise<boolean> {
    return newsletterSubscriberRepository.delete(id);
  }

  /**
   * Get count of all subscribers
   */
  async getTotalSubscriberCount(): Promise<number> {
    return newsletterSubscriberRepository.count();
  }

  /**
   * Get count of active subscribers
   */
  async getActiveSubscriberCount(): Promise<number> {
    return newsletterSubscriberRepository.countActive();
  }

  /**
   * Get subscribers by interest
   */
  async getSubscribersByInterest(interest: string): Promise<NewsletterSubscriber[]> {
    const all = await newsletterSubscriberRepository.findAll();
    return all.filter(s => s.interests?.includes(interest));
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
