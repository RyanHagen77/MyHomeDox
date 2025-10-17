"use client";
import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea, fieldLabel } from "@/components/ui";
import { Button, GhostButton } from "@/components/ui/Button";
import { uid, loadJSON, saveJSON } from "@/lib/storage";
import { textMeta, glassTight } from "@/lib/glass";

export type ReminderInput = {
  title: string;
  due: string;        // YYYY-MM-DD
  notes?: string;
  repeat?: "none" | "monthly" | "quarterly" | "semiannual" | "annual";
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (rem: { id: string } & ReminderInput) => void; // parent persists to state
  propertyYearBuilt?: number; // optional for suggestions
};

const SUGGESTIONS: Array<{title:string; deltaDays:number; repeat:ReminderInput["repeat"]}> = [
  { title: "Replace HVAC filter", deltaDays: 14, repeat: "monthly" },
  { title: "Test smoke/CO alarms", deltaDays: 7, repeat: "quarterly" },
  { title: "Gutter cleaning", deltaDays: 14, repeat: "semiannual" },
  { title: "Water heater flush", deltaDays: 21, repeat: "annual" },
];

export function AddReminderModal({ open, onClose, onCreate, propertyYearBuilt }: Props) {
  const today = new Date().toISOString().slice(0,10);
  const [form, setForm] = React.useState<ReminderInput>({
    title: "", due: today, notes: "", repeat: "none"
  });

  React.useEffect(() => {
    if (!open) return;
    setForm({ title: "", due: today, notes: "", repeat: "none" });
  }, [open]); // reset on open

  function set<K extends keyof ReminderInput>(k: K, v: ReminderInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit() {
    if (!form.title.trim()) return;
    onCreate({ id: uid(), ...form });
    onClose();
  }

  function quickAdd(s: typeof SUGGESTIONS[number]) {
    const d = new Date();
    d.setDate(d.getDate() + s.deltaDays); // start in near future
    setForm({
      title: s.title,
      due: d.toISOString().slice(0,10),
      notes: "",
      repeat: s.repeat
    });
  }

  return (
      <Modal open={open} onClose={onClose} title="Add Reminder">
        <div className="space-y-3">
          {/* Smart suggestions */}
          <div className={`${glassTight}`}>
            <div className={`text-sm ${textMeta} mb-2`}>Quick suggestions</div>
            <div className="flex flex-wrap items-center gap-2">
              {SUGGESTIONS.map((s) => (
                  <GhostButton key={s.title} size="sm" onClick={() => quickAdd(s)}>
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
            <Input type="date" value={form.due} onChange={(e) => set("due", e.target.value)}/>
          </label>
          <label className="block">
            <span className={fieldLabel}>Repeat</span>
            <Select value={form.repeat} onChange={(e) => set("repeat", e.target.value as any)}>
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
          <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)}
                    placeholder="Optional details…"/>
        </label>

        <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
          <GhostButton className="w-full sm:w-auto" onClick={onClose}>Cancel</GhostButton>
          <Button className="w-full sm:w-auto">Add</Button>
        </div>

      </div>
</Modal>
)
  ;
}
