"use client";

import RealtorTopBar from "../../_components/RealtorTopBar";
import { useRealtorData } from "@/lib/realtorData";
import { glass, heading, textMeta } from "@/lib/glass";

function Bg() {
  return (
    <div className="fixed inset-0 -z-50">
      <img src="/myhomedox_home3.webp" alt="" className="h-full w-full object-cover md:object-[50%_35%]" />
      <div className="absolute inset-0 bg-black/45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.45))]" />
    </div>
  );
}

export default function CalendarPage() {
  const { data, loading } = useRealtorData();

  return (
    <main className="relative min-h-screen text-white">
      <Bg />
      <RealtorTopBar />
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        <section className={`${glass}`}>
          <h1 className={`mb-2 text-lg font-medium ${heading}`}>Calendar</h1>
          {loading || !data ? (
            <div className="h-32 animate-pulse rounded-xl bg-white/10" />
          ) : data.calendar && data.calendar.length ? (
            <ul className="divide-y divide-white/10">
              {data.calendar.map(ev => (
                <li key={ev.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{ev.title}</p>
                      <p className={`text-sm ${textMeta}`}>{new Date(ev.date).toLocaleDateString()} {ev.time ? `• ${ev.time}` : ""} • {ev.location ?? "—"}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={textMeta}>No upcoming events.</p>
          )}
        </section>
      </div>
    </main>
  );
}
