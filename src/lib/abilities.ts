import Mustache from "mustache";
import { User, Channel, Program, Prisma, RolePermission } from "@prisma/client";
import {
  AbilityBuilder,
  AbilityClass,
  PureAbility,
} from "@casl/ability";
import { createPrismaAbility, PrismaQuery, Subjects } from "@casl/prisma";
import { UserWithPermission } from "@/types/types";

export type AppAbility = PureAbility<
  [
    string,
    (
      | "all"
      | Subjects<{
          User: User;
          Channel: Channel;
          Program: Program;
        }>
    )
  ],
  PrismaQuery
>;
type AppSubjects = "User" | "Channel" | "Program" | "all";

export const AppAbility = PureAbility as AbilityClass<AppAbility>;


export async function defineAbilitiesFor(user: UserWithPermission) {
  console.log(user);
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createPrismaAbility
  );
  user?.role?.permissions?.forEach(( permission ) => {
    const subject = permission.subject as AppSubjects;
    let condition: any;
    let inverted = permission.inverted;

    try {
      condition = parseConditions(permission.condition, user);
    } catch (error) {
      console.error(
        `Error parsing condition for permission ${permission.id}:`,
        error
      );
      condition = undefined;
    }

    const fields = permission.fields as unknown as Prisma.JsonArray;

    if (Array.isArray(fields)) {
      fields.forEach((fieldOne: any) => {
        const fieldCondition = `${fieldOne}`;
        if (condition) {
          if (inverted) {
            cannot(permission.action, subject, [fieldCondition], condition);
          } else {
            can(permission.action, subject, [fieldCondition], condition);
          }
        } else {
          // If no condition, grant permission based on field only
          can(permission.action, subject, [fieldCondition]);
        }
      });
    } else {
      // Only condition
      if (condition) {
        if (inverted) {
          cannot(permission.action, subject, condition);
        } else {
          can(permission.action, subject, condition);
        }
      } else {
        // If no condition, just grant permission without any specific condition
        can(permission.action, subject);
      }
    }
  });
  return build();
}

function parseConditions(
  condition: Prisma.JsonValue,
  user: UserWithPermission
): Prisma.JsonValue {
  if (!condition) {
    return condition;
  }

  if (typeof condition === "string") {
    condition = JSON.parse(condition);
  }

  if (Array.isArray(condition)) {
    return condition.map((condition) => parseConditions(condition, user));
  }

  if (typeof condition == "object") {
    const parsedConditions: Prisma.JsonObject = {};

    for (const key in condition) {
      const value = condition[key];
      if (typeof value === "string") {
        const parsedVal = Mustache.render(value, { userId: user.id });
        parsedConditions[key] = parsedVal ? parsedVal : parsedVal;
      } else {
        parsedConditions[key] = value;
      }
    }
    return parsedConditions;
  }

  return condition;
}
