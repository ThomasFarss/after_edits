import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { sendAccessRequestEmail } from "@/lib/email";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  reason: z.string().trim().min(1).max(1000),
  referredBy: z.string().trim().min(1).max(200),
});

// Sem auth de propósito: quem está pedindo acesso ainda não tem conta.
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.accessRequest.create({ data: parsed.data });
  const emailResult = await sendAccessRequestEmail(parsed.data);

  return NextResponse.json({ ok: true, id: created.id, emailSent: emailResult.sent }, { status: 201 });
}

export async function GET() {
  const { response } = await requirePermission("users.manage");
  if (response) return response;

  const requests = await prisma.accessRequest.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(requests);
}
