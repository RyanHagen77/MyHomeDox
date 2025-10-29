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

  // Minimal createRecord – if you already have a fuller version (presign, PUT, persist),
  // keep that one. This is just to keep types correct.
  async function createRecord(payload: {
    title: string;
    note?: string | null;
    date?: string;
    kind?: string | null;
    vendor?: string | null;
    cost?: number | null;
    verified?: boolean | null;
  }) {
    setBusy(true);
    try {
      const res = await fetch(`/api/home/${homeId}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string })?.error || "Failed to create record");
      push("Record added");
      setOpen(false);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not add record";
      push(msg);
    } finally {
      setBusy(false);
    }
  }

  const handleCreate = (rec: CreateRecordPayload) => {
    createRecord({
      title: rec.title,
      note: rec.note ?? null,
      date: rec.date,
      kind: rec.kind ?? (rec.category ? rec.category.toLowerCase() : null),
      vendor: rec.vendor ?? null,
      cost: typeof rec.cost === "number" ? rec.cost : rec.cost ? Number(rec.cost) : null,
      verified: rec.verified ?? null,
    });
  };

  const btnClass = `${variant === "ghost" ? ctaGhost : ctaPrimary}${className ? ` ${className}` : ""}`;

  return (
    <>
      <button className={btnClass} onClick={() => setOpen(true)} disabled={busy}>
        {busy ? "Saving…" : label}
      </button>

      <AddRecordModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={({ payload }) => handleCreate(payload)}
      />
    </>
  );
}