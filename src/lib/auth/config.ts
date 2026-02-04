import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import type { NextAuthOptions } from "next-auth";
import * as bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";

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
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
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
      maxAge: 10 * 60,
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.companyName = user.companyName;
        token.phone = user.phone;
        token.isNewUser = user.isNewUser;
        token.lastLogin = user.lastLogin;

        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        if (user.isNewUser || !user.lastLogin) {
          try {
            await prisma.user.update({
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
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.companyName = token.companyName;
        session.user.phone = token.phone;
        session.user.isNewUser = token.isNewUser;
        session.user.lastLogin = token.lastLogin;
        session.user.name = [token.firstName, token.lastName]
          .filter(Boolean)
          .join(" ");
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export const handlers = { GET: handler, POST: handler };
export { handler as GET, handler as POST };
export const auth = handler.auth;
export const signIn = handler.signIn;
export const signOut = handler.signOut;
// Alias for clarity when passing options to getServerSession
export const authConfig = authOptions;
