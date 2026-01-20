"use client";

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

export const signIn = nextAuthSignIn;
export const signOut = nextAuthSignOut;

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;