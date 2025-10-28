import "server-only";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth";
import { requireHomeAccess } from "@/lib/authz";

import HomeTopBar from "../../_components/HomeTopBar";
import AddRecordButton from "../../_components/AddRecordButton";
import { glass, heading, ctaGhost, textMeta } from "@/lib/glass"; // removed glassTight (unused)

export default async function RecordsIndex({
  params,
}: {
  params: { homeId: string };
}) {
  const { homeId } = params;

  const session = await getServerSession(authConfig);
  if (!session?.user?.id) notFound();

  // ✅ no `any` cast needed after the type augmentation
  await requireHomeAccess(homeId, session.user.id);

  const home = await prisma.home.findUnique({
    where: { id: homeId },
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      records: {
        orderBy: { date: "desc" },
        select: {
          id: true,
          title: true,
          note: true,
          vendor: true,
          cost: true,
          kind: true,
          date: true,
          // when attachments go in, add:
          // attachments: { select: { id: true, filename: true, url: true, size: true } },
        },
      },
    },
  });

  if (!home) notFound();

  const addrLine = `${home.address}${home.city ? `, ${home.city}` : ""}${home.state ? `, ${home.state}` : ""}${home.zip ? ` ${home.zip}` : ""}`;

  return (
    <main className="relative min-h-screen text-white">
      {/* background */}
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

        {/* Header / actions */}
        <section className={glass}>
          <div className="flex items-center justify-between gap-3">
            <h1 className={`text-xl font-semibold ${heading}`}>Records — {addrLine}</h1>
            <div className="flex items-center gap-2">
              <AddRecordButton homeId={home.id} />
              <Link href={`/home/${home.id}`} className={ctaGhost}>
                Back to home
              </Link>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className={glass}>
          {home.records.length === 0 ? (
            <div className="py-12 text-center text-white/80">
              <p className="mb-3">No records yet.</p>
              <AddRecordButton homeId={home.id} variant="ghost" label="Add your first record" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/10 text-white">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Kind</th>
                    <th className="p-2 text-left">Vendor</th>
                    <th className="p-2 text-right">Cost</th>
                    <th className="p-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {home.records.map((r) => (
                    <tr key={r.id}>
                      <td className="p-2">{r.date ? new Date(r.date).toLocaleDateString() : "—"}</td>
                      <td className="p-2">{r.title}</td>
                      <td className="p-2 text-white/85">{r.kind ?? "—"}</td>
                      <td className="p-2 text-white/85">{r.vendor ?? "—"}</td>
                      <td className="p-2 text-right">
                        {r.cost != null ? `$${Number(r.cost).toLocaleString()}` : "—"}
                      </td>
                      <td className="p-2 text-white/85 max-w-[24rem]">{r.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={`mt-2 text-xs ${textMeta}`}>Most recent first.</p>
            </div>
          )}
        </section>

        <div className="h-10" />
      </div>
    </main>
  );
}