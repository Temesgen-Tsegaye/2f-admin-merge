import NextAuth from "next-auth";
import { number } from "zod";
import { UserWithPermission } from "./types";
import { Permission, Role, RolePermission, User } from "@prisma/client";
import { permission } from "process";

declare module "next-auth" {
  interface User {
    roleId: number;
    role: Role & {
      permissions:Permission [];
    };
  }
  interface Session {
    user: User & {
      roleId: number;
      id: string;
      role: Role & {
        permissions:Permission [];
      };
      
    };
    token: {
      roleId: number;
      id: string;
      role: Role;
      role: Role & {
        permissions:Permission [];
      };
    };
  }
}
