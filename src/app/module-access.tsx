"use client";

import { useEffect, useState } from "react";
import { getModuleIcon, isCustomIconUrl, MODULE_ICONS } from "./module-icons";
import { ModalPortal } from "./modal-portal";
import { handleIconFileSelect } from "@/lib/icon-upload";
import type { DashboardLink } from "./dashboard";

const ICON_OPTIONS = Object.keys(MODULE_ICONS);

const inputClass =
  "w-full rounded-lg border border-[#3a3335] bg-[#181516] px-3 py-2 text-sm text-white outline-none transition-all focus:border-[#ca2027] focus:shadow-[0_0_0_3px_rgba(202,32,39,0.15)]";
const buttonClass =
  "rounded-lg bg-gradient-to-r from-[#ca2027] to-[#a8181e] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(202,32,39,0.4)] transition-transform hover:scale-[1.015] disabled:opacity-60";
const ghostButtonClass =
  "rounded-lg border border-[#3a3335] bg-[#181516] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-[#2a2426]";

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
    </svg>
  );
}

function DotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

// Card tracejado "+ Adicionar link" no fim da grade — só aparece pra quem
// administra o módulo (links.manage global ou admin delegado via "Acesso
// módulo").
export function AddLinkCard({
  moduleId,
  onCreated,
}: {
  moduleId: string;
  onCreated: (link: DashboardLink) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-full min-h-[168px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#3a3335] text-zinc-500 transition-colors hover:border-[#ca2027]/60 hover:text-[#ff8a8d]"
      >
        <PlusIcon className="h-6 w-6" />
        <span className="text-sm font-medium">Adicionar link</span>
      </button>
      {open && (
        <AddLinkModal moduleId={moduleId} onClose={() => setOpen(false)} onCreated={onCreated} />
      )}
    </>
  );
}

function AddLinkModal({
  moduleId,
  onClose,
  onCreated,
}: {
  moduleId: string;
  onClose: () => void;
  onCreated: (link: DashboardLink) => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("default");
  const [customIconUrl, setCustomIconUrl] = useState("");
  const [iconFileError, setIconFileError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, description, icon, moduleId }),
    });
    setSaving(false);
    if (res.ok) {
      onCreated(await res.json());
      onClose();
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Erro ao criar link");
    }
  }

  return (
    <ModalPortal onClose={onClose}>
      <div
        className="animated-border w-full max-w-2xl rounded-2xl p-[1px] shadow-[0_25px_70px_rgba(0,0,0,0.6)]"
        style={{ animationPlayState: "paused" }}
      >
        <div className="max-h-[85vh] overflow-y-auto rounded-2xl border border-[#3a3335] bg-[#181113] p-5">
          <div className="mb-4 flex items-center gap-3 border-b border-[#3a3335] pb-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ca2027]/10 text-[#ff8a8d]">
              <PlusIcon className="h-4 w-4" />
            </span>
            <p className="text-base font-semibold text-white">Novo link</p>
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-[#ca2027]/40 bg-[#ca2027]/10 px-3 py-2 text-xs text-[#ff6b70]">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">Título do botão</label>
                <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">URL de destino</label>
                <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">Descrição</label>
                <input
                  className={inputClass}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">Pré-visualização</label>
              <div
                className="animated-border mb-3 rounded-2xl p-[1px]"
                style={{ animationPlayState: "paused" }}
              >
                <div className="flex flex-col justify-between rounded-2xl border border-[#3a3335] bg-[#211d1f]/85 p-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-4 w-4 text-[#ca2027]">{getModuleIcon(icon)}</span>
                      <span className="truncate font-semibold text-zinc-50">{title || "Título do botão"}</span>
                    </div>
                    <p className="text-sm text-zinc-400">{description || "A descrição aparece aqui."}</p>
                  </div>
                  <span className="pressable-btn mt-4 w-fit">Acessar</span>
                </div>
              </div>

              <label className="mb-2 block text-xs font-medium text-zinc-400">Ícone</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setCustomIconUrl("");
                      setIcon(opt);
                    }}
                    title={opt}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                      icon === opt
                        ? "border-[#ca2027] bg-[#ca2027]/15 text-[#ff8a8d] shadow-[0_0_0_3px_rgba(202,32,39,0.15)]"
                        : "border-[#3a3335] bg-[#181516] text-zinc-400 hover:border-[#ca2027]/50 hover:text-zinc-200"
                    }`}
                  >
                    <span className="h-4 w-4">{getModuleIcon(opt)}</span>
                  </button>
                ))}
                {isCustomIconUrl(icon) && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ca2027] bg-[#ca2027]/15 shadow-[0_0_0_3px_rgba(202,32,39,0.15)]">
                    <span className="h-4 w-4 overflow-hidden rounded">{getModuleIcon(icon)}</span>
                  </span>
                )}
              </div>
              <input
                className={`${inputClass} mt-2`}
                placeholder="Ou cole a URL de uma imagem"
                value={customIconUrl}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomIconUrl(value);
                  setIcon(value.trim() ? value.trim() : "default");
                }}
              />
              <div className="mt-2">
                <label className={`${ghostButtonClass} inline-flex cursor-pointer`}>
                  Enviar imagem
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      setIconFileError("");
                      handleIconFileSelect(
                        e.target.files?.[0],
                        (dataUrl) => {
                          setCustomIconUrl(dataUrl);
                          setIcon(dataUrl);
                        },
                        setIconFileError
                      );
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              {iconFileError && <p className="mt-1 text-[11px] text-[#ff6b70]">{iconFileError}</p>}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t border-[#3a3335] pt-4">
            <button type="button" className={ghostButtonClass} onClick={onClose}>
              Cancelar
            </button>
            <button type="button" disabled={saving} className={buttonClass} onClick={handleSave}>
              {saving ? "Criando..." : "Adicionar"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

type OverrideState = "inherit" | "allow" | "block";
type ModuleVisibilityUser = {
  id: string;
  name: string;
  email: string;
  roleName: string;
  state: OverrideState;
};

// Botão "Gerenciar acesso" ao lado do título do módulo — só pra quem
// administra o módulo. Abre um popup pra decidir quem enxerga a aba.
export function ModuleVisibilityButton({ moduleId, moduleLabel }: { moduleId: string; moduleLabel: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 ${ghostButtonClass}`}
        title="Gerenciar quem pode ver este módulo"
      >
        <UsersIcon className="h-3.5 w-3.5" /> Gerenciar acesso
      </button>
      {open && (
        <ModuleVisibilityModal moduleId={moduleId} moduleLabel={moduleLabel} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

const overrideOptions: {
  key: OverrideState;
  shortLabel: string;
  icon: (props: { className?: string }) => React.ReactNode;
  activeClass: string;
}[] = [
  { key: "inherit", shortLabel: "Padrão", icon: DotIcon, activeClass: "border-zinc-400 bg-zinc-400/15 text-zinc-200" },
  { key: "allow", shortLabel: "Mostrar", icon: EyeIcon, activeClass: "border-emerald-500 bg-emerald-500/15 text-emerald-300" },
  { key: "block", shortLabel: "Ocultar", icon: EyeOffIcon, activeClass: "border-[#ca2027] bg-[#ca2027]/15 text-[#ff8a8d]" },
];

function ModuleVisibilityModal({
  moduleId,
  moduleLabel,
  onClose,
}: {
  moduleId: string;
  moduleLabel: string;
  onClose: () => void;
}) {
  const [users, setUsers] = useState<ModuleVisibilityUser[] | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/modules/${moduleId}/visibility`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ModuleVisibilityUser[]) => {
        if (!cancelled) setUsers(data);
      });
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  async function handleChange(userId: string, state: OverrideState) {
    setPendingUserId(userId);
    setError("");
    const prev = users?.find((u) => u.id === userId)?.state ?? "inherit";
    setUsers((list) => list?.map((u) => (u.id === userId ? { ...u, state } : u)) ?? list);
    const res = await fetch(`/api/modules/${moduleId}/visibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, state }),
    });
    setPendingUserId(null);
    if (!res.ok) {
      setUsers((list) => list?.map((u) => (u.id === userId ? { ...u, state: prev } : u)) ?? list);
      setError("Não foi possível salvar essa alteração.");
    }
  }

  return (
    <ModalPortal onClose={onClose}>
      <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#ca2027]/40 bg-[#181113] p-4 text-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#ca2027]/10 text-[#ff8a8d]">
            <UsersIcon className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-200">Gerenciar acesso</p>
            <p className="text-xs text-zinc-500">Quem pode ver o módulo &quot;{moduleLabel}&quot;</p>
          </div>
        </div>

        {error && <p className="mb-3 text-xs text-[#ff6b70]">{error}</p>}

        {!users ? (
          <p className="text-xs text-zinc-500">Carregando...</p>
        ) : (
          <ul className="space-y-2">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#3a3335] bg-[#1c1719] px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-100">{u.name}</p>
                  <p className="text-[11px] text-zinc-500">
                    {u.email} · {u.roleName}
                  </p>
                </div>
                <div className="inline-flex overflow-hidden rounded-lg border border-[#3a3335]">
                  {overrideOptions.map((opt, i) => {
                    const Icon = opt.icon;
                    const isActive = u.state === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        disabled={pendingUserId === u.id}
                        onClick={() => handleChange(u.id, opt.key)}
                        className={`inline-flex items-center gap-1.5 border-l px-2.5 py-1.5 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          i === 0 ? "border-l-0" : "border-[#3a3335]"
                        } ${isActive ? opt.activeClass : "bg-[#181516] text-zinc-500 hover:bg-[#211d1f] hover:text-zinc-300"}`}
                      >
                        <Icon className="h-3 w-3" />
                        <span className="hidden sm:inline">{opt.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex justify-end border-t border-[#3a3335] pt-3">
          <button type="button" className={ghostButtonClass} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
