"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

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
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email: username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Usuário ou senha inválidos");
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
          className="relative h-full w-full bg-[length:auto_100%] bg-no-repeat md:bg-[length:auto_100%]"
          style={{
            backgroundImage: "url(/images/logo.png)",
            backgroundPosition: "center 20%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#201c1e] via-transparent to-transparent md:bg-gradient-to-r" />
        <div className="pointer-events-none absolute bottom-8 left-8 hidden md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff8a8d]">
            After Edits
          </p>
          <p className="mt-1 max-w-xs text-sm text-zinc-400">
            Painel central de recursos para edição no After Effects
          </p>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center px-6 py-12 md:w-1/2">
        <div className="fade-in-up animated-border w-full max-w-sm rounded-2xl p-[1.5px] shadow-[0_0_90px_rgba(202,32,39,0.3)]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-[#211d1f]/85 p-8 backdrop-blur-2xl"
          >
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ca2027] to-[#a8181e] shadow-[0_4px_18px_rgba(202,32,39,0.5)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-5 w-5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-xl font-bold text-transparent">
                  Bem-vindo
                </h1>
                <p className="text-xs text-zinc-500">
                  Acesse o painel de edição
                </p>
              </div>
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#3a3335] bg-[#181516] py-2.5 pl-10 pr-10 text-white outline-none transition-all focus:border-[#ca2027] focus:shadow-[0_0_0_3px_rgba(202,32,39,0.15)]"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="mb-4 flex items-center gap-2 rounded-lg bg-[#ca2027]/10 px-3 py-2 text-sm text-[#ff6b70]">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ca2027] to-[#a8181e] py-2.5 font-semibold text-white shadow-[0_4px_20px_rgba(202,32,39,0.4)] transition-transform hover:scale-[1.015] hover:shadow-[0_4px_32px_rgba(202,32,39,0.6)] disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
