import NextAuth from "next-auth"
import { number } from "zod"
import { UserWithPermission } from "./types"


declare module "next-auth" {
  interface User {
    roleId: number
  }
  interface Session {
    user: UserWithPermission
    token: {
      roleId: number
      id: string
    }
  }
}
