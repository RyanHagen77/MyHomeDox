"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, fieldLabel } from "@/components/ui";
import { Button, GhostButton } from "@/components/ui/Button";

export type WarrantyModalPayload = {
  item: string;
  provider?: string;
  policyNo?: string;
  expiresAt?: string | null; // "YYYY-MM-DD" or null
  note?: string;
};

type Props = {
  open: boolean;
  onCloseAction: () => void; // action-suffixed for TS71007
  onCreateAction: (args: { payload: WarrantyModalPayload; files: File[] }) => void; // action-suffixed
};

export function AddWarrantyModal({ open, onCloseAction, onCreateAction }: Props) {
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [files, setFiles] = React.useState<File[]>([]);
  const [form, setForm] = React.useState<WarrantyModalPayload>({
    item: "",
    provider: "",
    policyNo: "",
    expiresAt: today,
    note: "",
  });

  React.useEffect(() => {
    if (!open) return;
    setFiles([]);
    setForm({ item: "", provider: "", policyNo: "", expiresAt: today, note: "" });
  }, [open, today]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.item.trim()) return;
    onCreateAction({ payload: form, files });
    onCloseAction();
  }

  function onFiles(list: FileList | null) {
    if (!list) return;
    setFiles(Array.from(list));
  }

  return (
    <Modal open={open} onCloseAction={onCloseAction} title="Add Warranty or Manual">
      <form className="space-y-3" onSubmit={submit}>
        <label className="block">
          <span className={fieldLabel}>Item</span>
          <Input
            value={form.item}
            onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))}
            placeholder="e.g., Water Heater"
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={fieldLabel}>Provider / Brand</span>
            <Input
              value={form.provider ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
              placeholder="e.g., Rheem"
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>Policy # (optional)</span>
            <Input
              value={form.policyNo ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, policyNo: e.target.value }))}
              placeholder="ABC-1234"
            />
          </label>
        </div>

        <label className="block">
          <span className={fieldLabel}>Expires</span>
          <Input
            type="date"
            value={form.expiresAt ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value || null }))}
          />
        </label>

        <label className="block">
          <span className={fieldLabel}>Notes (optional)</span>
          <Textarea
            rows={3}
            value={form.note ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="Add any notes or coverage details…"
          />
        </label>

        <label className="block">
          <span className={fieldLabel}>Attachments (optional)</span>
          <input
            type="file"
            multiple
            onChange={(e) => onFiles(e.target.files)}
            className="mt-1 block w-full text-white/85 file:mr-3 file:rounded-md file:border file:border-white/30 file:bg-white/10 file:px-3 file:py-1.5 file:text-white hover:file:bg-white/15"
          />
        </label>

        <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
          <GhostButton type="button" className="w-full sm:w-auto" onClick={onCloseAction}>
            Cancel
          </GhostButton>
          <Button className="w-full sm:w-auto" type="submit">
            Add
          </Button>
        </div>
      </form>
    </Modal>
  );
}