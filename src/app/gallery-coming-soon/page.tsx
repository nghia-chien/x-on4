"use client";

import React, { useState } from "react";
import Image from "next/image";
import gcsTabs from "@/data/gcs-tabs.json";
import { X, ZoomIn, Sparkles, Layers } from "lucide-react";

export default function GalleryComingSoonPage() {
  const [activeTab, setActiveTab] = useState<
    "christmas-nail-collection" | "fall-nail-collection" | "halloween-nail-collection" | "new-favourite-collection"
  >("christmas-nail-collection");

  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const tabs = [
    { id: "christmas-nail-collection", label: "Christmas Collection" },
    { id: "fall-nail-collection", label: "Fall Collection" },
    { id: "halloween-nail-collection", label: "Halloween Collection" },
    { id: "new-favourite-collection", label: "New Favourites" },
  ] as const;

  const currentImages = (gcsTabs as Record<string, string[]>)[activeTab] || [];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#faece9] via-[#fdf4f1] to-white py-12 sm:py-20 overflow-hidden text-gray-900">
      
      {/* Diffused Ambient Blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-[#f6c9c1]/35 blur-[100px]" />
        <div className="absolute top-20 -right-32 w-[550px] h-[550px] rounded-full bg-[#faece9]/80 blur-[110px]" />
        <div className="absolute top-[35%] -left-36 w-[520px] h-[520px] rounded-full bg-[#fbe3de]/50 blur-[120px]" />
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[650px] h-[550px] rounded-full bg-[#fdf4f1]/70 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-gray-950 font-serif">
            Gallery Coming Soon
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Preview upcoming seasonal press-on nail editions handcrafted by X-ON artisans. Click any design for full-screen view.
          </p>
        </div>

        {/* Floating Glass Pill Tabs Layout */}
        <div className="flex justify-center">
          <div className="bg-white/80 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-rose-100/90 shadow-sm inline-flex max-w-full overflow-x-auto gap-1 sm:gap-2 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = ((gcsTabs as Record<string, string[]>)[tab.id] || []).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-xl transition-all duration-300 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-neutral-950 text-white shadow-md scale-[1.02]"
                      : "text-gray-600 hover:text-gray-950 hover:bg-rose-50/60"
                  }`}
                >
                  <Layers className={`w-3.5 h-3.5 ${isActive ? "text-rose-300" : "text-gray-400"}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {currentImages.map((img: string, idx: number) => (
            <div
              key={idx}
              onClick={() => setLightboxImg(img)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-white border border-rose-100/80 cursor-pointer shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <Image
                src={img}
                alt={`Collection set ${idx + 1}`}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-between p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white">
                  Design #{idx + 1}
                </span>
                <span className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
                  <ZoomIn className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {lightboxImg && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
            onClick={() => setLightboxImg(null)}
          >
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-6 right-6 p-3 text-white hover:text-rose-200 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div
              className="relative max-w-4xl max-h-[85vh] w-full h-[80vh] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxImg}
                alt="Enlarged nail look"
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-contain"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

