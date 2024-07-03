import { Permission, Role, User } from "@prisma/client";

export type UserData = {
  id?: string;
  name: string;
  email: string;
  password?: string;
  roleId: number;
  role?: {
    id?: number;
    name?: string;
  };
};

export type ChannelData = {
  id?: number;
  name?: string;
  status?: boolean;
  userId?: string;
};

export type ProgramData = {
  start?: string;
  size?: string;
  filters?: string;
  filtersFn?: string;
  globalFilter?: string;
  sorting?: string;
};

export type PermissionData = {
  name: string;
  action: string;
  subject: string;
  inverted?: boolean;
  condition?: any;
  fields?: any;
  reason?: string;
};

export type UserWithPermission = User & {
  role: Role & {
    permissions: Permission[];
  };
};
