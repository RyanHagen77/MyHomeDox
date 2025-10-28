// src/app/home/_components/HomeTopBar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function HomeTopBar({
  onSwitch = () => {},
  onAccount = () => {},
}: {
  onSwitch?: () => void;
  onAccount?: () => void;
}) {
  const { data: session, status } = useSession();

  return (
    <div className="sticky top-0 z-40">
      {/* header row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-white">
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSwitch}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
          >
            Switch
          </button>

          {status === "authenticated" ? (
            <>
              <span className="hidden sm:inline text-white/85 text-sm">
                {session?.user?.email}
              </span>
              <button
                type="button"
                onClick={onAccount}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
              >
                Account
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login?role=homeowner" })}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login?role=homeowner"
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto h-px max-w-7xl bg-white/15" />
    </div>
  );
}