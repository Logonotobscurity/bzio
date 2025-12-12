/**
 * Web Vitals Tracking
 * Tracks Core Web Vitals metrics: LCP, FID, CLS, TTFB, FCP
 * Sends metrics to monitoring endpoint
 */

export interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
  entries: PerformanceEntry[]
}

export interface WebVitalPayload {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  url: string
  timestamp: number
  userAgent: string
  sessionId: string
}

class WebVitalsTracker {
  private sessionId: string
  private metrics: Map<string, WebVitalPayload> = new Map()
  private reportEndpoint: string = '/api/monitoring/web-vitals'

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
   * Determine Web Vital rating based on thresholds
   */
  private getRating(
    metricName: string,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    // Based on Google's Web Vitals thresholds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thresholds: any = {
      LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
      FID: { good: 100, needsImprovement: 300 }, // First Input Delay
      CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
      TTFB: { good: 600, needsImprovement: 1200 }, // Time to First Byte
      FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
    }

    const threshold = thresholds[metricName]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  /**
   * Report a Web Vital metric
   */
  private reportMetric(metric: WebVitalMetric): void {
    const payload: WebVitalPayload = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      sessionId: this.sessionId,
    }

    // Store locally
    this.metrics.set(metric.name, payload)

    // Send to monitoring endpoint
    this.sendToEndpoint(payload)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: `${metric.value.toFixed(2)}ms`,
        rating: metric.rating,
        delta: `${metric.delta.toFixed(2)}ms`,
      })
    }
  }

  /**
   * Send metric to monitoring endpoint
   */
  private sendToEndpoint(payload: WebVitalPayload): void {
    if (!navigator.sendBeacon) {
      // Fallback to fetch if sendBeacon not available
      fetch(this.reportEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // Silently fail
      })
      return
    }

    // Use sendBeacon for reliable delivery even if page unloads
    navigator.sendBeacon(this.reportEndpoint, JSON.stringify(payload))
  }

  /**
   * Track Largest Contentful Paint (LCP)
   */
  trackLCP(): void {
    if (!('PerformanceObserver' in window)) return

    let lastEntryTime = 0
    let sessionValue = 0

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntryWithStartTime

      sessionValue = lastEntry.startTime
      lastEntryTime = sessionValue

      // Ignore entries that start after user interaction
      if (lastEntry.startTime < this.getFirstInputOrPointerDown()) {
        return
      }

      const metric: WebVitalMetric = {
        name: 'LCP',
        value: sessionValue,
        rating: this.getRating('LCP', sessionValue),
        delta: sessionValue - (lastEntryTime || 0),
        id: `lcp-${Date.now()}`,
        navigationType: this.getNavigationType(),
        entries: entries,
      }

      this.reportMetric(metric)
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch {
      // Observer not supported
    }
  }

  /**
   * Track First Input Delay (FID)
   */
  trackFID(): void {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const firstEntry = entries[0] as PerformanceEventTiming

      if (!firstEntry.processingStart) {
        return
      }

      const metric: WebVitalMetric = {
        name: 'FID',
        value: firstEntry.processingStart - firstEntry.startTime,
        rating: this.getRating('FID', firstEntry.processingStart - firstEntry.startTime),
        delta: 0,
        id: `fid-${Date.now()}`,
        navigationType: this.getNavigationType(),
        entries: entries,
      }

      this.reportMetric(metric)
      observer.disconnect()
    })

    try {
      observer.observe({ entryTypes: ['first-input'] })
    } catch {
      // Observer not supported
    }
  }

  /**
   * Track Cumulative Layout Shift (CLS)
   */
  trackCLS(): void {
    if (!('PerformanceObserver' in window)) return

    let clsValue = 0
    const clsEntries: PerformanceEntry[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layoutShiftEntry = entry as any
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value
          clsEntries.push(entry)
        }
      }

      const metric: WebVitalMetric = {
        name: 'CLS',
        value: clsValue,
        rating: this.getRating('CLS', clsValue),
        delta: 0,
        id: `cls-${Date.now()}`,
        navigationType: this.getNavigationType(),
        entries: clsEntries,
      }

      this.reportMetric(metric)
    })

    try {
      observer.observe({ type: 'layout-shift', buffered: true })
    } catch {
      // Observer not supported
    }
  }

  /**
   * Track Time to First Byte (TTFB)
   */
  trackTTFB(): void {
    if (!('performance' in window)) return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (!navigation) return

    const ttfb = navigation.responseStart - navigation.fetchStart

    const metric: WebVitalMetric = {
      name: 'TTFB',
      value: ttfb,
      rating: this.getRating('TTFB', ttfb),
      delta: 0,
      id: `ttfb-${Date.now()}`,
      navigationType: this.getNavigationType(),
      entries: [navigation],
    }

    this.reportMetric(metric)
  }

  /**
   * Track First Contentful Paint (FCP)
   */
  trackFCP(): void {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntryWithStartTime

      const metric: WebVitalMetric = {
        name: 'FCP',
        value: lastEntry.startTime,
        rating: this.getRating('FCP', lastEntry.startTime),
        delta: 0,
        id: `fcp-${Date.now()}`,
        navigationType: this.getNavigationType(),
        entries: entries,
      }

      this.reportMetric(metric)
    })

    try {
      observer.observe({ entryTypes: ['paint'] })
    } catch {
      // Observer not supported
    }
  }

  /**
   * Initialize all Web Vitals tracking
   */
  initializeTracking(): void {
    if (typeof window === 'undefined') return

    // Use requestIdleCallback if available, otherwise use setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.trackLCP()
        this.trackFID()
        this.trackCLS()
        this.trackTTFB()
        this.trackFCP()
      })
    } else {
      setTimeout(() => {
        this.trackLCP()
        this.trackFID()
        this.trackCLS()
        this.trackTTFB()
        this.trackFCP()
      }, 0)
    }
  }

  /**
   * Get first input or pointer down time
   */
  private getFirstInputOrPointerDown(): number {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const firstEntry = list.getEntries()[0]
          return firstEntry.startTime
        })
        observer.observe({ entryTypes: ['first-input', 'pointerdown'], buffered: true })
      } catch {
        return Infinity
      }
    }
    return Infinity
  }

  /**
   * Get navigation type
   */
  private getNavigationType(): string {
    if ('navigation' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as unknown as PerformanceNavigationTiming
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (navigation as any)?.type || 'navigate'
    }
    return 'navigate'
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): WebVitalPayload[] {
    return Array.from(this.metrics.values())
  }

  /**
   * Get specific metric
   */
  getMetric(name: string): WebVitalPayload | undefined {
    return this.metrics.get(name)
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics.clear()
  }
}

// Singleton instance
let tracker: WebVitalsTracker | null = null

/**
 * Initialize Web Vitals tracking
 */
export function initializeWebVitals(reportEndpoint?: string): WebVitalsTracker {
  if (!tracker) {
    tracker = new WebVitalsTracker()
    if (reportEndpoint) {
      tracker['reportEndpoint'] = reportEndpoint
    }
    tracker.initializeTracking()
  }
  return tracker
}

/**
 * Get Web Vitals tracker instance
 */
export function getWebVitalsTracker(): WebVitalsTracker | null {
  return tracker
}

// TypeScript helpers
interface PerformanceEntryWithStartTime extends PerformanceEntry {
  startTime: number
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number
  processingDuration: number
  duration: number
}
