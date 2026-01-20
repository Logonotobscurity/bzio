/**
 * Next-Auth Type Declarations
 * 
 * Extends the default next-auth types to include custom fields
 * for role-based access control and company information.
 * 
 * This file must be included in tsconfig.json "include" array.
 */

import { UserRole } from "@/lib/auth-constants";
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extended User type returned from authorize callback
   */
  interface User extends DefaultUser {
    role: UserRole;
    firstName?: string | null;
    lastName?: string | null;
    companyName?: string | null;
    phone?: string | null;
    isActive?: boolean;
    company?: string | null;
    isNewUser?: boolean;
    lastLogin?: Date | null;
  }

  /**
   * Extended Session type with custom user fields
   */
  interface Session extends DefaultSession {
    user: {
      id?: string;
      role: string;
      company?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT type with custom fields
   */
  interface JWT extends DefaultJWT {
    role?: string;
    company?: string | null;
  }
}

declare module "@auth/core/adapters" {
  /**
   * Extended AdapterUser type to match Prisma User model
   */
  interface AdapterUser {
    id: string;
    email: string;
    emailVerified: Date | null;
    name?: string | null;
    image?: string | null;
    role: UserRole;
    firstName?: string | null;
    lastName?: string | null;
    companyName?: string | null;
    phone?: string | null;
    isActive?: boolean;
    company?: string | null;
  }
}
