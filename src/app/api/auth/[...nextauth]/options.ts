import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/db";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcrypt";
import { createLogger } from "@/utils/winston";

export const options: NextAuthOptions = {
  pages: {
    signIn: "/",
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

      
        createLogger().error("no error")
     
        if (!user) {
          createLogger().error("no user")
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!passwordMatch) {
          return null;
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          role: {
            ...user.role,
            permissions: user.role.permissions.map((rp) => rp.permission),
          },
          
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          roleId: user.roleId,
          id: user.id,
          role: user.role
          
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          roleId: token.roleId,
          id: token.id,
          role: token.role,
          
        },
      };
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
