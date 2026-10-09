import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  devIndicators: false,
  images: {
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
