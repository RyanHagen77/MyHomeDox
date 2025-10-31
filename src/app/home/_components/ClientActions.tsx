"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ctaPrimary, ctaGhost } from "@/lib/glass";

/** Client modals */
import { AddRecordModal, type CreateRecordPayload } from "@/app/home/_components/AddRecordModal";
import { ShareAccessModal } from "@/app/home/_components/ShareAccessModal";
import {
  AddReminderModal,
  type ReminderModalPayload,
} from "@/app/home/_components/AddReminderModal";
import {
  AddWarrantyModal,
  type WarrantyModalPayload,
} from "@/app/home/_components/AddWarrantyModal";
import { FindVendorsModal, type VendorDirectoryItem } from "@/app/home/_components/FindVendorModal";

/* ---------- Types ---------- */
type PresignResponse = { key: string; url: string; publicUrl: string | null };
type PersistAttachment = {
  filename: string;
  size: number;
  contentType: string;
  storageKey: string;
  url: string | null;
};

/* ---------- Component ---------- */
export default function ClientActions({ homeId }: { homeId: string }) {
  const router = useRouter();

  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [findVendorsOpen, setFindVendorsOpen] = useState(false);
  const [warrantyOpen, setWarrantyOpen] = useState(false);

  /* ---------- API Helpers ---------- */
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
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.id) throw new Error(json?.error || "Failed to create record");
    return { id: json.id };
  }

  async function createReminder(payload: {
    title: string;
    dueAt: string;
    note?: string | null;
    repeat?: ReminderModalPayload["repeat"];
  }): Promise<{ id: string }> {
    const res = await fetch(`/api/home/${homeId}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.id) throw new Error(json?.error || "Failed to create reminder");
    return { id: json.id };
  }

  async function createWarranty(payload: {
    item: string;
    provider?: string | null;
    policyNo?: string | null;
    expiresAt?: string | null;
    note?: string | null;
  }): Promise<{ id: string }> {
    const res = await fetch(`/api/home/${homeId}/warranties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.id) throw new Error(json?.error || "Failed to create warranty");
    return { id: json.id };
  }

  /* ---------- Shared uploader helper ---------- */
  async function uploadAndPersistAttachments({
    homeId,
    recordId,
    warrantyId,
    reminderId,
    files,
  }: {
    homeId: string;
    recordId?: string;
    warrantyId?: string;
    reminderId?: string;
    files: File[];
  }) {
    if (!files.length) return;

    const uploaded: PersistAttachment[] = [];
    for (const f of files) {
      // Build presign payload - only include the ID that's actually present
      const presignPayload: any = {
        homeId,
        filename: f.name,
        contentType: f.type || "application/octet-stream",
        size: f.size,
      };

      // Add whichever ID is present
      if (recordId) presignPayload.recordId = recordId;
      if (warrantyId) presignPayload.warrantyId = warrantyId;
      if (reminderId) presignPayload.reminderId = reminderId;

      const pre = await fetch(`/api/uploads/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(presignPayload),
      });

      if (!pre.ok) {
        const errorText = await pre.text();
        throw new Error(`Presign failed: ${errorText}`);
      }

      const { key, url, publicUrl } = (await pre.json()) as PresignResponse;
      if (!key || !url) throw new Error("Presign missing key/url");

      const put = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": f.type || "application/octet-stream" },
        body: f,
      });
      if (!put.ok) throw new Error(`S3 PUT failed: ${await put.text().catch(() => "")}`);

      uploaded.push({
        filename: f.name,
        size: f.size,
        contentType: f.type || "application/octet-stream",
        storageKey: key,
        url: publicUrl,
      });
    }

    // Pick correct endpoint
    let endpoint = "";
    if (recordId) endpoint = `/api/home/${homeId}/records/${recordId}/attachments`;
    else if (warrantyId) endpoint = `/api/home/${homeId}/warranties/${warrantyId}/attachments`;
    else if (reminderId) endpoint = `/api/home/${homeId}/reminders/${reminderId}/attachments`;
    if (!endpoint) return;

    const persist = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(uploaded),
    });
    if (!persist.ok) throw new Error(`Persist attachments failed: ${await persist.text()}`);
  }

  /* ---------- Record: create → presign → PUT → persist ---------- */
  async function onCreateRecord({
    payload,
    files,
  }: {
    payload: CreateRecordPayload;
    files: File[];
  }) {
    const record = await createRecord({
      title: payload.title,
      note: payload.note ?? null,
      date: payload.date,
      kind: payload.kind ?? (payload.category ? payload.category.toLowerCase() : null),
      vendor: payload.vendor ?? null,
      cost: typeof payload.cost === "number" ? payload.cost : Number(payload.cost) || null,
      verified: payload.verified ?? null,
    });

    const recordId = record.id;
    await uploadAndPersistAttachments({ homeId, recordId, files });
    setAddOpen(false);
    router.refresh();
  }

  /* ---------- Reminder: create → presign → PUT → persist ---------- */
  async function onCreateReminder({
    payload,
    files,
  }: {
    payload: ReminderModalPayload;
    files: File[];
  }) {
    const created = await createReminder({
      title: payload.title,
      dueAt: payload.dueAt,
      note: payload.note ?? null,
      repeat: payload.repeat ?? "none",
    });
    const reminderId = created.id;

    await uploadAndPersistAttachments({ homeId, reminderId, files });
    setReminderOpen(false);
    router.refresh();
  }

  /* ---------- Warranty: create → presign → PUT → persist ---------- */
  async function onCreateWarranty({
    payload,
    files,
  }: {
    payload: WarrantyModalPayload;
    files: File[];
  }) {
    const warranty = await createWarranty({
      item: payload.item,
      provider: payload.provider ?? null,
      policyNo: payload.policyNo ?? null,
      expiresAt: payload.expiresAt ?? null,
      note: payload.note ?? null,
    });

    const warrantyId = warranty.id;
    await uploadAndPersistAttachments({ homeId, warrantyId, files });
    setWarrantyOpen(false);
    router.refresh();
  }

  /* ---------- UI ---------- */
  return (
    <>
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

      {/* Record Modal */}
      <AddRecordModal
        open={addOpen}
        onCloseAction={() => setAddOpen(false)}
        onCreateAction={onCreateRecord}
      />

      {/* Reminder Modal */}
      <AddReminderModal
        open={reminderOpen}
        onCloseAction={() => setReminderOpen(false)}
        onCreateAction={onCreateReminder}
      />

      {/* Warranty Modal */}
      <AddWarrantyModal
        open={warrantyOpen}
        onCloseAction={() => setWarrantyOpen(false)}
        onCreateAction={onCreateWarranty}
      />

      {/* Share Access */}
      <ShareAccessModal open={shareOpen} onCloseAction={() => setShareOpen(false)} homeId={homeId} />

      {/* Find Vendors */}
      <FindVendorsModal
        open={findVendorsOpen}
        onCloseAction={() => setFindVendorsOpen(false)}
        onAdd={(v: VendorDirectoryItem) => {
          // hook up when ready
          console.log("picked vendor", v.id);
        }}
      />
    </>
  );
}