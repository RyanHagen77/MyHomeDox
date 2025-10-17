// app/pro/jobs/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { glass, glassTight, heading, textMeta, ctaPrimary, ctaGhost } from "@/lib/glass";
import { Button, GhostButton } from "@/components/ui/Button";
import { Input, Textarea, fieldLabel } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import ContractorTopBar from "@/app/pro/_components/ContractorTopBar";
import { loadJSON, saveJSON } from "@/lib/storage";

/* ------------ Types (aligned with /pro) ------------ */
type JobStatus = "requested" | "scheduled" | "in_progress" | "complete";
type Job = { id: string; title: string; clientAddress: string; due: string; status: JobStatus; estAmount?: number; };
type RecordItem = { id: string; title: string; date: string; address: string; amount?: number; };
type ClientHome = { id: string; address: string; sharedLink: string; owner?: string; };
type Review = { id: string; author: string; rating: number; text: string; date: string; };
type Pro = { id: string; business: string; category: string; rating: number; verified: boolean; logo?: string; };
type ProData = { pro: Pro; jobs: Job[]; records: RecordItem[]; clients: ClientHome[]; reviews: Review[]; };

export default function JobsPage() {
  const [db, setDb] = useState<ProData | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    setDb(loadJSON<ProData | null>("proData", null));
    setLoading(false);
  }, []);
  useEffect(() => { if (db) saveJSON("proData", db); }, [db]);

  const jobs = db?.jobs ?? [];
  const counts = useMemo(() => ({
    all: jobs.length,
    active: jobs.filter(j => j.status !== "complete").length,
    completed: jobs.filter(j => j.status === "complete").length,
  }), [jobs]);

  const filtered = useMemo(() => {
    let list = jobs;
    if (filter === "active") list = list.filter(j => j.status !== "complete");
    if (filter === "completed") list = list.filter(j => j.status === "complete");
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(j =>
        j.title.toLowerCase().includes(t) ||
        j.clientAddress.toLowerCase().includes(t)
      );
    }
    // sort: nearest due first (active) then completed most recent first
    return [...list].sort((a, b) => {
      if (a.status === "complete" && b.status !== "complete") return 1;
      if (b.status === "complete" && a.status !== "complete") return -1;
      return a.due.localeCompare(b.due);
    });
  }, [jobs, q, filter]);

  if (loading) {
    return (
      <main className="relative min-h-screen text-white">
        <Bg />
        <div className="mx-auto max-w-7xl p-6 space-y-6">
          <div className="h-9 w-48 animate-pulse rounded-xl bg-white/10 backdrop-blur-sm" />
          <div className="h-40 animate-pulse rounded-2xl bg-white/10 backdrop-blur-sm" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen text-white">
      <Bg />
      <div className="mx-auto max-w-7xl p-6 space-y-6">

      {/* Logo + nav */}
      <ContractorTopBar />

        {/* Filters */}
        <section className={glass}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Chip active={filter === "all"} onClick={() => setFilter("all")}>All ({counts.all})</Chip>
              <Chip active={filter === "active"} onClick={() => setFilter("active")}>Active ({counts.active})</Chip>
              <Chip active={filter === "completed"} onClick={() => setFilter("completed")}>Completed ({counts.completed})</Chip>
            </div>
            <div className="w-full sm:w-72">
              <Input placeholder="Search jobs or addresses…" value={q} onChange={e => setQ((e.target as HTMLInputElement).value)} />
            </div>
          </div>
        </section>

        {/* List */}
        <section className={glass}>
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-white/80">
              <p className="mb-2">No jobs match your filter.</p>
              <button className={ctaGhost} onClick={() => { setQ(""); setFilter("all"); }}>Clear filters</button>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {filtered.map((j) => (
                <li key={j.id} className="-mx-3">
                  <Link
                    href={`/pro/record/${j.id}`}
                    prefetch={false}
                    className="group block rounded-xl px-3 py-3 transition-colors duration-150 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-white group-hover:opacity-95">{j.title}</p>
                        <p className={`truncate text-sm ${textMeta}`}>
                          {j.clientAddress} • Due {new Date(j.due).toLocaleDateString()} • {prettyStatus(j.status)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {j.estAmount && (
                          <span className="rounded px-2 py-1 text-xs border border-white/20 bg-white/10 text-white/85">
                            ${j.estAmount}
                          </span>
                        )}
                        {j.status !== "complete" ? (
                          <button
                            className={ctaGhost}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              markComplete(j.id, setDb);
                            }}
                          >
                            Mark Complete
                          </button>
                        ) : (
                          <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-xs">Complete</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Modal */}
        <AddJobModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onCreate={(job) => setDb(d => (d ? { ...d, jobs: [job, ...(d.jobs ?? [])] } : d))}
        />
      </div>
    </main>
  );
}

/* ------------ Local helpers/components ------------ */

function Bg() {
  return (
    <div className="fixed inset-0 -z-50">
      <Image
        src="/myhomedox_home3.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.45))]" />
    </div>
  );
}
function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm transition ${active ? "border-white/40 bg-white/15" : "border-white/20 bg-white/5 hover:bg-white/10"}`}
    >{children}</button>
  );
}
function prettyStatus(s: JobStatus) {
  switch (s) { case "requested": return "Requested"; case "scheduled": return "Scheduled"; case "in_progress": return "In progress"; case "complete": return "Complete"; }
}
function markComplete(id: string, setDb: React.Dispatch<React.SetStateAction<ProData | null>>) {
  setDb(d => {
    if (!d) return d;
    const job = d.jobs.find(j => j.id === id); if (!job) return d;
    const jobs = d.jobs.map(j => j.id === id ? { ...j, status: "complete" as JobStatus } : j);
    const rec: RecordItem = { id: `rec-${id}`, title: job.title, date: new Date().toISOString().slice(0,10), address: job.clientAddress, amount: job.estAmount };
    return { ...d, jobs, records: [rec, ...d.records] };
  });
}
function cryptoId() { return (globalThis.crypto && "randomUUID" in crypto) ? crypto.randomUUID() : String(Date.now()); }

function AddJobModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (job: Job) => void; }) {
  const [form, setForm] = useState({ title: "", address: "", due: new Date().toISOString().slice(0,10), amount: "" });
  function submit() {
    if (!form.title.trim() || !form.address.trim()) return;
    onCreate({ id: cryptoId(), title: form.title.trim(), clientAddress: form.address.trim(), due: form.due, status: "requested", estAmount: form.amount ? Number(form.amount) : undefined });
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose} title="Add Job">
      <div className="space-y-3">
        <label className="block"><span className={fieldLabel}>Title</span><Input value={form.title} onChange={e => setForm({ ...form, title: (e.target as HTMLInputElement).value })} placeholder="e.g., Heat Pump Quote" /></label>
        <label className="block"><span className={fieldLabel}>Client address</span><Input value={form.address} onChange={e => setForm({ ...form, address: (e.target as HTMLInputElement).value })} placeholder="123 Main St" /></label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block"><span className={fieldLabel}>Due date</span><Input type="date" value={form.due} onChange={e => setForm({ ...form, due: (e.target as HTMLInputElement).value })} /></label>
          <label className="block"><span className={fieldLabel}>Estimated amount</span><Input type="number" inputMode="decimal" placeholder="Optional" value={form.amount} onChange={e => setForm({ ...form, amount: (e.target as HTMLInputElement).value })} /></label>
        </div>
        <div className="mt-1 flex justify-end gap-2"><GhostButton onClick={onClose}>Cancel</GhostButton><Button onClick={submit}>Add</Button></div>
      </div>
    </Modal>
  );
}
