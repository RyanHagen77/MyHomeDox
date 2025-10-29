"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ctaPrimary, ctaGhost } from "@/lib/glass";

/** Client modals */
import { AddRecordModal, type CreateRecordPayload } from "@/app/home/_components/AddRecordModal";
import { ShareAccessModal } from "@/app/home/_components/ShareAccessModal";
import { AddReminderModal } from "@/app/home/_components/AddReminderModal";
import { FindVendorsModal, type VendorDirectoryItem } from "@/app/home/_components/FindVendorModal";
import { AddWarrantyModal } from "@/app/home/_components/AddWarrantyModal";

/* ---------- Types for API helpers ---------- */
type PresignResponse = { key: string; url: string; publicUrl: string | null };
type PersistAttachment = {
  filename: string;
  size: number;
  contentType: string;
  storageKey: string;
  url: string | null;
};
type ReminderFromModal = { title: string; dueAt?: string; due?: string };
type WarrantyFromModal = {
  item: string;
  vendor?: string;
  policyNo?: string;
  expiresAt?: string | null;
};

export default function ClientActions({ homeId }: { homeId: string }) {
  const router = useRouter();

  // modal state
  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [findVendorsOpen, setFindVendorsOpen] = useState(false);
  const [warrantyOpen, setWarrantyOpen] = useState(false);

  /* ---------- API helpers ---------- */
  async function createRecord(payload: {
    title: string;
    note?: string | null;
    date?: string;
    kind?: string | null;
    vendor?: string | null;
    cost?: number | null;
    verified?: boolean | null;
  }): Promise<{ id: string }> {
    const res = await fetch(`/api/home/${homeId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
    if (!res.ok || !json?.id) throw new Error(json?.error || "Failed to create record");
    return { id: json.id };
  }

  async function createReminder(payload: { title: string; dueAt: string }) {
    const res = await fetch(`/api/home/${homeId}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create reminder");
    router.refresh();
  }

  async function createWarranty(payload: {
    item: string;
    provider?: string;
    policyNo?: string;
    expiresAt?: string | null;
  }) {
    const res = await fetch(`/api/home/${homeId}/warranties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create warranty");
    router.refresh();
  }

  /* ---------- Record create → presign → PUT → persist ---------- */
  async function onCreateRecord(args: { payload: CreateRecordPayload; files: File[] }): Promise<void> {
    const { payload, files } = args;

    // 1) Create record (presign requires recordId)
    const record = await createRecord({
      title: payload.title,
      note: payload.note ?? null,
      date: payload.date,
      kind: payload.kind ?? (payload.category ? payload.category.toLowerCase() : null),
      vendor: payload.vendor ?? null,
      cost:
        typeof payload.cost === "number"
          ? payload.cost
          : payload.cost
          ? Number(payload.cost)
          : null,
      verified: payload.verified ?? null,
    });
    const recordId = record.id;

    // 2) Presign → PUT for each file
    const uploaded: PersistAttachment[] = [];
    for (const f of files) {
      const preRes = await fetch(`/api/uploads/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeId,
          recordId,
          filename: f.name,
          mimeType: f.type || "application/octet-stream",
          size: f.size,
        }),
      });
      if (!preRes.ok) throw new Error(`Presign failed: ${await preRes.text()}`);
      const { key, url, publicUrl } = (await preRes.json()) as PresignResponse;
      if (!key || !url) throw new Error("Presign missing key/url");

      const putRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": f.type || "application/octet-stream" },
        body: f,
      });
      if (!putRes.ok) throw new Error(`S3 PUT failed: ${await putRes.text().catch(() => "")}`);

      uploaded.push({
        filename: f.name,
        size: f.size,
        contentType: f.type || "application/octet-stream",
        storageKey: key,
        url: publicUrl,
      });
    }

    // 3) Persist attachment rows
    if (uploaded.length) {
      const persistRes = await fetch(`/api/home/${homeId}/records/${recordId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploaded),
      });
      if (!persistRes.ok) throw new Error(`Persist attachments failed: ${await persistRes.text()}`);
    }

    setAddOpen(false);
    router.refresh();
  }

  return (
    <>
      {/* Buttons row */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setAddOpen(true)} className={ctaPrimary}>
          Add Record
        </button>
        <button onClick={() => setReminderOpen(true)} className={ctaGhost}>
          Add Reminder
        </button>
        <button onClick={() => setWarrantyOpen(true)} className={ctaGhost}>
          Add Warranty
        </button>
        <button onClick={() => setShareOpen(true)} className={ctaGhost}>
          Share Access
        </button>
        <a href={`/report?home=${homeId}`} className={ctaGhost}>
          View Report
        </a>
      </div>

      {/* Record modal — consistent prop names */}
      <AddRecordModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={onCreateRecord}
      />

      {/* Reminder modal */}
      <AddReminderModal
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        onCreate={async (rem: ReminderFromModal) => {
          await createReminder({
            title: rem.title,
            dueAt: rem.dueAt ?? rem.due ?? "", // normalize
          });
          setReminderOpen(false);
        }}
      />

      {/* Warranty modal */}
      <AddWarrantyModal
        open={warrantyOpen}
        onClose={() => setWarrantyOpen(false)}
        onCreate={async (w: WarrantyFromModal) => {
          await createWarranty({
            item: w.item,
            provider: w.vendor,        // map vendor -> provider
            policyNo: w.policyNo,
            expiresAt: w.expiresAt ?? null,
          });
          setWarrantyOpen(false);
        }}
      />

      {/* Share access modal */}
      <ShareAccessModal open={shareOpen} onClose={() => setShareOpen(false)} homeId={homeId} />

      {/* (Optional) Find vendor modal */}
      <FindVendorsModal
        open={findVendorsOpen}
        onClose={() => setFindVendorsOpen(false)}
        onAdd={function (_v: VendorDirectoryItem): void {
          // implement when ready
          throw new Error("Function not implemented.");
        }}
      />
    </>
  );
}