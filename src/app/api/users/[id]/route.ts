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

// Impede deixar o sistema sem nenhum Admin ativo: bloqueia trocar o papel do
// último Admin ou desativá-lo/convidá-lo de novo.
async function isLastActiveAdminBeingLocked(
  userId: string,
  newRoleId: string | undefined,
  newStatus: "ACTIVE" | "INACTIVE" | "INVITED" | undefined
) {
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true, role: { select: { name: true } } },
  });
  if (!target || target.role.name !== "Admin") return false;

  const losingAdminRole = newRoleId !== undefined && newRoleId !== null;
  const losingActiveStatus = newStatus !== undefined && newStatus !== "ACTIVE" && target.status === "ACTIVE";
  if (!losingAdminRole && !losingActiveStatus) return false;

  if (losingAdminRole) {
    const newRole = await prisma.role.findUnique({ where: { id: newRoleId } });
    if (newRole?.name === "Admin") return false;
  }

  const activeAdminCount = await prisma.user.count({
    where: { status: "ACTIVE", role: { name: "Admin" } },
  });
  return activeAdminCount <= 1;
}

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

  const demotesOrDeactivatesAdmin =
    (rest.roleId !== undefined || rest.status !== undefined) &&
    (await isLastActiveAdminBeingLocked(id, rest.roleId, rest.status));
  if (demotesOrDeactivatesAdmin) {
    return NextResponse.json(
      { error: "Não é possível remover o papel Admin ou desativar o último usuário Admin." },
      { status: 400 }
    );
  }

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

  if (id === session?.user?.id) {
    return NextResponse.json({ error: "Você não pode excluir sua própria conta." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { role: { select: { name: true } } } });
  if (target?.role.name === "Admin") {
    const adminCount = await prisma.user.count({ where: { role: { name: "Admin" } } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Não é possível excluir o último usuário Admin." },
        { status: 400 }
      );
    }
  }

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
