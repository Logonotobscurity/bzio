/**
 * Safe JSON stringify utility that handles circular references and non-serializable objects
 * Prevents errors from being lost when serializing for logging
 */

interface SerializedObject {
  [key: string]: unknown;
}

/**
 * Safely stringify an object, handling circular references and non-serializable values
 * @param obj Object to stringify
 * @param space Indentation space (optional)
 * @returns Safe JSON string
 */
export function safeStringify(obj: unknown, space?: number | string): string {
  const seen = new WeakSet<object>();
  const replacer = (_key: string, value: unknown): unknown => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value as object)) {
        return '[Circular]';
      }
      seen.add(value as object);
    }

    // Handle Error objects specially
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    // Handle undefined
    if (typeof value === 'undefined') {
      return '[undefined]';
    }

    // Handle functions
    if (typeof value === 'function') {
      return `[Function: ${value.name || 'anonymous'}]`;
    }

    // Handle symbols
    if (typeof value === 'symbol') {
      return `[Symbol: ${value.toString()}]`;
    }

    return value;
  };

  try {
    return JSON.stringify(obj, replacer, space);
  } catch (error) {
    // If serialization still fails, return a minimal safe representation
    return JSON.stringify({
      error: 'Failed to serialize object',
      message: error instanceof Error ? error.message : String(error),
      type: typeof obj,
    });
  }
}

/**
 * Create a safe error object that can be serialized
 * @param error Error to serialize
 * @returns Safe error object
 */
export function serializeError(error: Error | unknown): SerializedObject {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause ? serializeError(error.cause) : undefined,
    };
  }

  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.parse(JSON.stringify(error));
    } catch {
      return {
        error: 'Unable to serialize error',
        type: typeof error,
      };
    }
  }

  return {
    error: String(error),
    type: typeof error,
  };
}

/**
 * Create a safe error info object from React error info
 * @param errorInfo React error info
 * @returns Safe error info
 */
export function serializeErrorInfo(
  errorInfo: React.ErrorInfo | undefined
): SerializedObject | undefined {
  if (!errorInfo) return undefined;

  return {
    componentStack: errorInfo.componentStack,
    digest: (errorInfo as any).digest || undefined,
  };
}
