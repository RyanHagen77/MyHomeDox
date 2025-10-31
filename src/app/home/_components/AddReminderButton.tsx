"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ctaGhost } from "@/lib/glass";
import { useToast } from "@/components/ui/Toast";
import { AddReminderModal, type ReminderModalPayload } from "@/app/home/_components/AddReminderModal";

type Props = { homeId: string };

type PresignResponse = {
  key: string;
  url: string;
  publicUrl: string | null;
};

type PersistAttachment = {
  filename: string;
  size: number;
  contentType: string;
  storageKey: string;
  url: string | null;
};

export default function AddReminderButton({ homeId }: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function onCreateAction(args: { payload: ReminderModalPayload; files: File[] }) {
    setBusy(true);
    try {
      const { payload, files } = args;

      // 1) Create reminder
      const createRes = await fetch(`/api/home/${homeId}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          dueAt: payload.dueAt,
          note: payload.note ?? "",
          repeat: payload.repeat ?? "none",
        }),
      });
      const created = await createRes.json().catch(() => ({}));
      if (!createRes.ok || !created?.id) {
        throw new Error(created?.error || "Failed to create reminder");
      }
      const reminderId: string = created.id;

      // 2) Upload attachments (presign → PUT → persist)
      if (files.length > 0) {
        const uploaded: PersistAttachment[] = [];
        for (const f of files) {
          const pre = await fetch(`/api/uploads/presign`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              homeId,
              reminderId,
              filename: f.name,
              contentType: f.type || "application/octet-stream",
              size: f.size,
            }),
          });
          if (!pre.ok) throw new Error(`Presign failed: ${await pre.text()}`);
          const { key, url, publicUrl } = (await pre.json()) as PresignResponse;
          if (!key || !url) throw new Error("Presign missing key/url");

          const put = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": f.type || "application/octet-stream" },
            body: f,
          });
          if (!put.ok) throw new Error(`S3 PUT failed: ${await put.text().catch(() => "")}`);

          uploaded.push({
            filename: f.name,
            size: f.size,
            contentType: f.type || "application/octet-stream",
            storageKey: key,
            url: publicUrl,
          });
        }

        const persist = await fetch(`/api/home/${homeId}/reminders/${reminderId}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(uploaded),
        });
        if (!persist.ok) throw new Error(`Persist attachments failed: ${await persist.text()}`);
      }

      push("Reminder added");
      setOpen(false);
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not add reminder";
      push(message);
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className={ctaGhost} onClick={() => setOpen(true)} disabled={busy}>
        {busy ? "Saving…" : "Add Reminder"}
      </button>

      <AddReminderModal
        open={open}
        onCloseAction={() => setOpen(false)}
        onCreateAction={onCreateAction}
      />
    </>
  );
}