"use client";

import * as React from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea, fieldLabel } from "@/components/ui";
import { Button, GhostButton } from "@/components/ui/Button";
import { RecordSchema, type RecordInput } from "@/lib/validators";
import { uid } from "@/lib/storage";
import { useToast } from "@/components/ui/Toast";
import { textMeta } from "@/lib/glass";

/** Public payload type this modal returns */
export type CreateRecordPayload = {
  id: string;
  title: string;
  date: string;
  category?: string;
  vendor?: string;
  cost?: number;
  verified?: boolean;
  note: string;
  kind?: string;
};

type Props = {
  open: boolean;
  /** TS71007-safe prop name */
  onCloseAction: () => void;
  /** TS71007-safe prop name */
  onCreateAction: (args: { payload: CreateRecordPayload; files: File[] }) => void;
};

type RecordForm = RecordInput & { note: string };

export function AddRecordModal({ open, onCloseAction, onCreateAction }: Props) {
  const { push } = useToast();
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [step, setStep] = React.useState(1);
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [form, setForm] = React.useState<RecordForm>({
    title: "",
    date: today,
    category: "Maintenance",
    vendor: "",
    cost: 0,
    verified: false,
    note: "",
    attachments: [],
  });

  // Reset when modal opens - exactly like AddWarrantyModal
  React.useEffect(() => {
    if (!open) return;
    setStep(1);
    setFiles([]);
    // Clean up old previews
    previews.forEach(url => URL.revokeObjectURL(url));
    setPreviews([]);
    setForm({
      title: "",
      date: today,
      category: "Maintenance",
      vendor: "",
      cost: 0,
      verified: false,
      note: "",
      attachments: [],
    });
  }, [open, today]);

  function set<K extends keyof RecordForm>(k: K, v: RecordForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onFiles(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list);
    setFiles(arr);
    // Create previews for images
    const newPreviews = arr.map(f => URL.createObjectURL(f));
    setPreviews(newPreviews);
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index]);
    setFiles(f => f.filter((_, i) => i !== index));
    setPreviews(p => p.filter((_, i) => i !== index));
  }

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const candidate = {
      title: form.title,
      date: form.date,
      category: form.category,
      vendor: form.vendor,
      cost: form.cost,
      verified: form.verified,
      attachments: [],
    };

    const parsed = RecordSchema.safeParse(candidate);
    if (!parsed.success) {
      push("Please complete required fields");
      return;
    }

    const payload: CreateRecordPayload = {
      id: uid(),
      title: parsed.data.title,
      date: parsed.data.date,
      category: parsed.data.category,
      vendor: parsed.data.vendor,
      cost: parsed.data.cost,
      verified: parsed.data.verified,
      note: form.note ?? "",
      kind: parsed.data.category ? String(parsed.data.category).toLowerCase() : undefined,
    };

    onCreateAction({ payload, files });
    onCloseAction();
    push("Record added");
  }

  return (
    <Modal open={open} onCloseAction={onCloseAction} title="Add Record">
      <form className="space-y-4" onSubmit={submit}>
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

            <div className="flex justify-between items-center">
              <span className={`text-sm ${textMeta}`}>Images or PDFs welcome</span>
              <Button type="button" className="px-4" onClick={next}>Next</Button>
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
                  onChange={(e) => set("category", e.target.value as RecordForm["category"])}
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
                  step="0.01"
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
              <GhostButton type="button" onClick={back}>Back</GhostButton>
              <Button type="button" onClick={next}>Review</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-white/20 bg-white/5 p-4 space-y-3">
              <div>
                <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Title</div>
                <div className="text-white">{form.title || <span className="text-white/40">No title</span>}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Date</div>
                  <div className="text-white">{form.date}</div>
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Category</div>
                  <div className="text-white">{form.category}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Vendor</div>
                  <div className="text-white">{form.vendor || <span className="text-white/40">Not specified</span>}</div>
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Cost</div>
                  <div className="text-white">${form.cost?.toFixed(2) || "0.00"}</div>
                </div>
              </div>

              {form.verified && (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified by vendor
                </div>
              )}

              {form.note && (
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Notes</div>
                  <div className="text-white/85 text-sm">{form.note}</div>
                </div>
              )}

              {previews.length > 0 && (
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-2">Attachments</div>
                  <div className="flex gap-2 overflow-x-auto">
                    {previews.map((u, i) => (
                      <Image
                        key={i}
                        src={u}
                        alt={`Attachment ${i + 1}`}
                        width={60}
                        height={60}
                        className="h-16 w-16 rounded border border-white/20 object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <GhostButton type="button" onClick={back}>Back</GhostButton>
              <Button type="submit">Save Record</Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {["Upload", "Details", "Review"].map((label, i) => {
        const active = step === i + 1;
        const completed = step > i + 1;
        return (
          <div
            key={label}
            className={`rounded-full border px-2 py-1 ${
              active 
                ? "border-white/30 bg-white/20 text-white" 
                : completed
                ? "border-green-400/30 bg-green-400/10 text-green-400"
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

/** Also export default so either import style works */
export default AddRecordModal;