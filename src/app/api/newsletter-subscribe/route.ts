import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const subscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = subscriptionSchema.parse(body);

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.log('Newsletter subscription (no DB):', email);
      return NextResponse.json(
        { 
          success: true, 
          message: 'Successfully subscribed to newsletter',
        },
        { status: 200 }
      );
    }

    // Save to database (upsert to handle duplicates)
    await prisma.$executeRaw`
      INSERT INTO newsletter_subscribers (email, status, created_at)
      VALUES (${email}, 'active', NOW())
      ON CONFLICT (email) DO UPDATE SET status = 'active', updated_at = NOW()
    `;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully subscribed to newsletter',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}
