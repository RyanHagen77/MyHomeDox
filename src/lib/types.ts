// =============================================
// File: src/lib/types.ts
// =============================================
export type Property = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt?: number;
  estValue: number;
  photos: string[];
  healthScore: number; // 0-100
  lastUpdated?: string; // ISO
};

export type RecordItem = {
  id: string;
  category:
    | "Roof Repair"
    | "HVAC"
    | "Plumbing"
    | "Electrical"
    | "Remodel"
    | "Inspection"
    | "Other";
  vendor: string;
  description: string;
  date: string; // ISO
  cost?: number;
  verified: boolean;
  attachments?: string[]; // file urls
};

export type Vendor = {
  id: string;
  name: string;
  type: string;
  verified: boolean;
  rating: number; // 0-5
};

export type PropertyPayload = {
  property: Property;
  records: RecordItem[];
  vendors: Vendor[];
  smartSummary: string;
};
