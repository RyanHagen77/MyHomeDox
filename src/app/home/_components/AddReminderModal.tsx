"use client";

import * as React from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea, fieldLabel } from "@/components/ui";
import { Button, GhostButton } from "@/components/ui/Button";
import { glassTight, textMeta } from "@/lib/glass";

export type ReminderModalPayload = {
  title: string;
  dueAt: string; // YYYY-MM-DD
  note?: string;
  repeat?: "none" | "monthly" | "quarterly" | "semiannual" | "annual";
};

type Props = {
  open: boolean;
  onCloseAction: () => void;
  onCreateAction: (args: { payload: ReminderModalPayload; files: File[] }) => void;
  propertyYearBuilt?: number;
};

const SUGGESTIONS: Array<{
  title: string;
  deltaDays: number;
  repeat: NonNullable<ReminderModalPayload["repeat"]>;
}> = [
  { title: "Replace HVAC filter", deltaDays: 14, repeat: "monthly" },
  { title: "Test smoke/CO alarms", deltaDays: 7, repeat: "quarterly" },
  { title: "Gutter cleaning", deltaDays: 14, repeat: "semiannual" },
  { title: "Water heater flush", deltaDays: 21, repeat: "annual" },
];

export function AddReminderModal({ open, onCloseAction, onCreateAction }: Props) {
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [form, setForm] = React.useState<ReminderModalPayload>({
    title: "",
    dueAt: today,
    note: "",
    repeat: "none",
  });

  // attachments
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!open) return;
    // Clean up old previews
    previews.forEach(url => URL.revokeObjectURL(url));
    setForm({ title: "", dueAt: today, note: "", repeat: "none" });
    setFiles([]);
    setPreviews([]);
  }, [open, today]);

  const set = <K extends keyof ReminderModalPayload>(k: K, v: ReminderModalPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function quickAdd(s: (typeof SUGGESTIONS)[number]) {
    const d = new Date();
    d.setDate(d.getDate() + s.deltaDays);
    setForm({ title: s.title, dueAt: d.toISOString().slice(0, 10), note: "", repeat: s.repeat });
  }

  function onFiles(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list);
    setFiles(arr);
    const newPreviews = arr.map(f => URL.createObjectURL(f));
    setPreviews(newPreviews);
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index]);
    setFiles(f => f.filter((_, i) => i !== index));
    setPreviews(p => p.filter((_, i) => i !== index));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreateAction({ payload: form, files });
    onCloseAction();
  }

  return (
    <Modal open={open} onCloseAction={onCloseAction} title="Add Reminder">
      <form className="space-y-3" onSubmit={submit}>
        <div className={glassTight}>
          <div className={`mb-2 text-sm ${textMeta}`}>Quick suggestions</div>
          <div className="flex flex-wrap items-center gap-2">
            {SUGGESTIONS.map((s) => (
              <GhostButton key={s.title} type="button" size="sm" onClick={() => quickAdd(s)}>
                {s.title}
              </GhostButton>
            ))}
          </div>
        </div>

        <label className="block">
          <span className={fieldLabel}>Title</span>
          <Input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g., Replace HVAC filter"
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={fieldLabel}>Due date</span>
            <Input type="date" value={form.dueAt} onChange={(e) => set("dueAt", e.target.value)} />
          </label>
          <label className="block">
            <span className={fieldLabel}>Repeat</span>
            <Select
              value={form.repeat}
              onChange={(e) => set("repeat", e.target.value as NonNullable<ReminderModalPayload["repeat"]>)}
            >
              <option value="none">Does not repeat</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semiannual">Every 6 months</option>
              <option value="annual">Yearly</option>
            </Select>
          </label>
        </div>

        <label className="block">
          <span className={fieldLabel}>Notes</span>
          <Textarea
            rows={3}
            value={form.note ?? ""}
            onChange={(e) => set("note", e.target.value)}
            placeholder="Optional details…"
          />
        </label>

        {/* Attachments */}
        <label className="block">
          <span className={fieldLabel}>Attachments (optional)</span>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={(e) => onFiles(e.target.files)}
            className="mt-1 block w-full text-white/85 file:mr-3 file:rounded-md file:border file:border-white/30 file:bg-white/10 file:px-3 file:py-1.5 file:text-white hover:file:bg-white/15"
          />
        </label>

        {previews.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {previews.map((u, i) => (
              <div key={i} className="relative flex-shrink-0">
                <Image
                  src={u}
                  alt={`Preview ${i + 1}`}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded border border-white/20 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

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