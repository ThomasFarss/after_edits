import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { hasModulePermission } from "@/lib/permissions";

const userSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  roleId: true,
  role: { select: { id: true, name: true } },
  createdById: true,
  createdAt: true,
  updatedAt: true,
};

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "INVITED"]).optional(),
  roleId: z.string().min(1).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { response } = await requirePermission("users.manage");
  if (response) return response;

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: Request, { params }: Params) {
  const { session, response } = await requirePermission("users.manage");
  if (response) return response;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { password, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });

  await logAudit({
    actorId: session?.user?.id,
    action: "user.update",
    entityType: "User",
    entityId: user.id,
    metadata: { changedFields: Object.keys(rest), passwordChanged: Boolean(password) },
  });

  return NextResponse.json(user);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { session, access, response } = await requirePermission("users.manage");
  if (response) return response;

  if (!hasModulePermission(access.modulePermissions, "admin", "DELETE")) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const deleted = await prisma.user.delete({ where: { id }, select: userSelect });

  await logAudit({
    actorId: session?.user?.id,
    action: "user.delete",
    entityType: "User",
    entityId: deleted.id,
    metadata: { name: deleted.name, email: deleted.email },
  });

  return NextResponse.json({ ok: true });
}
