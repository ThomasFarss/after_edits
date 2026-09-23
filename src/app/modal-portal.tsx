"use client";

import { useEffect, useRef } from "react";
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
  // Só fecha se o mousedown E o click aconteceram os dois direto no fundo
  // (não em algo dentro do modal). Sem isso, selecionar/arrastar um texto
  // dentro de um campo (ex: colando uma URL longa) e soltar o mouse um
  // pouco fora do card fazia o "click" nativo cair no fundo e fechar o
  // popup do nada.
  const mouseDownOnBackdrop = useRef(false);

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
      onMouseDown={(e) => {
        mouseDownOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (mouseDownOnBackdrop.current && e.target === e.currentTarget) onClose();
      }}
    >
      <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}
