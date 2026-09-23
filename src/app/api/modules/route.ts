import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

const createModuleSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().min(1),
  route: z.string().min(1),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  permissionKey: z.string().min(1),
  roleIds: z.array(z.string()).optional(),
});

export async function GET() {
  const { response } = await requirePermission("modules.manage");
  if (response) return response;

  const modules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    include: { links: true },
  });
  return NextResponse.json(modules);
}

export async function POST(request: Request) {
  const { response } = await requirePermission("modules.manage");
  if (response) return response;

  const body = await request.json();
  const parsed = createModuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.module.findUnique({ where: { key: parsed.data.key } });
  if (existing) {
    return NextResponse.json({ error: "Já existe um módulo com essa key" }, { status: 409 });
  }

  const { roleIds, ...moduleData } = parsed.data;
  const created = await prisma.module.create({ data: moduleData });

  // A permissão precisa existir e estar vinculada a pelo menos um papel pra
  // que o módulo apareça no menu de alguém — sem isso o módulo fica "órfão".
  const permission = await prisma.permission.upsert({
    where: { key: moduleData.permissionKey },
    update: {},
    create: { key: moduleData.permissionKey, description: `Acesso ao módulo ${moduleData.label}` },
  });

  // Admin sempre enxerga todos os módulos, independente do que foi marcado
  // em "Quem pode ver esse módulo".
  const adminRole = await prisma.role.findUnique({ where: { name: "Admin" } });
  const grantRoleIds = new Set(roleIds ?? []);
  if (adminRole) grantRoleIds.add(adminRole.id);

  if (grantRoleIds.size > 0) {
    await prisma.rolePermission.createMany({
      data: Array.from(grantRoleIds).map((roleId) => ({ roleId, permissionId: permission.id })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json(created, { status: 201 });
}
