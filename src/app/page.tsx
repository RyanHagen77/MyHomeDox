// src/app/page.tsx
import HomeLandingClient from "./_home/HomeClient";

type Audience = "home" | "pro";

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sp = searchParams?.audience;
  const initialAudience =
    (typeof sp === "string" && (sp === "home" || sp === "pro" ? sp : "home")) as Audience;

  return <HomeLandingClient initialAudience={initialAudience} />;
}
