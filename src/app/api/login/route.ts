import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPassword) {
    return NextResponse.json(
      { ok: false, message: "Login não configurado no servidor" },
      { status: 500 }
    );
  }

  const { username, password } = await request.json();

  if (username === adminUser && password === adminPassword) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set("after-edits-auth", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  return NextResponse.json(
    { ok: false, message: "Usuário ou senha inválidos" },
    { status: 401 }
  );
}
