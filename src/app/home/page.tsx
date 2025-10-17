// src/app/home/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AddRecordModal } from "@/components/AddRecordModal";
import { ShareAccessModal } from "@/components/ShareAccessModal";
import { AddReminderModal } from "@/components/AddReminderModal";
import { FindVendorsModal } from "@/components/FindVendorModal"; // <-- plural path
import { AddWarrantyModal } from "@/components/AddWarrantyModal";
import { saveJSON, loadJSON } from "@/lib/storage";
import { glass, glassTight, textMeta, ctaPrimary, ctaGhost, heading } from "@/lib/glass";
import { lookupByAddress } from "@/lib/mock";

import HomeTopBar from "./_components/HomeTopBar";

type RecordItem = {
  id: string; date: string; title: string; vendor: string; cost: number;
  verified: boolean; attachments: string[]; category: string;
};
type Property = {
  id: string; address: string; photo: string; yearBuilt: number; sqft: number;
  beds: number; baths: number; estValue: number; healthScore: number; lastUpdated: string;
};
type Reminder = { id: string; title: string; due: string };
type Warranty = { id: string; item: string; vendor: string; expires: string };
type Vendor = { id: string; name: string; type: string; verified: boolean; rating: number };

type HomeData = {
  property: Property;
  records: RecordItem[];
  reminders: Reminder[];
  warranties: Warranty[];
  vendors: Vendor[];
};

type PurchasedHome = { id: string; address: string; photo?: string; readonly?: boolean };

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  // Existing modals
  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // NEW: modal state
  const [hydrated, setHydrated] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [serviceVendor, setServiceVendor] = useState<Vendor | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [findVendorsOpen, setFindVendorsOpen] = useState(false);
  const [warrantyOpen, setWarrantyOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Prefer cached payload from landing; fall back to mock.ts
      const cached = loadJSON<HomeData | null>("currentHome", null);
      if (cached) {
        const persistedRecords = loadJSON<RecordItem[] | null>("records", null);
        const persistedRem = loadJSON<Reminder[] | null>("reminders", null);
        const persistedWar = loadJSON<Warranty[] | null>("warranties", null);
        const persistedVendors = loadJSON<Vendor[] | null>("vendors", null);
        setData({
          ...cached,
          records: persistedRecords ?? cached.records,
          reminders: persistedRem ?? cached.reminders ?? [],
          warranties: persistedWar ?? cached.warranties ?? [],
          vendors: persistedVendors ?? cached.vendors,
        });
        setHydrated(true);    // <-- add this line
        setLoading(false);
        return;
      }

      // Address handoff or default
      const addr = loadJSON<string>("lastSearchedAddress", "1842 Maple St, Austin, TX 78704");
      const { property, records, vendors } = await lookupByAddress(addr);

      const d: HomeData = {
        property: {
          id: property.id,
          address: addr,
          photo: "/myhomedox_homeowner1.jpg",
          yearBuilt: property.yearBuilt,
          sqft: property.sqft,
          beds: property.beds,
          baths: property.baths,
          estValue: property.estValue,
          healthScore: property.healthScore,
          lastUpdated: property.lastUpdated,
        },
        records: records.map((r) => ({
          id: r.id,
          date: r.date,
          title: r.category,
          vendor: r.vendor,
          cost: r.cost,
          verified: r.verified,
          attachments: [],
          category: r.category,
        })),
        reminders: [
          {
            id: "rem1",
            title: "Change HVAC Filter",
            due: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days out
          },
          {
            id: "rem2",
            title: "Clean Gutters",
            due: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(), // 3 months out
          },
        ],

        warranties: [
          {
            id: "war1",
            item: "Water Heater",
            vendor: "AquaFix Plumbing",
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(), // 1 year
          },
          {
            id: "war2",
            item: "Roof Shingles",
            vendor: "Lone Star Roofing",
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 5).toISOString(), // 5 years
          },
        ],

        vendors: vendors.map((v) => ({
          id: v.id,
          name: v.name,
          type: v.type,
          verified: v.verified,
          rating: v.rating,
        })),
      };

      // Rehydrate locally-saved lists
      const persistedRecords = loadJSON<RecordItem[] | null>("records", null);
      const persistedRem = loadJSON<Reminder[] | null>("reminders", null);
      const persistedWar = loadJSON<Warranty[] | null>("warranties", null);
      const persistedVendors = loadJSON<Vendor[] | null>("vendors", null);

      const withLists: HomeData = {
        ...d,
        records: persistedRecords ?? d.records,
        reminders: persistedRem ?? d.reminders,
        warranties: persistedWar ?? d.warranties,
        vendors: persistedVendors ?? d.vendors,
      };

      setData(withLists);
      setLoading(false);
    }

    load();
  }, []);

  // Persist lists any time they change
