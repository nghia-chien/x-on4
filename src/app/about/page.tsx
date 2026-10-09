import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Star,
  BadgeCheck,
  MapPin,
  Phone,
  Clock,
  Mail,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us – X-ON Press-On Nails",
  description:
    "Discover X-ON: Handcrafted salon-quality press-on nails and damage-free Cold Gel Glue technology. Flawless 15-minute manicures at home.",
};

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

// Trust Signals (Real Google Reviews)
const REAL_REVIEWS = [
  {
    author: "Frank Baurgh",
    text: "I’ve tried so many press-ons before, but X-ON’s are truly salon-quality maybe even better than some sets I’ve paid for in person. The designs are detailed, sturdy, and look professionally done. Their nail glue has an amazing hold and kept my nails secure for days. So convenient and worth it!",
    date: "Recently",
  },
  {
    author: "Gwen Ivery",
    text: "No drilling, chemical, or UV light. Very healthy for your nails and quick. Still beautiful as if I paid $80 but only paid $35. They have over 1000 designs and they are so gorgeous. Only stayed about 15 minutes. Check them out!",
    date: "Recently",
  },
  {
    author: "Robin Richardson",
    text: "They do not use UV light or harsh chemicals. I was able to get my nails done fast and I am beyond pleased with the quality. Stephanie is amazing. I will definitely be coming back.",
    date: "Recently",
  },
];

// Real Studio Location & Operating Details
const STORE_INFO = {
  address: "3168 Bill Beck Blvd, Kissimmee, FL 34744",
  hours: "Monday – Sunday: 9:00 AM – 6:00 PM EST",
  phone: "689-212-8888",
  phoneDisplay: "(689) 212-8888",
  email: "info@x-on.com",
  mapsHref:
    "https://www.google.com/maps/place/3168+Bill+Beck+Blvd,+Kissimmee,+FL+34744,+Hoa+K%E1%BB%B3/@28.3421851,-81.384924,96m/data=!3m1!1e3!4m6!3m5!1s0x88dd86f7f805bafd:0x719187b51bbcb7ff!8m2!3d28.3423066!4d-81.3845875!16s%2Fg%2F11bw40bzvw!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDkyMS4wIKXMDSoASAFQAw%3D%3D",
  telHref: "tel:+16892128888",
  mailHref: "mailto:info@x-on.com",
};

