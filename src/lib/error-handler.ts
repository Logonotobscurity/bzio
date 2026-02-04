/**
 * Centralized error handling utility for the BZION Hub application
 * Provides consistent error codes, messages, and handling across all layers
 */

export enum API_ERROR_CODES {
  // Authentication errors (4xx)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',

  // Validation errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PHONE = 'INVALID_PHONE',

  // Resource errors (4xx)
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',

  // Business logic errors (4xx)
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  INVALID_STATE = 'INVALID_STATE',

  // Server errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',

  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * HTTP status code mapping for error codes
 */
const ERROR_CODE_TO_STATUS: Record<API_ERROR_CODES, number> = {
  // 401 Unauthorized
  [API_ERROR_CODES.UNAUTHORIZED]: 401,
  [API_ERROR_CODES.INVALID_CREDENTIALS]: 401,
  [API_ERROR_CODES.SESSION_EXPIRED]: 401,
  [API_ERROR_CODES.TOKEN_INVALID]: 401,

  // 403 Forbidden
  [API_ERROR_CODES.FORBIDDEN]: 403,
  [API_ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 403,

  // 400 Bad Request
  [API_ERROR_CODES.VALIDATION_ERROR]: 400,
  [API_ERROR_CODES.MISSING_REQUIRED_FIELD]: 400,
  [API_ERROR_CODES.INVALID_FORMAT]: 400,
  [API_ERROR_CODES.INVALID_EMAIL]: 400,
  [API_ERROR_CODES.INVALID_PHONE]: 400,

  // 404 Not Found
  [API_ERROR_CODES.NOT_FOUND]: 404,

  // 409 Conflict
  [API_ERROR_CODES.ALREADY_EXISTS]: 409,
  [API_ERROR_CODES.CONFLICT]: 409,
  [API_ERROR_CODES.RESOURCE_LOCKED]: 409,

  // 429 Too Many Requests
  [API_ERROR_CODES.QUOTA_EXCEEDED]: 429,

  // 422 Unprocessable Entity
  [API_ERROR_CODES.INVALID_STATE]: 422,
  [API_ERROR_CODES.OPERATION_NOT_ALLOWED]: 422,

  // 500 Internal Server Error
  [API_ERROR_CODES.INTERNAL_SERVER_ERROR]: 500,
  [API_ERROR_CODES.DATABASE_ERROR]: 500,
  [API_ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 502,

  // 503 Service Unavailable
  [API_ERROR_CODES.SERVICE_UNAVAILABLE]: 503,

  // 408 Request Timeout
  [API_ERROR_CODES.TIMEOUT]: 408,

  // 503 Service Unavailable
  [API_ERROR_CODES.CONNECTION_REFUSED]: 503,

  // 500 Internal Server Error (fallback)
  [API_ERROR_CODES.NETWORK_ERROR]: 500,
  [API_ERROR_CODES.UNKNOWN_ERROR]: 500,
};

/**
 * User-friendly error messages
 */
const ERROR_CODE_TO_MESSAGE: Record<API_ERROR_CODES, string> = {
  [API_ERROR_CODES.UNAUTHORIZED]: 'You are not authorized to access this resource. Please log in.',
  [API_ERROR_CODES.FORBIDDEN]: 'You do not have permission to perform this action.',
  [API_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [API_ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [API_ERROR_CODES.TOKEN_INVALID]: 'Your authentication token is invalid. Please log in again.',
  [API_ERROR_CODES.VALIDATION_ERROR]: 'The data you provided is invalid. Please check and try again.',
  [API_ERROR_CODES.MISSING_REQUIRED_FIELD]: 'One or more required fields are missing.',
  [API_ERROR_CODES.INVALID_FORMAT]: 'The format of the data is invalid.',
  [API_ERROR_CODES.INVALID_EMAIL]: 'Please provide a valid email address.',
  [API_ERROR_CODES.INVALID_PHONE]: 'Please provide a valid phone number.',
  [API_ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [API_ERROR_CODES.ALREADY_EXISTS]: 'This resource already exists.',
  [API_ERROR_CODES.CONFLICT]: 'There is a conflict with the current state of the resource.',
  [API_ERROR_CODES.RESOURCE_LOCKED]: 'This resource is currently locked. Please try again later.',
  [API_ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'You do not have sufficient permissions to perform this action.',
  [API_ERROR_CODES.QUOTA_EXCEEDED]: 'You have exceeded your quota. Please upgrade your plan.',
  [API_ERROR_CODES.OPERATION_NOT_ALLOWED]: 'This operation is not allowed at this time.',
  [API_ERROR_CODES.INVALID_STATE]: 'The resource is in an invalid state for this operation.',
  [API_ERROR_CODES.INTERNAL_SERVER_ERROR]: 'An internal server error occurred. Please try again later.',
  [API_ERROR_CODES.SERVICE_UNAVAILABLE]: 'The service is currently unavailable. Please try again later.',
  [API_ERROR_CODES.DATABASE_ERROR]: 'A database error occurred. Please try again later.',
  [API_ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'An external service error occurred. Please try again later.',
  [API_ERROR_CODES.NETWORK_ERROR]: 'A network error occurred. Please check your connection.',
  [API_ERROR_CODES.TIMEOUT]: 'The request timed out. Please try again.',
  [API_ERROR_CODES.CONNECTION_REFUSED]: 'Could not connect to the server. Please try again.',
  [API_ERROR_CODES.UNKNOWN_ERROR]: 'An unknown error occurred. Please try again.',
};

/**
 * Extended error information interface
 */
export interface AppError {
  code: API_ERROR_CODES;
  message: string;
  status: number;
  details?: Record<string, any>;
  originalError?: Error;
  timestamp: string;
  requestId?: string;
}

/**
 * Handle an error and return standardized error information
 * @param error - The error to handle (can be any type)
 * @param requestId - Optional request ID for tracking
 * @returns Standardized error object
 */
export function handleApiError(
  error: unknown,
  requestId?: string
): AppError {
  let code: API_ERROR_CODES = API_ERROR_CODES.UNKNOWN_ERROR;
  let message: string = ERROR_CODE_TO_MESSAGE[code];
  let details: Record<string, any> | undefined;
  let originalError: Error | undefined;

  if (error instanceof Error) {
    originalError = error;
    message = error.message;

    // Detect specific error types
    if (error.message.includes('Unauthorized') || error.message.includes('401')) {
      code = API_ERROR_CODES.UNAUTHORIZED;
    } else if (error.message.includes('Forbidden') || error.message.includes('403')) {
      code = API_ERROR_CODES.FORBIDDEN;
    } else if (error.message.includes('Not Found') || error.message.includes('404')) {
      code = API_ERROR_CODES.NOT_FOUND;
    } else if (error.message.includes('validation') || error.message.includes('Validation')) {
      code = API_ERROR_CODES.VALIDATION_ERROR;
    } else if (error.message.includes('Database') || error.message.includes('database')) {
      code = API_ERROR_CODES.DATABASE_ERROR;
    } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      code = API_ERROR_CODES.TIMEOUT;
    }
  } else if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, any>;

    if (errorObj.code) {
      code = errorObj.code as API_ERROR_CODES;
      message = errorObj.message || ERROR_CODE_TO_MESSAGE[code] || message;
    }

    if (errorObj.details) {
      details = errorObj.details;
    }

    if (errorObj.originalError instanceof Error) {
      originalError = errorObj.originalError;
    }
  } else if (typeof error === 'string') {
    message = error;
  }

  return {
    code,
    message: ERROR_CODE_TO_MESSAGE[code] || message,
    status: ERROR_CODE_TO_STATUS[code],
    details,
    originalError,
    timestamp: new Date().toISOString(),
    requestId,
  };
}

/**
 * Log an error with context information
 * @param error - The error to log
 * @param context - Context information (e.g., function name, endpoint)
 * @param requestId - Optional request ID for tracking
 */
export function logError(
  error: unknown,
  context: string,
  requestId?: string
): void {
  const appError = handleApiError(error, requestId);

  const logData = {
    timestamp: appError.timestamp,
    context,
    code: appError.code,
    message: appError.message,
    status: appError.status,
    requestId: requestId || 'N/A',
    details: appError.details,
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', logData);
    if (appError.originalError) {
      console.error('[Original Error]', appError.originalError);
    }
  }

  // In production, could send to monitoring service (future implementation)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to monitoring service (e.g., Sentry, DataDog)
    // sendToMonitoring(logData);
  }
}

/**
 * Get user-friendly error message
 * @param error - The error to convert
 * @returns User-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  const appError = handleApiError(error);
  return appError.message;
}

/**
 * Check if error is client error (4xx)
 */
export function isClientError(error: unknown): boolean {
  const appError = handleApiError(error);
  return appError.status >= 400 && appError.status < 500;
}

/**
 * Check if error is server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  const appError = handleApiError(error);
  return appError.status >= 500 && appError.status < 600;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const appError = handleApiError(error);

  // Retry on server errors and specific client errors
  const retryableCodes = [
    API_ERROR_CODES.TIMEOUT,
    API_ERROR_CODES.CONNECTION_REFUSED,
    API_ERROR_CODES.SERVICE_UNAVAILABLE,
    API_ERROR_CODES.EXTERNAL_SERVICE_ERROR,
    API_ERROR_CODES.DATABASE_ERROR,
  ];

  return retryableCodes.includes(appError.code);
}

/**
 * Format error for API response
 */
export function formatErrorResponse(
  code: API_ERROR_CODES,
  message?: string,
  details?: Record<string, any>
) {
  return {
    success: false,
    error: {
      code,
      message: message || ERROR_CODE_TO_MESSAGE[code],
      ...(details && { details }),
    },
  };
}

/**
 * Format success response (for consistency)
 */
export function formatSuccessResponse<T>(
  data: T,
  message?: string
) {
  return {
    success: true,
    data,
    ...(message && { message }),
    error: null as null,
  };
}
