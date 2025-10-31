"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ctaPrimary, ctaGhost } from "@/lib/glass";
import { useToast } from "@/components/ui/Toast";
import { AddRecordModal, type CreateRecordPayload } from "./AddRecordModal";

type Props = {
  homeId: string;
  variant?: "primary" | "ghost";
  label?: string;
  className?: string;
};

type PresignResponse = { key: string; url: string; publicUrl: string | null };
type PersistAttachment = {
  filename: string;
  size: number;
  contentType: string;
  storageKey: string;
  url: string | null;
};

export default function AddRecordButton({
  homeId,
  variant = "primary",
  label = "Add Record",
  className,
}: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

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

  async function uploadAndPersistAttachments({
    recordId,
    files,
  }: {
    recordId: string;
    files: File[];
  }) {
    if (!files.length) return;

    const uploaded: PersistAttachment[] = [];
    for (const f of files) {
      const pre = await fetch(`/api/uploads/presign`, {
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
      if (!pre.ok) throw new Error(`Presign failed: ${await pre.text()}`);
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

    const endpoint = `/api/home/${homeId}/records/${recordId}/attachments`;
    const persist = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(uploaded),
    });
    if (!persist.ok) throw new Error(`Persist attachments failed: ${await persist.text()}`);
  }

  async function onCreateAction({
    payload,
    files,
  }: {
    payload: CreateRecordPayload;
    files: File[];
  }) {
    setBusy(true);
    try {
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
      await uploadAndPersistAttachments({ recordId, files });

      setOpen(false);
      push("Record added");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not add record";
      push(msg);
    } finally {
      setBusy(false);
    }
  }

  const btnClass = `${variant === "ghost" ? ctaGhost : ctaPrimary}${className ? ` ${className}` : ""}`;

  return (
    <>
      <button className={btnClass} onClick={() => setOpen(true)} disabled={busy}>
        {busy ? "Saving…" : label}
      </button>

      <AddRecordModal
        open={open}
        onCloseAction={() => setOpen(false)}
        onCreateAction={onCreateAction}
      />
    </>
  );
}