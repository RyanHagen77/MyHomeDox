import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic"; // or leave off if not needed
export const revalidate = 0;            // ensure no caching

export default function Page() {
  return <LoginClient />;
}