useEffect(() => { if (hydrated && data) saveJSON("records", data.records); }, [hydrated, data?.records]);
useEffect(() => { if (hydrated && data) saveJSON("reminders", data.reminders); }, [hydrated, data?.reminders]);
useEffect(() => { if (hydrated && data) saveJSON("warranties", data.warranties); }, [hydrated, data?.warranties]);
useEffect(() => { if (hydrated && data) saveJSON("vendors", data.vendors); }, [hydrated, data?.vendors]);

  if (loading || !data) {
    return (
      <main className="relative min-h-screen text-white">
        {/* Fixed background (same as landing) */}
        <div className="fixed inset-0 -z-50">
          <div className="relative h-64 md:h-[400px] lg:h-[520px]">
            <Image
                src="/myhomedox_home3.webp"
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority
            />
          </div>
          <div className="absolute inset-0 bg-black/45"/>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.45))]" />
        </div>

        <div className="mx-auto max-w-7xl p-6 space-y-6">
          <div className="h-9 w-40 animate-pulse rounded-xl bg-white/10 backdrop-blur-sm" />
          <div className="h-64 animate-pulse rounded-2xl bg-white/10 backdrop-blur-sm" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/10 backdrop-blur-sm" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-2xl bg-white/10 backdrop-blur-sm lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-2xl bg-white/10 backdrop-blur-sm" />
          </div>
        </div>
      </main>
    );
  }

  const { property, records, reminders, warranties, vendors } = data;

  return (
      <main className="relative min-h-screen text-white">
        {/* Background */}
        <div className="fixed inset-0 -z-50">
          <Image
              src="/myhomedox_home3.webp"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
          />
          <div className="absolute inset-0 bg-black/45"/>
          <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.45))]"/>
        </div>

        <div className="mx-auto max-w-7xl p-6 space-y-6">
          {/* ✅ New homeowner header (logo + actions) */}
          <HomeTopBar
              onSwitch={() => setSwitchOpen(true)}
              onAccount={() => setAccountOpen(true)}
          />

          {/* Hero */}
          <section aria-labelledby="home-hero" className={glass}>
            <h2 id="home-hero" className="sr-only">Home overview</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Image
                    src={property.photo}
                    alt={`Photo of ${property.address}`}
                    width={640}
                    height={360}
                    className="aspect-video w-full rounded-md object-cover"
                />
              </div>
              <div className="space-y-3">
                <h3 className={`text-lg font-medium ${heading}`}>{property.address}</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setAddOpen(true)} className={ctaPrimary}>Add Record</button>
                  <button onClick={() => setShareOpen(true)} className={ctaGhost}>Share Access</button>
                  <a href="/report" className={ctaGhost}>View Report</a>
                </div>
                <p className={`text-sm ${textMeta}`}>
                  Last updated {new Date(property.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section aria-labelledby="stats" className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <Stat label="Health Score" value={`${property.healthScore}/100`}
                  hint="A 0–100 score based on recent maintenance."/>
            <Stat label="Est. Value" value={`$${property.estValue.toLocaleString()}`}/>
            <Stat label="Beds / Baths" value={`${property.beds} / ${property.baths}`}/>
            <Stat label="Sq Ft" value={property.sqft.toLocaleString()}/>
            <Stat label="Year Built" value={property.yearBuilt}/>
          </section>

          {/* Body */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Timeline */}
            <div className="space-y-3 lg:col-span-2">
              <Card title="Home History">
                {records.length === 0 ? (
                    <Empty message="No records yet" actionLabel="Add your first record"
                           onAction={() => setAddOpen(true)}/>
                ) : (
                    <ul className="divide-y divide-white/10">
                      {records.map((r) => (
                          <li key={r.id} className="flex items-start justify-between gap-4 py-4">
                            <div>
                              <p className="font-medium text-white">
                                {r.title} <span className="text-white/70">• {r.vendor}</span>
                              </p>
                              <p className="text-sm text-white/70">
                                {new Date(r.date).toLocaleDateString()} • {r.category}
                              </p>
                              {r.attachments.length > 0 && (
                                  <div className="mt-2 flex gap-2">
                                    {r.attachments.map((a, i) => (
                                        <a key={i} href={a} className="text-sm text-white underline">
                                          Attachment {i + 1}
                                        </a>
                                    ))}
                                  </div>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="block font-semibold text-white">${r.cost.toLocaleString()}</span>
                              <span
                                  className={`mt-1 inline-flex items-center rounded px-2 py-1 text-xs ${
                                      r.verified
                                          ? "bg-green-500/15 text-green-200 ring-1 ring-green-500/30"
                                          : "bg-white/10 text-white/85 ring-1 ring-white/20"
                                  }`}
                                  aria-label={r.verified ? "Verified record" : "Unverified record"}
                              >
                          {r.verified ? "Verified" : "Unverified"}
                        </span>
                            </div>
                          </li>
                      ))}
                    </ul>
                )}
              </Card>
            </div>

            {/* Right rail */}
            <div className="space-y-3">
              <Card title="Upcoming Reminders">
                <div className="mb-2 flex justify-end">
                  <button className={ctaPrimary} onClick={() => setReminderOpen(true)}>Add</button>
                </div>
                {reminders.length === 0 ? (
                    <Empty message="No upcoming reminders" actionLabel="Add reminder"
                           onAction={() => setReminderOpen(true)}/>
                ) : (
                    <ul className="space-y-2">
                      {reminders.map((m) => (
                          <li key={m.id} className="flex items-center justify-between text-white">
                            <span className="text-white">{m.title}</span>
                            <span className="text-sm text-white/70">{new Date(m.due).toLocaleDateString()}</span>
                          </li>
                      ))}
                    </ul>
                )}
              </Card>

              <Card title="Warranties & Manuals">
                <div className="mb-2 flex justify-end">
                  <button className={ctaPrimary} onClick={() => setWarrantyOpen(true)}>Add</button>
                </div>
                {warranties.length === 0 ? (
                    <Empty message="No warranties on file" actionLabel="Add warranty"
                           onAction={() => setWarrantyOpen(true)}/>
                ) : (
                    <ul className="space-y-2">
                      {warranties.map((w) => (
                          <li key={w.id} className="flex items-center justify-between text-white">
                            <span>{w.item} • <span className="text-white/70">{w.vendor}</span></span>
                            <span
                                className="text-sm text-white/70">Expires {new Date(w.expires).toLocaleDateString()}</span>
                          </li>
                      ))}
                    </ul>
                )}
              </Card>

              <Card title="Vendors">
                <div className="mb-2 flex justify-end">
                  <button className={ctaPrimary} onClick={() => setFindVendorsOpen(true)}>Find vendors</button>
                </div>
                {vendors.length === 0 ? (
                    <Empty message="No vendors linked" actionLabel="Find vendors"
                           onAction={() => setFindVendorsOpen(true)}/>
                ) : (
                    <ul className="space-y-2">
                      {vendors.map((v) => (
                          <li key={v.id} className="flex items-center justify-between text-white">
                      <span>
                        {v.name} • <span className="text-white/70">{v.type}</span>
                      </span>
                            <div className="flex items-center gap-2">
                              <button
                                  className={ctaGhost}
                                  onClick={() => {
                                    setServiceVendor(v);
                                    setServiceOpen(true);
                                  }}
                                  aria-haspopup="dialog"
                              >
                                Request
                              </button>
                              <span
                                  className={`rounded px-2 py-1 text-xs ${
                                      v.verified
                                          ? "bg-green-500/15 text-green-200 ring-1 ring-green-500/30"
                                          : "bg-white/10 text-white/85 ring-1 ring-white/20"
                                  }`}
                              >
                          {v.verified ? "Verified" : "Unverified"}
                        </span>
                            </div>
                          </li>
                      ))}
                    </ul>
                )}
              </Card>
            </div>
          </section>

          {/* Modals */}
          <AddRecordModal
              open={addOpen}
              onClose={() => setAddOpen(false)}
              onCreate={(record: RecordItem) => {
                setData((d) => (d ? {...d, records: [record, ...d.records]} : d));
              }}
          />
          <ShareAccessModal open={shareOpen} onClose={() => setShareOpen(false)}/>

          {/* NEW: Switch / Account / Vendor Request dialogs */}
          <SwitchPropertyModal
              open={switchOpen}
              onClose={() => setSwitchOpen(false)}
              currentId={property.id}
          />

          <AccountModal
              open={accountOpen}
              onClose={() => setAccountOpen(false)}
              email={undefined /* wire from auth if available */}
          />

          <VendorServiceModal
              open={serviceOpen}
              onClose={() => {
                setServiceOpen(false);
                setServiceVendor(null);
              }}
              vendor={serviceVendor}
          />

          <AddReminderModal
              open={reminderOpen}
              onClose={() => setReminderOpen(false)}
              onCreate={(rem) => {
                setData((d) => (d ? {...d, reminders: [rem, ...d.reminders]} : d));
              }}
              propertyYearBuilt={property.yearBuilt}
          />

          <AddWarrantyModal
              open={warrantyOpen}
              onClose={() => setWarrantyOpen(false)}
              onCreate={(war) => {
                setData((d) => (d ? {...d, warranties: [war, ...d.warranties]} : d));
              }}
          />

          <FindVendorsModal
              open={findVendorsOpen}
              onClose={() => setFindVendorsOpen(false)}
              onAdd={(v) => {
                const newVendor: Vendor = {
                  id: v.id, name: v.name, type: v.type, verified: v.verified, rating: v.rating,
                };
                setData((d) => {
                  if (!d) return d;
                  if (d.vendors.some((x) => x.id === newVendor.id)) return d; // avoid dupes
                  return {...d, vendors: [newVendor, ...d.vendors]};
                });
              }}
          />

          <div className="h-12"/>
        </div>
      </main>
  );
}

function Stat({label, value, hint}: { label: string; value: string | number; hint?: string }) {
  return (
      <div className={glassTight} role="group" aria-label={label}>
        <div className="flex items-center gap-1 text-sm text-white/70">
          <span>{label}</span>
          {hint && (
              <span aria-label={hint} title={hint} className="cursor-help">ⓘ</span>
          )}
        </div>
        <div className="mt-1 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={glass}>
      <h2 className={`mb-2 text-lg font-medium ${heading}`}>{title}</h2>
      {children}
    </section>
  );
}

function Empty({ message, actionLabel, onAction }: {
  message: string; actionLabel: string; onAction?: () => void;
}) {
  return (
    <div className="py-8 text-center text-white/70">
      <p className="mb-2">{message}</p>
      <button className={ctaGhost} onClick={onAction}>{actionLabel}</button>
    </div>
  );
}

/* =========================
   Lightweight modal primitives
   ========================= */

function ModalShell({
  open, onClose, title, labelledBy, children,
}: { open: boolean; onClose: () => void; title: string; labelledBy?: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy || "modal-title"}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`${glass} relative z-10 w-full max-w-lg`}>
        <div className="flex items-start justify-between">
          <h2 id={labelledBy || "modal-title"} className={`text-xl font-semibold ${heading}`}>{title}</h2>
          <button className={ctaGhost} onClick={onClose} aria-label="Close">Close</button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function SwitchPropertyModal({
  open, onClose, currentId,
}: { open: boolean; onClose: () => void; currentId: string }) {
  const [homes, setHomes] = useState<PurchasedHome[]>([]);
  useEffect(() => {
    if (!open) return;
    const list = loadJSON<PurchasedHome[]>("purchasedHomes", []);
    setHomes(list || []);
  }, [open]);

  return (
    <ModalShell open={open} onClose={onClose} title="Switch Home" labelledBy="switch-properties">
      {homes.length === 0 ? (
        <p className={textMeta}>No purchased reports yet. When you buy a Homefax, it appears here as read-only.</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {homes.map((h) => (
            <li key={h.id} className={`${glassTight} flex items-center gap-3`}>
              <Image
                src={h.photo || "/placeholder.jpg"}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-md object-cover"
              />
              <div className="flex-1">
                <p className="text-white/85">{h.address}</p>
                <p className={textMeta}>{h.readonly ? "Read-only report" : "Owner access"}</p>
              </div>
              {h.id === currentId ? (
                <span className="inline-flex items-center rounded px-2 py-1 text-xs border border-white/20 bg-white/10 text-white/85" aria-current="true">Current</span>
              ) : (
                <a className={ctaPrimary} href={`/home/${h.id}${h.readonly ? "?readonly=1" : ""}`}>
                  View {h.readonly ? "(RO)" : ""}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        <a className={ctaGhost} href="/buy">Buy another report</a>
      </div>
    </ModalShell>
  );
}

function AccountModal({
  open, onClose, email,
}: { open: boolean; onClose: () => void; email?: string }) {
  return (
    <ModalShell open={open} onClose={onClose} title="Account" labelledBy="account-menu">
      <div className="space-y-4">
        <div className={glassTight}>
          <p className="text-white/70 text-sm">Signed in as</p>
          <p className="text-white font-medium">{email || "you@example.com"}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <a className={ctaGhost} href="/account">Profile &amp; Settings</a>
          <a className={ctaGhost} href="/billing">Billing</a>
          <a className={ctaGhost} href="/access">Shared Access</a>
          <button className={ctaGhost} onClick={() => alert("Signed out (stub).")}>Sign out</button>
        </div>
        <p className={`${textMeta}`}>Tip: Use Shared Access to grant read-only Homefax to buyers or agents.</p>
      </div>
    </ModalShell>
  );
}

function VendorServiceModal({
  open, onClose, vendor,
}: { open: boolean; onClose: () => void; vendor: Vendor | null }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ summary: "", preferred: "", contact: "" });

  useEffect(() => {
    if (open) setForm({ summary: "", preferred: "", contact: "" });
  }, [open]);

  if (!vendor) return null;

  function submit() {
    setSubmitting(true);
    const reqs = loadJSON<any[]>("serviceRequests", []);
    const payload = {
      id: (globalThis.crypto && "randomUUID" in crypto) ? crypto.randomUUID() : String(Date.now()),
      vendorId: vendor.id,
      vendorName: vendor.name,
      ...form,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    saveJSON("serviceRequests", [...(reqs || []), payload]);
    setTimeout(() => {
      setSubmitting(false);
      onClose();
      alert("Request sent to vendor (stub).");
    }, 600);
  }

  return (
    <ModalShell open={open} onClose={onClose} title={`Request service — ${vendor.name}`}>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <label className="block">
          <span className="text-white/70 text-sm">What do you need?</span>
          <textarea
            required
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="mt-1 w-full rounded-lg bg-black/30 text-white placeholder:text-white/50 border border-white/20 p-2 resize-y min-h-[90px] focus:ring-2 focus:ring-white/60"
            placeholder="e.g., Water heater making noise, installed 2018..."
          />
        </label>
        <label className="block">
          <span className="text-white/70 text-sm">Preferred date/time</span>
          <input
            type="text"
            value={form.preferred}
            onChange={(e) => setForm({ ...form, preferred: e.target.value })}
            className="mt-1 w-full rounded-lg bg-black/30 text-white placeholder:text-white/50 border border-white/20 p-2 focus:ring-2 focus:ring-white/60"
            placeholder="This Friday afternoon, or next week Mon/Tue morning"
          />
        </label>
        <label className="block">
          <span className="text-white/70 text-sm">Contact phone or email</span>
          <input
            required
            type="text"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="mt-1 w-full rounded-lg bg-black/30 text-white placeholder:text-white/50 border border-white/20 p-2 focus:ring-2 focus:ring-white/60"
            placeholder="(555) 123-4567"
          />
        </label>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" className={ctaGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={ctaPrimary} disabled={submitting}>
            {submitting ? "Sending…" : "Send request"}
          </button>
        </div>
      </form>
      <p className={`mt-2 ${textMeta} text-xs`}>We’ll notify you in the timeline when the vendor confirms.</p>
    </ModalShell>
  );
}
