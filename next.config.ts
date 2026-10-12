import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  devIndicators: false,
  images: {
    // Allow quality={100} used on hero/gallery images (default allowlist is [75])
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lalafolie.us",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com",
      "media-src 'self' https://res.cloudinary.com https://*.cloudinary.com",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://res.cloudinary.com https://*.cloudinary.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: csp },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]
            : []),
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/extra-long-handmade-nail-luxury",
        destination: "/blog/extra-long-handmade-nail-luxury",
      },
      {
        source: "/salon-quality-handmade-nails-reimagined-for-home",
        destination: "/blog/salon-quality-handmade-nails-reimagined-for-home",
      },
      {
        source: "/apply-gripx-nails",
        destination: "/blog/apply-gripx-nails",
      },
      {
        source: "/post-1",
        destination: "/blog/post-1",
      },
    ];
  },
};

export default nextConfig;
