"use client";

import React, { use, Suspense } from "react";
import { ShopTemplate } from "@/components/ShopTemplate";

const themeDescriptions: Record<string, { title: string; desc: string }> = {
  "3d": {
    title: "3D Nail Art & Sculpted Luxury",
    desc: "Dimensional nail jewels, textured ribbons, pearls, and handcrafted relief art.",
  },
  "flower": {
    title: "Floral & Botanical Themes",
    desc: "Hand-painted blossoms, petals, and nature-inspired elegance for any occasion.",
  },
  "y2k": {
    title: "Y2K Aesthetic & Cyberpunk Glam",
    desc: "Chrome finishes, futuristic metallics, bold graphics, and nostalgic retro charms.",
  },
};

export default function DesignThemeCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const info = themeDescriptions[slug.toLowerCase()] || {
    title: `${slug.toUpperCase()} Theme`,
    desc: "Discover our specialized nail art theme collection.",
  };

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#faece9] via-[#fdf4f1] to-white py-20 text-center text-xs text-gray-500">
          Loading theme collection...
        </div>
      }
    >
      <ShopTemplate
        title={info.title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: info.title },
        ]}
        presetFilters={{
          theme: [slug],
        }}
      />
    </Suspense>
  );
}

