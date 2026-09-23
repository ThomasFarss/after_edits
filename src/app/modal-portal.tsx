"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

// Portal compartilhado por todo modal do app. Ancestrais com transform/filter
// (ex: animações com fill-mode "both" como .fade-in-up, ou .animated-border)
// viram containing block pra position:fixed e quebram um overlay comum —
// renderizar direto no document.body evita isso de vez, sem depender de cada
// modal lembrar de fazer o wrap sozinho.
export function ModalPortal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    document.body
  );
}
