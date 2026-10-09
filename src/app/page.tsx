"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, BadgeCheck, Sparkles, MapPin, Phone, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import productsData from "@/data/products.json";
import siteContent from "@/data/site-content.json";
import { ProductCard, type Product } from "@/components/ProductCard";
import { mapApiProduct, type ApiProductInput } from "@/lib/productMapper";

const heroVideos = [
  {
    src: "/videos/1K34PRO8E_DMCL0D.mp4",
    poster: "/images/IMG_7101.webp",
  },
  {
    src: "/videos/1K34PRO84_DMCL0D.mp4",
    poster: "/images/IMG_7098.webp",
  },
  {
    src: "/videos/1K34PRO8K_DMCL0D.mp4",
    poster: "/images/IMG_7099.webp",
  },
];

const AVATAR_GRADIENTS = [
  "from-[#f4a8a0] to-[#f7cfc8]",
  "from-[#e9b6d4] to-[#f6d9e8]",
  "from-[#f2c19a] to-[#f9e0c8]",
];

const Stars = ({ size = "w-4 h-4" }: { size?: string }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={`${size} fill-[#f5b301] text-[#f5b301]`} />
    ))}
  </div>
);

const GoogleG = () => (
  <svg viewBox="0 0 48 48" className="w-4 h-4" aria-hidden>
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
    <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.100 0 24s.9 7.600 2.600 10.800l7.900-6.100z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.900-2.100 15.900-5.800l-7.500-5.800c-2.100 1.400-4.800 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z" />
  </svg>
);

