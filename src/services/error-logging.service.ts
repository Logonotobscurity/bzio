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
  userAgent?: string;
  sessionId?: string;
  breadcrumbs?: any;
  sourceMap?: any;
  environment?: string;
  version?: string;
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
      userAgent: input.userAgent || '',
      sessionId: input.sessionId || '',
      userId: input.userId,
      context: input.metadata as any,
      breadcrumbs: input.breadcrumbs || [],
      sourceMap: input.sourceMap || {},
      environment: input.environment || process.env.NODE_ENV || 'development',
      version: input.version || process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
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
   * Get errors by criteria
   */
  async findErrors(criteria: {
    severity?: string;
    userId?: string;
    route?: string;
    environment?: string;
    limit?: number;
    skip?: number;
  }): Promise<any[]> {
    const all = await errorLogRepository.findAll(criteria.limit, criteria.skip);
    return all.filter(e => {
      if (criteria.severity && e.severity !== criteria.severity) return false;
      if (criteria.userId && e.userId !== criteria.userId) return false;
      if (criteria.route && e.url !== criteria.route) return false;
      if (criteria.environment && e.environment !== criteria.environment) return false;
      return true;
    });
  }

  /**
   * Get unresolved errors
   */
  async getUnresolvedErrors(): Promise<any[]> {
    const all = await errorLogRepository.findAll();
    return all.filter(e => e.severity === 'critical' || e.severity === 'high');
  }

  /**
   * Mark error as resolved
   */
  async markResolved(
    id: string | number,
    resolvedBy: string,
    notes?: string
  ): Promise<any> {
    return errorLogRepository.update(id, {
      severity: 'low',
      context: notes ? { notes, resolvedBy } : undefined
    });
  }

  /**
   * Delete error log
   */
  async deleteError(id: string | number): Promise<boolean> {
    return errorLogRepository.delete(id);
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
   * Validate error input
   */
  private validateErrorInput(input: LogErrorInput): void {
    if (!input.message?.trim()) {
      throw new Error('Error message is required');
    }
  }
}

export const errorLoggingService = new ErrorLoggingService();
