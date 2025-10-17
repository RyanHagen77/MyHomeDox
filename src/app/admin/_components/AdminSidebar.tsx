"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ctaGhost } from "@/lib/glass";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin#users", label: "Users" },
  { href: "/admin#properties", label: "Properties" },
  { href: "/admin#vendors", label: "Vendors" },
  { href: "/admin#requests", label: "Requests" },
  { href: "/admin#reports", label: "Reports" },
  { href: "/admin#settings", label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="pt-6 lg:pt-8">
      <nav className="sticky top-[60px] flex flex-col gap-2">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={[
              ctaGhost,
              "rounded-full",
              pathname === "/admin" ? "" : "", // keeps style consistent; anchors stay highlighted by scroll logic if you add it later
            ].join(" ")}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
