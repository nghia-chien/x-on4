import React from "react";
import Link from "next/link";
import { Sparkles, Ruler, Truck, Phone, FileCheck } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions – X-ON Press-On Nails",
  description: "Read the official terms and conditions for ordering handcrafted press-on nails from X-ON.",
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c]";

export default function TermsPage() {
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
      {/* Diffused ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-[#f6c9c1]/40 blur-[100px]" />
        <div className="absolute top-20 -right-32 w-[550px] h-[550px] rounded-full bg-[#faece9]/80 blur-[110px]" />
        <div className="absolute top-[35%] -left-36 w-[520px] h-[520px] rounded-full bg-[#fbe3de]/55 blur-[120px]" />
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[650px] h-[550px] rounded-full bg-[#fdf4f1]/70 blur-[130px]" />
        <div className="absolute top-[75%] -right-28 w-[520px] h-[520px] rounded-full bg-[#f8dfd8]/50 blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-[#c9776c]">
            <li>
              <Link href="/" className={`hover:text-[#b8897a] transition-colors ${focusRing}`}>
                Home
              </Link>
            </li>
            <span className="text-[#c9776c]/60">/</span>
            <li className="text-gray-700" aria-current="page">
              Terms &amp; Conditions
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9776c] block">
            Customer Agreement
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
            Terms &amp; Conditions
          </h1>
          <div className="h-px w-12 bg-rose-300" />
          <p className="text-xs text-gray-500 pt-1">
            Last updated: October 2026 &bull; X-ON Handmade Nail Studio
          </p>
        </div>

        {/* Content Card (Mobile Optimized) */}
        <div className="rounded-3xl border border-[#eedad7] bg-white/90 backdrop-blur-xs p-6 sm:p-10 shadow-xs space-y-8">
          <div className="rounded-2xl bg-[#faece9]/40 border border-[#eedad7] p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <FileCheck className="w-5 h-5 text-[#c9776c] shrink-0 mt-0.5" />
            <p>
              Welcome to <strong>X-ON</strong>. By accessing our website or placing an order, you agree to comply with and be bound by the following policies and service terms.
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#faece9] text-[#c9776c]">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide">
                1. Product Quality &amp; Handcrafting
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-0 sm:pl-10">
              Each set of X-ON press-on nails is hand-sculpted and painted by artists using salon gel and acrylic powder. Due to the artisanal nature of our craft, minor variations in charm placement, hand-painted details, or marble patterns may occur, making every set uniquely yours.
            </p>
          </div>

          <div className="h-px bg-[#eedad7]/60" />

          {/* Section 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#faece9] text-[#c9776c]">
                <Ruler className="w-4 h-4" />
              </span>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide">
                2. Sizing &amp; Custom Orders
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-0 sm:pl-10">
              Customers are responsible for accurately measuring natural nail widths with our <Link href="/sizing-chart" className="font-semibold text-gray-900 hover:text-[#c9776c] underline">Fit Guide</Link> before placing an order. Because handmade nails are intimate personal hygiene items made to order, we cannot accept returns for incorrect sizing. If unsure, we recommend sizing up so you can file edges flush.
            </p>
          </div>

          <div className="h-px bg-[#eedad7]/60" />

          {/* Section 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#faece9] text-[#c9776c]">
                <Truck className="w-4 h-4" />
              </span>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide">
                3. Shipping &amp; Delivery
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-0 sm:pl-10">
              We process and dispatch orders promptly from our US studio at <strong>3168 Bill Beck Blvd, Kissimmee Fl 34744</strong>. Free standard shipping applies to all US domestic orders over $50. Tracking information will be emailed immediately upon shipment.
            </p>
          </div>

          <div className="h-px bg-[#eedad7]/60" />

          {/* Section 4 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#faece9] text-[#c9776c]">
                <Phone className="w-4 h-4" />
              </span>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide">
                4. Customer Inquiries
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-0 sm:pl-10">
              For any questions regarding your order, customized sizing, or studio appointments, please reach out to our team at <a href="mailto:info@x-on.com" className="font-semibold text-gray-900 hover:text-[#c9776c] underline">info@x-on.com</a> or call <a href="tel:+16892128888" className="font-semibold text-gray-900 hover:text-[#c9776c] underline">689-212-8888</a>.
            </p>
          </div>
        </div>

        {/* Bottom Navigation Link */}
        <div className="flex justify-between items-center pt-2 text-xs text-gray-600">
          <Link href="/privacy-policy" className={`font-semibold hover:text-[#c9776c] ${focusRing}`}>
            &larr; View Privacy Policy
          </Link>
          <Link href="/contact-us" className={`font-semibold hover:text-[#c9776c] ${focusRing}`}>
            Contact Support &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
