
import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Email from "next-auth/providers/email";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import type { JWT } from "next-auth/jwt";
import * as bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";

// Define custom properties on the session and user objects
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      firstName: string | null;
      lastName: string | null;
      companyName: string | null;
      phone: string | null;
      isNewUser: boolean;
      lastLogin: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
    phone: string | null;
    isNewUser: boolean;
    lastLogin: Date | null;
  }
}

// Define custom properties on the JWT
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
    phone: string | null;
    isNewUser: boolean;
    lastLogin: Date | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  providers: [
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 10 * 60, // Magic links expire in 10 minutes
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user?.hashedPassword && (await bcrypt.compare(credentials.password, user.hashedPassword))) {
          const { hashedPassword, ...userWithoutPassword } = user;
          return { ...userWithoutPassword, id: user.id.toString() };
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // When the user signs in, the `user` object from the database is passed.
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.companyName = user.companyName;
        token.phone = user.phone;
        token.isNewUser = user.isNewUser;
        token.lastLogin = user.lastLogin;
      } else if (token.id) {
        // CRITICAL FIX: Refresh user data on every session check to ensure role changes are reflected
        // This prevents stale role data when admin role is updated in database
        const refreshedUser = await prisma.user.findUnique({
          where: { id: Number(token.id) },
          select: {
            id: true,
            role: true,
            firstName: true,
            lastName: true,
            companyName: true,
            phone: true,
            isNewUser: true,
            lastLogin: true,
          },
        });

        if (refreshedUser) {
          token.id = refreshedUser.id;
          token.role = refreshedUser.role;
          token.firstName = refreshedUser.firstName;
          token.lastName = refreshedUser.lastName;
          token.companyName = refreshedUser.companyName;
          token.phone = refreshedUser.phone;
          token.isNewUser = refreshedUser.isNewUser;
          token.lastLogin = refreshedUser.lastLogin;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // The `session` callback is called after the `jwt` callback.
      // We can transfer the custom properties from the token to the session.
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.companyName = token.companyName;
        session.user.phone = token.phone;
        session.user.isNewUser = token.isNewUser;
        session.user.lastLogin = token.lastLogin;

        // Combine firstName and lastName for the default `name` property
        session.user.name = [token.firstName, token.lastName]
          .filter(Boolean)
          .join(" ");
      }
      return session;
    },
  },
});
