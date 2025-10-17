"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import RealtorTopBar from "../_components/RealtorTopBar";
import { useRealtorData } from "@/lib/realtorData";
import { glass, glassTight, heading, textMeta, ctaGhost, ctaPrimary } from "@/lib/glass";
import { Modal } from "@/components/ui/Modal";
import { Button, GhostButton } from "@/components/ui/Button";
import { Input, Textarea, fieldLabel } from "@/components/ui";

/* ---------------- Background ---------------- */
function Bg() {
  return (
    <div className="fixed inset-0 -z-50">
      <Image
        src="/myhomedox_home3.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover md:object-[50%_35%] lg:object-[50%_30%]"
        priority
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.45))]" />
    </div>
  );
}

/* ---------------- Types ---------------- */
type ListingStatus = "active" | "pending" | "under_contract" | "sold";
type Listing = {
  id: string; address: string; mlsId?: string; price: number; status: ListingStatus;
  beds?: number; baths?: number; sqft?: number; updated: string;
};
type RecordsRequest = {
  id: string; address: string; owner?: string; created: string;
  status: "requested" | "owner_shared" | "declined"; link?: string;
};
type BuyerLead = {
  id: string; name: string; email?: string; phone?: string; interestAddress?: string;
  stage: "new" | "engaged" | "touring" | "offer" | "closed";
  note?: string;
};
type Partner = { id: string; name: string; org?: string; role?: string; email?: string; phone?: string; };

type AgendaItem = { id: string; title: string; date: string; time?: string; location?: string; kind: "showing"|"inspection"|"signing" };

/* Sellers derived view */
type SellerRow = { id: string; owner: string; address: string; updated: string; status: ListingStatus };
function deriveSellers(listings: Listing[], requests: RecordsRequest[]): SellerRow[] {
  const ownerByAddr = new Map<string, string>();
  requests.forEach(r => { if (r.owner) ownerByAddr.set(r.address.toLowerCase(), r.owner); });
  return listings.map(l => ({
    id: `s-${l.id}`,
    owner: ownerByAddr.get(l.address.toLowerCase()) ?? "Homeowner",
    address: l.address,
    updated: l.updated,
    status: l.status,
  }));
}

/* ---------------- Agenda Builder ---------------- */
function buildAgenda(listings: Listing[], requests: RecordsRequest[]): AgendaItem[] {
  const items: AgendaItem[] = [];
  const inDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); };

  listings.forEach((l, idx) => {
    if (l.status === "active" || l.status === "pending") {
      items.push({
        id: `ag_show_${l.id}`,
        title: `Showing — ${l.address}`,
        date: inDays(1 + (idx % 2 ? 2 : 0)),
        time: idx % 2 ? "2:00 PM" : "11:00 AM",
        location: l.address,
        kind: "showing",
      });
    }
  });

  requests.forEach((r, i) => {
    if (r.status === "owner_shared") {
      items.push({
        id: `ag_insp_${r.id}`,
        title: `Inspection — ${r.address}`,
        date: inDays(1 + (i % 2)),
        time: i % 2 ? "10:30 AM" : "1:30 PM",
        location: r.address,
        kind: "inspection",
      });
    }
  });

  return items
    .sort((a,b) => a.date.localeCompare(b.date) || (a.time||"").localeCompare(b.time||""))
    .slice(0, 8);
}

