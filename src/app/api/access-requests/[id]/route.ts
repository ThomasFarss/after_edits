import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { response } = await requirePermission("users.manage");
  if (response) return response;

  const { id } = await params;
  await prisma.accessRequest.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
