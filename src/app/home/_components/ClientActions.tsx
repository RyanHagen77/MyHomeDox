"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ctaPrimary, ctaGhost } from "@/lib/glass";

/** Reuse your existing client modals */
import { AddRecordModal } from "@/app/home/_components/AddRecordModal";
import { ShareAccessModal } from "@/app/home/_components/ShareAccessModal";
import { AddReminderModal } from "@/app/home/_components/AddReminderModal";
import { FindVendorsModal, VendorDirectoryItem} from "@/app/home/_components/FindVendorModal";
import {AddWarrantyModal} from "@/app/home/_components/AddWarrantyModal";

export default function ClientActions({homeId}: { homeId: string }) {
    const router = useRouter();

    // modal state
    const [addOpen, setAddOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [reminderOpen, setReminderOpen] = useState(false);
    const [findVendorsOpen, setFindVendorsOpen] = useState(false);
    const [warrantyOpen, setWarrantyOpen] = useState(false);

    // ----- API helpers -----
    async function createRecord(payload: { title: string; note?: string; date?: string; kind?: string }) {
        const res = await fetch(`/api/home/${homeId}/records`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create record");
        router.refresh();
    }

    async function createReminder(payload: { title: string; dueAt: string }) {
        const res = await fetch(`/api/home/${homeId}/reminders`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create reminder");
        router.refresh();
    }

    async function createWarranty(payload: {
        item: string;
        provider?: string;
        policyNo?: string;
        expiresAt?: string | null
    }) {
        const res = await fetch(`/api/home/${homeId}/warranties`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create warranty");
        router.refresh();
    }

    return (
        <>
            {/* Buttons row (same look/feel as dummy page) */}
            <div className="flex flex-wrap gap-2">
                <button onClick={() => setAddOpen(true)} className={ctaPrimary}>
                    Add Record
                </button>
                <button onClick={() => setReminderOpen(true)} className={ctaGhost}>
                    Add Reminder
                </button>
                <button onClick={() => setWarrantyOpen(true)} className={ctaGhost}>
                    Add Warranty
                </button>
                <button onClick={() => setShareOpen(true)} className={ctaGhost}>
                    Share Access
                </button>
                <a href={`/report?home=${homeId}`} className={ctaGhost}>
                    View Report
                </a>
            </div>

            {/* Record modal */}
            <AddRecordModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onCreate={async (rec: any) => {
                    await createRecord({
                        title: rec.title,
                        note: rec.note,
                        kind: rec.kind,
                        date: rec.date,
                    });
                    setAddOpen(false);
                }}
            />

            {/* Reminder modal */}
            <AddReminderModal
                open={reminderOpen}
                onClose={() => setReminderOpen(false)}
                onCreate={async (rem: any) => {
                    await createReminder({
                        title: rem.title,
                        dueAt: rem.dueAt || rem.due, // support flexible field names
                    });
                    setReminderOpen(false);
                }}
            />

            {/* Warranty modal */}
            <AddWarrantyModal
                open={warrantyOpen}
                onClose={() => setWarrantyOpen(false)}
                onCreate={async (w: any) => {
                    await createWarranty({
                        item: w.item,
                        provider: w.vendor || w.provider,
                        policyNo: w.policyNo,
                        expiresAt: w.expiresAt || w.expires || null,
                    });
                    setWarrantyOpen(false);
                }}
            />

            {/* Share access modal */}
            <ShareAccessModal open={shareOpen} onClose={() => setShareOpen(false)} homeId={homeId}/>

            {/* (Optional) Find vendor modal */}
            <FindVendorsModal open={findVendorsOpen} onClose={() => setFindVendorsOpen(false)}
                              onAdd={function (v: VendorDirectoryItem): void {
                                  throw new Error("Function not implemented.");
                              }} />
    </>
  );
}