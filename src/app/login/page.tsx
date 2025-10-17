"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const aud = sp.get("audience");
    const type = sp.get("type") ?? "contractor";
    if (aud === "pro") {
      router.replace(`/pro?type=${type}`);
    }
  }, [router, sp]);

  return <div>…your login UI…</div>;
}
