"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { glass, heading, ctaGhost } from "@/lib/glass";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function Modal({ open, onClose, title, children }: Props) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;

  const body = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={
          // scrollable panel with comfy bottom padding + safe-area
          `${glass} relative z-10 w-full max-w-xl p-4 sm:p-5 pb-8
           max-h-[min(85vh,100svh-2rem)] overflow-y-auto overscroll-contain
           [padding-bottom:clamp(1rem,env(safe-area-inset-bottom),2rem)]`
        }
      >
        <div className="flex items-start justify-between gap-3">
          {title ? (
            <h2 id="modal-title" className={`text-xl font-semibold ${heading}`}>{title}</h2>
          ) : <span className="sr-only">Dialog</span>}
          <button className={ctaGhost} onClick={onClose} aria-label="Close">Close</button>
        </div>
        {/* consistent inner spacing so nothing crowds the edges */}
        <div className="mt-3 space-y-3">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
