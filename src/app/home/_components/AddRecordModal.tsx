// src/app/home/_components/AddRecordModal.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal"; // <- Make sure Modal itself has "use client" and prop `onCloseAction`
import { Input, Select, Textarea, fieldLabel } from "@/components/ui";
import { Button, GhostButton } from "@/components/ui/Button";
import { RecordSchema, type RecordInput } from "@/lib/validators";
import { uid } from "@/lib/storage";
import { useToast } from "@/components/ui/Toast";
import { glassTight, textMeta } from "@/lib/glass";

type Props = {
  open: boolean;
  /** renamed from onClose to avoid TS71007 on server/client boundary */
  close: () => void;
  onCreate: (record: any) => void; // parent persists to DB
};

/** Local form type: extend RecordInput with the singular `note` field */
type RecordForm = RecordInput & { note: string };

export function AddRecordModal({ open, close, onCreate }: Props) {
  const { push } = useToast();
  const [step, setStep] = React.useState(1);
  const [attachments, setAttachments] = React.useState<string[]>([]);

  const [form, setForm] = React.useState<RecordForm>({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    category: "Maintenance",
    vendor: "",
    cost: 0,
    verified: false,
    note: "",                // <- singular local field
    attachments: [],
  });

  function set<K extends keyof RecordForm>(k: K, v: RecordForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setAttachments((a) => [...a, ...urls]);
  }

  function reset() {
    setStep(1);
    setAttachments([]);
    setForm({
      title: "",
      date: new Date().toISOString().slice(0, 10),
      category: "Maintenance",
      vendor: "",
      cost: 0,
      verified: false,
      note: "",
      attachments: [],
    });
  }

  function next() { setStep((s) => Math.min(3, s + 1)); }
  function back() { setStep((s) => Math.max(1, s - 1)); }

  function submit() {
    // Validate only what the Zod schema knows about, then reattach `note`
    const candidateForValidation = {
      title: form.title,
      date: form.date,
      category: form.category,
      vendor: form.vendor,
      cost: form.cost,
      verified: form.verified,
      attachments,
    };

    const parsed = RecordSchema.safeParse(candidateForValidation);
    if (!parsed.success) {
      push("Please complete required fields");
      return;
    }

    // Re-attach fields that may not exist in the schema (e.g., singular `note`)
    onCreate({
      id: uid(),
      ...parsed.data,
      note: form.note ?? "",
      // if your API expects `kind`, derive it from category
      kind:
        (parsed.data as any).kind ??
        (parsed.data.category ? String(parsed.data.category).toLowerCase() : undefined),
    });

    push("Record added");
    reset();
    close();
  }

  return (
    <Modal
      open={open}
      title="Add Record"
      onCloseAction={() => {
        reset();
        close();
      }}
    >
      <div className="mb-3">
        <Stepper step={step} />
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <label className="block">
            <span className={fieldLabel}>Upload files</span>
            <input
              type="file"
              multiple
              onChange={(e) => onFiles(e.target.files)}
              className="mt-1 block w-full text-white/85 file:mr-3 file:rounded-md file:border file:border-white/30 file:bg-white/10 file:px-3 file:py-1.5 file:text-white hover:file:bg-white/15"
            />
          </label>

          {attachments.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {attachments.map((u, i) => (
                <Image
                  key={i}
                  src={u}
                  alt=""
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded border border-white/20 object-cover"
                />
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <span className={`text-sm ${textMeta}`}>Images or PDFs welcome</span>
            <Button className="px-4" onClick={next}>Next</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <label className="block">
            <span className={fieldLabel}>Title</span>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g., HVAC Tune-up"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={fieldLabel}>Date</span>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </label>

            <label className="block">
              <span className={fieldLabel}>Category</span>
              <Select
                value={form.category}
                onChange={(e) => set("category", e.target.value as any)}
              >
                <option>Maintenance</option>
                <option>Repair</option>
                <option>Upgrade</option>
                <option>Inspection</option>
                <option>Warranty</option>
              </Select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={fieldLabel}>Vendor</span>
              <Input
                value={form.vendor}
                onChange={(e) => set("vendor", e.target.value)}
                placeholder="e.g., ChillRight Heating"
              />
            </label>

            <label className="block">
              <span className={fieldLabel}>Cost</span>
              <Input
                type="number"
                min="0"
                value={form.cost}
                onChange={(e) => set("cost", Number(e.target.value))}
              />
            </label>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.verified}
              onChange={(e) => set("verified", e.target.checked)}
              className="h-4 w-4 rounded border-white/30 bg-black/30"
            />
            <span className="text-sm text-white/85">Mark as verified by vendor</span>
          </label>

          <label className="block">
            <span className={fieldLabel}>Notes</span>
            <Textarea
              rows={3}
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Optional details…"
            />
          </label>

          <div className="flex justify-between">
            <GhostButton onClick={back}>Back</GhostButton>
            <Button onClick={next}>Next</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div className={`${glassTight} text-sm`}>
            <div className="mb-1 font-medium text-white">Review</div>
            <div className="text-white/85">
              {form.title} • {form.vendor} • {new Date(form.date).toLocaleDateString()}
            </div>
            <div className="text-white/85">
              Category: {form.category} • Cost: ${form.cost.toLocaleString()}
            </div>
            <div className="text-white/85">
              {form.verified ? "Verified" : "Unverified"} • {attachments.length} attachment(s)
            </div>
            {form.note && <div className="text-white/85">Notes: {form.note}</div>}
          </div>

          <div className="flex justify-between">
            <GhostButton onClick={back}>Back</GhostButton>
            <Button onClick={submit}>Save Record</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {["Upload", "Details", "Review"].map((label, i) => {
        const active = step === i + 1;
        return (
          <div
            key={label}
            className={`rounded-full border px-2 py-1 ${
              active
                ? "border-white/30 bg-white/20 text-white"
                : "border-white/20 bg-white/10 text-white/70"
            }`}
          >
            {i + 1}. {label}
          </div>
        );
      })}
    </div>
  );
}