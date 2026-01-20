/**
 * Web Vitals API Route
 * Receives and processes Web Vitals metrics from clients
 */

import { NextRequest, NextResponse } from 'next/server'

export interface WebVitalsReport {
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

/**
 * POST /api/monitoring/web-vitals
 * Receive Web Vitals metrics from clients
 */
export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalsReport = await request.json()

    // Validate required fields
    if (!metric.name || metric.value === undefined || !metric.sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Log metric (in production, send to monitoring service)
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: `${metric.value.toFixed(2)}ms`,
      rating: metric.rating,
      url: metric.url,
      sessionId: metric.sessionId,
    })

    // Store metric (you can implement database storage here)
    // await storeWebVital(metric)

    // Send to external monitoring service (e.g., Datadog, New Relic)
    // await sendToMonitoringService(metric)

    // Return success response
    return NextResponse.json(
      { success: true, id: metric.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Web Vitals API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/monitoring/web-vitals
 * Retrieve aggregated Web Vitals metrics
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
    // const metrics = await getWebVitalsMetrics()

    const metrics = {
      totalRequests: 0,
      avgLCP: 0,
      avgFID: 0,
      avgCLS: 0,
      avgTTFB: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      poorMetrics: [] as any[],
    }

    return NextResponse.json(metrics, { status: 200 })
  } catch (error) {
    console.error('[Web Vitals API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
