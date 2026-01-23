/**
 * Analytics Event Repository
 * 
 * Data access layer for Analytics Event entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma, analytics_events as AnalyticsEvent } from '@prisma/client';

interface CreateAnalyticsEventInput {
  eventType: string;
  userId?: number | string;
  eventData?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
  title?: string;
  description?: string;
  referenceId?: string;
  referenceType?: string;
}

interface UpdateAnalyticsEventInput {
  eventData?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
  title?: string;
  description?: string;
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

  async findById(id: number | string) {
    try {
      return await prisma.analytics_events.findUnique({
        where: { id: Number(id) },
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
          userId: data.userId ? Number(data.userId) : undefined,
          eventData: data.eventData || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          title: data.title,
          description: data.description,
          referenceId: data.referenceId,
          referenceType: data.referenceType,
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: number | string, data: UpdateAnalyticsEventInput) {
    try {
      return await prisma.analytics_events.update({
        where: { id: Number(id) },
        data,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: number | string) {
    try {
      await prisma.analytics_events.delete({
        where: { id: Number(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count(where?: Record<string, unknown>) {
    try {
      return await prisma.analytics_events.count({ where: where as any });
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
  async findByUserId(userId: number | string, limit?: number) {
    try {
      return await prisma.analytics_events.findMany({
        where: { userId: Number(userId) },
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
