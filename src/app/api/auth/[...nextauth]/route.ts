import { handler } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

// Forwarding wrappers: ensure exported handlers match Next.js 16 route signatures.
export const GET = async (request: Request) => {
	// handler is the NextAuth request handler; cast to any to avoid type incompatibilities
	return (handler as any)(request);
};

export const POST = async (request: Request) => {
	return (handler as any)(request);
};
