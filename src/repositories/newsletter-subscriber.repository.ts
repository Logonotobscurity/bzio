/**
 * Newsletter Subscriber Repository
 * 
 * Data access layer for Newsletter Subscriber entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma } from '@prisma/client';

type NewsletterSubscriber = Prisma.NewsletterSubscriberGetPayload<{}>;

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
      return await prisma.newsletterSubscriber.findMany({
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
      return await prisma.newsletterSubscriber.findUnique({
        where: { id: String(id) },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByEmail(email: string) {
    try {
      return await prisma.newsletterSubscriber.findUnique({
        where: { email },
      });
    } catch (error) {
      this.handleError(error, 'findByEmail');
    }
  }

  async create(data: CreateNewsletterSubscriberInput) {
    try {
      return await prisma.newsletterSubscriber.create({
        data: {
          email: data.email,
          source: data.source,
          status: data.status || 'active',
          metadata: data.metadata,
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateNewsletterSubscriberInput) {
    try {
      return await prisma.newsletterSubscriber.update({
        where: { id: String(id) },
        data,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number) {
    try {
      await prisma.newsletterSubscriber.delete({
        where: { id: String(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count() {
    try {
      return await prisma.newsletterSubscriber.count();
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Count active subscribers
   */
  async countActive() {
    try {
      return await prisma.newsletterSubscriber.count({
        where: { status: 'active' },
      });
    } catch (error) {
      this.handleError(error, 'countActive');
    }
  }

  /**
   * Unsubscribe a user
   */
  async unsubscribe(id: string) {
    try {
      return await prisma.newsletterSubscriber.update({
        where: { id },
        data: {
          status: 'unsubscribed',
          unsubscribedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, 'unsubscribe');
    }
  }
}

export const newsletterSubscriberRepository = new NewsletterSubscriberRepository();
