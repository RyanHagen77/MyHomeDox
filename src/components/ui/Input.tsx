// src/components/ui/Input.tsx
import * as React from "react";
import { cn } from "@/lib/cn";


/* ===== Input ===== */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-md border border-border bg-white px-3 py-2 text-sm",
      "placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/40",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

/* ===== Select ===== */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full rounded-md border border-border bg-white px-3 py-2 text-sm",
      "focus:outline-none focus:ring-2 focus:ring-accent/40",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

/* ===== Textarea ===== */
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-md border border-border bg-white px-3 py-2 text-sm",
      "placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/40",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
