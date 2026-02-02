/**
 * Analytics Service
 *
 * Business logic layer for analytics and event tracking.
 * Handles event tracking, aggregation, and reporting.
 *
 * This service now wraps the centralized analytics tracking in @/lib/analytics
 * to ensure backward compatibility while migrating to the fire-and-forget pattern.
 */

import * as analytics from '@/lib/analytics';
import type { Prisma } from '@prisma/client';

type AnalyticsEvent = Prisma.AnalyticsEventGetPayload<{}>;

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
  async trackEvent(input: TrackEventInput): Promise<void> {
    return analytics.trackEvent(
      input.eventType,
      input.userId,
      input.metadata || {}
    );
  }

  async getEvents(limit?: number, skip?: number): Promise<AnalyticsEvent[]> {
    return analytics.getEvents(limit, skip) as Promise<AnalyticsEvent[]>;
  }

  async getEventById(id: string | number): Promise<AnalyticsEvent | null> {
    return analytics.getEventById(id) as Promise<AnalyticsEvent | null>;
  }

  async getEventsByType(eventType: string): Promise<AnalyticsEvent[]> {
    return analytics.getEventsByType(eventType) as Promise<AnalyticsEvent[]>;
  }

  async getEventsByUser(userId: number): Promise<AnalyticsEvent[]> {
    return analytics.getEventsByUser(userId) as Promise<AnalyticsEvent[]>;
  }

  async getEventTypeStats(eventType: string): Promise<number> {
    return analytics.getEventTypeStats(eventType);
  }

  async getUserActivityStats(userId: number): Promise<number> {
    return analytics.getUserActivityStats(userId);
  }

  async getAllEvents(limit?: number, skip?: number): Promise<AnalyticsEvent[]> {
    return analytics.getEvents(limit, skip) as Promise<AnalyticsEvent[]>;
  }

  async getEventCount(): Promise<number> {
    return analytics.getEventCount();
  }

  async deleteEvent(id: string | number): Promise<boolean> {
    return analytics.deleteEvent(id);
  }

  async getPopularEvents(limit: number = 10): Promise<Array<{ type: string; count: number }>> {
    return analytics.getPopularEvents(limit);
  }

  async getActiveUsers(limit: number = 10): Promise<Array<{ userId: number; eventCount: number }>> {
    return analytics.getActiveUsers(limit);
  }
}

export const analyticsService = new AnalyticsService();
