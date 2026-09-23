import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";

const assignSchema = z.object({
  userId: z.string().min(1),
  moduleId: z.string().min(1),
});

export async function GET() {
  const { response } = await requirePermission("users.manage");
  if (response) return response;

  const moduleAdmins = await prisma.moduleAdmin.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      module: { select: { id: true, key: true, label: true, icon: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(moduleAdmins);
}

export async function POST(request: Request) {
  const { session, response } = await requirePermission("users.manage");
  if (response) return response;

  const body = await request.json();
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { userId, moduleId } = parsed.data;
  const [user, module_] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.module.findUnique({ where: { id: moduleId } }),
  ]);
  if (!user || !module_) {
    return NextResponse.json({ error: "Usuário ou módulo não encontrado" }, { status: 404 });
  }

  const existing = await prisma.moduleAdmin.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Esse usuário já administra esse módulo" }, { status: 409 });
  }

  const created = await prisma.moduleAdmin.create({
    data: { userId, moduleId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      module: { select: { id: true, key: true, label: true, icon: true } },
    },
  });

  await logAudit({
    actorId: session?.user?.id,
    action: "module_admin.assign",
    entityType: "Module",
    entityId: moduleId,
    metadata: { userId, userName: user.name, moduleLabel: module_.label },
  });

  return NextResponse.json(created, { status: 201 });
}
