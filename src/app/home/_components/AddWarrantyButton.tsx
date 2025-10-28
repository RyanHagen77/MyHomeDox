"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ctaPrimary } from "@/lib/glass";
import { useToast } from "@/components/ui/Toast";
import { AddWarrantyModal } from "@/app/home/_components/AddWarrantyModal";

type Props = { homeId: string };

export default function AddWarrantyButton({ homeId }: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function onCreate(w: { item: string; provider?: string; policyNo?: string; expiresAt?: string | null }) {
    setBusy(true);
    try {
      const res = await fetch(`/api/home/${homeId}/warranties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(w),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Failed to add warranty");

      push("Warranty added");
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      push(e?.message || "Could not add warranty");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className={ctaPrimary} onClick={() => setOpen(true)} disabled={busy}>
        {busy ? "Saving…" : "Add"}
      </button>
      <AddWarrantyModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={onCreate}
      />
    </>
  );
}