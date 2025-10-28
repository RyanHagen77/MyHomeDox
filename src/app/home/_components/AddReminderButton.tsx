"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ctaPrimary, ctaGhost } from "@/lib/glass";
import { AddRecordModal } from "./AddRecordModal";
import { useToast } from "@/components/ui/Toast";

type Props = {
  homeId: string;
  variant?: "primary" | "ghost";
  label?: string;
};

export default function AddRecordButton({
  homeId,
  variant = "primary",
  label = "Add Record",
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
  }) {
    setBusy(true);
    try {
      const res = await fetch(`/api/home/${homeId}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to create record");
      push("Record added");
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      push(err?.message || "Could not add record");
    } finally {
      setBusy(false);
    }
  }

  const handleCreate = (rec: any) => {
    // rec comes from AddRecordModal; includes: title, date, category, vendor, cost, note
    createRecord({
      title: rec.title,
      note: rec.note ?? null,
      date: rec.date,
      kind:
        (rec.kind as string) ??
        (String(rec.category || "").toLowerCase() || null),      vendor: rec.vendor ?? null,
      cost: typeof rec.cost === "number" ? rec.cost : rec.cost ? Number(rec.cost) : null,
    });
  };

  const btn = variant === "ghost" ? ctaGhost : ctaPrimary;

  return (
    <>
      <button className={btn} onClick={() => setOpen(true)} disabled={busy}>
        {busy ? "Saving…" : label}
      </button>

      <AddRecordModal
        open={open}
        close={() => setOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}