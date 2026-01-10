import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity-service';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        companyPhone: true,
        businessType: true,
        businessRegistration: true,
        addresses: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USER_PROFILE_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;
    const body = await req.json();

    const { firstName, lastName, phone, companyName, companyPhone, businessType, businessRegistration } = body;

    // Track which fields were updated
    const updatedFields: string[] = [];
    if (firstName !== undefined) updatedFields.push('firstName');
    if (lastName !== undefined) updatedFields.push('lastName');
    if (phone !== undefined) updatedFields.push('phone');
    if (companyName !== undefined) updatedFields.push('companyName');
    if (companyPhone !== undefined) updatedFields.push('companyPhone');
    if (businessType !== undefined) updatedFields.push('businessType');
    if (businessRegistration !== undefined) updatedFields.push('businessRegistration');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(companyName !== undefined && { companyName }),
        ...(companyPhone !== undefined && { companyPhone }),
        ...(businessType !== undefined && { businessType }),
        ...(businessRegistration !== undefined && { businessRegistration }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        companyPhone: true,
        businessType: true,
        businessRegistration: true,
        updatedAt: true,
      },
    });

    // Log activity
    if (updatedFields.length > 0) {
      await logActivity(userId, 'profile_update', {
        message: `Updated account details: ${updatedFields.join(', ')}`,
        title: 'Updated profile information',
        updatedFields: updatedFields.join(', '),
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[USER_PROFILE_PUT]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
