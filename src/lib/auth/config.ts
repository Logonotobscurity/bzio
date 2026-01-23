import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import type { NextAuthConfig, DefaultSession } from "next-auth";
import * as bcrypt from "bcryptjs";

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
    id?: string;
    role?: string;
    firstName?: string | null;
    lastName?: string | null;
    companyName?: string | null;
    phone?: string | null;
    isNewUser?: boolean;
    lastLogin?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    firstName?: string | null;
    lastName?: string | null;
    companyName?: string | null;
    phone?: string | null;
    isNewUser?: boolean;
    lastLogin?: Date | null;
  }
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.users.findUnique({
          where: { email: credentials.email as string },
        });

        if (user?.password && (await bcrypt.compare(credentials.password as string, user.password))) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password: _, ...userWithoutPassword } = user;
          return { ...userWithoutPassword, id: user.id.toString() };
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.companyName = user.companyName;
        token.phone = user.phone;
        token.isNewUser = user.isNewUser || false;
        token.lastLogin = user.lastLogin || null;

        const userId = parseInt(token.id, 10);
        if (user.isNewUser || !user.lastLogin) {
          try {
            await prisma.users.update({
              where: { id: userId },
              data: {
                isNewUser: false,
                lastLogin: new Date(),
              },
            });
            token.isNewUser = false;
            token.lastLogin = new Date();
          } catch (error) {
            console.error('[AUTH] Failed to update lastLogin for user', userId, error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role || 'CUSTOMER';
        session.user.firstName = token.firstName || null;
        session.user.lastName = token.lastName || null;
        session.user.companyName = token.companyName || null;
        session.user.phone = token.phone || null;
        session.user.isNewUser = token.isNewUser || false;
        session.user.lastLogin = token.lastLogin || null;
        session.user.name = [token.firstName, token.lastName]
          .filter(Boolean)
          .join(" ");
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const { GET, POST } = handlers;
