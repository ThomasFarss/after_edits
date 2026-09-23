import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { session, response } = await requirePermission("users.manage");
  if (response) return response;

  const { id } = await params;
  const existing = await prisma.moduleAdmin.findUnique({
    where: { id },
    include: { user: { select: { name: true } }, module: { select: { label: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.moduleAdmin.delete({ where: { id } });

  await logAudit({
    actorId: session?.user?.id,
    action: "module_admin.revoke",
    entityType: "Module",
    entityId: existing.moduleId,
    metadata: { userName: existing.user.name, moduleLabel: existing.module.label },
  });

  return NextResponse.json({ ok: true });
}
