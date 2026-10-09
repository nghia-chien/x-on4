"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ChevronRight, X, ZoomIn } from "lucide-react";
import galleryItems from "@/data/gallery-product.json";

export default function GalleryProductPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const itemsPerPage = 20;
  const totalPages = Math.ceil(galleryItems.length / itemsPerPage);

  const currentItems = galleryItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      {/* Background Motifs */}

      {/* Top Full-width Banner with Top-Left Luxury Overlay Text */}
      <div className="relative w-full overflow-hidden bg-[#f7f3ee] min-h-[420px] sm:min-h-[480px] md:min-h-[520px] lg:min-h-[560px] flex items-center">
        <Image
          src="/images/xon_gallery_banner.webp"
          alt="X-ON Handcrafted Nail Art Gallery"
          fill
          priority
          className="object-cover object-right sm:object-center"
          quality={100}
          unoptimized
        />
        {/* Soft subtle gradient to guarantee crystal-clear text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7f3ee]/95 via-[#f7f3ee]/70 to-transparent sm:from-[#f7f3ee]/90 sm:via-[#f7f3ee]/50 sm:to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 md:px-14 lg:px-20 py-12 sm:py-16">
          <div className="max-w-lg sm:max-w-xl md:max-w-2xl space-y-3 sm:space-y-4 md:space-y-5">
            <span className="inline-block text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.25em] text-[#8c5e32]">
              Handcrafted Artistry
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-extrabold text-neutral-900 tracking-tight leading-[1.06]">
              Elegance In <br className="hidden sm:block" /> Every Detail
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-neutral-800 font-sans max-w-lg leading-relaxed font-normal">
              Discover couture press-on sets meticulously hand-painted by master artisans for instant, salon-grade perfection.
            </p>
            <div className="pt-2 sm:pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 sm:px-8 sm:py-4 bg-neutral-900 hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded-md transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer"
              >
                <span>Shop Collection</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <section className="py-10 sm:py-16 max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Floating Title Box */}
        <div className="max-w-2xl mx-auto text-center p-6 sm:p-8 rounded-xl bg-white/70 backdrop-blur-xs shadow-xs mb-10 sm:mb-12">
          <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-black mb-2">
            READY TO WEAR
          </h3>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-[#dd9933] mb-3 leading-tight">
            Find Your Perfect Set
          </h2>
          <p className="text-sm sm:text-base text-neutral-800 mb-6">
            Discover handcrafted press-on nails designed to fit your style and your moment.
          </p>
          <div>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-[11px] transition-colors shadow-md"
            >
              SHOP THE COLLECTION
            </Link>
          </div>
        </div>

        {/* 4-Column Grid (4 on lg, 3 on md, 2 on sm, 1 on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {currentItems.map((item, idx) => {
            const itemId = `gp-${idx}`;
            return (
              <div
                key={idx}
                className="group relative bg-white border border-neutral-200/80 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Square Image Container */}
                <div className="relative aspect-square w-full bg-neutral-50 overflow-hidden cursor-pointer">
                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => toggleWishlist(itemId, e)}
                    className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-neutral-600 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        wishlist[itemId] ? "fill-rose-600 text-rose-600" : ""
                      }`}
                    />
                  </button>

                  <div
                    onClick={() => setSelectedImg(item.image)}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <ZoomIn className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Bar */}
        <div className="mt-12 flex items-center justify-center gap-1 text-sm font-semibold">
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => {
                  setCurrentPage(pageNum);
                  window.scrollTo({ top: 350, behavior: "smooth" });
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-black text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          {currentPage < totalPages && (
            <button
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 350, behavior: "smooth" });
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedImg(null)}
        >
          <button
            onClick={() => setSelectedImg(null)}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-3xl max-h-[85vh] w-full h-[80vh] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImg}
              alt="Enlarged view"
              fill
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
