import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

const createLinkSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  description: z.string().optional(),
  icon: z.string().optional(),
  moduleId: z.string().min(1),
  order: z.number().int().optional(),
});

export async function GET(request: Request) {
  const { response } = await requirePermission("links.manage");
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");

  const links = await prisma.link.findMany({
    where: moduleId ? { moduleId } : undefined,
    orderBy: { order: "asc" },
  });
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  const { response } = await requirePermission("links.manage");
  if (response) return response;

  const body = await request.json();
  const parsed = createLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const link = await prisma.link.create({ data: parsed.data });
  return NextResponse.json(link, { status: 201 });
}
