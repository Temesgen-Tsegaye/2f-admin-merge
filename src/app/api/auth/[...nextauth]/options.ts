import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/db"
import { NextAuthOptions } from "next-auth"

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
          return null
        }
        const user = await prisma.user.findFirst({
          where: { email: credentials.email },
          include: {
            role: {
              include: {
                Permissions: true,
              },
            },
          },
        })

        if (!user) {
          return null
        }

        if (user.password !== credentials.password) {
          return null
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          permissions: user.role.Permissions,
        }
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
          permissions: user.permissions,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          roleId: token.roleId,
          id: token.id,
          permissions: token.permissions,
        },
      }
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
