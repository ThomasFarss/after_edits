"use client";

import { useState } from "react";
import { getModuleIcon, isCustomIconUrl, MODULE_ICONS } from "./module-icons";
import type { DashboardLink, DashboardModule } from "./dashboard";

const ICON_OPTIONS = Object.keys(MODULE_ICONS);
const MAX_ICON_FILE_BYTES = 2 * 1024 * 1024;
const ICON_MAX_DIMENSION = 96;

const inputClass =
  "w-full rounded-lg border border-[#3a3335] bg-[#181516] px-3 py-2 text-sm text-white outline-none transition-all focus:border-[#ca2027] focus:shadow-[0_0_0_3px_rgba(202,32,39,0.15)]";
const buttonClass =
  "rounded-lg bg-gradient-to-r from-[#ca2027] to-[#a8181e] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(202,32,39,0.4)] transition-transform hover:scale-[1.015] disabled:opacity-60";
const ghostButtonClass =
  "rounded-lg border border-[#3a3335] bg-[#181516] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-[#2a2426]";

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        const scale = Math.min(1, ICON_MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Não foi possível processar a imagem."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

async function handleIconFileSelect(
  file: File | undefined,
  onSuccess: (dataUrl: string) => void,
  onError: (message: string) => void
) {
  if (!file) return;
  if (file.size > MAX_ICON_FILE_BYTES) {
    onError("Imagem muito grande. O limite é 2MB.");
    return;
  }
  try {
    const dataUrl = await resizeImageToDataUrl(file);
    onSuccess(dataUrl);
  } catch {
    onError("Não foi possível processar essa imagem.");
  }
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
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

// Botão discreto no canto do card de link, visível só pra quem tem
// links.manage (Editor/Admin) — abre um popup de edição rápida sem precisar
// ir até o painel Admin.
export function LinkQuickEditButton({
  link,
  modules,
  onUpdated,
}: {
  link: DashboardLink;
  modules: DashboardModule[];
  onUpdated: (moduleKey: string, updatedLink: DashboardLink) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        title="Editar link"
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-[#3a3335] bg-[#181516]/90 text-zinc-400 opacity-80 backdrop-blur transition-all hover:border-[#ca2027]/60 hover:text-[#ff8a8d] hover:opacity-100"
      >
        <PencilIcon className="h-3.5 w-3.5" />
      </button>
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#ca2027]/40 bg-[#141112] p-4 text-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#ca2027]/10 text-[#ff8a8d]">
              <PencilIcon className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm font-semibold text-zinc-200">Editar link</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-[#2a2426] hover:text-zinc-200"
            title="Fechar"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {error && <p className="mb-3 text-xs text-[#ff6b70]">{error}</p>}

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
          <div>
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
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                    icon === opt
                      ? "border-[#ca2027] bg-[#ca2027]/15 text-[#ff8a8d] shadow-[0_0_0_3px_rgba(202,32,39,0.15)]"
                      : "border-[#3a3335] bg-[#181516] text-zinc-400 hover:border-[#ca2027]/50 hover:text-zinc-200"
                  }`}
                >
                  <span className="h-4 w-4">{getModuleIcon(opt)}</span>
                </button>
              ))}
              {isCustomIconUrl(icon) && (
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#ca2027] bg-[#ca2027]/15 shadow-[0_0_0_3px_rgba(202,32,39,0.15)]">
                  <span className="h-5 w-5 overflow-hidden rounded">{getModuleIcon(icon)}</span>
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
                Enviar imagem do computador
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

        <div className="mt-4 flex justify-end gap-2 border-t border-[#3a3335] pt-3">
          <button type="button" className={ghostButtonClass} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" disabled={saving} className={buttonClass} onClick={handleSave}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
