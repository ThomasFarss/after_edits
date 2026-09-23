import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function logAudit({
  actorId,
  action,
  entityType,
  entityId,
  metadata,
}: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: actorId ?? undefined,
      action,
      entityType,
      entityId,
      metadata,
    },
  });
}
