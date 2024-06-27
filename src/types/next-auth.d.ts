import NextAuth from "next-auth"
import { number } from "zod"
import type { Permission } from "@prisma/client"

declare module "next-auth" {
  interface User {
    roleId: number
    permissions
  }
  interface Session {
    user: User & {
      /** The user's postal address. */
      roleId: number
      id: string
      permissions: Permission[]
    }
    token: {
      roleId: number
      id: string
      permissions: Permission[]
    }
  }
}
