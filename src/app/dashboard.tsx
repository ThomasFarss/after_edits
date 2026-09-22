"use client";

import { useState } from "react";
import { modules, type ModuleId } from "./data/links";
import AnimatedBackground from "./animated-background";
import LogoutButton from "./logout-button";

const MODULE_ICONS: Record<ModuleId, React.ReactNode> = {
  videos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5l4.72-2.36a.75.75 0 011.08.67v10.38a.75.75 0 01-1.08.67l-4.72-2.36M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 9.75v9A2.25 2.25 0 004.5 18.75z"
      />
    </svg>
  ),
  audios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.5a.75.75 0 01-.75-.75v-6a.75.75 0 01.75-.75h2.25z"
      />
    </svg>
  ),
  musicas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9l10.5-2.25M9 9v10.5a2.25 2.25 0 11-2.25-2.25H9zm0 0V5.25a2.25 2.25 0 012.25-2.25H12a2.25 2.25 0 012.25 2.25v.75m0 0l4.5-.75m0 0v9.75a2.25 2.25 0 11-2.25-2.25h2.25"
      />
    </svg>
  ),
  links: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 10.5L21 3m0 0h-5.25M21 3v5.25M11.25 3H6.75A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 21h13.5a2.25 2.25 0 002.25-2.25v-4.5"
      />
    </svg>
  ),
};

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState<ModuleId>("videos");
  const current = modules.find((m) => m.id === activeModule)!;

  return (
    <div className="relative min-h-screen text-zinc-50">
      <AnimatedBackground />

      <nav className="sticky top-0 z-20 border-b border-[#ca2027]/25 bg-[#1c1719]/80 shadow-[0_1px_30px_rgba(202,32,39,0.15)] backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ca2027] to-transparent" />

        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:px-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <div className="h-10" />
            <div className="md:hidden">
              <LogoutButton />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-between gap-4 md:justify-end">
            <div className="relative flex w-full gap-1 overflow-x-auto rounded-full border border-[#3a3335] bg-[#181516]/70 p-1 md:w-auto">
              {modules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m.id)}
                  className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    activeModule === m.id
                      ? "bg-gradient-to-r from-[#ca2027] to-[#a8181e] text-white shadow-[0_0_18px_rgba(202,32,39,0.55)]"
                      : "text-zinc-400 hover:bg-[#2a2426] hover:text-white"
                  }`}
                >
                  <span className="h-4 w-4">{MODULE_ICONS[m.id]}</span>
                  {m.label}
                </button>
              ))}
            </div>
            <div className="hidden md:block">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-6xl px-6 py-12 sm:px-10">
        <div className="fade-in-up mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#ca2027]/40 bg-[#ca2027]/10 px-3 py-1 text-xs font-medium text-[#ff8a8d]">
            <span className="h-4 w-4">{MODULE_ICONS[current.id]}</span>
            Módulo
          </div>
          <h2 className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
            {current.label}
          </h2>
          <p className="mt-2 text-zinc-400">{current.description}</p>
        </div>

        <div className="fade-in-up grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {current.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group animated-border rounded-2xl p-[1px] transition-transform hover:-translate-y-1"
              style={{ animationPlayState: "paused" }}
            >
              <div className="flex h-full flex-col justify-between rounded-2xl border border-[#3a3335] bg-[#211d1f]/85 p-5 backdrop-blur-xl transition-colors group-hover:border-[#ca2027]/60">
                <div>
                  <span className="font-semibold text-zinc-50 transition-colors group-hover:text-[#ff6b70]">
                    {link.title}
                  </span>
                  <p className="mt-2 text-sm text-zinc-400">
                    {link.description}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#ca2027]">
                  Acessar
                  <svg
                    className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </main>

      <footer className="relative border-t border-[#3a3335] px-6 py-6 text-center text-sm text-zinc-500">
        Painel criado para auxiliar edições no Adobe After Effects
      </footer>
    </div>
  );
}
