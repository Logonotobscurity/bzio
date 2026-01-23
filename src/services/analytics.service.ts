/**
 * Analytics Service
 *
 * Business logic layer for analytics and event tracking.
 * Handles event tracking, aggregation, and reporting.
 */

import { analyticsEventRepository } from '@/repositories';
import type { Prisma, analytics_events as AnalyticsEventRow } from '@prisma/client';

export interface AnalyticsEvent {
  id: string;
  eventType: string;
  userId?: number;
  data: Record<string, any>;
  timestamp: Date;
  title?: string;
  description?: string;
}

function mapEvent(row: AnalyticsEventRow): AnalyticsEvent {
  return {
    id: String(row.id),
    eventType: row.eventType,
    userId: row.userId ?? undefined,
    data: (row.eventData as Record<string, any>) || {},
    timestamp: row.createdAt,
    title: row.title || undefined,
    description: row.description || undefined,
  };
}

interface TrackEventInput {
  eventType: string;
  userId?: number | string;
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  referenceId?: string;
  referenceType?: string;
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
      title: input.title,
      description: input.description,
      referenceId: input.referenceId,
      referenceType: input.referenceType,
    });

    if (!result) throw new Error("Failed to track event");
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

  async getEventsByUser(userId: number | string): Promise<AnalyticsEvent[]> {
    const rows = await analyticsEventRepository.findByUserId(userId);
    return (rows || []).map(mapEvent);
  }

  async getEventTypeStats(eventType: string): Promise<number> {
    return (await analyticsEventRepository.countByEventType(eventType)) || 0;
  }

  async getUserActivityStats(userId: number | string): Promise<number> {
    return (await analyticsEventRepository.count({ userId: Number(userId) })) || 0;
  }

  async getAllEvents(limit?: number, skip?: number): Promise<AnalyticsEvent[]> {
    const rows = await analyticsEventRepository.findAll(limit, skip);
    return (rows || []).map(mapEvent);
  }

  async getEventCount(): Promise<number> {
    return (await analyticsEventRepository.count()) || 0;
  }

  async deleteEvent(id: string | number): Promise<boolean> {
    return analyticsEventRepository.delete(id);
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
