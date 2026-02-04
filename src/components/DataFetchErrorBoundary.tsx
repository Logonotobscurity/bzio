'use client';

import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface DataFetchErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component specifically for data fetching errors
 * Catches errors from hooks and provides user-friendly error UI
 */
export class DataFetchErrorBoundary extends React.Component<
  DataFetchErrorBoundaryProps,
  State
> {
  constructor(props: DataFetchErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Data fetch error:', error);
    this.props.onError?.(error);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry);
      }

      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to Load Data</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">{this.state.error.message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.retry}
              className="mt-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

interface QueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
}

interface FetchResultWithFallback<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
  fallback: ReactNode | null;
}

/**
 * Wrapper hook for automatic error handling in data fetching
 */
export function useDataFetchWithErrorBoundary<T>(
  queryResult: QueryResult<T>,
  errorFallback?: (error: Error) => ReactNode
): FetchResultWithFallback<T> {
  const { data, isLoading, error, refetch } = queryResult;

  if (error) {
    console.error('Data fetch hook error:', error);
    if (errorFallback) {
      return { data: null, isLoading: false, error, refetch, fallback: errorFallback(error) };
    }
  }

  return { data, isLoading, error, refetch, fallback: null };
}
