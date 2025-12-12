/**
 * Performance Monitoring Utilities
 * Custom metrics tracking and performance measurement
 */

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percent'
  tags?: Record<string, string>
  timestamp: number
}

export interface PerformanceThresholds {
  name: string
  good: number
  warning: number
  critical: number
  unit: string
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private marks: Map<string, number> = new Map()
  private reportEndpoint: string = '/api/monitoring/metrics'
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Start timing measurement
   */
  startMeasurement(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * End timing measurement and record metric
   */
  endMeasurement(
    name: string,
    tags?: Record<string, string>
  ): PerformanceMetric | undefined {
    const startTime = this.marks.get(name)
    if (!startTime) {
      console.warn(`No start mark found for measurement: ${name}`)
      return undefined
    }

    const duration = performance.now() - startTime
    const metric: PerformanceMetric = {
      name,
      value: duration,
      unit: 'ms',
      tags,
      timestamp: Date.now(),
    }

    this.recordMetric(metric)
    this.marks.delete(name)

    return metric
  }

  /**
   * Record custom metric
   */
  recordMetric(metric: PerformanceMetric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, [])
    }

    const metricList = this.metrics.get(metric.name)!
    metricList.push(metric)

    // Keep only recent metrics (last 100)
    if (metricList.length > 100) {
      metricList.shift()
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}${metric.unit}`, {
        tags: metric.tags,
      })
    }
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    this.startMeasurement(name)
    try {
      return await fn()
    } finally {
      this.endMeasurement(name, tags)
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measure<T>(
    name: string,
    fn: () => T,
    tags?: Record<string, string>
  ): T {
    this.startMeasurement(name)
    try {
      return fn()
    } finally {
      this.endMeasurement(name, tags)
    }
  }

  /**
   * Get metric statistics
   */
  getMetricStats(name: string): {
    count: number
    min: number
    max: number
    avg: number
    p95: number
    p99: number
  } | null {
    const metrics = this.metrics.get(name)
    if (!metrics || metrics.length === 0) {
      return null
    }

    const values = metrics.map((m) => m.value).sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      count: values.length,
      min: values[0],
      max: values[values.length - 1],
      avg: sum / values.length,
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
    }
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage(): {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
    percentUsed: number
  } | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const perfWithMemory = performance as unknown as { memory?: any };
    if (!perfWithMemory.memory) {
      return null
    }

    const memory = perfWithMemory.memory
    const percentUsed = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100

    const metric: PerformanceMetric = {
      name: 'memory_usage',
      value: percentUsed,
      unit: 'percent',
      timestamp: Date.now(),
    }

    this.recordMetric(metric)

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      percentUsed,
    }
  }

  /**
   * Track long tasks
   */
  trackLongTasks(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const metric: PerformanceMetric = {
            name: 'long_task',
            value: entry.duration,
            unit: 'ms',
            tags: { name: entry.name },
            timestamp: Date.now(),
          }

          this.recordMetric(metric)
        }
      })

      observer.observe({ entryTypes: ['longtask'] })
    } catch {
      // Long task observer not supported
    }
  }

  /**
   * Track resource timing
   */
  getResourceMetrics(): {
    totalResources: number
    totalSize: number
    averageLoadTime: number
    slowestResources: Array<{ name: string; duration: number; size: number }>
  } {
    const resources = performance.getEntriesByType('resource') as unknown as PerformanceResourceTiming[]

    const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
    const totalDuration = resources.reduce((sum, r) => sum + r.duration, 0)

    const slowest = resources
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map((r) => ({
        name: r.name.split('/').pop() || r.name,
        duration: r.duration,
        size: r.transferSize || 0,
      }))

    return {
      totalResources: resources.length,
      totalSize,
      averageLoadTime: totalDuration / resources.length,
      slowestResources: slowest,
    }
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, PerformanceMetric[]> {
    return new Map(this.metrics)
  }

  /**
   * Get metrics as array
   */
  getMetricsArray(): PerformanceMetric[] {
    const all: PerformanceMetric[] = []
    for (const metrics of this.metrics.values()) {
      all.push(...metrics)
    }
    return all.sort((a, b) => a.timestamp - b.timestamp)
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics.clear()
    this.marks.clear()
  }

  /**
   * Report metrics to endpoint
   */
  async reportMetrics(): Promise<void> {
    const metrics = this.getMetricsArray()
    if (metrics.length === 0) return

    try {
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          metrics,
          timestamp: Date.now(),
        }),
        keepalive: true,
      })
    } catch {
      // Silently fail
    }
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId
  }
}

// Singleton instance
let monitor: PerformanceMonitor | null = null

/**
 * Initialize performance monitor
 */
export function initializePerformanceMonitor(): PerformanceMonitor {
  if (!monitor) {
    monitor = new PerformanceMonitor()
  }
  return monitor
}

/**
 * Get performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor | null {
  return monitor
}

/**
 * Quick start measurement
 */
export function startMeasurement(name: string): void {
  const instance = getPerformanceMonitor()
  if (instance) {
    instance.startMeasurement(name)
  }
}

/**
 * Quick end measurement
 */
export function endMeasurement(name: string, tags?: Record<string, string>): void {
  const instance = getPerformanceMonitor()
  if (instance) {
    instance.endMeasurement(name, tags)
  }
}

/**
 * Measure async function
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const instance = getPerformanceMonitor()
  if (instance) {
    return instance.measureAsync(name, fn, tags)
  }
  return fn()
}

/**
 * Measure sync function
 */
export function measure<T>(
  name: string,
  fn: () => T,
  tags?: Record<string, string>
): T {
  const instance = getPerformanceMonitor()
  if (instance) {
    return instance.measure(name, fn, tags)
  }
  return fn()
}

// Common performance thresholds
export const PERFORMANCE_THRESHOLDS: Record<string, PerformanceThresholds> = {
  api_call: {
    name: 'API Call Duration',
    good: 200,
    warning: 500,
    critical: 1000,
    unit: 'ms',
  },
  page_load: {
    name: 'Page Load Duration',
    good: 1000,
    warning: 2500,
    critical: 5000,
    unit: 'ms',
  },
  component_render: {
    name: 'Component Render Duration',
    good: 50,
    warning: 100,
    critical: 300,
    unit: 'ms',
  },
  image_load: {
    name: 'Image Load Duration',
    good: 500,
    warning: 1000,
    critical: 2000,
    unit: 'ms',
  },
  database_query: {
    name: 'Database Query Duration',
    good: 100,
    warning: 300,
    critical: 1000,
    unit: 'ms',
  },
  memory_usage: {
    name: 'Memory Usage',
    good: 50,
    warning: 75,
    critical: 90,
    unit: 'percent',
  },
}
