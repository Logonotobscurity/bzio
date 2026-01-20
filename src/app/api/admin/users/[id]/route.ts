import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { USER_ROLES } from '@/lib/auth-constants';
import { updateUserRole, toggleUserStatus } from '@/app/admin/_services/user.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, role } = body;

    if (action === 'updateRole' && role) {
      const user = await updateUserRole(parseInt(id), role);
      return NextResponse.json({ success: true, user });
    }

    if (action === 'toggleStatus') {
      const user = await toggleUserStatus(parseInt(id));
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[ADMIN_USER_UPDATE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