/* ---------------- Page ---------------- */
export default function RealtorClientsPage() {
  const { data, setData, loading } = useRealtorData();

  const [tab, setTab] = useState<"buyers" | "sellers" | "partners">("buyers");
  const [view, setView] = useState<"board" | "list">("board");

  // Buyers filters
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<BuyerLead["stage"] | "all">("all");

  // Sellers filters
  const [sQuery, setSQuery] = useState("");
  const [sStatus, setSStatus] = useState<ListingStatus | "all">("all");

  // Note modal
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteKind, setNoteKind] = useState<"buyer" | "seller">("buyer");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    if (!noteOpen) { setEditingKey(null); setNoteDraft(""); }
  }, [noteOpen]);

  /* ---------- Derivations ---------- */
  const buyers = (data?.buyers ?? []) as BuyerLead[];
  const listings = (data?.listings ?? []) as Listing[];
  const requests = (data?.requests ?? []) as RecordsRequest[];
  const sellerNotes: Record<string, string> = (data as any)?.sellerNotes ?? {};
  const partners: Partner[] = (data as any)?.partners ?? [];

  const sellersAll = useMemo(() => deriveSellers(listings, requests), [listings, requests]);

  const filteredBuyers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return buyers.filter(b => {
      const matchesQ =
        !q ||
        b.name.toLowerCase().includes(q) ||
        (b.email?.toLowerCase().includes(q)) ||
        (b.phone?.toLowerCase().includes(q)) ||
        (b.interestAddress?.toLowerCase().includes(q));
      const matchesStage = stage === "all" ? true : b.stage === stage;
      return matchesQ && matchesStage;
    });
  }, [buyers, query, stage]);

  const filteredSellers = useMemo(() => {
    const q = sQuery.trim().toLowerCase();
    return sellersAll.filter(s => {
      const matchesQ = !q || s.owner.toLowerCase().includes(q) || s.address.toLowerCase().includes(q);
      const matchesStatus = sStatus === "all" ? true : s.status === sStatus;
      return matchesQ && matchesStatus;
    });
  }, [sellersAll, sQuery, sStatus]);

  const agenda = useMemo(() => buildAgenda(listings, requests), [listings, requests]);

  const stages: Array<BuyerLead["stage"] | "all"> = ["all","new","engaged","touring","offer","closed"];
  const statusPills: Array<ListingStatus | "all"> = ["all","active","pending","under_contract","sold"];

  /* ---------- Loading ---------- */
  if (loading || !data) {
    return (
      <main className="relative min-h-screen text-white">
        <Bg />
        <RealtorTopBar />
        <div className="mx-auto max-w-7xl p-6">
          <div className="h-40 animate-pulse rounded-2xl bg-white/10 backdrop-blur-sm" />
        </div>
      </main>
    );
  }

  /* ---------- Mutations ---------- */
  function updateStage(id: string, next: BuyerLead["stage"]) {
    setData(prev => ({ ...prev, buyers: prev.buyers.map(b => b.id === id ? { ...b, stage: next } : b) }));
  }

  function openBuyerNote(id: string, current?: string) {
    setNoteKind("buyer");
    setEditingKey(id);
    setNoteDraft(current ?? "");
    setNoteOpen(true);
  }
  function openSellerNote(address: string) {
    const k = address.toLowerCase();
    setNoteKind("seller");
    setEditingKey(k);
    setNoteDraft(sellerNotes[k] ?? "");
    setNoteOpen(true);
  }

  function saveNote() {
    if (!editingKey) return;
    if (noteKind === "buyer") {
      setData(prev => ({
        ...prev,
        buyers: prev.buyers.map(b => b.id === editingKey ? { ...b, note: noteDraft.trim() || undefined } : b),
      }));
    } else {
      setData(prev => {
        const prevMap: Record<string,string> = (prev as any).sellerNotes ?? {};
        const nextMap = { ...prevMap };
        if (noteDraft.trim()) nextMap[editingKey] = noteDraft.trim();
        else delete nextMap[editingKey];
        return { ...prev, sellerNotes: nextMap } as any;
      });
    }
    setNoteOpen(false);
  }

  function addBuyer(b: Omit<BuyerLead, "id">) {
    const id = "b" + Date.now();
    setData(prev => ({ ...prev, buyers: [{ id, ...b }, ...prev.buyers] }));
  }
  function addPartner(p: Omit<Partner, "id">) {
    const id = "p" + Date.now();
    setData(prev => {
      const prevPartners: Partner[] = (prev as any).partners ?? [];
      return { ...prev, partners: [{ id, ...p }, ...prevPartners] } as any;
    });
  }

  /* ---------- Local UI bits ---------- */
  function ViewToggle() {
    return (
      <div className="inline-flex overflow-hidden rounded-full border border-white/20 bg-white/10 p-0.5 backdrop-blur-sm">
        {(["board","list"] as const).map(opt => (
          <button
            key={opt}
            onClick={() => setView(opt)}
            className={`px-3 py-1 text-xs rounded-full transition ${view === opt ? "bg-white text-slate-900" : "text-white/85 hover:text-white"}`}
            aria-pressed={view === opt}
          >
            {opt === "board" ? "Board" : "List"}
          </button>
        ))}
      </div>
    );
  }

  function TabPills() {
    return (
      <div className="inline-flex overflow-hidden rounded-full border border-white/20 bg-white/10 p-0.5 backdrop-blur-sm">
        {(["buyers","sellers","partners"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 text-xs rounded-full transition ${tab === t ? "bg-white text-slate-900" : "text-white/85 hover:text-white"}`}
            aria-pressed={tab === t}
          >
            {t[0].toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <main className="relative min-h-screen text-white">
      <Bg />

      <div className="mx-auto max-w-7xl p-6 space-y-6">
        <RealtorTopBar />

        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-semibold ${heading}`}>
              {tab === "buyers" ? "Clients — Buyers"
                : tab === "sellers" ? "Clients — Sellers"
                : "Clients — Partners"}
            </h1>
            <p className={`mt-1 text-sm ${textMeta}`}>
              {tab === "buyers" ? "Manage buyers, stages, notes, and outreach."
                : tab === "sellers" ? "Seller contacts with listing status, filters, and notes."
                : "Keep lenders, attorneys, inspectors, etc."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TabPills />
            <AddPersonButton
              defaultKind={tab === "partners" ? "partner" : "buyer"}
              onCreate={(payload) => {
                if (payload.kind === "buyer") addBuyer(payload.data);
                else addPartner(payload.data);
              }}
            />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT: main area */}
          <div className="space-y-3 lg:col-span-2">
            <section className={glass}>
              {/* Buyers header controls */}
              {tab === "buyers" && (
                <div className="mb-3 space-y-2">
                  {/* Row 1: search + right controls */}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search name, email, phone, or address…"
                      value={query}
                      onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
                      className="h-9 min-w-0 flex-1 rounded-lg bg-white/95 text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-white/30"
                    />
                    <div className="ml-auto flex items-center gap-2">
                      <ViewToggle />
                      <a className={`${ctaGhost} rounded-full whitespace-nowrap`} href="/realtor/listings">Go to Listings</a>
                    </div>
                  </div>
                  {/* Row 2: scrolling pills (always visible, never clipped) */}
                  <StageFilter stages={stages} value={stage} onChange={setStage} />
                </div>
              )}

              {/* Sellers header controls */}
              {tab === "sellers" && (
                <div className="mb-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search owner or address…"
                      value={sQuery}
                      onChange={(e) => setSQuery((e.target as HTMLInputElement).value)}
                      className="h-9 min-w-0 flex-1 rounded-lg bg-white/95 text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-white/30"
                    />
                    <div className="ml-auto flex items-center gap-2">
                      <ViewToggle />
                      <a className={`${ctaGhost} rounded-full whitespace-nowrap`} href="/realtor/listings">Go to Listings</a>
                    </div>
                  </div>
                  <StatusFilter statuses={statusPills} value={sStatus} onChange={setSStatus} />
                </div>
              )}

              {/* Content by tab */}
              {tab === "buyers" ? (
                filteredBuyers.length === 0 ? (
                  <div className="py-10 text-center text-white/70">
                    <p>No clients match your filters.</p>
                  </div>
                ) : view === "list" ? (
                  <ul className="divide-y divide-white/10">
                    {filteredBuyers.map(b => (
                      <li key={b.id} className="py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-white font-medium">{b.name}</p>
                            <p className={`truncate text-sm ${textMeta}`}>
                              {b.email ? b.email : b.phone ? b.phone : "—"}
                              {b.interestAddress ? ` • ${b.interestAddress}` : ""}
                            </p>
                            {b.note && <p className="mt-1 line-clamp-2 text-sm text-white/85">{b.note}</p>}
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
                            <StageBadge value={b.stage} onChange={(s) => updateStage(b.id, s)} />
                            {b.email && <a className="underline text-white/85" href={`mailto:${b.email}`}>Email</a>}
                            {b.phone && <a className="underline text-white/85" href={`tel:${b.phone}`}>Call</a>}
                            <button className={ctaGhost} onClick={() => openBuyerNote(b.id, b.note)}>Note</button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {(["new","engaged","touring","offer","closed"] as BuyerLead["stage"][]).map(s => {
                      const items = filteredBuyers.filter(b => b.stage === s);
                      return (
                        <BoardLane key={s} title={s[0].toUpperCase() + s.slice(1)} count={items.length}>
                          {items.length === 0 ? (
                            <div className={`${glassTight} rounded-xl p-3 text-sm text-white/70`}>No clients in this stage.</div>
                          ) : (
                            <ul className="space-y-2">
                              {items.map(b => (
                                <li key={b.id} className={`${glassTight} rounded-xl p-3`}>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="font-medium text-white">{b.name}</p>
                                      <p className={`truncate text-sm ${textMeta}`}>
                                        {b.email ? b.email : b.phone ? b.phone : "—"}
                                        {b.interestAddress ? ` • ${b.interestAddress}` : ""}
                                      </p>
                                      {b.note && <p className="mt-1 line-clamp-2 text-sm text-white/85">{b.note}</p>}
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:self-start">
                                      <button className={ctaGhost} onClick={() => openBuyerNote(b.id, b.note)}>Note</button>
                                      <button
                                        className={`${ctaGhost} text-xs`}
                                        onClick={() => {
                                          const order: BuyerLead["stage"][] = ["new","engaged","touring","offer","closed"];
                                          const idx = order.indexOf(b.stage);
                                          const next = order[Math.min(order.length - 1, idx + 1)];
                                          updateStage(b.id, next);
                                        }}
                                        aria-label="Advance stage"
                                        title="Advance stage"
                                      >
                                        Move →
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </BoardLane>
                      );
                    })}
                  </div>
                )
              ) : tab === "sellers" ? (
                filteredSellers.length === 0 ? (
                  <div className="py-10 text-center text-white/70">
                    <p>No sellers match your filters.</p>
                  </div>
                ) : view === "list" ? (
                  <ul className="divide-y divide-white/10">
                    {filteredSellers.map(s => {
                      const k = s.address.toLowerCase();
                      const note = sellerNotes[k];
                      return (
                        <li key={s.id} className="py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-white font-medium">{s.owner}</p>
                              <p className={`truncate text-sm ${textMeta}`}>
                                {s.address} • {prettyListingStatus(s.status)} • Updated {new Date(s.updated).toLocaleDateString()}
                              </p>
                              {note && <p className="mt-1 line-clamp-2 text-sm text-white/85">{note}</p>}
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
                              <a className="underline text-white/85" href={`/report?h=${slugify(s.address)}`}>Report</a>
                              <a className={ctaGhost} href="/realtor/reports">Request Records</a>
                              <button className={ctaGhost} onClick={() => openSellerNote(s.address)}>Note</button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {(["active","pending","under_contract","sold"] as ListingStatus[]).map(st => {
                      const items = filteredSellers.filter(s => s.status === st);
                      return (
                        <BoardLane key={st} title={prettyListingStatus(st)!} count={items.length}>
                          {items.length === 0 ? (
                            <div className={`${glassTight} rounded-xl p-3 text-sm text-white/70`}>No sellers in this status.</div>
                          ) : (
                            <ul className="space-y-2">
                              {items.map(s => {
                                const k = s.address.toLowerCase();
                                const note = sellerNotes[k];
                                return (
                                  <li key={s.id} className={`${glassTight} rounded-xl p-3`}>
                                    <div className="min-w-0">
                                      <p className="font-medium text-white">{s.owner}</p>
                                      <p className={`truncate text-sm ${textMeta}`}>{s.address}</p>
                                      {note && <p className="mt-1 line-clamp-2 text-sm text-white/85">{note}</p>}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                      <a className="underline text-white/85" href={`/report?h=${slugify(s.address)}`}>Report</a>
                                      <button className={ctaGhost} onClick={() => openSellerNote(s.address)}>Note</button>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </BoardLane>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Partners */
                partners.length === 0 ? (
                  <div className="py-10 text-center text-white/70">
                    <p>No partners yet. Use “Add Person” → Partner.</p>
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {partners.map(p => (
                      <li key={p.id} className={`${glassTight} rounded-xl p-3`}>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="font-medium text-white">{p.name}{p.org ? ` — ${p.org}` : ""}</p>
                            <p className={`truncate text-sm ${textMeta}`}>
                              {p.role ?? "Partner"}{p.email ? ` • ${p.email}` : ""}{p.phone ? ` • ${p.phone}` : ""}
                            </p>
                          </div>
                          {p.email ? <a className="underline text-white/85" href={`mailto:${p.email}`}>Email</a> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </section>
          </div>

          {/* RIGHT: Agenda + quick actions */}
          <div className="space-y-3">
            <section className={glass}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className={`text-lg font-medium ${heading}`}>Calendar / Agenda</h2>
                <a className={`${ctaGhost} rounded-full`} href="/realtor/calendar">Open</a>
              </div>
              {agenda.length === 0 ? (
                <p className={textMeta}>No upcoming items.</p>
              ) : (
                <ul className="space-y-2">
                  {agenda.map(ev => (
                    <li key={ev.id} className={`${glassTight} rounded-xl p-3`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-white">{ev.title}</p>
                          <p className={`truncate text-sm ${textMeta}`}>
                            {new Date(ev.date).toLocaleDateString()}
                            {ev.time ? ` • ${ev.time}` : ""} {ev.location ? ` • ${ev.location}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white/85">
                          {ev.kind === "showing" ? "Showing" : ev.kind === "inspection" ? "Inspection" : "Signing"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={glass}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className={`text-lg font-medium ${heading}`}>Quick Actions</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <a className={ctaPrimary} href="/realtor/reports">Request Records</a>
                <a className={ctaGhost} href="/realtor/listings">Create Listing</a>
              </div>
            </section>
          </div>
        </section>

        {/* Note modal */}
        <Modal open={noteOpen} onClose={() => setNoteOpen(false)} title="Note">
          <div className="space-y-3">
            <label className="block">
              <span className={fieldLabel}>Notes</span>
              <Textarea
                rows={4}
                value={noteDraft}
                onChange={(e) => setNoteDraft((e.target as HTMLTextAreaElement).value)}
                placeholder={noteKind === "buyer" ? "Next steps, preferences, constraints…" : "Owner preferences, disclosure reminders…"}
              />
            </label>
            <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
              <GhostButton className="w-full sm:w-auto" onClick={() => setNoteOpen(false)}>Cancel</GhostButton>
              <Button className="w-full sm:w-auto" onClick={saveNote}>Save Note</Button>
            </div>
          </div>
        </Modal>

        <div className="h-10" />
      </div>
    </main>
  );
}

/* ---------------- Small UI bits ---------------- */

function StageFilter({
  stages, value, onChange,
}: {
  stages: Array<BuyerLead["stage"] | "all">;
  value: BuyerLead["stage"] | "all";
  onChange: (v: BuyerLead["stage"] | "all") => void;
}) {
  // Horizontally scrollable, with a right-edge fade so it's obvious there's more.
  return (
    <div className="relative">
      <div className="flex max-w-full min-w-0 snap-x snap-mandatory gap-1 overflow-x-auto whitespace-nowrap rounded-full border border-white/20 bg-white/10 p-0.5 backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stages.map(s => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`snap-start shrink-0 px-3 py-1 text-xs rounded-full transition ${value === s ? "bg-white text-slate-900" : "text-white/85 hover:text-white"}`}
            aria-pressed={value === s}
          >
            {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-black/20 to-transparent sm:hidden" />
    </div>
  );
}

function StatusFilter({
  statuses, value, onChange,
}: {
  statuses: Array<ListingStatus | "all">;
  value: ListingStatus | "all";
  onChange: (v: ListingStatus | "all") => void;
}) {
  return (
    <div className="relative">
      <div className="flex max-w-full min-w-0 snap-x snap-mandatory gap-1 overflow-x-auto whitespace-nowrap rounded-full border border-white/20 bg-white/10 p-0.5 backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`snap-start shrink-0 px-3 py-1 text-xs rounded-full transition ${value === s ? "bg-white text-slate-900" : "text-white/85 hover:text-white"}`}
            aria-pressed={value === s}
          >
            {s === "all" ? "All" : prettyListingStatus(s)}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-black/20 to-transparent sm:hidden" />
    </div>
  );
}

function StageBadge({
  value, onChange,
}: {
  value: BuyerLead["stage"];
  onChange: (v: BuyerLead["stage"]) => void;
}) {
  return (
    <details className="relative">
      <summary
        className="list-none cursor-pointer rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-xs text-white/85 hover:bg-white/15"
        aria-label={`Change stage (current ${value})`}
      >
        {value[0].toUpperCase() + value.slice(1)}
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-white/20 bg-white/95 text-slate-900 shadow-lg">
        {(["new","engaged","touring","offer","closed"] as BuyerLead["stage"][]).map(s => (
          <button
            key={s}
            onClick={(e) => { e.preventDefault(); onChange(s); (e.currentTarget.closest("details") as HTMLDetailsElement)?.removeAttribute("open"); }}
            className="block w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50"
          >
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
    </details>
  );
}

function BoardLane({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/95">{title}</h3>
        <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white/80">{count}</span>
      </div>
      {children}
    </section>
  );
}

/* ===== Add Person (Client or Partner) ===== */
function AddPersonButton({
  onCreate, defaultKind = "buyer",
}: {
  onCreate: (p: { kind: "buyer" | "partner"; data: any }) => void;
  defaultKind?: "buyer" | "partner";
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"buyer" | "partner">(defaultKind);

  // buyer fields
  const [bName, setBName] = useState(""); const [bEmail, setBEmail] = useState(""); const [bPhone, setBPhone] = useState(""); const [bAddr, setBAddr] = useState("");
  const [bStage, setBStage] = useState<BuyerLead["stage"]>("new");

  // partner fields
  const [pName, setPName] = useState(""); const [pOrg, setPOrg] = useState(""); const [pRole, setPRole] = useState(""); const [pEmail, setPEmail] = useState(""); const [pPhone, setPPhone] = useState("");

  useEffect(() => { setKind(defaultKind); }, [defaultKind]);

  function reset() {
    setKind(defaultKind);
    setBName(""); setBEmail(""); setBPhone(""); setBAddr(""); setBStage("new");
    setPName(""); setPOrg(""); setPRole(""); setPEmail(""); setPPhone("");
  }

  function submit() {
    if (kind === "buyer") {
      if (!bName.trim()) return;
      onCreate({
        kind: "buyer",
        data: { name: bName.trim(), email: bEmail.trim() || undefined, phone: bPhone.trim() || undefined, interestAddress: bAddr.trim() || undefined, stage: bStage },
      });
    } else {
      if (!pName.trim()) return;
      onCreate({
        kind: "partner",
        data: { name: pName.trim(), org: pOrg.trim() || undefined, role: pRole.trim() || "Partner", email: pEmail.trim() || undefined, phone: pPhone.trim() || undefined },
      });
    }
    setOpen(false); reset();
  }

  return (
    <>
      <button className={ctaPrimary} onClick={() => setOpen(true)}>Add Person</button>
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Add Person">
        <div className="space-y-3">
          <label className="block">
            <span className={fieldLabel}>Type</span>
            <select
              className="w-full rounded-md border border-white/15 bg-white/10 px-2 py-2 text-sm outline-none backdrop-blur placeholder:text-white/60 focus:ring-2 focus:ring-white/30"
              value={kind}
              onChange={(e) => setKind(e.target.value as any)}
            >
              <option value="buyer">Client (Buyer)</option>
              <option value="partner">Partner</option>
            </select>
          </label>

          {kind === "buyer" ? (
            <>
              <label className="block"><span className={fieldLabel}>Name</span>
                <Input value={bName} onChange={e => setBName((e.target as HTMLInputElement).value)} />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block"><span className={fieldLabel}>Email (optional)</span>
                  <Input type="email" value={bEmail} onChange={e => setBEmail((e.target as HTMLInputElement).value)} />
                </label>
                <label className="block"><span className={fieldLabel}>Phone (optional)</span>
                  <Input value={bPhone} onChange={e => setBPhone((e.target as HTMLInputElement).value)} />
                </label>
              </div>
              <label className="block"><span className={fieldLabel}>Interest address (optional)</span>
                <Input value={bAddr} onChange={e => setBAddr((e.target as HTMLInputElement).value)} placeholder="e.g., 1842 Maple St" />
              </label>
              <label className="block">
                <span className={fieldLabel}>Stage</span>
                <select
                  className="w-full rounded-md border border-white/15 bg-white/10 px-2 py-2 text-sm outline-none backdrop-blur placeholder:text-white/60 focus:ring-2 focus:ring-white/30"
                  value={bStage}
                  onChange={(e) => setBStage(e.target.value as BuyerLead["stage"])}
                >
                  <option value="new">New</option>
                  <option value="engaged">Engaged</option>
                  <option value="touring">Touring</option>
                  <option value="offer">Offer</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <label className="block"><span className={fieldLabel}>Name</span>
                <Input value={pName} onChange={e => setPName((e.target as HTMLInputElement).value)} />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block"><span className={fieldLabel}>Organization (optional)</span>
                  <Input value={pOrg} onChange={e => setPOrg((e.target as HTMLInputElement).value)} />
                </label>
                <label className="block"><span className={fieldLabel}>Role (optional)</span>
                  <Input value={pRole} onChange={e => setPRole((e.target as HTMLInputElement).value)} placeholder="Lender, Attorney, Inspector…" />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block"><span className={fieldLabel}>Email (optional)</span>
                  <Input type="email" value={pEmail} onChange={e => setPEmail((e.target as HTMLInputElement).value)} />
                </label>
                <label className="block"><span className={fieldLabel}>Phone (optional)</span>
                  <Input value={pPhone} onChange={e => setPPhone((e.target as HTMLInputElement).value)} />
                </label>
              </div>
            </>
          )}

          <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
            <GhostButton className="w-full sm:w-auto" onClick={() => { setOpen(false); reset(); }}>Cancel</GhostButton>
            <Button className="w-full sm:w-auto" onClick={submit}>Create</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

/* pretties used above */
function prettyListingStatus(s: ListingStatus | "all") {
  switch (s) {
    case "active": return "Active";
    case "pending": return "Pending";
    case "under_contract": return "Under contract";
    case "sold": return "Sold";
    case "all": return "All";
  }
}
function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
