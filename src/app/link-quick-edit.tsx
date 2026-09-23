"use client";

import { useState } from "react";
import { getModuleIcon, isCustomIconUrl, MODULE_ICONS } from "./module-icons";
import { ModalPortal } from "./modal-portal";
import { handleIconFileSelect } from "@/lib/icon-upload";
import type { DashboardLink, DashboardModule } from "./dashboard";

const ICON_OPTIONS = Object.keys(MODULE_ICONS);

const inputClass =
  "w-full rounded-lg border border-[#3a3335] bg-[#181516] px-3 py-2 text-sm text-white outline-none transition-all focus:border-[#ca2027] focus:shadow-[0_0_0_3px_rgba(202,32,39,0.15)]";
const buttonClass =
  "rounded-lg bg-gradient-to-r from-[#ca2027] to-[#a8181e] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(202,32,39,0.4)] transition-transform hover:scale-[1.015] disabled:opacity-60";
const ghostButtonClass =
  "rounded-lg border border-[#3a3335] bg-[#181516] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-[#2a2426]";

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.166L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// Botões fixos no canto do card de link (edição + exclusão), visíveis só pra
// quem tem links.manage (Editor/Admin) — não ficam dentro do <a> nem do
// grupo do botão "Acessar", então não interferem no hover/clique dele.
export function LinkQuickActions({
  link,
  modules,
  onUpdated,
  onDeleted,
}: {
  link: DashboardLink;
  modules: DashboardModule[];
  onUpdated: (moduleKey: string, updatedLink: DashboardLink) => void;
  onDeleted: (moduleKey: string, linkId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Excluir o link "${link.title}"? Essa ação não pode ser desfeita.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/links/${link.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      const moduleKey = modules.find((m) => m.links.some((l) => l.id === link.id))?.key ?? "";
      onDeleted(moduleKey, link.id);
    }
  }

  return (
    <>
      <div className="absolute right-3 top-3 z-10 flex gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          title="Editar link"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#3a3335] bg-[#181516]/95 text-zinc-400 backdrop-blur transition-colors hover:border-[#ca2027]/60 hover:text-[#ff8a8d]"
        >
          <PencilIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={handleDelete}
          title="Excluir link"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-900/60 bg-[#181516]/95 text-red-400 backdrop-blur transition-colors hover:bg-red-950/60 disabled:opacity-50"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      {open && (
        <LinkQuickEditModal
          link={link}
          modules={modules}
          onClose={() => setOpen(false)}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}

function LinkQuickEditModal({
  link,
  modules,
  onClose,
  onUpdated,
}: {
  link: DashboardLink;
  modules: DashboardModule[];
  onClose: () => void;
  onUpdated: (moduleKey: string, updatedLink: DashboardLink) => void;
}) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [description, setDescription] = useState(link.description ?? "");
  const [icon, setIcon] = useState(link.icon ?? "default");
  const [customIconUrl, setCustomIconUrl] = useState(
    isCustomIconUrl(link.icon ?? "") ? link.icon ?? "" : ""
  );
  const [iconFileError, setIconFileError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sourceModule = modules.find((m) => m.links.some((l) => l.id === link.id));

  async function handleSave() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, description, icon }),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      const moduleKey = modules.find((m) => m.id === updated.moduleId)?.key ?? modules[0]?.key ?? "";
      onUpdated(moduleKey, updated);
      onClose();
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Erro ao salvar link");
    }
  }

  return (
    <ModalPortal onClose={onClose}>
      <div
        className="animated-border w-full max-w-2xl rounded-2xl p-[1px] shadow-[0_25px_70px_rgba(0,0,0,0.6)]"
        style={{ animationPlayState: "paused" }}
      >
        <div className="max-h-[85vh] overflow-y-auto rounded-2xl border border-[#3a3335] bg-[#181113] p-5">
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-[#3a3335] pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ca2027]/10 text-[#ff8a8d]">
                <PencilIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-base font-semibold text-white">Editar link</p>
                {sourceModule && (
                  <p className="flex items-center gap-1 text-xs text-zinc-500">
                    <span className="h-3 w-3">{getModuleIcon(sourceModule.icon)}</span>
                    {sourceModule.label}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-[#2a2426] hover:text-zinc-200"
              title="Fechar"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
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
                <p className="mt-1 text-[11px] text-zinc-500">Troque aqui se o link original expirou.</p>
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
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
