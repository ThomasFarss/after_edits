import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireModuleManage } from "@/lib/api-auth";

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
  const { id } = await params;
  const link = await prisma.link.findUnique({ where: { id } });
  if (!link) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const { response } = await requireModuleManage(link.moduleId);
  if (response) return response;

  return NextResponse.json(link);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.link.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const { response } = await requireModuleManage(existing.moduleId);
  if (response) return response;

  const body = await request.json();
  const parsed = updateLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Admin de módulo delegado não pode mover o link pra um módulo que não gerencia.
  if (parsed.data.moduleId && parsed.data.moduleId !== existing.moduleId) {
    const { response: targetResponse } = await requireModuleManage(parsed.data.moduleId);
    if (targetResponse) return targetResponse;
  }

  const link = await prisma.link.update({ where: { id }, data: parsed.data });
  return NextResponse.json(link);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.link.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const { response } = await requireModuleManage(existing.moduleId);
  if (response) return response;

  await prisma.link.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
