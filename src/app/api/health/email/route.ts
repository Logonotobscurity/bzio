/**
 * Email Health Check Endpoint
 * Tests SMTP connection and email configuration
 * 
 * Endpoint: GET /api/health/email
 * Response: { success: boolean, message: string, details: object }
 */

import { testSMTPConnection } from '@/lib/email-service';

export async function GET() {
  try {
    const result = await testSMTPConnection();
    
    // Return appropriate status code
    const statusCode = result.success ? 200 : 503;
    
    return Response.json(result, { status: statusCode });
  } catch (error) {
    console.error('Email health check failed:', error);
    return Response.json(
      {
        success: false,
        message: 'Email health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to send a test email (admin only)
 * 
 * Request:
 * POST /api/health/email
 * {
 *   "to": "test@example.com",
 *   "adminToken": "your-admin-token"
 * }
 * 
 * Response:
 * { success: boolean, message: string, messageId?: string }
 */
export async function POST(req: Request) {
  try {
    // Only allow in development or with admin token
    const isDevMode = process.env.NODE_ENV === 'development';
    const adminToken = process.env.ADMIN_EMAIL_TEST_TOKEN;
    
    if (!isDevMode && !adminToken) {
      return Response.json(
        {
          success: false,
          message: 'Email test endpoint is disabled',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { to, adminToken: providedToken } = body;

    // Verify token if not in dev mode
    if (!isDevMode && providedToken !== adminToken) {
      return Response.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return Response.json(
        {
          success: false,
          message: 'Invalid email address',
        },
        { status: 400 }
      );
    }

    // Import sendEmail here to avoid circular dependency
    const { sendTestEmail } = await import('@/lib/email-service');
    const success = await sendTestEmail(to);

    return Response.json({
      success,
      message: success
        ? `Test email sent to ${to}`
        : `Failed to send test email to ${to}`,
    });
  } catch (error) {
    console.error('Email test endpoint error:', error);
    return Response.json(
      {
        success: false,
        message: 'Error sending test email',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
