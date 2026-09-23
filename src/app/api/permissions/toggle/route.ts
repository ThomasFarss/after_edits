import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";

const toggleSchema = z.object({
  moduleId: z.string().min(1),
  roleId: z.string().min(1),
});

export async function POST(request: Request) {
  const { session, response } = await requirePermission("users.manage");
  if (response) return response;

  const body = await request.json();
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { moduleId, roleId } = parsed.data;

  const [module, role] = await Promise.all([
    prisma.module.findUnique({ where: { id: moduleId } }),
    prisma.role.findUnique({ where: { id: roleId } }),
  ]);
  if (!module || !role) {
    return NextResponse.json({ error: "Módulo ou papel não encontrado" }, { status: 404 });
  }

  const permission = await prisma.permission.upsert({
    where: { key: module.permissionKey },
    update: {},
    create: { key: module.permissionKey, description: `Acesso ao módulo ${module.label}` },
  });

  const existing = await prisma.rolePermission.findUnique({
    where: { roleId_permissionId: { roleId, permissionId: permission.id } },
  });

  let granted: boolean;
  if (existing) {
    await prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId: permission.id } },
    });
    granted = false;
  } else {
    await prisma.rolePermission.create({ data: { roleId, permissionId: permission.id } });
    granted = true;
  }

  await logAudit({
    actorId: session?.user?.id,
    action: granted ? "permission.grant" : "permission.revoke",
    entityType: "Module",
    entityId: module.id,
    metadata: { roleName: role.name, moduleLabel: module.label, permissionKey: module.permissionKey },
  });

  return NextResponse.json({ granted });
}
