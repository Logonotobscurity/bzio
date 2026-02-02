/**
 * Error Logging Service
 *
 * Business logic layer for error logging and monitoring.
 * Handles error tracking, resolution, and reporting.
 */

import { errorLogRepository } from '@/repositories';
import type { Prisma } from '@prisma/client';

type ErrorLog = Prisma.ErrorLogGetPayload<{}>;

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
  async logError(input: LogErrorInput): Promise<ErrorLog> {
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
      context: input.metadata as Prisma.InputJsonValue,
      breadcrumbs: input.breadcrumbs as Prisma.InputJsonValue || [],
      sourceMap: input.sourceMap as Prisma.InputJsonValue || {},
      environment: input.environment || process.env.NODE_ENV || 'development',
      version: input.version || process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    }) as Promise<ErrorLog>;
  }

  /**
   * Get all error logs
   */
  async getAllErrors(limit?: number, skip?: number): Promise<ErrorLog[]> {
    return errorLogRepository.findAll(limit, skip) as Promise<ErrorLog[]>;
  }

  /**
   * Get error by ID
   */
  async getErrorById(id: string | number): Promise<ErrorLog | null> {
    return errorLogRepository.findById(id) as Promise<ErrorLog | null>;
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
    hoursSince?: number;
  }): Promise<ErrorLog[]> {
    const where: Prisma.ErrorLogWhereInput = {
      ...(criteria.severity && { severity: criteria.severity }),
      ...(criteria.userId && { userId: criteria.userId }),
      ...(criteria.route && { url: criteria.route }),
      ...(criteria.environment && { environment: criteria.environment }),
      ...(criteria.hoursSince && {
        timestamp: {
          gte: new Date(Date.now() - criteria.hoursSince * 60 * 60 * 1000),
        },
      }),
    };

    return errorLogRepository.findAll(criteria.limit, criteria.skip, where) as Promise<ErrorLog[]>;
  }

  /**
   * Get total count matching criteria
   */
  async getCount(criteria: {
    severity?: string;
    userId?: string;
    route?: string;
    environment?: string;
    hoursSince?: number;
  }): Promise<number> {
    const where: Prisma.ErrorLogWhereInput = {
      ...(criteria.severity && { severity: criteria.severity }),
      ...(criteria.userId && { userId: criteria.userId }),
      ...(criteria.route && { url: criteria.route }),
      ...(criteria.environment && { environment: criteria.environment }),
      ...(criteria.hoursSince && {
        timestamp: {
          gte: new Date(Date.now() - criteria.hoursSince * 60 * 60 * 1000),
        },
      }),
    };

    return errorLogRepository.count(where) as Promise<number>;
  }

  /**
   * Get unresolved errors
   */
  async getUnresolvedErrors(): Promise<ErrorLog[]> {
    return errorLogRepository.findAll(undefined, undefined, {
      severity: { in: ['critical', 'high'] },
    }) as Promise<ErrorLog[]>;
  }

  /**
   * Mark error as resolved
   */
  async markResolved(
    id: string | number,
    resolvedBy: string,
    notes?: string
  ): Promise<ErrorLog> {
    return errorLogRepository.update(id, {
      severity: 'low',
      context: notes ? ({ notes, resolvedBy } as any) : undefined
    }) as Promise<ErrorLog>;
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
