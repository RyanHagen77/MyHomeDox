"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomeTopBar({
  onSwitch,
  onAccount,
}: {
  onSwitch: () => void;
  onAccount: () => void;
}) {
  return (
    <div className="sticky top-0 z-40">
      {/* header row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-white">
        {/* ✅ Logo links home */}
        <Link href="/" className="inline-flex items-center gap-3 shrink-0">
          <Image
            src="/myhomedox_logo.png"
            alt="MyHomeDox"
            width={160}
            height={44}
            priority
            className="h-7 w-auto sm:h-9"
            sizes="(min-width: 640px) 160px, 120px"
          />
          <span className="sr-only">MyHomeDox Homeowner</span>
        </Link>

        {/* actions — wrap on smaller screens instead of overflowing */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSwitch}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
          >
            Switch
          </button>
          <button
            type="button"
            onClick={onAccount}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
          >
            Account
          </button>
        </div>
      </div>

      {/* divider */}
      <div className="mx-auto h-px max-w-7xl bg-white/15" />
    </div>
  );
}
