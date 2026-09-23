import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";

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

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  status: z.enum(["ACTIVE", "INACTIVE", "INVITED"]).optional(),
  roleId: z.string().min(1),
});

export async function GET(request: Request) {
  const { session, response } = await requirePermission("users.manage");
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const role = searchParams.get("role")?.trim();
  const status = searchParams.get("status")?.trim();

  const where: Prisma.UserWhereInput = {};
  const andConditions: Prisma.UserWhereInput[] = [];

  if (q) {
    andConditions.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (role) where.role = { name: role };
  if (status && ["ACTIVE", "INACTIVE", "INVITED"].includes(status)) {
    where.status = status as Prisma.EnumUserStatusFilter["equals"];
  }

  // Admin (users.manage) vê todos os usuários. Caso esse escopo de gestão
  // seja concedido a outros papéis no futuro, restringe a usuários criados
  // por quem está logado ou pertencentes a um time que ele gerencia.
  const isAdmin = session?.user?.roleName === "Admin";
  if (!isAdmin && session?.user?.id) {
    const managedTeams = await prisma.team.findMany({
      where: { managers: { some: { id: session.user.id } } },
      select: { id: true },
    });
    const managedTeamIds = managedTeams.map((t) => t.id);

    andConditions.push({
      OR: [
        { createdById: session.user.id },
        ...(managedTeamIds.length > 0 ? [{ teamId: { in: managedTeamIds } }] : []),
      ],
    });
  }

  if (andConditions.length > 0) where.AND = andConditions;

  const users = await prisma.user.findMany({
    where,
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const { session, response } = await requirePermission("users.manage");
  if (response) return response;

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, status, roleId } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, status, roleId, createdById: session?.user?.id },
    select: userSelect,
  });

  await logAudit({
    actorId: session?.user?.id,
    action: "user.create",
    entityType: "User",
    entityId: user.id,
    metadata: { name: user.name, email: user.email, roleId: user.roleId, status: user.status },
  });

  return NextResponse.json(user, { status: 201 });
}
