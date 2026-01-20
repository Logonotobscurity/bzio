import { clearAuthResponse } from '@/lib/auth/jwt-auth';

export async function POST() {
  try {
    return clearAuthResponse('Logged out successfully');
  } catch (error) {
    console.error('[AUTH_LOGOUT]', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}