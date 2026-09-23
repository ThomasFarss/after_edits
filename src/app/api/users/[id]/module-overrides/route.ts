import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";

const overrideSchema = z.object({
  moduleId: z.string().min(1),
  state: z.enum(["inherit", "allow", "block"]),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { response } = await requirePermission("users.manage");
  if (response) return response;

  const { id } = await params;
  const overrides = await prisma.userModuleOverride.findMany({
    where: { userId: id },
    select: { userId: true, moduleId: true, granted: true },
  });
  return NextResponse.json(overrides);
}

export async function POST(request: Request, { params }: Params) {
  const { session, response } = await requirePermission("users.manage");
  if (response) return response;

  const { id } = await params;
  const body = await request.json();
  const parsed = overrideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { moduleId, state } = parsed.data;

  if (state === "inherit") {
    await prisma.userModuleOverride.deleteMany({ where: { userId: id, moduleId } });
  } else {
    await prisma.userModuleOverride.upsert({
      where: { userId_moduleId: { userId: id, moduleId } },
      update: { granted: state === "allow" },
      create: { userId: id, moduleId, granted: state === "allow" },
    });
  }

  await logAudit({
    actorId: session?.user?.id,
    action: "user.module_override",
    entityType: "User",
    entityId: id,
    metadata: { moduleId, state },
  });

  return NextResponse.json({ moduleId, state });
}
