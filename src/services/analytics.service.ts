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
import type { AnalyticsEvent } from '@/lib/types/domain';

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
  async trackEvent(input: TrackEventInput): Promise<any> {
    return analytics.trackEvent(
      input.eventType,
      input.userId,
      input.metadata || {}
    );
  }

  async getEvents(limit?: number, skip?: number): Promise<any[]> {
    return analytics.getEvents(limit, skip);
  }

  async getEventById(id: string | number): Promise<any> {
    return analytics.getEventById(id);
  }

  async getEventsByType(eventType: string): Promise<any[]> {
    return analytics.getEventsByType(eventType);
  }

  async getEventsByUser(userId: number): Promise<any[]> {
    return analytics.getEventsByUser(userId);
  }

  async getEventTypeStats(eventType: string): Promise<number> {
    return analytics.getEventTypeStats(eventType);
  }

  async getUserActivityStats(userId: number): Promise<number> {
    return analytics.getUserActivityStats(userId);
  }

  async getAllEvents(limit?: number, skip?: number): Promise<any[]> {
    return analytics.getEvents(limit, skip);
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
