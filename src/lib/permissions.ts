import type { Session } from "next-auth";
import type { Action } from "@prisma/client";

export function hasModulePermission(
  session: Session | null | undefined,
  moduleKey: string,
  action: Action
): boolean {
  const modulePermissions = session?.user?.modulePermissions ?? [];
  return modulePermissions.includes(`${moduleKey}:${action}`);
}
