import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getFreshUserAccess } from "@/lib/permissions";
import AdminPanel from "./admin-panel";

export default async function AdminPage() {
  const session = await auth();
  const permissions = session?.user?.id ? (await getFreshUserAccess(session.user.id)).permissions : [];

  if (!session?.user || !permissions.includes("users.manage")) {
    redirect("/");
  }

  const [users, roles, modules] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        roleId: true,
        role: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
    prisma.module.findMany({
      orderBy: { order: "asc" },
      include: { links: { orderBy: { order: "asc" } } },
    }),
  ]);

  const [auditLogs, auditLogsTotal] = await Promise.all([
    prisma.auditLog.findMany({
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
    }),
    prisma.auditLog.count(),
  ]);

  const permissionKeys = modules.map((m) => m.permissionKey);
  const perms = await prisma.permission.findMany({
    where: { key: { in: permissionKeys } },
    include: { roles: true },
  });
  const keyToModuleId = new Map(modules.map((m) => [m.permissionKey, m.id]));
  const permissionGrants = perms.flatMap((p) => {
    const moduleId = keyToModuleId.get(p.key);
    if (!moduleId) return [];
    return p.roles.map((rp) => ({ roleId: rp.roleId, moduleId }));
  });

  const moduleAdmins = await prisma.moduleAdmin.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      module: { select: { id: true, key: true, label: true, icon: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminPanel
      initialUsers={users}
      roles={roles}
      initialModules={modules}
      initialAuditLogs={auditLogs.map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      }))}
      initialAuditLogsTotal={auditLogsTotal}
      canManageUsers
      canManageLinks={permissions.includes("links.manage")}
      canManageModules={permissions.includes("modules.manage")}
      initialPermissionGrants={permissionGrants}
      initialModuleAdmins={moduleAdmins}
    />
  );
}
