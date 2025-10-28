// src/components/TopBar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { ctaGhost } from "@/lib/glass";

type Tone = "white" | "sky";
export type TopBarLink = {
  href: string;
  label: string;
  badge?: number;
  tone?: Tone;
};

export function TopBar({
  links,
  srBrand = "MyHomeDox",
  logoAlt = "MyHomeDox",
}: {
  links: TopBarLink[];
  srBrand?: string;
  logoAlt?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  // close mobile menu on route changes
  useEffect(() => setOpen(false), [pathname]);

  const linkCn = useMemo(
    () => (href: string, extra = "") =>
      [
        ctaGhost,
        "rounded-full px-3 py-1.5 transition",
        pathname === href ? "bg-white text-slate-900 hover:bg-white" : "",
        extra,
      ].join(" "),
    [pathname]
  );

  return (
    <div className="sticky top-0 z-40">
      {/* header row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:py-5 text-white">
        {/* logo */}
        <Link href="/" className="inline-flex items-center gap-3 shrink-0">
          <Image
            src="/myhomedox_logo.png"
            alt={logoAlt}
            width={160}
            height={44}
            priority
            className="h-7 w-auto sm:h-9"
            sizes="(min-width: 640px) 160px, 120px"
          />
          <span className="sr-only">{srBrand}</span>
        </Link>

        {/* desktop nav (left) */}
        <nav className="hidden md:flex items-center gap-3">
          {links.map(({ href, label, badge, tone = "white" }) => (
            <Link key={href} href={href} className={linkCn(href)}>
              {label} {badge && badge > 0 ? <Badge tone={tone}>{badge}</Badge> : null}
            </Link>
          ))}
        </nav>

        {/* desktop auth (right) */}
        <div className="hidden md:flex items-center gap-2">
          {status === "authenticated" ? (
            <>
              <span className="text-white/85 text-sm">{session?.user?.email}</span>
              <button
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login?role=homeowner"
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
              >
                Homeowner Login
              </Link>

              <details className="relative group">
                <summary className="list-none cursor-pointer select-none rounded-full bg-white px-3 py-1.5 text-sm text-slate-900 hover:bg-white/90">
                  Pro Login
                </summary>
                <div
                  className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/20 bg-white/95 text-slate-900 shadow-lg"
                >
                  <Link
                    href="/login?role=realtor"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    Realtor
                  </Link>
                  <Link
                    href="/login?role=inspector"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    Inspector
                  </Link>
                  <Link
                    href="/login?role=contractor"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    Contractor
                  </Link>
                </div>
              </details>
            </>
          )}
        </div>

        {/* mobile hamburger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* mobile dropdown */}
      {open && (
        <div className="md:hidden">
          <div className="mx-auto max-w-7xl px-6 pb-3">
            <div className="rounded-2xl border border-white/15 bg-black/55 backdrop-blur-md p-2">
              <div className="grid grid-cols-2 gap-2">
                {links.map(({ href, label, badge, tone = "white" }, i) => (
                  <Link
                    key={href}
                    href={href}
                    className={linkCn(href, `w-full justify-center ${i === links.length - 1 ? "col-span-2" : ""}`)}
                  >
                    {label} {badge && badge > 0 ? <Badge tone={tone}>{badge}</Badge> : null}
                  </Link>
                ))}

                {/* mobile auth actions */}
                {status === "authenticated" ? (
                  <>
                    <div className="col-span-2 text-center text-white/85 text-sm py-1">
                      {session?.user?.email}
                    </div>
                    <button
                      className="col-span-2 inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login?role=homeowner"
                      className="col-span-2 inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                    >
                      Homeowner Login
                    </Link>
                    <Link
                      href="/login?role=realtor"
                      className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                    >
                      Realtor
                    </Link>
                    <Link
                      href="/login?role=inspector"
                      className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                    >
                      Inspector
                    </Link>
                    <Link
                      href="/login?role=contractor"
                      className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                    >
                      Contractor
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* divider */}
      <div className="mx-auto h-px max-w-7xl bg-white/15" />
    </div>
  );
}

function Badge({
  children,
  tone = "white",
}: {
  children: React.ReactNode;
  tone?: "white" | "sky";
}) {
  const toneClasses =
    tone === "sky"
      ? "border-sky-400/40 bg-sky-500/10 text-sky-100"
      : "border-white/30 bg-white/10 text-white/85";
  return (
    <span className={`ml-1 inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs ${toneClasses}`}>
      {children}
    </span>
  );
}