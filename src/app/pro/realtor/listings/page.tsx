"use client";

import Image from "next/image";
import RealtorTopBar from "../../_components/RealtorTopBar";
import { useRealtorData } from "@/lib/realtorData";
import { glass, heading, textMeta, ctaGhost } from "@/lib/glass";
import Link from "next/link";

function Bg() {
  return (
    <div className="fixed inset-0 -z-50">
      <Image
        src="/myhomedox_home3.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover md:object-[50%_35%] lg:object-[50%_30%]"
        priority
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.45))]" />
    </div>
  );
}

export default function ListingsPage() {
  const { data, setData, loading } = useRealtorData();

  if (loading || !data) {
    return (
      <main className="relative min-h-screen text-white">
        <Bg />
        <RealtorTopBar />
        <div className="mx-auto max-w-7xl p-6">
          <div className="h-40 animate-pulse rounded-2xl bg-white/10 backdrop-blur-sm" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen text-white">
      <Bg />
      <RealtorTopBar />
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        <section className={`${glass}`}>
          <div className="mb-2 flex items-center justify-between">
            <h1 className={`text-lg font-medium ${heading}`}>Listings</h1>
            <button
              className={`${ctaGhost} rounded-full`}
              onClick={() => {
                // demo add
                const id = "l" + Date.now();
                setData(prev => ({
                  ...prev,
                  listings: [
                    { id, address: "New Address", price: 500000, status: "active", updated: new Date().toISOString().slice(0,10) },
                    ...prev.listings,
                  ],
                }));
              }}
            >
              New Listing
            </button>
          </div>
          <ul className="divide-y divide-white/10">
            {data.listings.map((l) => (
              <li key={l.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{l.address}</p>
                    <p className={`truncate text-sm ${textMeta}`}>
                      {l.mlsId ? `${l.mlsId} • ` : ""}{l.beds ?? "—"} bd • {l.baths ?? "—"} ba • {l.sqft?.toLocaleString() ?? "—"} sqft • {l.status}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-white/85">
                      ${l.price.toLocaleString()}
                    </span>
                    <Link className="underline text-white/85" href={`/report?h=${encodeURIComponent(l.address.toLowerCase().replace(/[^a-z0-9]+/g,"-"))}`}>
                      Report
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
