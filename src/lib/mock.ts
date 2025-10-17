
// =============================================
// File: src/lib/mock.ts
// =============================================
import type { PropertyPayload, RecordItem, Vendor, Property } from "./types";

function seedFromString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = (h ^ str.charCodeAt(i)) * 16777619;
  return Math.abs(h);
}

function pick<T>(arr: T[], n: number) {
  return arr.slice(0, Math.max(1, Math.min(n, arr.length)));
}

export async function lookupByAddress(address: string): Promise<PropertyPayload> {
  // Simulate a tiny network delay
  await new Promise((r) => setTimeout(r, 320));

  const seed = seedFromString(address);
  const cities = [
    { city: "Austin", state: "TX", zip: "78704" },
    { city: "Denver", state: "CO", zip: "80211" },
    { city: "Nashville", state: "TN", zip: "37209" },
  ];
  const c = cities[seed % cities.length];

  const beds = 3 + (seed % 3);
  const baths = 2 + (seed % 2);
  const sqft = 1600 + (seed % 1400);
  const estValue = 350_000 + (seed % 450_000);
  const yearBuilt = 1980 + (seed % 30);
  const healthScore = 70 + (seed % 25); // 70-94

  const photos = [
    `https://images.unsplash.com/photo-1505691723518-36a5ac3b2c5f?q=80&w=1600&auto=format`,
    `https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600&auto=format`,
    `https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format`,
  ];

  const property: Property = {
    id: `prop_${seed}`,
    address,
    city: c.city,
    state: c.state,
    zip: c.zip,
    beds,
    baths,
    sqft,
    yearBuilt,
    estValue,
    photos,
    healthScore,
    lastUpdated: new Date().toISOString(),
  };

  const records: RecordItem[] = [
    {
      id: `r_${seed}_roof`,
      category: "Roof Repair",
      vendor: "Lone Star Roofing",
      description: "Replaced damaged shingles and flashing",
      date: "2023-07-14",
      cost: 4200,
      verified: true,
    },
    {
      id: `r_${seed}_hvac`,
      category: "HVAC",
      vendor: "ChillRight Heating",
      description: "Annual service and filter change",
      date: "2024-05-10",
      cost: 250,
      verified: true,
    },
    {
      id: `r_${seed}_plumb`,
      category: "Plumbing",
      vendor: "AquaFix Plumbing",
      description: "Repaired minor pipe leak in kitchen",
      date: "2023-02-20",
      cost: 450,
      verified: false,
    },
  ];



  const vendors: Vendor[] = [
    { id: "v1", name: "Lone Star Roofing", type: "Roofing", verified: true, rating: 5 },
    { id: "v2", name: "BuildPro Renovations", type: "Remodel", verified: true, rating: 4.5 },
    { id: "v3", name: "AquaFix Plumbing", type: "Plumbing", verified: false, rating: 3.5 },
  ];

  const smartSummary = `This ${beds} bed / ${baths} bath, ${sqft.toLocaleString()} sqft home in ${c.city}, ${c.state} shows strong upkeep with recent HVAC and roof work. Verified records and a health score of ${healthScore}/100 support a market-ready profile.`;

  return { property, records, vendors, smartSummary };
}
