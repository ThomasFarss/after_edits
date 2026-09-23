"use client";

import { useState } from "react";
import { ModalPortal } from "../modal-portal";

const inputClass =
  "w-full rounded-lg border border-[#3a3335] bg-[#181516] px-3 py-2 text-sm text-white outline-none transition-all focus:border-[#ca2027] focus:shadow-[0_0_0_3px_rgba(202,32,39,0.15)]";
const buttonClass =
  "flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ca2027] to-[#a8181e] py-2.5 font-semibold text-white shadow-[0_4px_20px_rgba(202,32,39,0.4)] transition-transform hover:scale-[1.015] disabled:opacity-60 disabled:hover:scale-100";
const ghostButtonClass =
  "rounded-lg border border-[#3a3335] bg-[#181516] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-[#2a2426]";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export function AccessRequestButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-[#ff8a8d]"
      >
        <MailIcon className="h-3.5 w-3.5" />
        Não tem uma conta? Solicitar acesso
      </button>
      {open && <AccessRequestModal onClose={() => setOpen(false)} />}
    </>
  );
}

function AccessRequestModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/access-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, reason, referredBy }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Não foi possível enviar o pedido. Tente novamente.");
    }
  }

  return (
    <ModalPortal onClose={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-[#ca2027]/40 bg-[#181113] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        {sent ? (
          <div className="text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <CheckIcon className="h-6 w-6" />
            </span>
            <p className="mb-1 text-sm font-semibold text-zinc-100">Pedido enviado!</p>
            <p className="mb-5 text-xs text-zinc-500">
              Assim que for avaliado, você recebe seu acesso.
            </p>
            <button type="button" className={ghostButtonClass} onClick={onClose}>
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ca2027]/10 text-[#ff8a8d]">
                <MailIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-base font-semibold text-white">Solicitar acesso</p>
                <p className="text-xs text-zinc-500">Conta seu pedido pra gente</p>
              </div>
            </div>

            {error && <p className="mb-3 text-xs text-[#ff6b70]">{error}</p>}

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-zinc-400">Seu nome</label>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como podemos te chamar"
                required
              />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-zinc-400">Por que você quer acesso?</label>
              <textarea
                className={`${inputClass} min-h-[80px] resize-none`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Conte rapidinho o motivo"
                required
              />
            </div>
            <div className="mb-5">
              <label className="mb-1 block text-xs font-medium text-zinc-400">Quem te passou o link?</label>
              <input
                className={inputClass}
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                placeholder="Nome de quem te indicou"
                required
              />
            </div>

            <button type="submit" disabled={loading} className={buttonClass}>
              {loading ? "Enviando..." : "Enviar pedido"}
            </button>
            <button type="button" onClick={onClose} className="mt-2 w-full text-center text-xs text-zinc-500 hover:text-zinc-300">
              Cancelar
            </button>
          </form>
        )}
      </div>
    </ModalPortal>
  );
}
