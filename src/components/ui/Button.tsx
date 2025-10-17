// src/components/ui/Button.tsx
"use client";
import * as React from "react";
import { ctaPrimary, ctaGhost } from "@/lib/glass";

type Size = "sm" | "md";
type Variant = "primary" | "ghost";

type ButtonBase = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
};

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonBase & { asChild?: true; href: string };

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonBase & { asChild?: false | undefined };

type Props = AnchorProps | NativeButtonProps;

const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0";
const sizeMap: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};
const variantMap: Record<Variant, string> = {
  primary: ctaPrimary,
  ghost: ctaGhost,
};

export function Button(props: Props) {
  const {
    variant = "primary",
    size = "md",
    className = "",
    children,
    ...rest
  } = props as any;

  const classes = `${base} ${sizeMap[size]} ${variantMap[variant]} ${className}`;

  // Link-style button (anchor)
  if ("asChild" in props && props.asChild) {
    const { href, target, rel, ...aRest } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} target={target} rel={rel} className={classes} {...aRest}>
        {children}
      </a>
    );
  }

  // Native button; default type="button" to avoid accidental submits
  const { type, ...btnRest } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type ?? "button"} className={classes} {...btnRest}>
      {children}
    </button>
  );
}

// Convenience wrapper matching your old export; this uses the glass Ghost style and supports size/className.
export function GhostButton(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: Size; className?: string }) {
  const { className = "", size = "md", type, ...rest } = props;
  const classes = `${base} ${sizeMap[size]} ${ctaGhost} ${className}`;
  return <button type={type ?? "button"} className={classes} {...rest} />;
}
