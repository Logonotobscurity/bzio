/**
 * Analytics Event Repository
 * 
 * Data access layer for Analytics Event entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma } from '@prisma/client';

type AnalyticsEvent = Prisma.analytics_eventsGetPayload<{}>;

interface CreateAnalyticsEventInput {
  eventType: string;
  userId?: number;
  eventData?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

interface UpdateAnalyticsEventInput {
  eventData?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export class AnalyticsEventRepository extends BaseRepository<AnalyticsEvent, CreateAnalyticsEventInput, UpdateAnalyticsEventInput> {
  async findAll(limit?: number, skip?: number) {
    try {
      return await prisma.analytics_events.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: number) {
    try {
      return await prisma.analytics_events.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateAnalyticsEventInput) {
    try {
      return await prisma.analytics_events.create({
        data: {
          eventType: data.eventType,
          userId: data.userId,
          eventData: data.eventData || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: number, data: UpdateAnalyticsEventInput) {
    try {
      return await prisma.analytics_events.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: number) {
    try {
      await prisma.analytics_events.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count(where?: Record<string, unknown>) {
    try {
      return await prisma.analytics_events.count({ where });
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Find by event type
   */
  async findByEventType(eventType: string, limit?: number) {
    try {
      return await prisma.analytics_events.findMany({
        where: { eventType },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findByEventType');
    }
  }

  /**
   * Find by user
   */
  async findByUserId(userId: number, limit?: number) {
    try {
      return await prisma.analytics_events.findMany({
        where: { userId },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findByUserId');
    }
  }

  /**
   * Count events by type
   */
  async countByEventType(eventType: string) {
    try {
      return await prisma.analytics_events.count({
        where: { eventType },
      });
    } catch (error) {
      this.handleError(error, 'countByEventType');
    }
  }

  /**
   * Track event (convenience method)
   */
  async track(data: CreateAnalyticsEventInput) {
    try {
      return await this.create(data);
    } catch (error) {
      this.handleError(error, 'track');
    }
  }
}

export const analyticsEventRepository = new AnalyticsEventRepository();
