"use client";

import * as React from "react";
import {
  glass,
  glassTight,
  heading,
  textMeta,
  fieldInput,
  fieldLabel as fieldLabelToken,
} from "@/lib/glass";

// 1) Re-export buttons from ./Button (make sure this file exists, see below)
export { Button, GhostButton } from "./Button";

// 2) Re-export label token so callers can import from "@/components/ui"
export const fieldLabel = fieldLabelToken;

// 3) Inputs with dark-glass styling
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`${fieldInput} ${className}`} {...props} />
  )
);
Input.displayName = "Input";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => (
    <select ref={ref} className={`${fieldInput} ${className}`} {...props}>
      {children}
    </select>
  )
);
Select.displayName = "Select";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => (
    <textarea ref={ref} className={`${fieldInput} ${className}`} {...props} />
  )
);
Textarea.displayName = "Textarea";

// 4) Shared Card and Stat to satisfy imports like `import { Card, Stat } from "@/components/ui"`
export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={glass}>
      <h2 className={`mb-2 text-lg font-medium ${heading}`}>{title}</h2>
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className={glassTight} role="group" aria-label={label}>
      <div className={`flex items-center gap-1 text-sm ${textMeta}`}>
        <span>{label}</span>
        {hint && (
          <span aria-label={hint} title={hint} className="cursor-help">
            ⓘ
          </span>
        )}
      </div>
      <div className="mt-1 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
