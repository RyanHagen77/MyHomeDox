"use client";
import { TopBar, TopBarLink } from "@/components/TopBar";

export default function ContractorTopBar() {
  const links: TopBarLink[] = [
    { href: "/pro/contractor/", label: "Dashboard" },
    { href: "/pro/contractor/jobs", label: "Jobs" },
    { href: "/pro/contractor/clients", label: "Clients" },
    { href: "/pro/contractor/billing", label: "Billing" },
    { href: "/pro/contractor/account", label: "Account" },
  ];

  return <TopBar links={links} srBrand="MyHomeDox Contractor" logoAlt="MyHomeDox" />;
}
