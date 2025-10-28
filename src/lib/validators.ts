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
