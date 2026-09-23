import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireModuleManage } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id: moduleId } = await params;
  const { response } = await requireModuleManage(moduleId);
  if (response) return response;

  const [users, overrides] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.userModuleOverride.findMany({ where: { moduleId } }),
  ]);

  const overrideByUser = new Map(overrides.map((o) => [o.userId, o.granted]));
  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      roleName: u.role.name,
      state: overrideByUser.has(u.id) ? (overrideByUser.get(u.id) ? "allow" : "block") : "inherit",
    }))
  );
}

const overrideSchema = z.object({
  userId: z.string().min(1),
  state: z.enum(["inherit", "allow", "block"]),
});

export async function POST(request: Request, { params }: Params) {
  const { id: moduleId } = await params;
  const { session, response } = await requireModuleManage(moduleId);
  if (response) return response;

  const body = await request.json();
  const parsed = overrideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { userId, state } = parsed.data;

  if (state === "inherit") {
    await prisma.userModuleOverride.deleteMany({ where: { userId, moduleId } });
  } else {
    await prisma.userModuleOverride.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      update: { granted: state === "allow" },
      create: { userId, moduleId, granted: state === "allow" },
    });
  }

  await logAudit({
    actorId: session?.user?.id,
    action: "module.visibility_override",
    entityType: "Module",
    entityId: moduleId,
    metadata: { userId, state },
  });

  return NextResponse.json({ userId, state });
}
