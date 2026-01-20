import { Prisma } from '@prisma/client';
import { prisma } from './dbService';
import { ErrorLogReport } from '@/lib/schema';

/**
 * Stores an error log in the database.
 * 
 * @param errorLog The error log report to store.
 * @returns The created error log record.
 */
export async function storeErrorLog(errorLog: ErrorLogReport) {
  try {
    // Some projects may not have an `error_logs` model in Prisma.
    // Use a dynamic delegate access to avoid compile-time type errors
    // and gracefully fall back to console logging if the model is missing.
    const delegate = (prisma as any).error_logs;
    if (!delegate) {
      console.warn('[ErrorLoggingService] Prisma model `error_logs` not found; logging to console only.');
      console.error(errorLog);
      return null;
    }

    const createdError = await delegate.create({
      data: {
        message: errorLog.message,
        stack: errorLog.stack || '',
        context: errorLog.context as Prisma.InputJsonValue | undefined,
        severity: errorLog.severity,
        url: errorLog.url,
        userAgent: errorLog.userAgent,
        userId: errorLog.userId,
        environment: process.env.NODE_ENV || 'production',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      },
    });
    return createdError;
  } catch (error) {
    console.error('[ErrorLoggingService] Failed to store error log:', error);
    return null;
  }
}

/**
 * Retrieves error logs from the database with optional filtering and pagination.
 * 
 * @param options - Filtering and pagination options.
 * @param options.severity - Filter by severity level.
 * @param options.sessionId - Filter by session ID.
 * @param options.limit - The maximum number of records to return.
 * @param options.cursor - The cursor for pagination.
 * @returns A list of error logs.
 */
export async function getErrorLogs(options: {
  severity?: string;
  sessionId?: string;
  limit?: number;
  cursor?: string;
}) {
  const { severity, sessionId, limit = 50, cursor } = options;

  try {
    const delegate = (prisma as any).error_logs;
    if (!delegate) {
      console.warn('[ErrorLoggingService] Prisma model `error_logs` not found; returning empty list.');
      return [];
    }

    const errorLogs = await delegate.findMany({
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        ...(severity && { severity }),
        ...(sessionId && { sessionId }),
      },
      orderBy: {
        createdAt: 'desc'
      },
    });
    return errorLogs;
  } catch (error) {
    console.error('[ErrorLoggingService] Failed to retrieve error logs:', error);
    return [];
  }
}

/**
 * Deletes an error log from the database.
 * _This is a placeholder and requires robust authentication/authorization._
 * 
 * @param id The ID of the error log to delete.
 * @returns The deleted error log record or null if not found.
 */
export async function deleteErrorLog(id: string) {
  // IMPORTANT: Add robust authentication and authorization checks here
  // to ensure that only authorized users can delete error logs.
  try {
    const delegate = (prisma as any).error_logs;
    if (!delegate) {
      console.warn('[ErrorLoggingService] Prisma model `error_logs` not found; cannot delete.');
      return null;
    }

    const deletedError = await delegate.delete({
      where: { id },
    });
    return deletedError;
  } catch (error) {
    console.error(`[ErrorLoggingService] Failed to delete error log with ID ${id}:`, error);
    return null;
  }
}

/**
 * Sends an alert for a critical error.
 * Placeholder for integration with a notification service.
 * 
 * @param errorLog The critical error to report.
 */
export async function sendAlert(errorLog: ErrorLogReport) {
  // This is a placeholder. In a real application, this would integrate
  // with a notification service like email, Slack, or a dedicated
  // alerting tool to notify developers of critical issues.
  console.log(`[Alert] Critical Error Reported: ${errorLog.message}`);
  // Example: await emailService.send(...)
  // Example: await slackService.postMessage(...)
}
