import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Instância edge-safe do Auth.js (sem Prisma/bcrypt) só pra ler a sessão
// no middleware — mantém o bundle do Edge Function dentro do limite do plano.
const { auth } = NextAuth(authConfig);

// Decisão: o middleware roda em edge runtime e não consegue consultar o
// Prisma/Postgres a cada request de forma leve, então ele só garante que o
// usuário está autenticado. A checagem fina de permissão por módulo
// (permissionKey de cada rota, ex: /admin exigindo "module.admin.view")
// é feita em Server Components (layout/page) que já rodam em Node e podem
// consultar o banco diretamente.
// Rotas públicas mesmo sem sessão: /login (a própria tela) e o endpoint que
// ela usa pra enviar pedido de acesso — quem está pedindo ainda não tem conta.
const PUBLIC_PATHS = ["/login", "/api/access-requests"];

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const { pathname } = req.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)"],
};
