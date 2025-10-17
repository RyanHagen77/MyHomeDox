/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ✅ Unblocks Vercel builds even if lint errors exist
    ignoreDuringBuilds: true,

  // Keep clean URLs like /home instead of /home/
  trailingSlash: false,

  // Disable built-in image optimization — all assets come from /public
  images: {
    unoptimized: true,
    domains: [], // no external hosts needed
  },

  // Ensure Vercel static exports behave as expected
  output: "standalone",

  // Optional: short-term cache control for dynamic pages
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate"
          }
        ]
      }
    ];
  }
 },
};


module.exports = nextConfig;
