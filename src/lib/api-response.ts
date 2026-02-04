/**
 * API Response utilities for standardized response formatting
 * Ensures all API endpoints return consistent response structures
 */

import { NextResponse } from 'next/server';
import { API_ERROR_CODES, formatErrorResponse, formatSuccessResponse } from './error-handler';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  error: null;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  error: {
    code: API_ERROR_CODES;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  statusCode: number = 200,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      error: null,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  code: API_ERROR_CODES,
  statusCode: number,
  message?: string,
  details?: Record<string, any>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: {
        code,
        message: message || getErrorMessage(code),
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Create a 400 Bad Request response
 */
export function badRequest(message?: string, details?: Record<string, any>) {
  return errorResponse(
    API_ERROR_CODES.VALIDATION_ERROR,
    400,
    message,
    details
  );
}

/**
 * Create a 401 Unauthorized response
 */
export function unauthorized(message?: string) {
  return errorResponse(
    API_ERROR_CODES.UNAUTHORIZED,
    401,
    message
  );
}

/**
 * Create a 403 Forbidden response
 */
export function forbidden(message?: string) {
  return errorResponse(
    API_ERROR_CODES.FORBIDDEN,
    403,
    message
  );
}

/**
 * Create a 404 Not Found response
 */
export function notFound(message?: string) {
  return errorResponse(
    API_ERROR_CODES.NOT_FOUND,
    404,
    message
  );
}

/**
 * Create a 409 Conflict response
 */
export function conflict(message?: string, details?: Record<string, any>) {
  return errorResponse(
    API_ERROR_CODES.CONFLICT,
    409,
    message,
    details
  );
}

/**
 * Create a 422 Unprocessable Entity response
 */
export function unprocessableEntity(message?: string, details?: Record<string, any>) {
  return errorResponse(
    API_ERROR_CODES.INVALID_STATE,
    422,
    message,
    details
  );
}

/**
 * Create a 500 Internal Server Error response
 */
export function internalServerError(message?: string) {
  return errorResponse(
    API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    500,
    message
  );
}

/**
 * Get error message for a code
 */
function getErrorMessage(code: API_ERROR_CODES): string {
  const messages: Record<API_ERROR_CODES, string> = {
    [API_ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access',
    [API_ERROR_CODES.FORBIDDEN]: 'Forbidden',
    [API_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid credentials',
    [API_ERROR_CODES.SESSION_EXPIRED]: 'Session expired',
    [API_ERROR_CODES.TOKEN_INVALID]: 'Invalid token',
    [API_ERROR_CODES.VALIDATION_ERROR]: 'Validation error',
    [API_ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Missing required field',
    [API_ERROR_CODES.INVALID_FORMAT]: 'Invalid format',
    [API_ERROR_CODES.INVALID_EMAIL]: 'Invalid email',
    [API_ERROR_CODES.INVALID_PHONE]: 'Invalid phone',
    [API_ERROR_CODES.NOT_FOUND]: 'Not found',
    [API_ERROR_CODES.ALREADY_EXISTS]: 'Already exists',
    [API_ERROR_CODES.CONFLICT]: 'Conflict',
    [API_ERROR_CODES.RESOURCE_LOCKED]: 'Resource locked',
    [API_ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',
    [API_ERROR_CODES.QUOTA_EXCEEDED]: 'Quota exceeded',
    [API_ERROR_CODES.OPERATION_NOT_ALLOWED]: 'Operation not allowed',
    [API_ERROR_CODES.INVALID_STATE]: 'Invalid state',
    [API_ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Internal server error',
    [API_ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service unavailable',
    [API_ERROR_CODES.DATABASE_ERROR]: 'Database error',
    [API_ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'External service error',
    [API_ERROR_CODES.NETWORK_ERROR]: 'Network error',
    [API_ERROR_CODES.TIMEOUT]: 'Request timeout',
    [API_ERROR_CODES.CONNECTION_REFUSED]: 'Connection refused',
    [API_ERROR_CODES.UNKNOWN_ERROR]: 'Unknown error',
  };

  return messages[code] || 'An error occurred';
}
