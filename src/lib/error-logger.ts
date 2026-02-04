/**
 * Error logging utility for centralized error tracking and monitoring
 * Supports different log levels and contextual information
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

export interface LogContext {
  userId?: string | number;
  endpoint?: string;
  method?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, any>;
}

class ErrorLogger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context, undefined, metadata);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context, undefined, metadata);
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context, undefined, metadata);
  }

  /**
   * Log an error
   */
  error(
    message: string,
    error?: Error | unknown,
    context?: LogContext,
    metadata?: Record<string, any>
  ): void {
    this.log(LogLevel.ERROR, message, context, error, metadata);
  }

  /**
   * Log a fatal error
   */
  fatal(
    message: string,
    error?: Error | unknown,
    context?: LogContext,
    metadata?: Record<string, any>
  ): void {
    this.log(LogLevel.FATAL, message, context, error, metadata);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error | unknown,
    metadata?: Record<string, any>
  ): void {
    // Skip if log level is below threshold
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry = this.buildLogEntry(level, message, context, error, metadata);

    // Log to console in development
    if (this.isDevelopment) {
      this.logToConsole(logEntry);
    }

    // Send to monitoring service in production
    if (this.isProduction) {
      this.sendToMonitoring(logEntry);
    }
  }

  /**
   * Build a log entry object
   */
  private buildLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error | unknown,
    metadata?: Record<string, any>
  ): LogEntry {
    const errorObj = error ? this.parseError(error) : undefined;

    return {
      level,
      timestamp: new Date().toISOString(),
      message,
      context,
      error: errorObj,
      metadata,
    };
  }

  /**
   * Parse error to extract message and stack
   */
  private parseError(error: Error | unknown): { message: string; stack?: string; code?: string } {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    }

    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, any>;
      return {
        message: errorObj.message || String(error),
        stack: errorObj.stack,
        code: errorObj.code,
      };
    }

    return {
      message: String(error),
    };
  }

  /**
   * Check if message should be logged based on level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);

    return messageIndex >= currentIndex;
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level}]`;
    const style = this.getConsoleStyle(entry.level);

    console.log(
      `%c${prefix} ${entry.message}`,
      style,
      {
        context: entry.context,
        error: entry.error,
        metadata: entry.metadata,
      }
    );

    // Log full stack if available
    if (entry.error?.stack) {
      console.error(entry.error.stack);
    }
  }

  /**
   * Get console styling for different log levels
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: 'color: #999; font-weight: normal;',
      [LogLevel.INFO]: 'color: #2196F3; font-weight: normal;',
      [LogLevel.WARN]: 'color: #FF9800; font-weight: bold;',
      [LogLevel.ERROR]: 'color: #F44336; font-weight: bold;',
      [LogLevel.FATAL]: 'color: #8B0000; font-weight: bold;',
    };

    return styles[level];
  }

  /**
   * Send to external monitoring service
   * Placeholder for future integration (Sentry, DataDog, etc.)
   */
  private sendToMonitoring(entry: LogEntry): void {
    // TODO: Implement monitoring service integration
    // Examples:
    // - Sentry.captureException()
    // - DataDog.logger.log()
    // - Custom logging API

    // For now, just log critical errors to console
    if (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL) {
      console.error('[MONITORING]', entry);
    }
  }
}

/**
 * Global error logger instance
 */
export const errorLogger = new ErrorLogger();

/**
 * Log context builder for adding contextual information
 */
export class ContextBuilder {
  private context: LogContext = {};

  withUserId(userId: string | number): this {
    this.context.userId = userId;
    return this;
  }

  withEndpoint(endpoint: string): this {
    this.context.endpoint = endpoint;
    return this;
  }

  withMethod(method: string): this {
    this.context.method = method;
    return this;
  }

  withRequestId(requestId: string): this {
    this.context.requestId = requestId;
    return this;
  }

  withUserAgent(userAgent: string): this {
    this.context.userAgent = userAgent;
    return this;
  }

  withIp(ip: string): this {
    this.context.ip = ip;
    return this;
  }

  withCustom(key: string, value: any): this {
    this.context[key] = value;
    return this;
  }

  build(): LogContext {
    return this.context;
  }
}

/**
 * Create a new context builder
 */
export function createContext(): ContextBuilder {
  return new ContextBuilder();
}
