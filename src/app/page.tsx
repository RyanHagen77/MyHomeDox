"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button, Input } from "@/components/ui";
import type { PropertyPayload } from "@/lib/types";

type Audience = "home" | "pro";

export default function Page() {
  const search = useSearchParams();
  const router = useRouter();
  const initial = (search.get("audience") as Audience) || "home";
  const [aud, setAud] = useState<Audience>(initial);

  useEffect(() => {
    const qs = new URLSearchParams(Array.from(search.entries()));
    qs.set("audience", aud);
    router.replace(`/?${qs.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aud]);

  const [addr, setAddr] = useState("");
  const [data, setData] = useState<PropertyPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setData(null);
    try {
      const res = await fetch("/api/property/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
      });
      if (!res.ok) throw new Error("Lookup failed");
      setData(await res.json());
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const hero = useMemo(() => {
    if (aud === "home") {
      return {
        headline: "The home record your buyers trust.",
        sub: "Store repairs, warranties, and upgrades — then share a verified report in one click. Invite realtors and contractors with controlled access.",
        primary: { label: "Create home record", href: "/home" },
        secondary: { label: "See sample report", href: "/report" },
        showAddress: true,
      };
    }
    return {
      headline: "Verified home history for every listing.",
      sub: "Request owner-controlled service records to reduce contingencies, build buyer confidence, and speed up closings.",
      primary: { label: "Request records from owner", href: "/share" },
      secondary: { label: "View sample report", href: "/report" },
      showAddress: false,
    };
  }, [aud]);

  return (
    <main className="relative min-h-screen text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-50">
        <img src="/myhomedox_home3.webp" alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.45))]" />
      </div>

      {/* Top bar */}
      <div className="mx-auto max-w-6xl px-4 md:px-8 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-3 shrink-0">
            <Image
              src="/myhomedox_logo.png"
              alt="MyHomeDox"
              width={180}
              height={50}
              priority
              className="h-7 w-auto sm:h-9"
            />
          </div>

          {/* Right side – wraps nicely on small screens */}
          <div className="ml-auto flex items-center gap-2 basis-full sm:basis-auto sm:ml-auto">
            <a
              href="/home"
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto"
            >
              Homeowner Login
            </a>

            {/* Pro login dropdown */}
            <div className="relative w-full sm:w-auto">
              <details className="group">
                <summary className="list-none cursor-pointer select-none rounded-full bg-white px-3 py-1.5 text-center text-sm text-slate-900 hover:bg-white/90">
                  Pro Login
                </summary>

                <div
                  className="z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/20 bg-white/95 text-slate-900 shadow-lg sm:absolute sm:right-0 sm:w-56"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    onClick={() => router.push("/pro/realtor?type=realtor")}
                  >
                    Realtor
                  </button>
                  <button
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    onClick={() => router.push("/pro?type=inspector")}
                  >
                    Inspector
                  </button>
                  <button
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    onClick={() => router.push("/pro/contractor?type=contractor")}
                  >
                    Contractor
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Hero – LEFT ALIGNED */}
      <section className="px-4 pt-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Audience pills (compact, left aligned) */}
          <div className="mb-4 inline-flex overflow-hidden rounded-full border border-white/20 bg-white/10 p-0.5 backdrop-blur-sm">
            <button
              onClick={() => setAud("home")}
              className={`px-3 py-1 text-xs rounded-full transition ${aud === "home" ? "bg-white text-slate-900" : "text-white/85 hover:text-white"}`}
            >
              For Homeowners
            </button>
            <button
              onClick={() => setAud("pro")}
              className={`px-3 py-1 text-xs rounded-full transition ${aud === "pro" ? "bg-white text-slate-900" : "text-white/85 hover:text-white"}`}
            >
              For Pros
            </button>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-semibold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {hero.headline}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">{hero.sub}</p>

          {/* CTAs (left aligned, wrap on small) */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium text-white
                         bg-[rgba(243,90,31,0.85)] hover:bg-[rgba(243,90,31,0.95)]
                         border border-white/30 backdrop-blur
                         shadow-[0_8px_24px_rgba(243,90,31,.25)] transition w-full sm:w-auto"
              onClick={() => window.location.assign(hero.primary.href)}
            >
              {hero.primary.label}
            </button>
            <button
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium
                         border border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur transition w-full sm:w-auto"
              onClick={() => window.location.assign(hero.secondary.href)}
            >
              {hero.secondary.label}
            </button>
          </div>

          {/* Address input (left, stacks on small) */}
          <div className="mt-8">
            <div className={hero.showAddress ? "" : "invisible"}>
              <form
                onSubmit={onLookup}
                className="flex w-full max-w-xl items-stretch gap-2 sm:gap-3"
              >
                <Input
                  placeholder="Look up an address (e.g., 2147 Oakview Dr, Austin, TX)"
                  value={addr}
                  onChange={(e) => setAddr(e.target.value)}
                  className="
                    h-11 rounded-xl
                    bg-white/95 text-slate-900 placeholder:text-slate-500
                    ring-1 ring-white/30 focus:ring-2 focus:ring-[#F35A1F]
                    shadow-[0_2px_12px_rgba(0,0,0,.12)]
                    flex-1
                  "
                />
                <Button
                  type="submit"
                  disabled={!addr || loading}
                  className="
                    h-11 rounded-xl px-4 sm:min-w-[112px]
                    text-white border border-white/30 backdrop-blur
                    bg-[rgba(243,90,31,0.85)] hover:bg-[rgba(243,90,31,0.95)]
                    shadow-[0_8px_24px_rgba(243,90,31,.25)] transition
                  "
                >
                  {loading ? "Looking…" : "Visit home"}
                </Button>
              </form>
            </div>
            {error && <p className="mt-2 text-sm text-red-200">{error}</p>}
          </div>
        </div>
      </section>

      {/* Content sections */}
      <section className="mx-auto mt-12 max-w-6xl px-4 md:px-8">
        {/* Value props */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {(aud === "home"
            ? [
                ["Single source of truth", "All repairs, upgrades, and warranties in one place."],
                ["Verified service history", "Provider verification that builds buyer trust."],
                ["Share control", "Invite realtors or contractors with role-based access."],
                ["Smart ownership", "Maintenance reminders and warranty expirations handled."],
              ]
            : [
                ["Deal readiness", "Verified histories reduce surprises and renegotiations."],
                ["Buyer confidence", "Proof of upkeep to justify price and terms."],
                ["Collaboration", "Request and review records securely with clients."],
                ["Integrations", "Export to CRM/MLS workflows."],
              ]
          ).map(([t, d]) => (
            <div
              key={t as string}
              className="space-y-2 rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-sm
                         shadow-[inset_0_1px_0_rgba(255,255,255,.25)] hover:bg-white/15 transition"
            >
              <div className="text-base font-medium">{t}</div>
              <p className="text-sm text-white/85">{d}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {(aud === "home"
            ? [
                ["1", "Claim your home", "Start from an address and we’ll prefill details."],
                ["2", "Add records", "Upload receipts and link vendors; we auto-tag and organize."],
                ["3", "Share the report", "Invite buyers, agents, or pros with a magic link."],
              ]
            : [
                ["1", "Request records", "Ask the owner for a verified Homefax with one link."],
                ["2", "Review & attach", "Add to your listing package, disclosures, or CRM."],
                ["3", "Win trust", "Reduce contingencies and speed up closings."],
              ]
          ).map(([s, t, d]) => (
            <div
              key={s}
              className="space-y-2 rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-sm
                         shadow-[inset_0_1px_0_rgba(255,255,255,.25)] hover:bg-white/15 transition"
            >
              <div className="text-xs text-white/70">Step {s}</div>
              <div className="text-base font-medium">{t}</div>
              <p className="text-sm text-white/85">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preview state */}
      {loading && (
        <div className="mx-auto mt-6 max-w-6xl px-4 md:px-8">
          <div className="h-24 animate-pulse rounded-2xl bg-white/10 backdrop-blur-sm" />
        </div>
      )}
      {data && (
        <section className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-6 px-4 md:grid-cols-3 md:px-8">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-sm">
            <h3 className="text-lg font-medium">Property</h3>
            <p className="text-white/85">{data.property.address}</p>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-sm">
              <div className="text-xs text-white/70">Est. Value</div>
              <div className="text-lg font-semibold">
                {data.property.estValue.toLocaleString(undefined, { style: "currency", currency: "USD" })}
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-sm">
              <div className="text-xs text-white/70">Beds/Baths</div>
              <div className="text-lg font-semibold">{data.property.beds}/{data.property.baths}</div>
            </div>
          </div>
        </section>
      )}

      <div className="h-16" />
    </main>
  );
}
