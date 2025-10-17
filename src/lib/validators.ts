import { z } from "zod";

export const RecordSchema = z.object({
  title: z.string().min(2),
  date: z.string(),                 // ISO date
  category: z.enum(["Maintenance","Repair","Upgrade","Inspection","Warranty"]),
  vendor: z.string().min(2),
  cost: z.coerce.number().min(0),
  verified: z.boolean().default(false),
  notes: z.string().optional(),
  attachments: z.array(z.string()).default([]),
});

export type RecordInput = z.infer<typeof RecordSchema>;

export const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["Viewer","Contributor"]),
});
export type InviteInput = z.infer<typeof InviteSchema>;
