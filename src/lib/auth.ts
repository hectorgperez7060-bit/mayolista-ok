import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "GitHub",
      credentials: {
        name: { label: "Nombre", type: "text", placeholder: "Tu nombre completo" },
        email: { label: "Email", type: "text", placeholder: "tu@email.com" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.email) return null;

        const githubId = credentials.email.split("@")[0] || "user_" + Date.now();

        let user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          user = await db.user.create({
            data: {
              name: credentials.name,
              email: credentials.email,
              githubId,
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET || "mayolista-secret-dev-2024",
};
