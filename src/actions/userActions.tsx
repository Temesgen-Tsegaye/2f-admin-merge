"use server";

import { Permission, PrismaClient, Role, User } from "@prisma/client";
import { defineAbilitiesFor } from "@/lib/abilities";
import { UserWithPermission, UserData } from "@/types/types";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const updateUser = async (
  user: UserWithPermission,
  data: UserData,
  id: string
) => {
  const ability = await defineAbilitiesFor(user);

  if (!ability.can("update", "User")) {
    return { error: "Access denied" };
  }

  try {
    const { name, email, password, roleId } = data;
    let updateData: any = {
      name,
      email,
      password,
      roleId,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      updateData.password = hashedPassword;
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return { error: `Role with ID '${roleId}' not found.` };
    }
    updateData.roleId = role.id;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
      },
    });

    return updatedUser;
  } catch (error) {
    return { error: (error as Error).message };
  }
};

const createUser = async (user: UserWithPermission, data: UserData) => {
  const ability = await defineAbilitiesFor(user);

  if (!ability.can("create", "User")) {
    return { error: "Access denied" };
  }

  try {
    const { name, email, password, roleId } = data;

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return { error: `Role with ID '${roleId}' not found.` };
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: role.id,
      },
      include: {
        role: true,
      },
    });

    return user;
  } catch (error) {
    return { error: (error as Error).message };
  }
};

const getAllUsers = async (
  user: UserWithPermission
): Promise<{ users: UserData[] } | { error: string }> => {
  const ability = await defineAbilitiesFor(user);

  if (!ability.can("read", "User")) {
    return { error: "Access denied" };
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
    });
    return { users };
  } catch (error) {
    return { error: (error as Error).message };
  }
};

const getUserById = async (
  user: UserWithPermission,
  id: string
): Promise<User | { error: string }> => {
  const ability = await defineAbilitiesFor(user);

  if (!ability.can("read", "User")) {
    return { error: "Access denied" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (user) {
      return user;
    } else {
      return { error: "User not found" };
    }
  } catch (error) {
    return { error: (error as Error).message };
  }
};

const deleteUser = async (
  user: UserWithPermission,
  id: string
): Promise<void | { error: string }> => {
  const ability = await defineAbilitiesFor(user);

  if (!ability.can("delete", "User")) {
    return { error: "Access denied" };
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
};

// const loginUser = async ({
//   name,
//   password,
// }: {
//   name: string;
//   password: string;
// }): Promise<{ success: boolean; user?: UserWithPermission }> => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { name },
//       include: {
//         role: true,
//       },
//     });

//     if (!user || user.password !== password) {
//       return { success: false };
//     }

//     return { success: true, user };
//   } catch (error) {
//     console.error("Login failed:", error);
//     return { success: false };
//   }
// };

const usersCount = async (): Promise<{ count: number } | { error: string }> => {
  try {
    const count = await prisma.user.count();
    return { count };
  } catch (error) {
    return { error: (error as Error).message };
  }
};

const getUser = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
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
    console.log(user);
    return user;
  } catch (error) {
    throw new Error("User not found");
  }
};

const getAllPermissions = async (): Promise<Permission[]> => {
  try {
    const permissions = await prisma.permission.findMany();
    return permissions;
  } catch (error) {
    console.error(`Error fetching permissions: ${(error as Error).message}`);
    throw new Error("fetching Permissions failed");
  }
};

const createRole = async (name: string, permissionIds: number[]) => {
  try {
    const existingPermissions = await prisma.permission.findMany({
      where: {
        id: { in: permissionIds },
      },
    });

    if (existingPermissions.length !== permissionIds.length) {
      throw new Error("Some permissions do not exist.");
    }

    const createdRole = await prisma.role.create({
      data: {
        name,
        permissions: {
          create: permissionIds.map((permissionId) => ({
            permission: { connect: { id: permissionId } },
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return createdRole;
  } catch (error) {
    console.log(`Error creating role: ${(error as Error).message}`);
    throw new Error("failed to create new role");
  }
};

export {
  // loginUser,
  deleteUser,
  updateUser,
  getAllUsers,
  createUser,
  getUserById,
  usersCount,
  getUser,
  getAllPermissions,
  createRole,
};
