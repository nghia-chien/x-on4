"use client";

import React, { Suspense } from "react";
import { ShopTemplate } from "@/components/ShopTemplate";

export default function BundleAndSavePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#faece9] via-[#fdf4f1] to-white py-20 text-center text-xs text-gray-500">
          Loading catalog...
        </div>
      }
    >
      <ShopTemplate
        title="Bundle & Save"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: "Bundle & Save" },
        ]}
      />
    </Suspense>
  );
}
