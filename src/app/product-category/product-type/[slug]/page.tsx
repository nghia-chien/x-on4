"use client";

import React, { use, Suspense } from "react";
import { ShopTemplate } from "@/components/ShopTemplate";

const categoryNames: Record<string, { title: string; desc: string }> = {
  "cold-gel-glue": {
    title: "Cold Gel Glue",
    desc: "Non-damaging, room-temperature curing gel adhesive engineered to hold your nails secure for 3-4 weeks.",
  },
  "cold-gel-remover": {
    title: "Cold Gel Remover",
    desc: "Nourishing and gentle removal solution. Dissolves adhesive safely without drying cuticles or soaking in acetone.",
  },
  "best-seller": {
    title: "Best Sellers",
    desc: "Our most sought-after designs and iconic nail art, loved and reviewed by thousands nationwide.",
  },
  "nail-essentials": {
    title: "Nail Essentials",
    desc: "Professional salon-grade cold gel adhesives, removers, and nail care essentials.",
  },
};

export default function ProductTypeCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const info = categoryNames[slug] || {
    title: slug.replace(/-/g, " ").toUpperCase(),
    desc: "Explore our premium handcrafted nail collection.",
  };

  const presetType = slug === "best-seller" ? "best-sellers" : slug;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#faece9] via-[#fdf4f1] to-white py-20 text-center text-xs text-gray-500">
          Loading category...
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
          type: [presetType],
        }}
      />
    </Suspense>
  );
}

