import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

const updateModuleSchema = z.object({
  key: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  icon: z.string().min(1).optional(),
  route: z.string().min(1).optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  permissionKey: z.string().min(1).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { response } = await requirePermission("modules.manage");
  if (response) return response;

  const { id } = await params;
  const moduleRecord = await prisma.module.findUnique({ where: { id }, include: { links: true } });
  if (!moduleRecord) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(moduleRecord);
}

export async function PATCH(request: Request, { params }: Params) {
  const { response } = await requirePermission("modules.manage");
  if (response) return response;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateModuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.module.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { response } = await requirePermission("modules.manage");
  if (response) return response;

  const { id } = await params;
  const moduleRecord = await prisma.module.findUnique({ where: { id } });
  if (!moduleRecord) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  if (moduleRecord.isActive) {
    return NextResponse.json(
      { error: "Desative o módulo antes de excluí-lo." },
      { status: 409 }
    );
  }

  await prisma.$transaction([
    prisma.link.deleteMany({ where: { moduleId: id } }),
    prisma.userModuleOverride.deleteMany({ where: { moduleId: id } }),
    prisma.roleModulePermission.deleteMany({
      where: { modulePermission: { moduleId: id } },
    }),
    prisma.modulePermission.deleteMany({ where: { moduleId: id } }),
    prisma.rolePermission.deleteMany({
      where: { permission: { key: moduleRecord.permissionKey } },
    }),
    prisma.permission.deleteMany({ where: { key: moduleRecord.permissionKey } }),
    prisma.module.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