// Brand Lifestyle / Lookbook Images
const LIFESTYLE_GALLERY = [
  {
    src: "/images/IMG_7098.webp",
    alt: "X-ON luxury handcrafted nail design",
    title: "Artisan Handcrafted Sets",
  },
  {
    src: "/images/IMG_7101.webp",
    alt: "X-ON dimensional nail art",
    title: "3D Texture & Details",
  },
  {
    src: "/images/IMG_7103.webp",
    alt: "X-ON elegant press-on manicure",
    title: "Everyday Effortless Glam",
  },
  {
    src: "/images/IMG_7104.webp",
    alt: "X-ON salon-quality finish",
    title: "High-Gloss Mirror Finish",
  },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c]";

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO — Brand Positioning (Bạn là ai?) */}
      <section className="relative overflow-hidden border-b border-[#f3dedb] bg-gradient-to-b from-[#fdf4f1] via-[#faece9] to-[#fdf4f1] py-16 sm:py-24 lg:py-28">

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c9776c]">
            About X-ON
          </p>
          <h1 className="font-serif text-3xl font-semibold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Where Modern Nail Artistry Meets{" "}
            <span className="italic text-[#c9776c]">Effortless Beauty.</span>
          </h1>
          <div className="mx-auto mt-6 h-px w-12 bg-rose-300" />
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-gray-700 sm:text-base">
            Handcrafted salon-caliber press-on nails and innovative Cold Gel technology,
            engineered to give you flawless manicures at home in under 15 minutes without UV damage.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/shop"
              className={`inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-black hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${focusRing}`}
            >
              Shop Collection <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="#our-story"
              className={`inline-flex items-center justify-center rounded-full border border-gray-900 bg-white/80 backdrop-blur-xs px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-900 transition-all hover:bg-gray-900 hover:text-white active:scale-[0.98] ${focusRing}`}
            >
              Our Story
            </a>
          </div>
        </div>
      </section>

      {/* 2. BRAND STORY — Lý do thương hiệu tồn tại */}
      <section id="our-story" className="scroll-mt-20 bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div
              aria-hidden
              className="absolute -inset-3 translate-x-3 translate-y-3 rounded-3xl border border-[#eedad7]"
            />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-[#f6e6e2] shadow-[0_18px_50px_-20px_rgba(201,119,108,0.5)]">
              <Image
                src="/images/IMG_7112.webp"
                alt="X-ON handmade press-on nails"
                fill
                sizes="(max-width: 768px) 90vw, 45vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c9776c] block mb-2">
                Why We Started
              </span>
              <h2 className="font-serif text-3xl font-semibold text-gray-900 sm:text-4xl">
                The Salon Look, Reimagined for Home
              </h2>
              <div className="mx-auto mt-4 h-px w-12 bg-rose-300 md:mx-0" />
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-gray-700 sm:text-base">
              <p>
                Traditional salon appointments mean 2+ hours sitting in a chair, high recurring costs, and gradual
                nail damage from harsh UV lamps, filing, and electric drills. Meanwhile, typical drugstore press-ons
                are mass-molded in rigid plastic that pops off within days and rarely fits natural nail curves.
              </p>
              <p>
                <strong>X-ON was created to solve both problems.</strong> Every single set is hand-crafted nail by nail
                by our artists using professional salon gel and premium acrylic powder, locking in authentic depth,
                structure, and high-gloss shine.
              </p>
              <p>
                Paired with our room-temperature <strong>Cold Gel Glue</strong>, you get instant salon-caliber hold that lasts
                up to 3–4 weeks without ever exposing your hands to UV lights or thinning your natural nails.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/shop"
                className={`inline-flex items-center gap-2 rounded-full border border-gray-900 px-7 py-3 text-xs font-bold uppercase tracking-wider text-gray-900 transition-colors hover:bg-gray-900 hover:text-white active:scale-[0.98] ${focusRing}`}
              >
                Explore Handcrafted Sets <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST SIGNALS — SECTION: OUR REVIEWS (Giống trang chủ) */}
      <section className="relative w-full overflow-hidden py-10 sm:py-14 lg:py-18 bg-gradient-to-b from-[#fdf4f1] via-[#faece9] to-[#fdf4f1] border-t border-[#f3dedb]">
        {/* soft blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#f6c9c1]/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#e9c6e0]/40 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c9776c]">
              Real reviews · Real nail girlies
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl leading-tight text-gray-900">
              Loved by{" "}
              <span className="italic text-[#c9776c]">babes</span> everywhere
            </h2>

            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/70 px-5 py-2.5 shadow-sm backdrop-blur">
              <span className="font-serif text-2xl font-bold text-gray-900">5.0</span>
              <Stars />
              <span className="h-4 w-px bg-gray-200" />
              <span className="flex items-center gap-1.5 text-xs text-gray-600">
                <GoogleG /> Google Reviews
              </span>
            </div>
          </div>

          {/* Cards: swipe on mobile, 3-col on desktop */}
          <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {REAL_REVIEWS.map((rev, idx) => (
              <article
                key={idx}
                className={`group relative flex min-w-[82%] snap-center flex-col justify-between rounded-3xl border border-white bg-white/80 p-6 shadow-[0_10px_40px_-15px_rgba(201,119,108,0.35)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(201,119,108,0.5)] sm:min-w-[60%] md:min-w-0 ${
                  idx === 1 ? "md:-translate-y-4 md:hover:-translate-y-5" : ""
                }`}
              >
                {/* big quote mark */}
                <span className="pointer-events-none absolute right-5 top-2 font-serif text-7xl leading-none text-[#f3d3cd]">
                  &rdquo;
                </span>

                <div className="relative">
                  <Stars size="w-3.5 h-3.5" />
                  <p className="mt-4 text-[15px] leading-relaxed text-gray-800">
                    {rev.text}
                  </p>
                </div>

                <div className="relative mt-6 flex items-center gap-3 border-t border-[#f3dedb] pt-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${
                      AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
                    } text-sm font-bold text-white shadow-inner`}
                  >
                    {rev.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {rev.author}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-emerald-600">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified buyer
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-400">{rev.date}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. STUDIO & SHOWROOM — Visit X-ON In Person (Thiết kế trực quan, rõ ràng & dễ nhìn) */}
      <section className="border-t border-[#f3dedb] bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-[#eedad7] bg-gradient-to-br from-[#fdf4f1] via-white to-[#fbf0ec] shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Cột trái: Ảnh đại diện showroom / studio */}
              <div className="relative min-h-[300px] sm:min-h-[360px] lg:col-span-5 lg:min-h-full">
                <Image
                  src="/images/shop-irl-bg.webp"
                  alt="X-ON Studio & Showroom in Kissimmee FL"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent lg:hidden" />
                <div className="absolute bottom-4 left-4 right-4 text-white lg:hidden">
                  <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white border border-white/30">
                    Kissimmee, Florida
                  </span>
                </div>
              </div>

              {/* Cột phải: Thông tin trực quan, dễ nhìn, font chữ rõ ràng */}
              <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-7 lg:p-12">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c9776c]">
                      Studio &amp; Showroom
                    </span>
                    <span className="hidden sm:inline-block rounded-full bg-[#fbe3de] px-3 py-1 text-[11px] font-semibold text-[#c9776c]">
                      Walk-ins &amp; Appointments Welcome
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">
                    Visit X-ON In Person
                  </h2>

                  <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl">
                    Experience our handmade nail collections in person, test your nail sizes on-site,
                    and discover our signature Cold Gel technology with our friendly studio team.
                  </p>

                  {/* Danh sách thông tin chi tiết với icon nổi bật */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Địa chỉ */}
                    <div className="rounded-2xl border border-[#eedad7] bg-white p-4.5 shadow-2xs">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#faece9] text-[#c9776c]">
                          <MapPin className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Location
                          </span>
                          <p className="mt-0.5 text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                            {STORE_INFO.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Giờ mở cửa */}
                    <div className="rounded-2xl border border-[#eedad7] bg-white p-4.5 shadow-2xs">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#faece9] text-[#c9776c]">
                          <Clock className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Hours
                          </span>
                          <p className="mt-0.5 text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                            {STORE_INFO.hours}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Số điện thoại */}
                    <div className="rounded-2xl border border-[#eedad7] bg-white p-4.5 shadow-2xs">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#faece9] text-[#c9776c]">
                          <Phone className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Direct Line
                          </span>
                          <a
                            href={STORE_INFO.telHref}
                            className={`mt-0.5 block text-xs sm:text-sm font-semibold text-gray-900 transition-colors hover:text-[#c9776c] ${focusRing}`}
                          >
                            {STORE_INFO.phoneDisplay}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Email hỗ trợ */}
                    <div className="rounded-2xl border border-[#eedad7] bg-white p-4.5 shadow-2xs">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#faece9] text-[#c9776c]">
                          <Mail className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Email Contact
                          </span>
                          <a
                            href={STORE_INFO.mailHref}
                            className={`mt-0.5 block text-xs sm:text-sm font-semibold text-gray-900 transition-colors hover:text-[#c9776c] ${focusRing}`}
                          >
                            {STORE_INFO.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Các nút hành động nhanh */}
                <div className="mt-8 pt-6 border-t border-[#eedad7]/60 flex flex-wrap items-center gap-3">
                  <a
                    href={STORE_INFO.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98] ${focusRing}`}
                  >
                    Get Directions <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={STORE_INFO.telHref}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-gray-900 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-900 transition-all hover:bg-gray-900 hover:text-white active:scale-[0.98] ${focusRing}`}
                  >
                    Call Studio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BRAND LIFESTYLE & LOOKBOOK — Đặt xuống dưới cùng trước CTA */}
      <section className="border-t border-[#f3dedb] bg-[#fdf4f1]/30 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c9776c] block mb-2">
              The X-ON Look
            </span>
            <h2 className="font-serif text-3xl font-semibold text-gray-900 sm:text-4xl">
              Artistry at Your Fingertips
            </h2>
            <div className="mx-auto mt-4 h-px w-12 bg-rose-300" />
            <p className="mt-3 text-xs sm:text-sm text-gray-600">
              Each set is an individual piece of wearable art, designed to elevate your everyday mood.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {LIFESTYLE_GALLERY.map((item) => (
              <div
                key={item.title}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-[#eedad7] bg-[#f6e6e2] shadow-xs"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
                  <span className="text-xs font-semibold text-white tracking-wide">
                    {item.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL COMMERCE CTA — Mời khách hàng khám phá sản phẩm */}
      <section className="bg-neutral-950 px-4 py-16 text-center sm:py-24 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c9776c] mb-3">
            Press On. Slay On. Repeat.
          </p>
          <h2 className="font-serif text-3xl font-semibold tracking-wide sm:text-5xl">
            Ready to Find Your Next Set?
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Discover our latest handcrafted sets, exclusive 3D luxury designs, and room-temperature Cold Gel kits.
          </p>
          <div className="mt-8">
            <Link
              href="/shop"
              className={`inline-flex items-center gap-2 rounded-full bg-white px-9 py-4 text-xs font-bold uppercase tracking-wider text-neutral-950 transition-all hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg ${focusRing}`}
            >
              Shop All Nails <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}