// src/components/AddWarrantyModal.tsx
"use client";
import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, fieldLabel } from "@/components/ui";
import { Button, GhostButton } from "@/components/ui/Button";
import { uid } from "@/lib/storage";

type WarrantyInput = { item: string; vendor: string; expires: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (w: { id: string } & WarrantyInput) => void;
};

export function AddWarrantyModal({ open, onClose, onCreate }: Props) {
  const [form, setForm] = React.useState<WarrantyInput>({
    item: "",
    vendor: "",
    expires: new Date().toISOString().slice(0, 10),
  });

  React.useEffect(() => {
    if (open) {
      setForm({
        item: "",
        vendor: "",
        expires: new Date().toISOString().slice(0, 10),
      });
    }
  }, [open]);

  function submit() {
    if (!form.item.trim() || !form.vendor.trim()) return;
    onCreate({ id: uid(), ...form });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Warranty or Manual">
      <div className="space-y-3">
        <label className="block">
          <span className={fieldLabel}>Item</span>
          <Input
            value={form.item}
            onChange={(e) => setForm({ ...form, item: e.target.value })}
            placeholder="e.g., Water Heater"
          />
        </label>

        <label className="block">
          <span className={fieldLabel}>Vendor / Brand</span>
          <Input
            value={form.vendor}
            onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            placeholder="e.g., Rheem"
          />
        </label>

        <label className="block">
          <span className={fieldLabel}>Expires</span>
          <Input
            type="date"
            value={form.expires}
            onChange={(e) => setForm({ ...form, expires: e.target.value })}
          />
        </label>

        <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
          <GhostButton className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </GhostButton>
          <Button className="w-full sm:w-auto" onClick={submit}>
            Add
          </Button>
        </div>
      </div>
    </Modal>
  );
}
