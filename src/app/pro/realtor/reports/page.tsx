"use client";

import Image from "next/image";
import RealtorTopBar from "../../_components/RealtorTopBar";
import { useRealtorData } from "@/lib/realtorData";
import { glass, heading, textMeta } from "@/lib/glass";

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

export default function ReportsPage() {
  const { data, loading } = useRealtorData();

  return (
    <main className="relative min-h-screen text-white">
      <Bg />
      <RealtorTopBar />
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        <section className={`${glass}`}>
          <h1 className={`mb-2 text-lg font-medium ${heading}`}>Reports</h1>
          {loading || !data ? (
            <div className="h-32 animate-pulse rounded-xl bg-white/10" />
          ) : data.requests.length ? (
            <ul className="space-y-2">
              {data.requests.map(r => (
                <li key={r.id} className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{r.address}</p>
                      <p className={`text-sm ${textMeta}`}>
                        Owner • {r.owner ?? "—"} • {r.status} • {new Date(r.created).toLocaleDateString()}
                      </p>
                    </div>
                    {r.link ? (
                      <a className="underline text-white/85" href={r.link}>View report</a>
                    ) : (
                      <span className="rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-xs">Pending</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={textMeta}>No report requests yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
