"use client";

import { lookupByAddress } from "@/lib/mock";

/* ===== Types kept local (or import yours) ===== */
type ListingStatus = "active" | "pending" | "under_contract" | "sold";
type Listing = {
  id: string; address: string; mlsId?: string; price: number; status: ListingStatus;
  beds?: number; baths?: number; sqft?: number; updated: string;
};
type RecordsRequest = {
  id: string; address: string; owner?: string; created: string;
  status: "requested" | "owner_shared" | "declined"; link?: string;
};
type BuyerLead = {
  id: string; name: string; email?: string; phone?: string; interestAddress?: string;
  stage: "new" | "engaged" | "touring" | "offer" | "closed"; note?: string;
};
type Review = { id: string; author: string; rating: number; text: string; date: string; };
type RealtorPro = { id: string; brokerage: string; agentName: string; rating: number; verified: boolean; logo?: string; };

export type ClientRole = "buyer" | "seller";
export type SellerClient = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "seller";
  stage: "prep" | "listed" | "under_contract" | "closed";
  listingId?: string;
  propertyAddress?: string;
  note?: string;
};

// extend RealtorData
export type RealtorData = {
  pro: RealtorPro;
  listings: Listing[];
  requests: RecordsRequest[];
  buyers: BuyerLead[];
  sellers?: SellerClient[];           // <— NEW
  reviews: Review[];
  calendar?: Array<{ id: string; title: string; date: string; time?: string; location?: string }>;
};

const LS_KEY = "realtorData";

export function getRealtorData(): RealtorData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LS_KEY);
  return raw ? (JSON.parse(raw) as RealtorData) : null;
}
export function setRealtorData(next: RealtorData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function isoToday() { return new Date().toISOString().slice(0, 10); }
function addDays(n: number, withTime = false) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return withTime ? d.toISOString() : d.toISOString().slice(0, 10);
}

/** Seed once if store empty; returns the (existing or new) dataset */
export async function ensureRealtorData(): Promise<RealtorData> {
  const existing = getRealtorData();
  if (existing) return existing;

  const today = isoToday();
  const seeds = [
    "1842 Maple St, Austin, TX",
    "92 3rd Ave, Nashville, TN",
    "501 Park Ln, Denver, CO",
  ];
  const sellersSeed: SellerClient[] = [
    { id: "s1", name: "Nguyen Family", email: "nguyen@example.com", role: "seller", stage: "listed", listingId: "l1", propertyAddress: p1.property.address, note: "Prefers weekend showings" },
    { id: "s2", name: "Santos Household", phone: "(555) 404-9988", role: "seller", stage: "under_contract", listingId: "l2", propertyAddress: p2.property.address },
  ];
  const [p1, p2, p3] = await Promise.all(seeds.map(lookupByAddress));

  const mock: RealtorData = {
    pro: {
      id: "re-1",
      brokerage: "Northstar Realty Group",
      agentName: "Alexis Romero",
      rating: 4.9,
      verified: false,
      logo: "/logo-placeholder.svg",
    },
    listings: [
      { id: "l1", address: p1.property.address, mlsId: `MLS# ${p1.property.id.slice(-6)}`, price: p1.property.estValue, status: "active", beds: p1.property.beds, baths: p1.property.baths, sqft: p1.property.sqft, updated: today },
      { id: "l2", address: p2.property.address, price: p2.property.estValue, status: "pending", beds: p2.property.beds, baths: p2.property.baths, sqft: p2.property.sqft, updated: addDays(-2) },
      { id: "l3", address: p3.property.address, price: p3.property.estValue, status: "under_contract", beds: p3.property.beds, baths: p3.property.baths, sqft: p3.property.sqft, updated: addDays(-7) },
    ],
    requests: [
      { id: "rq1", address: p1.property.address, owner: "Nguyen", created: addDays(-1, true), status: "requested" },
      { id: "rq2", address: p2.property.address, owner: "Santos", created: addDays(-5, true), status: "owner_shared", link: `/report?h=${slugify(p2.property.address)}` },
    ],
    buyers: [
      { id: "b1", name: "Jordan Lee", email: "jordan@example.com", stage: "engaged", interestAddress: p1.property.address },
      { id: "b2", name: "Sam Patel", phone: "(555) 201-0199", stage: "touring", interestAddress: p3.property.address, note: "Prefers afternoon showings" },
    ],
    reviews: [
      { id: "rv1", author: "K. Santos", rating: 5, text: "Streamlined disclosures, confident close.", date: addDays(-14, true) },
      { id: "rv2", author: "D. Patel", rating: 5, text: "Record requests made inspections easy.", date: addDays(-30, true) },
    ],
    calendar: [
      { id: "c1", title: "Show 1842 Maple St", date: addDays(1), time: "2:00 PM", location: p1.property.address },
      { id: "c2", title: "Inspection — 92 3rd Ave", date: addDays(2), time: "10:30 AM", location: p2.property.address },
    ],
     sellers: sellersSeed,
  };

  setRealtorData(mock);
  return mock;
}

/** Simple client hook used by any Realtor page */
import { useEffect, useState } from "react";
export function useRealtorData() {
  const [data, setData] = useState<RealtorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const next = await ensureRealtorData();
      if (!alive) return;
      setData(next);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const save = (updater: (prev: RealtorData) => RealtorData) => {
    if (!data) return;
    const next = updater(data);
    setData(next);
    setRealtorData(next);
  };

  return { data, setData: save, loading };
}
