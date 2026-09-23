import type { Action } from "@prisma/client";
import { prisma } from "./prisma";

export type UserAccess = {
  permissions: string[];
  modulePermissions: string[];
  moduleAdminIds: string[];
};

// Busca as permissões direto do banco em vez de confiar no JWT: a sessão
// (strategy "jwt") só grava permissions/modulePermissions no login, então um
// usuário logado não veria um módulo/permissão criado depois até relogar.
export async function getFreshUserAccess(userId: string): Promise<UserAccess> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
          modulePermissions: { include: { modulePermission: { include: { module: true } } } },
        },
      },
      moduleAdminOf: { select: { moduleId: true } },
    },
  });
  if (!user) return { permissions: [], modulePermissions: [], moduleAdminIds: [] };

  return {
    permissions: user.role.permissions.map((rp) => rp.permission.key),
    modulePermissions: user.role.modulePermissions.map(
      (rmp) => `${rmp.modulePermission.module.key}:${rmp.modulePermission.action}`
    ),
    moduleAdminIds: user.moduleAdminOf.map((ma) => ma.moduleId),
  };
}

// Um usuário pode gerenciar os links/visibilidade de um módulo se tiver a
// permissão global links.manage, ou se for admin delegado daquele módulo
// específico (via "Acesso módulo").
export function canManageModule(access: UserAccess, moduleId: string): boolean {
  return access.permissions.includes("links.manage") || access.moduleAdminIds.includes(moduleId);
}

export function hasModulePermission(
  modulePermissions: string[],
  moduleKey: string,
  action: Action
): boolean {
  return modulePermissions.includes(`${moduleKey}:${action}`);
}
