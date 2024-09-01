import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null;

        const { email, password } = credentials;

        if (
          email === process.env.LOGIN_EMAIL &&
          password === process.env.LOGIN_PASSWORD
        ) {
          user = {
            id: "admin",
            email: "admin@gmail.com",
            name: "admin",
          };
        }

        if (!user) {
          throw new Error("User not found.");
        }

        return user;
      },
    }),
  ],

  logger: {
    error: (code, ...message) => {
      console.error(code, message);
    },
    warn: (code, ...message) => {
      console.warn(code, JSON.stringify(message));
    },
    debug: (code, ...message) => {
      console.debug(code, JSON.stringify(message));
    },
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.sub = `${account.providerAccountId}`;
      }
      return token;
    },

    async session({ session, token, user }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

export interface NextAuthRequest extends NextRequest {
  auth: Session | null;
}

export const handleAuth = (
  handler: (req: NextAuthRequest, res: any) => Promise<NextResponse>
) => {
  return auth(async (req, res) => {
    if (!req.auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return handler(req, res);
  });
};
