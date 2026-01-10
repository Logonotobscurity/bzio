'use client'

import { useMonitoring } from "@/hooks/use-monitoring";

/**
 * MonitoringProvider Component
 * Initializes all monitoring services (Web Vitals, Error Logging, Performance Metrics)
 * Must be a client component to use React hooks
 */
export function MonitoringProvider(): null {
  // Initialize all monitoring services
  useMonitoring()

  return null
}
