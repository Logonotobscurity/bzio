/**
 * Error Log Repository
 * 
 * Data access layer for Error Log entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma } from '@prisma/client';

type ErrorLog = Prisma.error_logsGetPayload<{}>;

interface CreateErrorLogInput {
  message: string;
  stack?: string;
  context?: Prisma.InputJsonValue;
  severity: string;
  url: string;
  userAgent?: string;
  sessionId: string;
  userId?: string;
  breadcrumbs?: Prisma.InputJsonValue;
  sourceMap?: Prisma.InputJsonValue;
  environment: string;
  version: string;
}

interface UpdateErrorLogInput {
  context?: Prisma.InputJsonValue;
  severity?: string;
}

export class ErrorLogRepository extends BaseRepository<ErrorLog, CreateErrorLogInput, UpdateErrorLogInput> {
  async findAll(limit?: number, skip?: number) {
    try {
      return await prisma.error_logs.findMany({
        take: limit,
        skip,
        orderBy: { timestamp: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number) {
    try {
      return await prisma.error_logs.findUnique({
        where: { id: String(id) },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateErrorLogInput) {
    try {
      return await prisma.error_logs.create({
        data: {
          message: data.message,
          stack: data.stack,
          context: data.context,
          severity: data.severity,
          url: data.url,
          userAgent: data.userAgent,
          sessionId: data.sessionId,
          userId: data.userId,
          breadcrumbs: data.breadcrumbs,
          sourceMap: data.sourceMap,
          environment: data.environment,
          version: data.version,
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateErrorLogInput) {
    try {
      return await prisma.error_logs.update({
        where: { id: String(id) },
        data,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number) {
    try {
      await prisma.error_logs.delete({
        where: { id: String(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count() {
    try {
      return await prisma.error_logs.count();
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Find by severity
   */
  async findBySeverity(severity: string, limit?: number) {
    try {
      return await prisma.error_logs.findMany({
        where: { severity },
        take: limit,
        orderBy: { timestamp: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findBySeverity');
    }
  }

  /**
   * Find recent errors
   */
  async findRecent(limit: number = 10) {
    try {
      return await prisma.error_logs.findMany({
        take: limit,
        orderBy: { timestamp: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findRecent');
    }
  }

  /**
   * Find errors for user
   */
  async findByUserId(userId: string, limit?: number) {
    try {
      return await prisma.error_logs.findMany({
        where: { userId },
        take: limit,
        orderBy: { timestamp: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findByUserId');
    }
  }
}

export const errorLogRepository = new ErrorLogRepository();
