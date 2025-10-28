// middleware.ts
export { default } from "next-auth/middleware";
export const config = { matcher: ["/home/:path*", "/admin/:path*"] };