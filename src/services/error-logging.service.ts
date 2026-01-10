/**
 * Error Logging Service
 *
 * Business logic layer for error logging and monitoring.
 * Handles error tracking, resolution, and reporting.
 */

import { errorLogRepository } from '@/repositories';
import type { ErrorLog } from '@/lib/types/domain';

interface LogErrorInput {
  message: string;
  stack?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  route?: string;
  metadata?: Record<string, unknown>;
}

interface UpdateErrorInput {
  status?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
}

export class ErrorLoggingService {
  /**
   * Log an error
   */
  async logError(input: LogErrorInput): Promise<ErrorLog> {
    // Validate input
    this.validateErrorInput(input);

    return errorLogRepository.create({
      message: input.message,
      stack: input.stack,
      severity: input.severity || 'medium',
      userId: input.userId,
      route: input.route,
      metadata: input.metadata,
      status: 'open',
    });
  }

  /**
   * Get all error logs
   */
  async getAllErrors(limit?: number, skip?: number): Promise<ErrorLog[]> {
    return errorLogRepository.findAll(limit, skip);
  }

  /**
   * Get error by ID
   */
  async getErrorById(id: string | number): Promise<ErrorLog | null> {
    return errorLogRepository.findById(id);
  }

  /**
   * Get unresolved errors
   */
  async getUnresolvedErrors(): Promise<ErrorLog[]> {
    return errorLogRepository.findUnresolved();
  }

  /**
   * Get errors by severity
   */
  async getErrorsBySeverity(severity: string): Promise<ErrorLog[]> {
    return errorLogRepository.findBySeverity(severity);
  }

  /**
   * Get unresolved error count
   */
  async getUnresolvedErrorCount(): Promise<number> {
    return errorLogRepository.countUnresolved();
  }

  /**
   * Get error count by severity
   */
  async getErrorCountBySeverity(severity: string): Promise<number> {
    return errorLogRepository.countBySeverity(severity);
  }

  /**
   * Mark error as resolved
   */
  async markResolved(
    id: string | number,
    resolvedBy: string,
    notes?: string
  ): Promise<ErrorLog> {
    return errorLogRepository.markResolved(id, resolvedBy, notes);
  }

  /**
   * Update error log
   */
  async updateError(id: string | number, input: UpdateErrorInput): Promise<ErrorLog> {
    return errorLogRepository.update(id, input);
  }

  /**
   * Delete error log
   */
  async deleteError(id: string | number): Promise<boolean> {
    return errorLogRepository.delete(id);
  }

  /**
   * Get total error count
   */
  async getErrorCount(): Promise<number> {
    return errorLogRepository.count();
  }

  /**
   * Get error statistics
   */
  async getErrorStats(): Promise<{
    total: number;
    unresolved: number;
    resolved: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }> {
    const all = await errorLogRepository.findAll();

    return {
      total: all.length,
      unresolved: all.filter(e => e.status === 'open').length,
      resolved: all.filter(e => e.status === 'resolved').length,
      critical: all.filter(e => e.severity === 'critical').length,
      high: all.filter(e => e.severity === 'high').length,
      medium: all.filter(e => e.severity === 'medium').length,
      low: all.filter(e => e.severity === 'low').length,
    };
  }

  /**
   * Get errors by route
   */
  async getErrorsByRoute(route: string): Promise<ErrorLog[]> {
    const all = await errorLogRepository.findAll();
    return all.filter(e => e.route === route);
  }

  /**
   * Get errors by user
   */
  async getErrorsByUser(userId: string): Promise<ErrorLog[]> {
    const all = await errorLogRepository.findAll();
    return all.filter(e => e.userId === userId);
  }

  /**
   * Get recent errors
   */
  async getRecentErrors(hours: number = 24, limit?: number): Promise<ErrorLog[]> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    const all = await errorLogRepository.findAll(limit);
    return all.filter(e => new Date(e.createdAt) >= cutoffTime);
  }

  /**
   * Get most common errors
   */
  async getMostCommonErrors(limit: number = 10): Promise<Array<{ message: string; count: number }>> {
    const all = await errorLogRepository.findAll();
    const messageCounts = new Map<string, number>();

    all.forEach(error => {
      messageCounts.set(error.message, (messageCounts.get(error.message) || 0) + 1);
    });

    return Array.from(messageCounts.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Validate error input
   */
  private validateErrorInput(input: LogErrorInput): void {
    if (!input.message?.trim()) {
      throw new Error('Error message is required');
    }
  }
}

export const errorLoggingService = new ErrorLoggingService();
