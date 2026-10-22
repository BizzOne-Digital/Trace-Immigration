import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
