/**
 * Analytics Service
 *
 * Business logic layer for analytics and event tracking.
 * Handles event tracking, aggregation, and reporting.
 */

import { analyticsEventRepository } from '@/repositories';
import type { AnalyticsEvent } from '@/lib/types/domain';
import { Prisma } from '@prisma/client';

interface TrackEventInput {
  eventType: string;
  userId?: number;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class AnalyticsService {
  /**
   * Track a new event
   */
  async trackEvent(input: TrackEventInput): Promise<AnalyticsEvent> {
    this.validateEventInput(input);

    const result = await analyticsEventRepository.track({
      eventType: input.eventType,
      userId: input.userId,
      data: (input.metadata as Prisma.InputJsonValue) ?? {},
      source: 'B2B_PLATFORM',
    });

    return result as AnalyticsEvent;
  }

  async getEvents(limit?: number, skip?: number): Promise<AnalyticsEvent[]> {
    return analyticsEventRepository.findAll(limit, skip) as Promise<AnalyticsEvent[]>;
  }

  async getEventById(id: string | number): Promise<AnalyticsEvent | null> {
    return analyticsEventRepository.findById(id) as Promise<AnalyticsEvent | null>;
  }

  async getEventsByType(eventType: string): Promise<AnalyticsEvent[]> {
    return analyticsEventRepository.findByEventType(eventType) as Promise<AnalyticsEvent[]>;
  }

  async getEventsByUser(userId: number): Promise<AnalyticsEvent[]> {
    return analyticsEventRepository.findByUserId(userId) as Promise<AnalyticsEvent[]>;
  }

  async getEventTypeStats(eventType: string): Promise<number> {
    return analyticsEventRepository.countByEventType(eventType);
  }

  async getUserActivityStats(userId: number): Promise<number> {
    return analyticsEventRepository.count({ userId });
  }

  async getAllEvents(limit?: number, skip?: number): Promise<AnalyticsEvent[]> {
    return analyticsEventRepository.findAll(limit, skip) as Promise<AnalyticsEvent[]>;
  }

  async getEventCount(): Promise<number> {
    return analyticsEventRepository.count();
  }

  async deleteEvent(id: string | number): Promise<boolean> {
    return analyticsEventRepository.delete(id);
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]> {
    const all = await analyticsEventRepository.findAll() as AnalyticsEvent[];
    return all.filter(
      e => new Date(e.timestamp) >= startDate && new Date(e.timestamp) <= endDate
    );
  }

  async getPopularEvents(limit: number = 10): Promise<Array<{ type: string; count: number }>> {
    const all = await analyticsEventRepository.findAll();
    const counts = new Map<string, number>();

    all.forEach(event => {
      counts.set(event.eventType, (counts.get(event.eventType) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getActiveUsers(limit?: number): Promise<Array<{ userId: number; eventCount: number }>> {
    const all = await analyticsEventRepository.findAll();
    const userCounts = new Map<number, number>();

    all.forEach(event => {
      if (event.userId) {
        userCounts.set(event.userId, (userCounts.get(event.userId) || 0) + 1);
      }
    });

    return Array.from(userCounts.entries())
      .map(([userId, eventCount]) => ({ userId, eventCount }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, limit);
  }

  /**
   * Validate event input
   */
  private validateEventInput(input: TrackEventInput): void {
    if (!input.eventType?.trim()) {
      throw new Error('Event type is required');
    }
  }
}

export const analyticsService = new AnalyticsService();
