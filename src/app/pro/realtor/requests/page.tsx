"use client";
import RealtorTopBar from "../../_components/RealtorTopBar";

export default function RequestsPage() {
  return (
    <main className="relative min-h-screen text-white">
      <Bg />
      <RealtorTopBar />
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        <section className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
          <h1 className="text-xl font-semibold">Requests</h1>
          <p className="text-white/80 text-sm mt-1">
            Track owner record requests and verification status. (Badges in the top bar reflect pending counts.)
          </p>
        </section>
      </div>
    </main>
  );
}
function Bg() {
  return (
    <div className="fixed inset-0 -z-50">
      <img src="/myhomedox_home3.webp" alt="" className="h-full w-full object-cover md:object-[50%_35%]" />
      <div className="absolute inset-0 bg-black/45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.45))]" />
    </div>
  );
}
