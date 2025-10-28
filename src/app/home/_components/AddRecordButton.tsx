// src/app/home/_components/AddRecordButton.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ctaPrimary, ctaGhost } from "@/lib/glass";
import { AddRecordModal } from "./AddRecordModal";
import { useToast } from "@/components/ui/Toast";

export default function AddRecordButton({
  homeId,
  variant = "primary",
  label = "Add Record",
}: {
  homeId: string;
  variant?: "primary" | "ghost";
  label?: string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function createRecord(payload: {
    title: string;
    note?: string;
    date?: string;
    kind?: string;
    vendor?: string;
    cost?: number;
  }) {
    setBusy(true);
    try {
      console.log("POST payload:", payload); // 👈 inspect in browser devtools

      const res = await fetch(`/api/home/${homeId}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to create record");
      push("Record added");
      router.refresh();
      setOpen(false);
    } catch (err: any) {
      push(err?.message || "Could not add record");
    } finally {
      setBusy(false);
    }
  }

  const handleCreate = (rec: any) => {
    createRecord({
      title: rec.title,
      note: rec.note ?? "",
      date: rec.date,
      kind:
        rec.kind ??
        (rec.category ? String(rec.category).toLowerCase() : undefined),
      vendor: rec.vendor ?? "",
      cost: rec.cost ? Number(rec.cost) : undefined,
    });
  };

  return (
    <>
      <button
        className={variant === "ghost" ? ctaGhost : ctaPrimary}
        onClick={() => setOpen(true)}
        disabled={busy}
      >
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