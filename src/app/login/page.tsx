"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="flex min-h-screen flex-col bg-[#201c1e] md:flex-row">
      <div
        className="relative h-64 w-full bg-cover bg-top md:h-auto md:w-1/2"
        style={{ backgroundImage: "url(/images/logo.png)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#201c1e] via-transparent to-transparent md:bg-gradient-to-r" />
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 md:w-1/2">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-2xl border border-[#ca2027]/40 bg-[#2a2426] p-8 shadow-[0_0_60px_rgba(202,32,39,0.2)]"
        >
          <h1 className="mb-1 text-2xl font-bold text-white">Bem-vindo</h1>
          <p className="mb-6 text-sm text-zinc-400">
            Entre com suas credenciais para acessar o painel
          </p>

          <div className="mb-4">
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-[#3a3335] bg-[#201c1e] px-4 py-2.5 text-white outline-none transition-colors focus:border-[#ca2027]"
              placeholder="Digite seu usuário"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#3a3335] bg-[#201c1e] px-4 py-2.5 text-white outline-none transition-colors focus:border-[#ca2027]"
              placeholder="Digite sua senha"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-[#ca2027]/10 px-3 py-2 text-sm text-[#ff6b70]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#ca2027] py-2.5 font-semibold text-white transition-colors hover:bg-[#a8181e] disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
