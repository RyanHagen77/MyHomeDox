import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { requireHomeAccess } from "@/lib/authz";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { glass, glassTight, textMeta, ctaPrimary, ctaGhost, heading } from "@/lib/glass";
import HomeTopBar from "@/app/home/_components/HomeTopBar";
import ClientActions from "@/app/home/_components/ClientActions";
import AddRecordButton from "@/app/home/_components/AddRecordButton";
import AddReminderButton from "@/app/home/_components/AddReminderButton";
import AddWarrantyButton from "@/app/home/_components/AddWarrantyButton";

type HomeMeta = {
  attrs?: {
    yearBuilt?: number;
    sqft?: number;
    beds?: number;
    baths?: number;
    estValue?: number;
    healthScore?: number;
    lastUpdated?: string;
  };
};


// ✅ FIXED: params is a normal object, not a Promise
export default async function HomePage({
  params,
}: {
  params: Promise<{ homeId: string }>;
}) {
  const { homeId } = await params;

  const session = await getServerSession(authConfig);
  if (!session?.user?.id) notFound();

  await requireHomeAccess(homeId, session.user.id);

  const home = await prisma.home.findUnique({
    where: { id: homeId },
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      photos: true,
      meta: true,
      records: {
        orderBy: { date: "desc" },
        take: 8,
        select: {
          id: true,
          title: true,
          note: true,
          kind: true,
          date: true,
          vendor: true,
          cost: true,
        },
      },
      reminders: {
        orderBy: { dueAt: "asc" },
        take: 8,
        select: { id: true, title: true, dueAt: true },
      },
      warranties: {
        orderBy: { expiresAt: "asc" },
        take: 8,
        select: { id: true, item: true, provider: true, expiresAt: true },
      },
    },
  });

  if (!home) notFound();

  const addrLine = `${home.address}${home.city ? `, ${home.city}` : ""}${home.state ? `, ${home.state}` : ""}${home.zip ? ` ${home.zip}` : ""}`;

  const meta = home.meta as HomeMeta | null;
  const attrs = meta?.attrs ?? {};

  const stats = {
    yearBuilt: attrs.yearBuilt ?? undefined,
    sqft: attrs.sqft ?? undefined,
    beds: attrs.beds ?? undefined,
    baths: attrs.baths ?? undefined,
    estValue: attrs.estValue ?? undefined,
    healthScore: attrs.healthScore ?? undefined,
    lastUpdated: attrs.lastUpdated ?? undefined,
  };

  return (
    <main className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-50">
        <Image
          src="/myhomedox_home3.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.45))]" />
      </div>

      <div className="mx-auto max-w-7xl p-6 space-y-6">
        <HomeTopBar />

        <section aria-labelledby="home-hero" className={glass}>
          <h2 id="home-hero" className="sr-only">
            Home overview
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <img
                src={home.photos?.[0] ?? "/myhomedox_homeowner1.jpg"}
                alt={addrLine}
                className="aspect-video w-full rounded-md object-cover"
              />
            </div>

            <div className="space-y-3">
              <h3 className={`text-lg font-medium ${heading}`}>{addrLine}</h3>
              <ClientActions homeId={home.id} />
              <p className={`text-sm ${textMeta}`}>
                Last updated{" "}
                {stats.lastUpdated
                  ? new Date(stats.lastUpdated).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="stats" className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <Stat label="Health Score" value={stats.healthScore != null ? `${stats.healthScore}/100` : "—"} hint="A 0–100 score based on recent maintenance." />
          <Stat label="Est. Value" value={stats.estValue != null ? `$${Number(stats.estValue).toLocaleString()}` : "—"} />
          <Stat label="Beds / Baths" value={`${stats.beds ?? "—"} / ${stats.baths ?? "—"}`} />
          <Stat label="Sq Ft" value={stats.sqft != null ? Number(stats.sqft).toLocaleString() : "—"} />
          <Stat label="Year Built" value={stats.yearBuilt ?? "—"} />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <Card title="Home History">
              {home.records.length === 0 ? (
              <div className="py-8 text-center text-white/70">
                <p className="mb-2">No records yet</p>
                <AddRecordButton homeId={home.id} variant="ghost" label="Add your first record" />
              </div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {home.records.map((r) => (
                    <li key={r.id} className="flex items-start justify-between gap-4 py-4">
                      <div>
                        <p className="font-medium text-white">
                          {r.title}

                          {/* Kind (Maintenance / Repair / etc.) */}
                          {r.kind && <span className="text-white/70"> • {r.kind}</span>}

                          {/* Vendor (e.g., DoneRite) */}
                          {r.vendor && <span className="text-white/70"> • {r.vendor}</span>}

                          {/* Cost (e.g., $500) */}
                          {r.cost != null && (
                            <span className="text-white/70"> • ${Number(r.cost).toLocaleString()}</span>
                          )}
                        </p>

                        {/* Date */}
                        {r.date && (
                          <p className="text-sm text-white/70">
                            {new Date(r.date).toLocaleDateString()}
                          </p>
                        )}

                        {/* Optional note text */}
                        {r.note && (
                          <p className="mt-1 text-sm text-white/80">{r.note}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 text-right">
                <Link href={`/home/${home.id}/records`} className={ctaGhost}>View all</Link>
              </div>
            </Card>
          </div>

          <div className="space-y-3">
            <Card title="Upcoming Reminders">
            <div className="mb-2 flex justify-end">
            </div>
              {home.reminders.length === 0 ? (
                <Empty message="No upcoming reminders" actionLabel="Add reminder" />
              ) : (
                <ul className="space-y-2">
                  {home.reminders.map((m) => (
                    <li key={m.id} className="flex items-center justify-between text-white">
                      <span>{m.title}</span>
                      <span className="text-sm text-white/70">{new Date(m.dueAt).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Warranties & Manuals">
              <div className="mb-2 flex justify-end">
                <AddWarrantyButton homeId={home.id} />
              </div>
              {home.warranties.length === 0 ? (
                <Empty message="No warranties on file" actionLabel="Add warranty" />
              ) : (
                <ul className="space-y-2">
                  {home.warranties.map((w) => (
                    <li key={w.id} className="flex items-center justify-between text-white">
                      <span>{w.item} {w.provider && <span className="text-white/70">• {w.provider}</span>}</span>
                      <span className="text-sm text-white/70">
                        {w.expiresAt ? `Expires ${new Date(w.expiresAt).toLocaleDateString()}` : "No expiry"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </section>

        <div className="h-12" />
      </div>
    </main>
  );
}

/* ------- Small server-side helpers ------- */
function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className={glassTight} role="group" aria-label={label}>
      <div className="flex items-center gap-1 text-sm text-white/70">
        <span>{label}</span>
        {hint && <span aria-label={hint} title={hint} className="cursor-help">ⓘ</span>}
      </div>
      <div className="mt-1 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={glass}>
      <h2 className={`mb-2 text-lg font-medium ${heading}`}>{title}</h2>
      {children}
    </section>
  );
}

function Empty({ message, actionLabel }: { message: string; actionLabel: string }) {
  return (
    <div className="py-8 text-center text-white/70">
      <p className="mb-2">{message}</p>
      <span className={ctaGhost} aria-hidden>{actionLabel}</span>
    </div>
  );
}