import { handlers } from '@/lib/auth/config';

// Prevent this route from being statically exported during build
export const dynamic = 'force-dynamic';

// Handle both cases where handlers might not be available
const GET = handlers?.GET || undefined;
const POST = handlers?.POST || undefined;

export { GET, POST };
