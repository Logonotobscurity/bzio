'use client';

import React, { ReactNode, ReactElement } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Error Boundary Component
 * Catches errors in child components and displays fallback UI
 * Logs errors for debugging and error tracking
 * 
 * @example
 * <ErrorBoundary level="page">
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Store error info for display
    this.setState({ errorInfo });

    // Log error details for debugging
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    // Call optional error handler prop
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      logErrorToService(error, errorInfo, this.props.level || 'component');
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center max-w-md px-6 py-8">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Please try again or contact support if the problem persists.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Go Home
                </button>
              </div>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-8 text-left">
                  <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-gray-900">
                    Error Details
                  </summary>
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-red-900 mb-1">Message:</p>
                      <p className="text-sm font-mono text-red-800 break-words">
                        {this.state.error.message}
                      </p>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <p className="text-xs font-semibold text-red-900 mb-1">Component Stack:</p>
                        <pre className="text-xs text-red-700 overflow-auto max-h-40 bg-white p-2 rounded border border-red-100">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Logs errors to an external service (e.g., Sentry, LogRocket)
 * Extend this function to integrate with your error tracking service
 */
function logErrorToService(
  error: Error,
  errorInfo: React.ErrorInfo,
  level: string
) {
  // Example: Send to Sentry
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, {
  //     contexts: {
  //       react: {
  //         componentStack: errorInfo.componentStack,
  //         level,
  //       },
  //     },
  //   });
  // }

  // Or send to your own API
  try {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        level,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      }),
    }).catch(() => {
      // Silently fail if error logging fails
    });
  } catch {
    // Silently fail if error logging fails
  }
}
