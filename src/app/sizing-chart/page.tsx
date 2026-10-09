"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";

interface SizeRow {
  size: "XS" | "S" | "M" | "L";
  name: string;
  popular?: boolean;
  thumb: { num: string; mm: string };
  index: { num: string; mm: string };
  middle: { num: string; mm: string };
  ring: { num: string; mm: string };
  pinky: { num: string; mm: string };
}

const STANDARD_SIZES: SizeRow[] = [
  {
    size: "XS",
    name: "Extra Small",
    thumb: { num: "#3", mm: "15mm" },
    index: { num: "#6", mm: "12mm" },
    middle: { num: "#5", mm: "13mm" },
    ring: { num: "#7", mm: "11mm" },
    pinky: { num: "#9", mm: "9mm" },
  },
  {
    size: "S",
    name: "Small",
    popular: true,
    thumb: { num: "#2", mm: "16mm" },
    index: { num: "#5", mm: "13mm" },
    middle: { num: "#4", mm: "14mm" },
    ring: { num: "#6", mm: "12mm" },
    pinky: { num: "#9", mm: "9mm" },
  },
  {
    size: "M",
    name: "Medium",
    thumb: { num: "#1", mm: "17mm" },
    index: { num: "#5", mm: "13mm" },
    middle: { num: "#4", mm: "14mm" },
    ring: { num: "#6", mm: "12mm" },
    pinky: { num: "#8", mm: "10mm" },
  },
  {
    size: "L",
    name: "Large",
    thumb: { num: "#0", mm: "19mm" },
    index: { num: "#4", mm: "14mm" },
    middle: { num: "#3", mm: "15mm" },
    ring: { num: "#5", mm: "13mm" },
    pinky: { num: "#7", mm: "11mm" },
  },
];

const MEASURE_STEPS = [
  {
    step: "01",
    title: "Tape Across",
    desc: "Press clear scotch tape across the widest part of your natural nail bed.",
  },
  {
    step: "02",
    title: "Mark Edges",
    desc: "Use a pen to mark both sidewalls exactly where the nail meets skin.",
  },
  {
    step: "03",
    title: "Read mm",
    desc: "Peel tape off, place flat on a ruler, and note the width in millimeters.",
  },
];

const POPULAR_SHAPES = [
  { name: "Almond", img: "/images/shape-almond.webp", desc: "Elongating & flattering" },
  { name: "Coffin", img: "/images/shape-coffin.webp", desc: "Modern & trendy" },
  { name: "Oval", img: "/images/shape-oval.webp", desc: "Timeless & feminine" },
  { name: "Round", img: "/images/shape-round.webp", desc: "Natural & low-profile" },
  { name: "Square", img: "/images/shape-square.webp", desc: "Clean & classic" },
  { name: "Stiletto", img: "/images/shape-stiletto.webp", desc: "Bold statement look" },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c]";

