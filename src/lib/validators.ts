// src/lib/validators.ts
import { z } from "zod";

export const RecordSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1), // yyyy-mm-dd or ISO
  category: z.enum(["Maintenance", "Repair", "Upgrade", "Inspection", "Warranty"]),
  vendor: z.string().optional().default(""),
  cost: z.number().nonnegative().default(0),
  verified: z.boolean().default(false),
  note: z.string().optional().default(""),          // 👈 singular note
  attachments: z.array(z.string()).default([]),
});
export type RecordInput = z.infer<typeof RecordSchema>;

export const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["Viewer","Contributor"]),
});
export type InviteInput = z.infer<typeof InviteSchema>;

export const ReminderSchema = z.object({
  title: z.string().min(1),
  dueAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  note: z.string().optional(),                    // <- NEW
  repeat: z.enum(["none","monthly","quarterly","semiannual","annual"]).optional(),
});

export type ReminderInput = z.infer<typeof ReminderSchema>;

export const WarrantySchema = z.object({
  item: z.string().min(1),
  provider: z.string().optional().nullable(),
  policyNo: z.string().optional().nullable(),
  expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  note: z.string().optional(), // <- NEW
});

export type WarrantyInput = z.infer<typeof WarrantySchema>;

export const AttachmentPersistItemSchema = z.object({
  filename: z.string().min(1),
  size: z.number().int().nonnegative(),
  contentType: z.string().min(1),
  storageKey: z.string().min(1),
  url: z.string().nullable().optional(),

  // NEW:
  visibility: z.enum(["OWNER", "HOME", "PUBLIC"]).default("OWNER"),
  notes: z.string().optional(),
});

export type AttachmentPersistItem = z.infer<typeof AttachmentPersistItemSchema>