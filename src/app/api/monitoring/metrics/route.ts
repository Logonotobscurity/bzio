/**
 * Performance Metrics API Route
 * Receives and processes custom performance metrics from clients
 */

import { NextRequest, NextResponse } from 'next/server'

export interface PerformanceMetricsReport {
  sessionId: string
  metrics: Array<{
    name: string
    value: number
    unit: 'ms' | 'bytes' | 'count' | 'percent'
    tags?: Record<string, string>
    timestamp: number
  }>
  timestamp: number
}

/**
 * POST /api/monitoring/metrics
 * Receive performance metrics from clients
 */
export async function POST(request: NextRequest) {
  try {
    const report: PerformanceMetricsReport = await request.json()

    // Validate required fields
    if (!report.sessionId || !report.metrics || !Array.isArray(report.metrics)) {
      return NextResponse.json(
        { error: 'Invalid metrics report' },
        { status: 400 }
      )
    }

    // Process metrics
    for (const metric of report.metrics) {
      // Log slow operations
      if (metric.name === 'api_call' && metric.value > 1000) {
        console.warn(`[Slow API] ${metric.value.toFixed(2)}ms`, {
          tags: metric.tags,
        })
      }

      if (metric.name === 'component_render' && metric.value > 300) {
        console.warn(`[Slow Render] ${metric.value.toFixed(2)}ms`, {
          tags: metric.tags,
        })
      }

      if (metric.name === 'memory_usage' && metric.value > 80) {
        console.warn(`[High Memory] ${metric.value.toFixed(2)}%`)
      }
    }

    // Store metrics (you can implement database storage here)
    // await storeMetrics(report)

    // Send to metrics collection service (e.g., Prometheus, InfluxDB)
    // await sendToMetricsService(report)

    return NextResponse.json(
      { success: true, received: report.metrics.length },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Performance Metrics API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/monitoring/metrics
 * Retrieve aggregated performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Add authentication check here
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Retrieve metrics from storage
    // const metrics = await getMetrics()

    const metrics = {
      total: 0,
      metrics: [] as any[],
      statistics: {},
    }

    return NextResponse.json(metrics, { status: 200 })
  } catch (error) {
    console.error('[Performance Metrics API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
