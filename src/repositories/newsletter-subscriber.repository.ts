/**
 * Newsletter Subscriber Repository
 * 
 * Data access layer for Newsletter Subscriber entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma } from '@prisma/client';

type NewsletterSubscriber = Prisma.newsletter_subscribersGetPayload<{}>;

interface CreateNewsletterSubscriberInput {
  email: string;
  source: string;
  status?: string;
  metadata?: Prisma.InputJsonValue;
}

interface UpdateNewsletterSubscriberInput {
  status?: string;
  metadata?: Prisma.InputJsonValue;
  unsubscribedAt?: Date;
}

export class NewsletterSubscriberRepository extends BaseRepository<NewsletterSubscriber, CreateNewsletterSubscriberInput, UpdateNewsletterSubscriberInput> {
  async findAll(limit?: number, skip?: number) {
    try {
      return await prisma.newsletter_subscribers.findMany({
        take: limit,
        skip,
        orderBy: { subscribedAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number) {
    try {
      return await prisma.newsletter_subscribers.findUnique({
        where: { id: Number(id) },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByEmail(email: string) {
    try {
      return await prisma.newsletter_subscribers.findUnique({
        where: { email },
      });
    } catch (error) {
      this.handleError(error, 'findByEmail');
    }
  }

  async create(data: CreateNewsletterSubscriberInput) {
    try {
      return await prisma.newsletter_subscribers.create({
        // Only include known fields and cast the rest to avoid schema mismatches
        data: {
          email: data.email,
          metadata: data.metadata,
          ...(data.source ? { source: (data as any).source } : {}),
          ...(data.status ? { status: (data as any).status } : {}),
        } as any,
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateNewsletterSubscriberInput) {
    try {
      return await prisma.newsletter_subscribers.update({
        where: { id: Number(id) },
        data: data as any,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number) {
    try {
      await prisma.newsletter_subscribers.delete({
        where: { id: Number(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count() {
    try {
      return await prisma.newsletter_subscribers.count();
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Count active subscribers
   */
  async countActive() {
    try {
      // `status` may not exist on the generated model; use dynamic delegate to avoid typescript errors
      return await (prisma as any).newsletter_subscribers.count({ where: { status: 'active' } });
    } catch (error) {
      this.handleError(error, 'countActive');
    }
  }

  /**
   * Unsubscribe a user
   */
  async unsubscribe(id: string) {
    try {
      return await prisma.newsletter_subscribers.update({
        where: { id: Number(id) },
        data: { status: ("unsubscribed" as any), unsubscribedAt: new Date() } as any,
      });
    } catch (error) {
      this.handleError(error, 'unsubscribe');
    }
  }
}

export const newsletterSubscriberRepository = new NewsletterSubscriberRepository();
