"use client";

import { glass, glassTight, ctaGhost, ctaPrimary, heading } from "@/lib/glass";

export default function AccountPage() {
  return (
    <main className="relative min-h-screen text-white">
      {/* Fixed background (same as landing) */}
      <div className="fixed inset-0 -z-50">
        <img src="/myhomedox_home3.webp" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.45))]" />
      </div>

      <div className="mx-auto max-w-3xl p-6 space-y-6">
        {/* Header (no modals on this page) */}
        <header className="flex items-center justify-between">
          <h1 className={`text-3xl font-semibold tracking-tight ${heading}`}>Account</h1>
          <nav className="flex items-center gap-2">
            <a className={`${ctaGhost} rounded-full`} href="/home">
              My Home
            </a>
          </nav>
        </header>

        {/* Profile card */}
        <section className={glass}>
          <h2 className={`mb-2 text-lg font-medium ${heading}`}>Profile</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-white/70 text-sm">Name</span>
              <input
                className="mt-1 w-full rounded-lg bg-black/30 text-white placeholder:text-white/50 border border-white/20 p-2"
                defaultValue="Homeowner"
              />
            </label>
            <label className="block">
              <span className="text-white/70 text-sm">Email</span>
              <input
                className="mt-1 w-full rounded-lg bg-black/30 text-white placeholder:text-white/50 border border-white/20 p-2"
                defaultValue="you@example.com"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button className={ctaPrimary}>Save</button>
            <a className={ctaGhost} href="/billing">Billing</a>
          </div>
        </section>

        {/* Access & Security */}
        <section className={glass}>
          <h2 className={`mb-2 text-lg font-medium ${heading}`}>Access &amp; Security</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <a className={ctaGhost} href="/access">Shared Access</a>
            <button className={ctaGhost} onClick={() => alert("Signed out (stub).")}>
              Sign out
            </button>
          </div>
        </section>

        {/* Subscription */}
        <section className={glass}>
          <h2 className={`mb-2 text-lg font-medium ${heading}`}>Subscription</h2>
          <div className={glassTight}>
            <p className="text-white/85">Homefax Basic</p>
            <p className="text-white/70 text-sm">Manage your plan and payment details.</p>
          </div>
          <div className="mt-3">
            <a className={ctaGhost} href="/billing">Manage billing</a>
          </div>
        </section>

        <div className="h-12" />
      </div>
    </main>
  );
}