export default function HomePage() {
  const [heroVideoIndex, setHeroVideoIndex] = useState(0);
  const heroVideoRef = React.useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [productsList, setProductsList] = useState<Product[]>(() =>
    (productsData as unknown as ApiProductInput[]).map(mapApiProduct)
  );

  const handleHeroVideoEnded = () => {
    setHeroVideoIndex((prev) => (prev + 1) % heroVideos.length);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector("div")?.clientWidth ?? 300;
    const gap = 20;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.play().catch(() => {});
    }
  }, [heroVideoIndex]);

  useEffect(() => {
    async function loadLiveProducts() {
      try {
        const res = await fetch("/api/products?limit=500");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && Array.isArray(json.data.products) && json.data.products.length > 0) {
            setProductsList(json.data.products.map(mapApiProduct));
          }
        }
      } catch (err) {
        console.error("Failed to load live products for homepage:", err);
      }
    }
    loadLiveProducts();
  }, []);

  const handmadeNails = productsList.slice(0, 8);
  const bestSellers = productsList.slice(0, 8);
  const reviews = siteContent.reviews || [];

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 overflow-x-hidden">
      
      {/* 1. HERO VIDEO BANNER */}
      <section className="relative w-full overflow-hidden bg-black aspect-video max-h-[calc(100vh-120px)] min-h-[440px] sm:min-h-[540px]">
        <video
          ref={heroVideoRef}
          key={heroVideos[heroVideoIndex].src}
          autoPlay
          muted
          playsInline
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          poster={heroVideos[heroVideoIndex].poster}
          onEnded={handleHeroVideoEnded}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-700"
        >
          <source src={heroVideos[heroVideoIndex].src} type="video/mp4" />
        </video>

        {/* Soft Luxury Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20 pointer-events-none" />

        {/* Hero Content & Action Controls */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end max-w-7xl mx-auto px-6 sm:px-12 pb-8 sm:pb-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            
            {/* Headline & Subtitle */}
            <div className="max-w-xl space-y-2 sm:space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-white font-serif leading-tight drop-shadow-md">
                Elevate Your Manicure
              </h1>

              <p className="text-xs sm:text-sm text-neutral-200 font-light leading-relaxed max-w-md drop-shadow-sm">
                Salon-grade durability in 15 minutes with damage-free Cold Gel Glue technology. Reusable &amp; custom fitted.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3 sm:gap-4">
                <Link
                  href="/shop"
                  className="px-7 py-3 sm:px-8 sm:py-3.5 bg-white hover:bg-neutral-100 text-black text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl hover:scale-102 flex items-center gap-2"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="tel:+16892128888"
                  className="px-6 py-3 sm:px-7 sm:py-3.5 bg-amber-600/90 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-amber-600/30 hover:scale-102 flex items-center gap-2 backdrop-blur-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>CALL NOW</span>
                </a>
              </div>
            </div>

            {/* Video Slide Indicator Badge */}
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 w-fit">
              <span className="text-[11px] font-mono text-neutral-300">
                0{heroVideoIndex + 1} / 0{heroVideos.length}
              </span>
              <div className="flex items-center gap-1.5">
                {heroVideos.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHeroVideoIndex(idx)}
                    aria-label={`Switch to video ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer pointer-events-auto ${
                      idx === heroVideoIndex
                        ? "w-6 bg-white shadow-sm"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. SECTION: THE X-ON COLLECTION (Blush Pink Gradient Background) */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#faece9] via-[#fdf4f1] to-[#faece9] w-full overflow-hidden">
        {/* Soft Ambient Blob */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#f6c9c1]/35 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* ===== HEADER: Tiêu đề + View All ===== */}
          <div className="flex items-end justify-between border-b border-rose-200/60 pb-4">
            <div className="text-left space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                Handcrafted Press-On Artistry
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-semibold text-gray-950">
                The X-ON Collection
              </h2>
            </div>

            <Link
              href="/product-category/product-type/handmade-grip-x-nails"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-rose-900 hover:text-black transition-colors pb-0.5 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ===== HORIZONTAL SCROLL + ARROWS ===== */}
          <div className="relative">
            {/* Left Scroll Button */}
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="hidden sm:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-md border border-rose-200 text-gray-800 hover:bg-black hover:text-white hover:border-black transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Scroll Button */}
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="hidden sm:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-md border border-rose-200 text-gray-800 hover:bg-black hover:text-white hover:border-black transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Product Cards Carousel */}
            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {handmadeNails.map((prod) => (
                <div
                  key={prod.id}
                  className="shrink-0 w-[72%] xs:w-[62%] sm:w-[45%] lg:w-[23.5%]"
                >
                  <ProductCard product={prod} variant="shop" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 3. THREE-VIDEO FULL-WIDTH STRIP */}
      <section className="hidden md:block w-full bg-neutral-950 overflow-hidden p-0 m-0">
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-0.5 p-0 m-0 bg-neutral-900">
          {/* Video 1 */}
          <div className="relative aspect-[9/16] w-full overflow-hidden bg-black pointer-events-none">
            <video
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              poster="/images/IMG_7098.webp"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none hover:scale-105 transition-transform duration-700"
            >
              <source src="/videos/1K34PRO84_DMCL0D.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Video 2 */}
          <div className="relative aspect-[9/16] w-full overflow-hidden bg-black pointer-events-none">
            <video
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              poster="/images/IMG_7099.webp"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none hover:scale-105 transition-transform duration-700"
            >
              <source src="/videos/1K34PRO8K_DMCL0D.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Video 3 */}
          <div className="relative aspect-[9/16] w-full overflow-hidden bg-black pointer-events-none">
            <video
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              poster="/images/IMG_7100.webp"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none hover:scale-105 transition-transform duration-700"
            >
              <source src="/videos/1K34PRO8E_DMCL0D.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Mobile Video 1 */}
      <div className="md:hidden w-full overflow-hidden bg-black relative aspect-[9/16] max-h-[540px]">
        <video
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          poster="/images/IMG_7098.webp"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        >
          <source src="/videos/1K34PRO84_DMCL0D.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 4. SECTION: BEST SELLER */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#fdf4f1] via-[#faece9] to-[#fdf4f1] w-full overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* ===== HEADER ===== */}
          <div className="flex items-end justify-between border-b border-rose-200/60 pb-4">
            <div className="text-left space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                Most Loved Styles
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-semibold text-gray-950">
                Best Sellers
              </h2>
            </div>

            <Link
              href="/product-category/product-type/handmade-grip-x-nails"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-rose-900 hover:text-black transition-colors pb-0.5 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ===== PRODUCT GRID ===== */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} variant="shop" />
            ))}
          </div>

        </div>
      </section>

      {/* Mobile Video 2 */}
      <div className="md:hidden w-full overflow-hidden bg-black relative aspect-[9/16] max-h-[540px]">
        <video
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          poster="/images/IMG_7099.webp"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        >
          <source src="/videos/1K34PRO8K_DMCL0D.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 5. SECTION: OUR REVIEWS */}
      <section className="relative w-full overflow-hidden py-14 sm:py-18 lg:py-22 bg-gradient-to-b from-[#fdf4f1] via-[#faece9] to-[#fdf4f1]">
        {/* Soft Blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#f6c9c1]/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#e9c6e0]/40 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-800">
              Real Reviews · Real Nail Girlies
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl leading-tight text-gray-950">
              Loved by <span className="italic text-rose-700">babes</span> everywhere
            </h2>

            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-rose-200/80 bg-white/80 px-6 py-2.5 shadow-sm backdrop-blur-md">
              <span className="font-serif text-2xl font-bold text-gray-950">5.0</span>
              <Stars />
              <span className="h-4 w-px bg-gray-300" />
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <GoogleG /> Google Reviews
              </span>
            </div>
          </div>

          {/* Cards */}
          <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0 scrollbar-none">
            {reviews.slice(0, 3).map((rev, idx) => (
              <article
                key={idx}
                className={`group relative flex min-w-[82%] snap-center flex-col justify-between rounded-3xl border border-rose-100/90 bg-white/85 p-6 sm:p-7 shadow-sm backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-w-[60%] md:min-w-0 ${
                  idx === 1 ? "md:-translate-y-3 md:hover:-translate-y-4" : ""
                }`}
              >
                <span className="pointer-events-none absolute right-6 top-3 font-serif text-7xl leading-none text-rose-200/60 select-none">
                  &rdquo;
                </span>

                <div className="relative z-10">
                  <Stars size="w-3.5 h-3.5" />
                  <p className="mt-4 text-[14px] sm:text-[15px] leading-relaxed text-gray-800">
                    {rev.text}
                  </p>
                </div>

                <div className="relative z-10 mt-6 flex items-center gap-3 border-t border-rose-100 pt-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${
                      AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
                    } text-sm font-bold text-white shadow-xs`}
                  >
                    {rev.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-950">
                      {rev.author}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified buyer
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">{rev.date}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECTION: SHOP US IRL / URL - Seamless Harmonious Split */}
      <section className="relative w-full overflow-hidden bg-[#faf1ec] border-t border-rose-100/80">
        <div className="grid grid-cols-1 md:grid-cols-2 items-stretch min-h-[420px] sm:min-h-[480px] lg:min-h-[540px]">
          {/* Left Column Image */}
          <div className="relative w-full h-[360px] sm:h-[440px] md:h-full min-h-[360px] md:min-h-full overflow-hidden">
            <Image
              src="/images/shop-url-bg.webp"
              alt="Shop US IRL & URL"
              fill
              priority
              quality={100}
              unoptimized
              className="object-cover object-center"
            />
            <div className="hidden md:block absolute inset-y-0 right-0 w-36 lg:w-52 bg-gradient-to-r from-transparent to-[#faf1ec] pointer-events-none" />
            <div className="md:hidden absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#faf1ec] pointer-events-none" />
          </div>

          {/* Right Column Content */}
          <div className="relative flex flex-col items-center justify-center text-center px-6 sm:px-12 lg:px-16 py-12 sm:py-16 space-y-5 bg-[#faf1ec]">
            <div className="relative z-10 space-y-4 max-w-md">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-800 flex items-center justify-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                Visit Our Studio or Shop Online
              </span>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-neutral-950 font-serif leading-tight">
                SHOP US URL
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Visit our Kissimmee Florida studio or order online with fast worldwide shipping.
              </p>

              <div className="pt-2">
                <a
                  href="https://www.google.com/maps/place/3168+Bill+Beck+Blvd,+Kissimmee,+FL+34744,+Hoa+K%E1%BB%B3/@28.3421851,-81.384924,96m/data=!3m1!1e3!4m6!3m5!1s0x88dd86f7f805bafd:0x719187b51bbcb7ff!8m2!3d28.3423066!4d-81.3845875!16s%2Fg%2F11bw40bzvw!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDkyMS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-9 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-xl hover:scale-102 cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>FIND US ON MAP</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
