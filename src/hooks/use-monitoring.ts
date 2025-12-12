'use client';

import { useEffect } from 'react';
import {
  initializeWebVitals,
} from '@/lib/web-vitals'
import {
  initializeErrorLogger,
  getErrorLogger,
} from '@/lib/utils/error-logger'
import {
  initializePerformanceMonitor,
  getPerformanceMonitor,
} from '@/lib/performance-monitor'

export const useMonitoring = () => {
  useEffect(() => {
    // Initialize monitoring services
    initializeErrorLogger();
    initializePerformanceMonitor();

    // Setup web vitals tracking
    initializeWebVitals();
  }, []);

  return {
    errorLogger: getErrorLogger(),
    performanceMonitor: getPerformanceMonitor(),
  };
};
