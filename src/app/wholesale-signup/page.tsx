"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Building2 } from "lucide-react";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c]";

export default function WholesaleSignupPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    contactName: "",
    businessName: "",
    email: "",
    phone: "",
    website: "",
    taxId: "",
    message: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.contactName.trim()) {
      errors.contactName = "Contact Name is required.";
    }
    if (!formData.businessName.trim()) {
      errors.businessName = "Business / Salon Name is required.";
    }
    if (!formData.email.trim()) {
      errors.email = "Business Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone Number is required.";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Please complete all required fields indicated below.");
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/wholesale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: formData.contactName.trim(),
          businessName: formData.businessName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          website: formData.website.trim(),
          taxId: formData.taxId.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.message || "Failed to submit wholesale application.");
      }
    } catch {
      setErrorMessage("Network connection error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
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
              Wholesale Application
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 tracking-tight">
            Wholesale Account Application
          </h1>
          <div className="mx-auto h-px w-12 bg-rose-300" />
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
            Become an official partner of X-ON&apos;s handcrafted press-on nails, patented Cold Gel Glue technology, and pro essentials.
          </p>
        </div>

        {/* Benefits Banner (Tối ưu cho cả Mobile & Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-[#eedad7] bg-white/80 backdrop-blur-xs p-4 sm:p-5 text-center shadow-2xs">
            <span className="text-xl sm:text-2xl font-serif font-bold text-gray-900 block">40–60%</span>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c9776c] mt-1">Wholesale Margins</p>
            <p className="text-[11px] text-gray-500 mt-0.5">High profit return per set</p>
          </div>
          <div className="rounded-2xl border border-[#eedad7] bg-white/80 backdrop-blur-xs p-4 sm:p-5 text-center shadow-2xs">
            <span className="text-xl sm:text-2xl font-serif font-bold text-gray-900 block">Low MOQ</span>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c9776c] mt-1">Flexible Starter Kits</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Custom mix &amp; match packs</p>
          </div>
          <div className="rounded-2xl border border-[#eedad7] bg-white/80 backdrop-blur-xs p-4 sm:p-5 text-center shadow-2xs">
            <span className="text-xl sm:text-2xl font-serif font-bold text-gray-900 block">US Stock</span>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c9776c] mt-1">Prompt Dispatch</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Shipped from Florida studio</p>
          </div>
        </div>

        {/* Form Container (Mobile Optimized) */}
        <div className="rounded-3xl border border-[#eedad7] bg-white/95 backdrop-blur-xs p-6 sm:p-10 shadow-xs">
          {submitted ? (
            <div className="text-center py-10 sm:py-14 space-y-4">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-gray-900">
                Application Received!
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you for applying to partner with X-ON. Our wholesale accounts manager will review your credentials and contact you via email within 1–2 business days.
              </p>
              <div className="pt-4">
                <Link
                  href="/shop"
                  className={`inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-black ${focusRing}`}
                >
                  Return to Shop <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => {
                      setFormData({ ...formData, contactName: e.target.value });
                      if (fieldErrors.contactName) {
                        setFieldErrors({ ...fieldErrors, contactName: "" });
                      }
                    }}
                    placeholder="Full Name"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white transition-colors ${
                      fieldErrors.contactName
                        ? "border-rose-500 bg-rose-50/30"
                        : "border-[#eedad7] hover:border-gray-400"
                    } ${focusRing}`}
                  />
                  {fieldErrors.contactName && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {fieldErrors.contactName}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => {
                      setFormData({ ...formData, businessName: e.target.value });
                      if (fieldErrors.businessName) {
                        setFieldErrors({ ...fieldErrors, businessName: "" });
                      }
                    }}
                    placeholder="Boutique / Salon Name"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white transition-colors ${
                      fieldErrors.businessName
                        ? "border-rose-500 bg-rose-50/30"
                        : "border-[#eedad7] hover:border-gray-400"
                    } ${focusRing}`}
                  />
                  {fieldErrors.businessName && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {fieldErrors.businessName}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (fieldErrors.email) {
                        setFieldErrors({ ...fieldErrors, email: "" });
                      }
                    }}
                    placeholder="orders@business.com"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white transition-colors ${
                      fieldErrors.email
                        ? "border-rose-500 bg-rose-50/30"
                        : "border-[#eedad7] hover:border-gray-400"
                    } ${focusRing}`}
                  />
                  {fieldErrors.email && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (fieldErrors.phone) {
                        setFieldErrors({ ...fieldErrors, phone: "" });
                      }
                    }}
                    placeholder="(555) 000-0000"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white transition-colors ${
                      fieldErrors.phone
                        ? "border-rose-500 bg-rose-50/30"
                        : "border-[#eedad7] hover:border-gray-400"
                    } ${focusRing}`}
                  />
                  {fieldErrors.phone && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {fieldErrors.phone}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Website or Social Handle
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="instagram.com/yoursalon"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#eedad7] bg-white hover:border-gray-400 transition-colors ${focusRing}`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Tax ID / Reseller Permit #
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="Tax ID Number"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#eedad7] bg-white hover:border-gray-400 transition-colors ${focusRing}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Business Details &amp; Estimated Volume
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your boutique, salon clients, and the nail collections you're interested in stocking..."
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#eedad7] bg-white hover:border-gray-400 transition-colors resize-y ${focusRing}`}
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-full bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer ${focusRing}`}
              >
                {isSubmitting && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{isSubmitting ? "Submitting Application..." : "Submit Wholesale Application"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
