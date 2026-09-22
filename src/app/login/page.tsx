"use client";

import Image from "next/image";
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
    <div className="flex min-h-screen items-center justify-center bg-black px-6 py-10">
      <div className="flex w-full max-w-4xl flex-col items-center gap-10 sm:flex-row sm:justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="overflow-hidden rounded-2xl border-4 border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.4)]">
            <Image
              src="/images/logo.png"
              alt="Logo do Painel"
              width={220}
              height={220}
              className="h-56 w-56 object-cover"
              priority
            />
          </div>
          <p className="text-sm font-medium text-red-500">
            Painel de Edição — After Effects
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-2xl border border-red-900/50 bg-zinc-950 p-8 shadow-[0_0_60px_rgba(220,38,38,0.15)]"
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
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white outline-none transition-colors focus:border-red-600"
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
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white outline-none transition-colors focus:border-red-600"
              placeholder="Digite sua senha"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 py-2.5 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
