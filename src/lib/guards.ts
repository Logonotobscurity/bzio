import { auth } from "./auth/config";
import { NextResponse } from "next/server";
import { USER_ROLES } from "./auth-constants";

export async function getSession() {
  return await auth();
}

/**
 * Guard for Route Handlers (API)
 */
export async function requireAuthRoute() {
  const session = await auth();
  if (!session?.user) {
    return { authenticated: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { authenticated: true, session, user: session.user };
}

export async function requireAdminRoute() {
  const { authenticated, session, user, response } = await requireAuthRoute();
  if (!authenticated) return { authenticated, response };

  if (user?.role !== USER_ROLES.ADMIN) {
    return { authenticated: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { authenticated: true, session, user };
}

/**
 * Guard for Server Actions
 */
export async function requireAuthAction() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return { session, user: session.user };
}

export async function requireAdminAction() {
  const { session, user } = await requireAuthAction();
  if (user.role !== USER_ROLES.ADMIN) {
    throw new Error("Forbidden");
  }
  return { session, user };
}
