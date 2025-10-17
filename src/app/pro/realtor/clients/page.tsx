"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import RealtorTopBar from "../../_components/RealtorTopBar";
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

/* ---------------- Types (local view only) ---------------- */
type ListingStatus = "active" | "pending" | "under_contract" | "sold";
type Listing = {
  id: string; address: string; mlsId?: string; price: number; status: ListingStatus;
  beds?: number; baths?: number; sqft?: number; updated: string;
};
type RecordsRequest = {
  id: string; address: string; owner?: string; created: string;
  status: "requested" | "owner_shared" | "declined"; link?: string;
};
type Role = "buyer" | "seller";
type BuyerLead = {
  id: string;
  role?: Role; // new (optional for existing data)
  name: string; email?: string; phone?: string; interestAddress?: string;
  // buyer stages
  stage: "new" | "engaged" | "touring" | "offer" | "closed" | "prep" | "listed" | "under_contract";
  note?: string;
};
type AgendaItem = { id: string; title: string; date: string; time?: string; location?: string; kind: "showing"|"inspection"|"signing" };

/* ---------------- Agenda Builder (demo logic) ---------------- */
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

  // filters/search
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | Role>("all");
  const [stage, setStage] = useState<BuyerLead["stage"] | "all">("all");

  // note modal
  const [noteOpen, setNoteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  // add client modal
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (!noteOpen) { setEditingId(null); setNoteDraft(""); }
  }, [noteOpen]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.buyers.filter((b: BuyerLead) => {
      const q = query.trim().toLowerCase();
      const matchesQ = !q ||
        b.name.toLowerCase().includes(q) ||
        (b.email?.toLowerCase().includes(q)) ||
        (b.phone?.toLowerCase().includes(q)) ||
        (b.interestAddress?.toLowerCase().includes(q));
      const matchesRole = role === "all" ? true : (b.role ?? "buyer") === role;
      const matchesStage = stage === "all" ? true : b.stage === stage;
      return matchesQ && matchesRole && matchesStage;
    });
  }, [data, query, role, stage]);

  const agenda = useMemo(
    () => (data ? buildAgenda(data.listings as any, data.requests as any) : []),
    [data]
  );

  if (loading || !data) {
    return (
      <main className="relative min-h-screen text-white">
        <Bg />
        <RealtorTopBar />
        <div className="mx-auto max-w-7xl p-6">
          <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
        </div>
      </main>
    );
  }

  const buyerStages: BuyerLead["stage"][] = ["new","engaged","touring","offer","closed"];
  const sellerStages: BuyerLead["stage"][] = ["prep","listed","under_contract","closed"];

  function updateStage(id: string, next: BuyerLead["stage"]) {
    setData(prev => ({
      ...prev,
      buyers: prev.buyers.map((b: BuyerLead) => b.id === id ? { ...b, stage: next } : b),
    }));
  }

  function openNote(id: string, current?: string) {
    setEditingId(id);
    setNoteDraft(current ?? "");
    setNoteOpen(true);
  }

  function saveNote() {
    if (!editingId) return;
    setData(prev => ({
      ...prev,
      buyers: prev.buyers.map((b: BuyerLead) =>
        b.id === editingId ? { ...b, note: noteDraft.trim() || undefined } : b),
    }));
    setNoteOpen(false);
  }

  function addClient(b: Omit<BuyerLead, "id">) {
    const id = "c" + Date.now();
    setData(prev => ({ ...prev, buyers: [{ id, ...b }, ...prev.buyers] as any }));
  }

  return (
    <main className="relative min-h-screen text-white">
      <Bg />
      <RealtorTopBar />

      <div className="mx-auto max-w-7xl p-6 space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className={`text-3xl font-semibold ${heading}`}>Clients</h1>
            <p className={`mt-1 text-sm ${textMeta}`}>Buyers and sellers in one place. Filter by role and stage.</p>
          </div>
          <div className="flex gap-2">
            <button className={ctaPrimary} onClick={() => setAddOpen(true)}>Add Client</button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT: Clients */}
          <div className="space-y-3 lg:col-span-2">
            <section className={glass}>
              {/* Filters */}
              <div className="mb-3 space-y-2">
                {/* Row 1: Role + Stage group (wraps nicely) */}
                <div className="flex flex-wrap gap-2">
                  <ChipGroup
                    label="Role"
                    value={role}
                    onChange={(v) => { setRole(v as any); setStage("all"); }}
                    options={[
                      { key: "all", label: "All" },
                      { key: "buyer", label: "Buyer" },
                      { key: "seller", label: "Seller" },
                    ]}
                  />
                  <ChipGroup
                    label="Stage"
                    value={stage}
                    onChange={setStage as any}
                    options={
                      role === "seller"
                        ? [{ key: "all", label: "All" }, ...sellerStages.map(s => ({ key: s, label: prettyStage(s) }))]
                        : role === "buyer"
                        ? [{ key: "all", label: "All" }, ...buyerStages.map(s => ({ key: s, label: prettyStage(s) }))]
                        : [{ key: "all", label: "All" }]
                    }
                  />
                </div>

                {/* Row 2: Search (fluid width) */}
                <div>
                  <Input
                    placeholder="Search name, email, phone, or address…"
                    value={query}
                    onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
                    className="h-11 w-full rounded-xl bg-white/95 text-slate-900 placeholder:text-slate-500 ring-1 ring-white/30 focus:ring-2 focus:ring-white/30"
                  />
                </div>
              </div>

              {/* List */}
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-white/70">
                  <p>No clients match your filters.</p>
                </div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {filtered.map((b: BuyerLead) => (
                    <li key={b.id} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-white font-medium flex items-center gap-2">
                            {b.name}
                            <span className="rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-xs text-white/85">
                              {b.role ? (b.role[0].toUpperCase()+b.role.slice(1)) : "Buyer"}
                            </span>
                          </p>
                          <p className={`truncate text-sm ${textMeta}`}>
                            {b.email ? b.email : b.phone ? b.phone : "—"}
                            {b.interestAddress ? ` • ${b.interestAddress}` : ""}
                          </p>
                          {b.note && (
                            <p className="mt-1 line-clamp-2 text-sm text-white/85">{b.note}</p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <StageBadge
                            value={b.stage}
                            onChange={(s) => updateStage(b.id, s)}
                            role={b.role ?? "buyer"}
                          />
                          {b.email && <a className="underline text-white/85" href={`mailto:${b.email}`}>Email</a>}
                          {b.phone && <a className="underline text-white/85" href={`tel:${b.phone}`}>Call</a>}
                          <button className={ctaGhost} onClick={() => openNote(b.id, b.note)}>Note</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* RIGHT: Agenda + quick actions */}
          <div className="space-y-3">
            <section className={glass}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className={`text-lg font-medium ${heading}`}>Calendar / Agenda</h2>
                <a className={`${ctaGhost} rounded-full`} href="/pro/realtor/calendar">Open</a>
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
                <a className={ctaPrimary} href="/pro/realtor/reports">Request Records</a>
                <a className={ctaGhost} href="/pro/realtor/listings">Create Listing</a>
              </div>
            </section>
          </div>
        </section>

        {/* Note modal */}
        <Modal open={noteOpen} onClose={() => setNoteOpen(false)} title="Client Note">
          <div className="space-y-3">
            <label className="block">
              <span className={fieldLabel}>Notes</span>
              <Textarea
                rows={4}
                value={noteDraft}
                onChange={(e) => setNoteDraft((e.target as HTMLTextAreaElement).value)}
                placeholder="Next steps, preferences, constraints…"
              />
            </label>
            <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
              <GhostButton className="w-full sm:w-auto" onClick={() => setNoteOpen(false)}>Cancel</GhostButton>
              <Button className="w-full sm:w-auto" onClick={saveNote}>Save Note</Button>
            </div>
          </div>
        </Modal>

        {/* Add client modal (single entry point) */}
        <AddClientModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onCreate={addClient}
        />

        <div className="h-10" />
      </div>
    </main>
  );
}

/* ---------------- Small UI bits ---------------- */

function ChipGroup({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string }[];
}) {
  return (
    <div className="inline-flex items-center gap-1 overflow-x-auto rounded-full border border-white/20 bg-white/10 p-1 pr-1.5">
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-3 py-1 text-xs rounded-full transition
            ${value === opt.key ? "bg-white text-slate-900" : "text-white/85 hover:text-white"}`}
          aria-pressed={value === opt.key}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function StageBadge({
  value, onChange, role,
}: {
  value: BuyerLead["stage"];
  onChange: (v: BuyerLead["stage"]) => void;
  role: Role;
}) {
  const options = role === "seller"
    ? (["prep","listed","under_contract","closed"] as BuyerLead["stage"][])
    : (["new","engaged","touring","offer","closed"] as BuyerLead["stage"][]);

  return (
    <details className="relative">
      <summary
        className="list-none cursor-pointer rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-xs text-white/85 hover:bg-white/15"
        aria-label={`Change stage (current ${value})`}
      >
        {prettyStage(value)}
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-white/20 bg-white/95 text-slate-900 shadow-lg">
        {options.map(s => (
          <button
            key={s}
            onClick={(e) => { e.preventDefault(); onChange(s); (e.currentTarget.closest("details") as HTMLDetailsElement)?.removeAttribute("open"); }}
            className="block w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50"
          >
            {prettyStage(s)}
          </button>
        ))}
      </div>
    </details>
  );
}

function prettyStage(s: BuyerLead["stage"]) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

/* ---- Add Client Modal ---- */
function AddClientModal({
  open, onClose, onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (b: Omit<BuyerLead,"id">) => void;
}) {
  const [form, setForm] = useState<Omit<BuyerLead,"id">>({
    role: "buyer",
    name: "",
    email: "",
    phone: "",
    interestAddress: "",
    stage: "new",
    note: "",
  });

  // keep stage in sync with role
  useEffect(() => {
    setForm(f => ({
      ...f,
      stage: f.role === "seller" ? "prep" : (f.stage === "prep" || f.stage === "listed" || f.stage === "under_contract" ? "new" : f.stage),
    }));
  }, [form.role]); // eslint-disable-line react-hooks/exhaustive-deps

  function submit() {
    if (!form.name.trim()) return;
    const payload: Omit<BuyerLead,"id"> = {
      ...form,
      name: form.name.trim(),
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      interestAddress: form.interestAddress?.trim() || undefined,
      note: form.note?.trim() || undefined,
    };
    onCreate(payload);
    onClose();
    setForm({ role: "buyer", name: "", email: "", phone: "", interestAddress: "", stage: "new", note: "" });
  }

  const stageOptions = form.role === "seller"
    ? (["prep","listed","under_contract","closed"] as BuyerLead["stage"][])
    : (["new","engaged","touring","offer","closed"] as BuyerLead["stage"][]);

  return (
    <Modal open={open} onClose={onClose} title="Add Client">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block"><span className={fieldLabel}>Name</span>
            <Input value={form.name} onChange={e => setForm({ ...form, name: (e.target as HTMLInputElement).value })} />
          </label>
          <label className="block"><span className={fieldLabel}>Role</span>
            <select
              className="w-full rounded-md border border-white/15 bg-white/10 px-2 py-2 text-sm outline-none placeholder:text-white/60 focus:ring-2 focus:ring-white/30"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block"><span className={fieldLabel}>Email (optional)</span>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: (e.target as HTMLInputElement).value })} />
          </label>
          <label className="block"><span className={fieldLabel}>Phone (optional)</span>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: (e.target as HTMLInputElement).value })} />
          </label>
        </div>

        <label className="block"><span className={fieldLabel}>Interest address (optional)</span>
          <Input value={form.interestAddress} onChange={e => setForm({ ...form, interestAddress: (e.target as HTMLInputElement).value })} placeholder="e.g., 1842 Maple St" />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block"><span className={fieldLabel}>Stage</span>
            <select
              className="w-full rounded-md border border-white/15 bg-white/10 px-2 py-2 text-sm outline-none placeholder:text-white/60 focus:ring-2 focus:ring-white/30"
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value as BuyerLead["stage"] })}
            >
              {stageOptions.map(s => <option key={s} value={s}>{prettyStage(s)}</option>)}
            </select>
          </label>
          <div />
        </div>

        <label className="block">
          <span className={fieldLabel}>Notes (optional)</span>
          <Textarea
            rows={3}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: (e.target as HTMLTextAreaElement).value })}
            placeholder="Preferences, constraints, next steps…"
          />
        </label>

        <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
          <GhostButton className="w-full sm:w-auto" onClick={onClose}>Cancel</GhostButton>
          <Button className="w-full sm:w-auto" onClick={submit}>Create</Button>
        </div>
      </div>
    </Modal>
  );
}
