import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Self-contained server.js build for the cPanel Node.js app (Passenger).
  output: "standalone",
  serverExternalPackages: ["mongoose", "pdf-lib", "nodemailer", "bcryptjs"],
  images: {
    // Uploaded media is served from MongoDB through /api/uploads/{folder}/{filename}.
    localPatterns: [
      { pathname: "/api/uploads/**", search: "" },
      { pathname: "/brand/**", search: "" },
      { pathname: "/images/**", search: "" },
      { pathname: "/images/**", search: "" },
    ],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
    formats: ["image/avif", "image/webp"],
  },
  // Pages removed at the firm's request (Nov 2026) send visitors somewhere useful instead of a 404.
  async redirects() {
    return [
      { source: "/pricing", destination: "/services", permanent: true },
      { source: "/team", destination: "/about", permanent: true },
      { source: "/services/:slug", destination: "/services", permanent: true },
      { source: "/booking", destination: "https://form.traceimmigration.com/book/PFm3w0OsLPAwMIwdck2z", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/(admin|consultation-agreement)/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
