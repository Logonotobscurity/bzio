/**
 * Analytics Event Repository
 * 
 * Data access layer for Analytics Event entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma } from '@prisma/client';

type AnalyticsEvent = Prisma.AnalyticsEventGetPayload<{}>;

interface CreateAnalyticsEventInput {
  eventType: string;
  userId?: number;
  sessionId?: string;
  data?: Prisma.InputJsonValue;
  source?: string;
}

interface UpdateAnalyticsEventInput {
  data?: Prisma.InputJsonValue;
}

export class AnalyticsEventRepository extends BaseRepository<AnalyticsEvent, CreateAnalyticsEventInput, UpdateAnalyticsEventInput> {
  async findAll(limit?: number, skip?: number) {
    try {
      return await prisma.analyticsEvent.findMany({
        take: limit,
        skip,
        orderBy: { timestamp: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number) {
    try {
      return await prisma.analyticsEvent.findUnique({
        where: { id: String(id) },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateAnalyticsEventInput) {
    try {
      return await prisma.analyticsEvent.create({
        data: {
          eventType: data.eventType,
          userId: data.userId,
          sessionId: data.sessionId,
          data: data.data || {},
          source: data.source || 'B2B_PLATFORM',
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateAnalyticsEventInput) {
    try {
      return await prisma.analyticsEvent.update({
        where: { id: String(id) },
        data,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number) {
    try {
      await prisma.analyticsEvent.delete({
        where: { id: String(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count(where?: Record<string, unknown>) {
    try {
      return await prisma.analyticsEvent.count({ where });
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Find by event type
   */
  async findByEventType(eventType: string, limit?: number) {
    try {
      return await prisma.analyticsEvent.findMany({
        where: { eventType },
        take: limit,
        orderBy: { timestamp: 'desc' },
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
      return await prisma.analyticsEvent.findMany({
        where: { userId },
        take: limit,
        orderBy: { timestamp: 'desc' },
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
      return await prisma.analyticsEvent.count({
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
