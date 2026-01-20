/**
 * Analytics Service
 *
 * Business logic layer for analytics and event tracking.
 * Handles event tracking, aggregation, and reporting.
 */

import { analyticsEventRepository } from '@/repositories';
import type { AnalyticsEvent } from '@/lib/types/domain';
import { Prisma } from '@prisma/client';

function mapEvent(row: any): AnalyticsEvent {
  return {
    id: String(row?.id ?? ''),
    eventType: row?.eventType ?? row?.type ?? '',
    userId: row?.userId ?? undefined,
    data: (row?.eventData ?? row?.data) as Record<string, any> || {},
    timestamp: row?.createdAt ?? row?.timestamp ?? new Date(),
  } as AnalyticsEvent;
}

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
      eventData: (input.metadata as Prisma.InputJsonValue) ?? {},
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return mapEvent(result);
  }

  async getEvents(limit?: number, skip?: number): Promise<AnalyticsEvent[]> {
    const rows = await analyticsEventRepository.findAll(limit, skip);
    return (rows || []).map(mapEvent);
  }

  async getEventById(id: string | number): Promise<AnalyticsEvent | null> {
    const row = await analyticsEventRepository.findById(id);
    return row ? mapEvent(row) : null;
  }

  async getEventsByType(eventType: string): Promise<AnalyticsEvent[]> {
    const rows = await analyticsEventRepository.findByEventType(eventType);
    return (rows || []).map(mapEvent);
  }

  async getEventsByUser(userId: number): Promise<AnalyticsEvent[]> {
    const rows = await analyticsEventRepository.findByUserId(userId);
    return (rows || []).map(mapEvent);
  }

  async getEventTypeStats(eventType: string): Promise<number> {
    return analyticsEventRepository.countByEventType(eventType);
  }

  async getUserActivityStats(userId: number): Promise<number> {
    return analyticsEventRepository.count({ userId });
  }

  async getAllEvents(limit?: number, skip?: number): Promise<AnalyticsEvent[]> {
    const rows = await analyticsEventRepository.findAll(limit, skip);
    return (rows || []).map(mapEvent);
  }

  async getEventCount(): Promise<number> {
    return analyticsEventRepository.count();
  }

  async deleteEvent(id: string | number): Promise<boolean> {
    return analyticsEventRepository.delete(id);
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]> {
    const all = await analyticsEventRepository.findAll();
    const mapped = (all || []).map(mapEvent);
    return mapped.filter(e => new Date(e.timestamp) >= startDate && new Date(e.timestamp) <= endDate);
  }

  async getPopularEvents(limit: number = 10): Promise<Array<{ type: string; count: number }>> {
    const all = await analyticsEventRepository.findAll();
    const counts = new Map<string, number>();

    (all || []).forEach(event => {
      const ev = mapEvent(event);
      counts.set(ev.eventType, (counts.get(ev.eventType) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getActiveUsers(limit?: number): Promise<Array<{ userId: number; eventCount: number }>> {
    const all = await analyticsEventRepository.findAll();
    const userCounts = new Map<number, number>();

    (all || []).forEach(event => {
      const ev = mapEvent(event);
      if (ev.userId) {
        userCounts.set(ev.userId, (userCounts.get(ev.userId) || 0) + 1);
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
