"use client";
import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, fieldLabel } from "@/components/ui";
import { Button, GhostButton } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { glass, textMeta } from "@/lib/glass";
import { loadJSON, saveJSON } from "@/lib/storage";

type ClaimForm = {
  address: string;
  city?: string;
  state?: string;
  zip?: string;
};

export function ClaimHomeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { push } = useToast();

  const [form, setForm] = React.useState<ClaimForm>({
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  // Prefill from last search if available
  React.useEffect(() => {
    if (!open) return;
    const last = loadJSON<string>("lastSearchedAddress", "");
    if (last && !form.address) {
      setForm((f) => ({ ...f, address: last }));
    }
  }, [open]); // eslint-disable-line

  async function claim() {
    setMsg(null);
    if (!form.address.trim()) {
      setMsg("Please enter a street address.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/home/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Could not claim home.");
      // Optional: remember last claimed
      saveJSON("lastClaimedAddress", form.address);
      push("Home claimed!");
      window.location.href = `/home/${j.id}`;
    } catch (err: any) {
      setMsg(err.message || "Something went wrong.");
      push("Error claiming home");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Claim your home">
      {/* remove global text-gray-900 to prevent unwanted gray inheritance */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          <Input
            placeholder="Street address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            aria-label="Street address"
            className="border border-gray-300 text-gray-900 placeholder-gray-400"
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              aria-label="City"
              className="border border-gray-300 text-gray-900 placeholder-gray-400"
            />
            <Input
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              aria-label="State"
              className="border border-gray-300 text-gray-900 placeholder-gray-400"
            />
            <Input
              placeholder="ZIP"
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
              aria-label="ZIP"
              className="border border-gray-300 text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {msg && <p className="text-sm text-red-600">{msg}</p>}

        {/* 👇 updated color to solid white */}
        <p className="text-sm text-white">
          We’ll attach this address to your account. You can manage access and
          records once it’s claimed.
        </p>

        <div className="flex items-center justify-end gap-2">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <Button onClick={claim} disabled={submitting}>
            {submitting ? "Claiming…" : "Claim home"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}