export default function SizingChartPage() {
  const [selectedSize, setSelectedSize] = useState<"XS" | "S" | "M" | "L">("S");
  const activeSizeData = STANDARD_SIZES.find((s) => s.size === selectedSize) ?? STANDARD_SIZES[1];

  return (
    <div
      className="relative min-h-screen py-8 sm:py-12 overflow-hidden text-gray-900"
      style={{
        background: `
          radial-gradient(ellipse 60% 40% at 12% 15%, rgba(246, 201, 193, 0.42) 0%, transparent 70%),
          radial-gradient(ellipse 55% 45% at 88% 22%, rgba(250, 236, 233, 0.75) 0%, transparent 70%),
          radial-gradient(ellipse 65% 50% at 30% 55%, rgba(251, 227, 222, 0.50) 0%, transparent 70%),
          radial-gradient(ellipse 60% 45% at 75% 70%, rgba(246, 217, 210, 0.38) 0%, transparent 70%),
          radial-gradient(ellipse 70% 40% at 50% 90%, rgba(253, 244, 241, 0.60) 0%, transparent 70%),
          linear-gradient(180deg, #faece9 0%, #fdf4f1 35%, #ffffff 100%)
        `,
      }}
    >
      {/* Diffused ambient blobs đồng nhất với Shop và Bundle page */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-[#f6c9c1]/40 blur-[100px]" />
        <div className="absolute top-20 -right-32 w-[550px] h-[550px] rounded-full bg-[#faece9]/80 blur-[110px]" />
        <div className="absolute top-[35%] -left-36 w-[520px] h-[520px] rounded-full bg-[#fbe3de]/55 blur-[120px]" />
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[650px] h-[550px] rounded-full bg-[#fdf4f1]/70 blur-[130px]" />
        <div className="absolute top-[75%] -right-28 w-[520px] h-[520px] rounded-full bg-[#f8dfd8]/50 blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* 1. Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-[#c9776c]">
            <li>
              <Link
                href="/"
                className={`hover:text-[#b8897a] transition-colors ${focusRing}`}
              >
                Home
              </Link>
            </li>
            <span className="text-[#c9776c]/60">/</span>
            <li className="text-gray-700" aria-current="page">
              Fit Guide
            </li>
          </ol>
        </nav>

        {/* 2. Header & Title: Tinh gọn, sang trọng */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 tracking-tight">
            Find Your Perfect Nail Fit
          </h1>
          <div className="mx-auto h-px w-12 bg-rose-300" />
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
            Take 2 minutes to measure your natural nail widths for a seamless, comfortable salon-quality fit.
          </p>
        </div>

        {/* 3. Interactive Quick Size Picker (Tối ưu đặc biệt cho Mobile) */}
        <section className="rounded-3xl border border-[#eedad7] bg-white/90 backdrop-blur-xs p-5 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9776c] block">
                Step 1: Compare Sizes
              </span>
              <h2 className="text-base sm:text-xl font-bold font-serif text-gray-900">
                Standard Size Measurements
              </h2>
            </div>
            <span className="text-[11px] text-gray-500">
              Finger Order: Thumb &rarr; Index &rarr; Middle &rarr; Ring &rarr; Pinky
            </span>
          </div>

          {/* Mobile-friendly Touch Size Tabs */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
            {STANDARD_SIZES.map((item) => {
              const isSelected = selectedSize === item.size;
              return (
                <button
                  key={item.size}
                  type="button"
                  onClick={() => setSelectedSize(item.size)}
                  className={`relative flex flex-col items-center justify-center py-2.5 sm:py-3.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${focusRing} ${
                    isSelected
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm scale-[1.02]"
                      : "bg-[#fdf4f1]/50 text-gray-700 border-[#eedad7] hover:bg-white hover:border-gray-400"
                  }`}
                >
                  {item.popular && (
                    <span
                      className={`absolute -top-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        isSelected ? "bg-[#c9776c] text-white" : "bg-gray-900 text-white"
                      }`}
                    >
                      Popular
                    </span>
                  )}
                  <span className="text-sm sm:text-base font-bold">{item.size}</span>
                  <span
                    className={`text-[10px] hidden sm:block ${
                      isSelected ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Size Breakdown Display (Cards dễ đọc trên mobile) */}
          <div className="rounded-2xl border border-[#eedad7] bg-gradient-to-b from-[#fdf4f1]/40 to-white p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  {activeSizeData.size}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">
                  {activeSizeData.name} Breakdown
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Pre-calibrated set
              </span>
            </div>

            {/* 5 Finger Cards Grid */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 text-center">
              {[
                { label: "Thumb", data: activeSizeData.thumb },
                { label: "Index", data: activeSizeData.index },
                { label: "Middle", data: activeSizeData.middle },
                { label: "Ring", data: activeSizeData.ring },
                { label: "Pinky", data: activeSizeData.pinky },
              ].map((finger) => (
                <div
                  key={finger.label}
                  className="rounded-xl border border-[#eedad7] bg-white p-2 sm:p-3 shadow-2xs"
                >
                  <span className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                    {finger.label}
                  </span>
                  <span className="block text-xs sm:text-base font-bold text-gray-900 mt-1">
                    {finger.data.mm}
                  </span>
                  <span className="inline-block text-[9px] sm:text-[10px] font-semibold text-[#c9776c] bg-[#faece9] px-1.5 py-0.2 rounded-sm mt-0.5">
                    {finger.data.num}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Comparison Table (Clean, Responsive) */}
          <div className="overflow-x-auto rounded-xl border border-[#eedad7]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faece9]/60 text-[10px] sm:text-xs uppercase font-semibold text-gray-600 border-b border-[#eedad7]">
                <tr>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-2 text-center">Thumb</th>
                  <th className="py-2.5 px-2 text-center">Index</th>
                  <th className="py-2.5 px-2 text-center">Middle</th>
                  <th className="py-2.5 px-2 text-center">Ring</th>
                  <th className="py-2.5 px-2 text-center">Pinky</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eedad7]/60 bg-white">
                {STANDARD_SIZES.map((row) => (
                  <tr
                    key={row.size}
                    className={`transition-colors ${
                      selectedSize === row.size ? "bg-[#faece9]/30 font-semibold" : "hover:bg-neutral-50"
                    }`}
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-gray-900">{row.size}</span>
                      <span className="text-gray-400 text-[11px] ml-1 hidden sm:inline">
                        ({row.name})
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">{row.thumb.mm}</td>
                    <td className="py-2.5 px-2 text-center">{row.index.mm}</td>
                    <td className="py-2.5 px-2 text-center">{row.middle.mm}</td>
                    <td className="py-2.5 px-2 text-center">{row.ring.mm}</td>
                    <td className="py-2.5 px-2 text-center">{row.pinky.mm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Custom Size Callout */}
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#faece9]/50 border border-[#eedad7] p-4 text-xs text-gray-700">
            <Info className="w-4 h-4 text-[#c9776c] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">
                Need a Custom Size?
              </p>
              <p className="mt-0.5 leading-relaxed text-gray-600">
                If your fingers match different sizes, select <span className="font-bold text-gray-900">&ldquo;Custom Size&rdquo;</span> at checkout and write your 5 measurements (mm) in the order notes for free customized sizing.
              </p>
            </div>
          </div>
        </section>

        {/* 4. How to Measure at Home (3 bước đơn giản, không ngộp) */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9776c]">
              Step 2: Simple Measurement
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
              How to Measure with Tape &amp; Ruler
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Only takes a minute with standard clear scotch tape and a ruler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {MEASURE_STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-[#eedad7] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-serif font-bold text-[#c9776c]/40 block mb-2">
                    {s.step}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                    {s.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#eedad7]/50 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Accurate fit</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tip Box */}
          <div className="max-w-2xl mx-auto rounded-2xl border border-[#eedad7] bg-white/80 p-4 text-center text-xs text-gray-600">
            <p>
              💡 <strong className="text-gray-900">Between sizes?</strong> Always size up! You can easily buff down the sides with the included mini file for an exact flush fit.
            </p>
          </div>
        </section>

        {/* 5. Nail Shapes Preview (Trực quan, gọn đẹp) */}
        <section className="rounded-3xl border border-[#eedad7] bg-white/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9776c]">
              Silhouettes
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
              Popular Nail Shapes
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Choose the silhouette that best complements your natural hands.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {POPULAR_SHAPES.map((shape) => (
              <div
                key={shape.name}
                className="flex flex-col items-center justify-between p-3 rounded-2xl border border-[#eedad7] bg-[#fdf4f1]/30 text-center transition-all hover:bg-white hover:shadow-xs"
              >
                <div className="relative w-16 h-20 mb-2">
                  <Image
                    src={shape.img}
                    alt={shape.name}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-900 uppercase tracking-wide">
                    {shape.name}
                  </span>
                  <span className="block text-[10px] text-gray-500 mt-0.5">
                    {shape.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Ready to Shop CTA */}
        <div className="text-center pt-4 pb-6">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/shop"
              className={`inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98] ${focusRing}`}
            >
              Shop Handcrafted Nails <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact-us"
              className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-900 bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-900 transition-colors hover:bg-gray-900 hover:text-white ${focusRing}`}
            >
              Need Sizing Help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
