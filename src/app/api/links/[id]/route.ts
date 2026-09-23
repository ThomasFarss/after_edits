import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

const updateLinkSchema = z.object({
  title: z.string().min(1).optional(),
  url: z.string().url().optional(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  moduleId: z.string().min(1).optional(),
  order: z.number().int().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { response } = await requirePermission("links.manage");
  if (response) return response;

  const { id } = await params;
  const link = await prisma.link.findUnique({ where: { id } });
  if (!link) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(link);
}

export async function PATCH(request: Request, { params }: Params) {
  const { response } = await requirePermission("links.manage");
  if (response) return response;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const link = await prisma.link.update({ where: { id }, data: parsed.data });
  return NextResponse.json(link);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { response } = await requirePermission("links.manage");
  if (response) return response;

  const { id } = await params;
  await prisma.link.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
