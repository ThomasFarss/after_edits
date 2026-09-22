"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: 2 + ((i * 13) % 5),
  duration: 9 + ((i * 7) % 10),
  delay: (i * 1.3) % 12,
  drift: `${((i % 2 === 0 ? 1 : -1) * (10 + (i % 5) * 6))}px`,
}));

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.message ?? "Erro ao entrar");
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#201c1e] md:flex-row">
      <div
        className="animated-grid pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(#ca2027 1px, transparent 1px), linear-gradient(90deg, #ca2027 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="animated-blob-1 pointer-events-none absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-[#ca2027] opacity-40 blur-[110px]" />
      <div className="animated-blob-2 pointer-events-none absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-[#ff4d55] opacity-30 blur-[100px]" />
      <div className="animated-blob-1 pointer-events-none absolute -right-24 top-1/3 h-[24rem] w-[24rem] rounded-full bg-[#ca2027] opacity-25 blur-[100px]" />

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="particle pointer-events-none"
          style={
            {
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--drift": p.drift,
            } as React.CSSProperties
          }
        />
      ))}

      <div className="relative h-64 w-full md:h-auto md:w-1/2">
        <div
          className="relative h-full w-full bg-[length:auto_75%] bg-bottom bg-no-repeat md:bg-[length:auto_70%] md:bg-center"
          style={{ backgroundImage: "url(/images/logo.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#201c1e] via-transparent to-transparent md:bg-gradient-to-r" />
      </div>

      <div className="relative flex w-full items-center justify-center px-6 py-12 md:w-1/2">
        <div className="fade-in-up animated-border w-full max-w-sm rounded-2xl p-[1.5px] shadow-[0_0_90px_rgba(202,32,39,0.3)]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-[#211d1f]/85 p-8 backdrop-blur-2xl"
          >
            <div className="mb-7">
              <h1 className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-xl font-bold text-transparent">
                Bem-vindo
              </h1>
              <p className="text-xs text-zinc-500">
                Acesse o painel de edição
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="username"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Usuário
              </label>
              <div className="group relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-[#ca2027]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#3a3335] bg-[#181516] py-2.5 pl-10 pr-4 text-white outline-none transition-all focus:border-[#ca2027] focus:shadow-[0_0_0_3px_rgba(202,32,39,0.15)]"
                  placeholder="Digite seu usuário"
                />
              </div>
            </div>

            <div className="mb-7">
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Senha
              </label>
              <div className="group relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-[#ca2027]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#3a3335] bg-[#181516] py-2.5 pl-10 pr-4 text-white outline-none transition-all focus:border-[#ca2027] focus:shadow-[0_0_0_3px_rgba(202,32,39,0.15)]"
                  placeholder="Digite sua senha"
                />
              </div>
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-[#ca2027]/10 px-3 py-2 text-sm text-[#ff6b70]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-[#ca2027] to-[#a8181e] py-2.5 font-semibold text-white shadow-[0_4px_20px_rgba(202,32,39,0.4)] transition-transform hover:scale-[1.015] hover:shadow-[0_4px_32px_rgba(202,32,39,0.6)] disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
