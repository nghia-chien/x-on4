"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Send, Check, Sparkles, ShieldCheck, Heart, ArrowUp } from "lucide-react";

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;

    setNewsletterLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      if (res.ok) {
        setNewsletterSuccess(true);
        setNewsletterEmail("");
      }
    } catch {
      console.error("Newsletter error");
    } finally {
      setNewsletterLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#0e0d11] via-[#141218] to-[#09080b] text-neutral-300 border-t border-rose-900/30 overflow-hidden">
      
      {/* Ambient background glow accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[350px] rounded-full bg-rose-900/10 blur-[130px]" />
        <div className="absolute bottom-0 right-10 w-[450px] h-[300px] rounded-full bg-rose-950/20 blur-[120px]" />
      </div>


      {/* Main footer content grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">

          {/* Col 1: Logo + tagline + description + VIP Club (4 cols) */}
          <div className="space-y-5 sm:col-span-4 lg:col-span-4">
            <Link
              href="/"
              className="inline-block transition-transform hover:scale-102"
            >
              <div className="relative h-28 sm:h-32 md:h-36 w-[300px] sm:w-[360px] md:w-[390px] max-w-full">
                <Image
                  src="/images/logo-xon.webp"
                  alt="X-ON"
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 380px, 600px"
                  className="object-contain object-left [filter:drop-shadow(0_0_2px_rgba(255,255,255,0.95))_drop-shadow(0_0_10px_rgba(255,255,255,0.7))_drop-shadow(0_0_22px_rgba(244,63,94,0.5))]"
                />
              </div>
            </Link>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-rose-400">
                Press on. Slay on. Repeat.
              </p>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-sm font-light">
                X-ON is where modern nail artistry meets effortless luxury. Handcrafted bespoke press-on nails and premium essentials designed for long-lasting salon elegance.
              </p>
            </div>

            {/* Newsletter VIP Club Box */}
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-rose-400 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Join X-ON VIP Club
              </p>
              {newsletterSuccess ? (
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/80 shadow-xs">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Subscribed! Check your inbox.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-xs">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="flex-1 px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 text-white placeholder-neutral-500 rounded-xl focus:outline-none focus:border-rose-500 focus:bg-white/10 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shadow-md hover:shadow-rose-600/30"
                    title="Subscribe"
                  >
                    {newsletterLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Col 2: Explore X-ON (2 cols) */}
          <div className="space-y-4 lg:col-span-2 pt-2 sm:pt-0">
            <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400 font-serif">
              Explore X-ON
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-200">
              <li>
                <Link href="/shop" className="hover:text-rose-300 hover:translate-x-1 transition-all duration-200 inline-block">
                  Shop All Nails
                </Link>
              </li>
              <li>
                <Link href="/bundle-and-save" className="hover:text-rose-300 hover:translate-x-1 transition-all duration-200 inline-block">
                  Bundle &amp; Save
                </Link>
              </li>
              <li>
                <Link href="/sizing-chart" className="hover:text-rose-300 hover:translate-x-1 transition-all duration-200 inline-block">
                  Sizing Chart &amp; Fit Guide
                </Link>
              </li>
              <li>
                <Link href="/gallery-product" className="hover:text-rose-300 hover:translate-x-1 transition-all duration-200 inline-block">
                  Product Gallery
                </Link>
              </li>
              <li>
                <Link href="/gallery-coming-soon" className="hover:text-rose-300 hover:translate-x-1 transition-all duration-200 inline-block">
                  Coming Soon Collections
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-rose-300 hover:translate-x-1 transition-all duration-200 inline-block">
                  Beauty &amp; Nail Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Partnerships & Info (2 cols) */}
          <div className="space-y-4 lg:col-span-2 pt-2 sm:pt-0">
            <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400 font-serif">
              Partnerships &amp; Info
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-200">
              <li>
                <Link href="/about" className="hover:text-rose-300 hover:translate-x-1 transition-all duration-200 inline-block">
                  About Our Artistry
                </Link>
              </li>
              <li>
                <Link href="/wholesale-signup" className="hover:text-rose-300 hover:translate-x-1 transition-all duration-200 inline-block">
                  Wholesale Registration
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-rose-300 hover:translate-x-1 transition-all duration-200 inline-block">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-rose-300 hover:translate-x-1 transition-all duration-200 inline-block">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-rose-300 hover:translate-x-1 transition-all duration-200 inline-block">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Kissimmee Studio (4 cols) */}
          <div className="space-y-4 lg:col-span-4 pt-2 sm:pt-0">
            <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400 font-serif">
              Kissimmee Studio
            </h3>
            <div className="space-y-3.5 text-xs text-neutral-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps/place/3168+Bill+Beck+Blvd,+Kissimmee,+FL+34744,+Hoa+K%E1%BB%B3/@28.3421851,-81.384924,96m/data=!3m1!1e3!4m6!3m5!1s0x88dd86f7f805bafd:0x719187b51bbcb7ff!8m2!3d28.3423066!4d-81.3845875!16s%2Fg%2F11bw40bzvw!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDkyMS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-300 transition-colors leading-relaxed"
                >
                  3168 Bill Beck Blvd, Kissimmee, FL 34744
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <a href="tel:+16892128888" className="hover:text-rose-300 transition-colors font-semibold tracking-wide text-neutral-100">
                  689–212–8888
                </a>
              </div>

              {/* Social icons */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2.5">
                  Follow Us
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-neutral-300 hover:border-rose-400 hover:text-white hover:bg-rose-600/30 transition-all hover:scale-110"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-neutral-300 hover:border-rose-400 hover:text-white hover:bg-rose-600/30 transition-all hover:scale-110"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                    className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-neutral-300 hover:border-rose-400 hover:text-white hover:bg-rose-600/30 transition-all hover:scale-110"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                    </svg>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/10 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} X-ON. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-rose-300 transition-colors">
              Terms
            </Link>
            <Link href="/privacy-policy" className="hover:text-rose-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact-us" className="hover:text-rose-300 transition-colors">
              Contact
            </Link>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all ml-2"
              title="Back to Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}