import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requirePermission(permissionKey: string) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  if (!session?.user) {
    return {
      session: null,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  if (!permissions.includes(permissionKey)) {
    return {
      session,
      response: NextResponse.json({ error: "Sem permissão" }, { status: 403 }),
    };
  }

  return { session, response: null };
}
