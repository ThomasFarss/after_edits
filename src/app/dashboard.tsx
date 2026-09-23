"use client";

import { useState } from "react";
import Image from "next/image";
import AnimatedBackground from "./animated-background";
import LogoutButton from "./logout-button";
import { getModuleIcon } from "./module-icons";
import AdminPanel, { type AdminData } from "./admin/admin-panel";
import { LinkQuickActions } from "./link-quick-edit";

export type DashboardLink = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
};

export type DashboardModule = {
  id: string;
  key: string;
  label: string;
  icon: string;
  route: string;
  links: DashboardLink[];
};

export default function Dashboard({
  modules: initialModules,
  adminData,
  canManageLinks,
}: {
  modules: DashboardModule[];
  adminData: AdminData | null;
  canManageLinks: boolean;
}) {
  const [modules, setModules] = useState(initialModules);
  const [activeModule, setActiveModule] = useState<string>(initialModules[0]?.key ?? "");
  const current = modules.find((m) => m.key === activeModule) ?? modules[0];
  const isAdminTab = current?.key === "admin" && adminData;

  function handleLinkUpdated(moduleKey: string, updatedLink: DashboardLink) {
    setModules((prev) =>
      prev.map((m) =>
        m.key === moduleKey
          ? { ...m, links: m.links.map((l) => (l.id === updatedLink.id ? updatedLink : l)) }
          : m
      )
    );
  }

  function handleLinkDeleted(moduleKey: string, linkId: string) {
    setModules((prev) =>
      prev.map((m) =>
        m.key === moduleKey ? { ...m, links: m.links.filter((l) => l.id !== linkId) } : m
      )
    );
  }

  if (!current) {
    return (
      <div className="relative flex min-h-screen items-center justify-center text-zinc-400">
        Nenhum módulo disponível para o seu usuário.
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col text-zinc-50">
      <AnimatedBackground />

      <nav className="sticky top-0 z-20 border-b border-[#ca2027]/25 bg-[#1c1719]/80 shadow-[0_1px_30px_rgba(202,32,39,0.15)] backdrop-blur-2xl">
        <div className="navbar-shimmer absolute inset-x-0 top-0 h-[2px]" />
        <div className="navbar-glow pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ca2027] to-transparent" />
        <div className="navbar-glow pointer-events-none absolute inset-x-0 -bottom-6 h-6 bg-gradient-to-b from-[#ca2027]/20 to-transparent blur-md" />

        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:px-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <Image
              src="/images/nav-icon.png"
              alt="Ícone do painel"
              width={64}
              height={64}
              className="h-16 w-16 object-contain drop-shadow-[0_0_15px_rgba(202,32,39,0.5)]"
            />
            <div className="md:hidden">
              <LogoutButton />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-between gap-4 md:justify-end">
            <div className="animated-border w-full rounded-full p-[1.5px] shadow-[0_0_20px_rgba(202,32,39,0.25)] md:w-auto">
            <div className="relative flex w-full gap-1 overflow-x-auto rounded-full bg-[#181516]/90 p-1 md:w-auto">
              {modules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m.key)}
                  className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    activeModule === m.key
                      ? "bg-gradient-to-r from-[#ca2027] to-[#a8181e] text-white shadow-[0_0_18px_rgba(202,32,39,0.55)]"
                      : "text-zinc-400 hover:bg-[#2a2426] hover:text-white"
                  }`}
                >
                  <span className="h-4 w-4">{getModuleIcon(m.icon)}</span>
                  {m.label}
                </button>
              ))}
            </div>
            </div>
            <div className="hidden md:block">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:px-10">
        <div className="fade-in-up mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#ca2027]/40 bg-[#ca2027]/10 px-3 py-1 text-xs font-medium text-[#ff8a8d]">
            <span className="h-4 w-4">{getModuleIcon(current.icon)}</span>
            Módulo
          </div>
          <h2 className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
            {current.label}
          </h2>
        </div>

        {isAdminTab && adminData ? (
          <AdminPanel
            initialUsers={adminData.users}
            roles={adminData.roles}
            initialModules={adminData.modules}
            initialAuditLogs={adminData.auditLogs}
            initialAuditLogsTotal={adminData.auditLogsTotal}
            canManageUsers={adminData.canManageUsers}
            canManageLinks={adminData.canManageLinks}
            canManageModules={adminData.canManageModules}
            initialPermissionGrants={adminData.permissionGrants}
          />
        ) : (
        <div className="fade-in-up grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {current.links.map((link) => (
            <div
              key={link.id}
              className="group relative animated-border rounded-2xl p-[1px] transition-transform hover:-translate-y-1"
              style={{ animationPlayState: "paused" }}
            >
              {canManageLinks && (
                <LinkQuickActions
                  link={link}
                  modules={modules}
                  onUpdated={handleLinkUpdated}
                  onDeleted={handleLinkDeleted}
                />
              )}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col justify-between rounded-2xl border border-[#3a3335] bg-[#211d1f]/85 p-5 backdrop-blur-xl transition-colors group-hover:border-[#ca2027]/60"
              >
                <div>
                  <div className="mb-2 flex items-center gap-2 pr-16">
                    <span className="h-4 w-4 text-[#ca2027]">
                      {getModuleIcon(link.icon ?? "default")}
                    </span>
                    <span className="font-semibold text-zinc-50 transition-colors group-hover:text-[#ff6b70]">
                      {link.title}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    {link.description}
                  </p>
                </div>
                <span className="pressable-btn mt-4 w-fit">
                  Acessar
                  <svg
                    className="h-3 w-3"
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
              </a>
            </div>
          ))}
        </div>
        )}
      </main>

      <footer className="relative border-t border-[#3a3335] px-6 py-6 text-center text-sm text-zinc-500">
        Painel criado para auxiliar edições no Adobe After Effects
      </footer>
    </div>
  );
}
