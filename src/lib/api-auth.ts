import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canManageModule, getFreshUserAccess } from "@/lib/permissions";

export async function requirePermission(permissionKey: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      session: null,
      access: null,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  const access = await getFreshUserAccess(session.user.id);

  if (!access.permissions.includes(permissionKey)) {
    return {
      session,
      access,
      response: NextResponse.json({ error: "Sem permissão" }, { status: 403 }),
    };
  }

  return { session, access, response: null };
}

// Pra rotas cuja permissão é por módulo: libera quem tem links.manage global
// OU é admin delegado daquele módulo específico (ModuleAdmin / "Acesso módulo").
export async function requireModuleManage(moduleId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      session: null,
      access: null,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  const access = await getFreshUserAccess(session.user.id);

  if (!canManageModule(access, moduleId)) {
    return {
      session,
      access,
      response: NextResponse.json({ error: "Sem permissão" }, { status: 403 }),
    };
  }

  return { session, access, response: null };
}
