/**
 * Error Logging Service
 *
 * Business logic layer for error logging and monitoring.
 * Handles error tracking, resolution, and reporting.
 */

import { errorLogRepository } from '@/repositories';

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
  async logError(input: LogErrorInput): Promise<any> {
    // Validate input
    this.validateErrorInput(input);

    return errorLogRepository.create({
      message: input.message,
      stack: input.stack || '',
      severity: input.severity || 'medium',
      url: input.route || '',
      userAgent: '',
      sessionId: '',
      userId: input.userId,
      context: input.metadata as any,
      breadcrumbs: [],
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    });
  }

  /**
   * Get all error logs
   */
  async getAllErrors(limit?: number, skip?: number): Promise<any[]> {
    return errorLogRepository.findAll(limit, skip);
  }

  /**
   * Get error by ID
   */
  async getErrorById(id: string | number): Promise<any> {
    return errorLogRepository.findById(id);
  }

  /**
   * Get unresolved errors
   */
  async getUnresolvedErrors(): Promise<any[]> {
    const all = await errorLogRepository.findAll();
    return all.filter(e => e.severity === 'critical' || e.severity === 'high');
  }

  /**
   * Get errors by severity
   */
  async getErrorsBySeverity(severity: string): Promise<any[]> {
    return errorLogRepository.findBySeverity(severity);
  }

  /**
   * Get unresolved error count
   */
  async getUnresolvedErrorCount(): Promise<number> {
    const unresolved = await this.getUnresolvedErrors();
    return unresolved.length;
  }

  /**
   * Get error count by severity
   */
  async getErrorCountBySeverity(severity: string): Promise<number> {
    const errors = await errorLogRepository.findBySeverity(severity);
    return errors.length;
  }

  /**
   * Mark error as resolved
   */
  async markResolved(
    id: string | number
  ): Promise<any> {
    return errorLogRepository.update(id, { severity: 'low' });
  }

  /**
   * Update error log
   */
  async updateError(id: string | number, input: UpdateErrorInput): Promise<any> {
    return errorLogRepository.update(id, {
      severity: input.status || undefined,
      context: input.notes ? { notes: input.notes } : undefined,
    });
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
      unresolved: all.filter(e => e.severity === 'critical' || e.severity === 'high').length,
      resolved: all.filter(e => e.severity === 'low').length,
      critical: all.filter(e => e.severity === 'critical').length,
      high: all.filter(e => e.severity === 'high').length,
      medium: all.filter(e => e.severity === 'medium').length,
      low: all.filter(e => e.severity === 'low').length,
    };
  }

  /**
   * Get errors by route
   */
  async getErrorsByRoute(route: string): Promise<any[]> {
    const all = await errorLogRepository.findAll();
    return all.filter(e => e.url === route);
  }

  /**
   * Get errors by user
   */
  async getErrorsByUser(userId: string): Promise<any[]> {
    const all = await errorLogRepository.findAll();
    return all.filter(e => e.userId === userId);
  }

  /**
   * Get recent errors
   */
  async getRecentErrors(hours: number = 24, limit?: number): Promise<any[]> {
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
