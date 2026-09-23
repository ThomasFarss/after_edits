import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const { response } = await requirePermission("users.manage");
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
        createdAt: true,
        actor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count(),
  ]);

  return NextResponse.json({ logs, total, offset, pageSize: PAGE_SIZE });
}
