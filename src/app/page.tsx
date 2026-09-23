import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getFreshUserAccess } from "@/lib/permissions";
import Dashboard from "./dashboard";

export default async function Home() {
  const session = await auth();
  // Busca direto do banco (não do JWT) pra que módulos/permissões criados
  // depois do login apareçam sem precisar relogar.
  const access = session?.user?.id
    ? await getFreshUserAccess(session.user.id)
    : { permissions: [], modulePermissions: [], moduleAdminIds: [], roleName: null };
  const permissions = access.permissions;

  const baseModules = await prisma.module.findMany({
    where: {
      isActive: true,
      permissionKey: { in: permissions },
    },
    orderBy: { order: "asc" },
    include: { links: { orderBy: { order: "asc" } } },
  });

  let modules = baseModules;
  if (session?.user?.id) {
    const overrides = await prisma.userModuleOverride.findMany({
      where: { userId: session.user.id },
    });
    // Admin nunca pode ser bloqueado por um override individual — mantém a
    // garantia de que Admin sempre enxerga todo módulo.
    const blockedIds =
      access.roleName === "Admin"
        ? new Set<string>()
        : new Set(overrides.filter((o) => !o.granted).map((o) => o.moduleId));
    // Um admin delegado de módulo ("Acesso módulo") enxerga a aba mesmo que
    // seu papel não desse essa permissão — um override explícito de bloqueio
    // ainda prevalece.
    const grantedIds = new Set([
      ...overrides.filter((o) => o.granted).map((o) => o.moduleId),
      ...access.moduleAdminIds,
    ]);
    const existingIds = new Set(baseModules.map((m) => m.id));
    const missingGrantedIds = [...grantedIds].filter((id) => !existingIds.has(id));

    const extraModules = missingGrantedIds.length
      ? await prisma.module.findMany({
          where: { id: { in: missingGrantedIds }, isActive: true },
          orderBy: { order: "asc" },
          include: { links: { orderBy: { order: "asc" } } },
        })
      : [];

    if (blockedIds.size > 0 || extraModules.length > 0) {
      modules = [...baseModules.filter((m) => !blockedIds.has(m.id)), ...extraModules].sort(
        (a, b) => a.order - b.order
      );
    }
  }

  const canManageUsers = permissions.includes("users.manage");
  const canManageLinks = permissions.includes("links.manage");
  const canManageModules = permissions.includes("modules.manage");
  const hasAnyAdminAccess = canManageUsers || canManageLinks || canManageModules;
  let adminData = null;

  if (hasAnyAdminAccess) {
    // Usuários e log de auditoria só são buscados se o papel puder vê-los
    // (Editor tem links.manage/modules.manage mas não users.manage).
    const [users, roles, allModules, auditLogs, auditLogsTotal] = await Promise.all([
      canManageUsers
        ? prisma.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              roleId: true,
              role: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
      prisma.role.findMany({ orderBy: { name: "asc" } }),
      prisma.module.findMany({
        orderBy: { order: "asc" },
        include: { links: { orderBy: { order: "asc" } } },
      }),
      canManageUsers
        ? prisma.auditLog.findMany({
            select: {
              id: true,
              action: true,
              entityType: true,
              entityId: true,
              metadata: true,
              createdAt: true,
              actor: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          })
        : Promise.resolve([]),
      canManageUsers ? prisma.auditLog.count() : Promise.resolve(0),
    ]);

    // Matriz papel x módulo: para cada módulo, quais papéis têm a permission
    // (module.<key>.view) vinculada — é isso que decide se a aba aparece
    // no menu daquele papel. Buscado só pra quem gerencia usuários.
    let permissionGrants: { roleId: string; moduleId: string }[] = [];
    if (canManageUsers) {
      const permissionKeys = allModules.map((m) => m.permissionKey);
      const perms = await prisma.permission.findMany({
        where: { key: { in: permissionKeys } },
        include: { roles: true },
      });
      const keyToModuleId = new Map(allModules.map((m) => [m.permissionKey, m.id]));
      permissionGrants = perms.flatMap((p) => {
        const moduleId = keyToModuleId.get(p.key);
        if (!moduleId) return [];
        return p.roles.map((rp) => ({ roleId: rp.roleId, moduleId }));
      });
    }

    const moduleAdmins = canManageUsers
      ? await prisma.moduleAdmin.findMany({
          include: {
            user: { select: { id: true, name: true, email: true } },
            module: { select: { id: true, key: true, label: true, icon: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    adminData = {
      users,
      roles,
      modules: allModules,
      auditLogs: auditLogs.map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
      auditLogsTotal,
      canManageUsers,
      canManageLinks,
      canManageModules,
      permissionGrants,
      moduleAdmins,
    };
  }

  // Quais módulos o usuário pode gerenciar (links + visibilidade) direto pelo
  // dashboard: todos, se tiver links.manage; senão só os que administra via
  // "Acesso módulo".
  const editableModuleIds = canManageLinks
    ? modules.map((m) => m.id)
    : modules.filter((m) => access.moduleAdminIds.includes(m.id)).map((m) => m.id);

  return (
    <Dashboard modules={modules} adminData={adminData} editableModuleIds={editableModuleIds} />
  );
}
