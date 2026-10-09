"use client";

import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Gem,
  Wrench,
  Check,
} from "lucide-react";

export default function ContactUsPage() {
  // Contact Form State
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneOrOrder: "",
    subject: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) {
      errors.firstName = "First Name is required.";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last Name is required.";
    }
    if (!formData.email.trim()) {
      errors.email = "Email Address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.message.trim()) {
      errors.message = "Please enter your message.";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Please fill in all required fields indicated below.");
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: formData.email.trim(),
          phone: formData.phoneOrOrder.trim(),
          subject: formData.subject || "General Inquiry",
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneOrOrder: "",
          subject: "",
          message: "",
        });
      } else {
        setErrorMessage(data.message || "Failed to submit message. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail.trim())) {
      setNewsletterError("Please enter a valid email address.");
      return;
    }
    setNewsletterError("");
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#faece9] via-[#fdf4f1] to-white py-10 sm:py-16 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Header & Brand Tagline */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-gray-950 font-serif">
            Contact X-ON
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Have questions about press-on nail sizing, order status, wholesale, or custom sets? Send us a message below for fast assistance.
          </p>
        </div>

        {/* TOP SECTION: Contact Form & Interactive Map / Direct Info Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Left Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-rose-100/80 shadow-md space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold uppercase tracking-tight text-gray-950 flex items-center gap-2 font-serif">
                <MessageSquare className="w-5 h-5 text-rose-700" />
                Contact X-ON Form
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Fill out your details below. Submitting creates a direct inquiry record in our admin system.
              </p>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                <h3 className="text-xl font-bold uppercase tracking-tight text-gray-950">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-gray-600 max-w-md">
                  Thank you for reaching out to X-ON. Your inquiry has been created and our team will respond within 24 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-black text-white text-xs uppercase font-semibold tracking-wider rounded-full hover:bg-neutral-800 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* First & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      First Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({ ...formData, firstName: e.target.value });
                        if (fieldErrors.firstName) setFieldErrors({ ...fieldErrors, firstName: "" });
                      }}
                      placeholder="Jane"
                      className={`w-full px-4 py-3 text-xs border rounded-lg focus:outline-hidden transition-colors ${
                        fieldErrors.firstName
                          ? "border-rose-500 bg-rose-50/30 focus:border-rose-600"
                          : "border-gray-200 focus:border-black"
                      }`}
                    />
                    {fieldErrors.firstName && (
                      <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                        {fieldErrors.firstName}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Last Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData({ ...formData, lastName: e.target.value });
                        if (fieldErrors.lastName) setFieldErrors({ ...fieldErrors, lastName: "" });
                      }}
                      placeholder="Doe"
                      className={`w-full px-4 py-3 text-xs border rounded-lg focus:outline-hidden transition-colors ${
                        fieldErrors.lastName
                          ? "border-rose-500 bg-rose-50/30 focus:border-rose-600"
                          : "border-gray-200 focus:border-black"
                      }`}
                    />
                    {fieldErrors.lastName && (
                      <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                        {fieldErrors.lastName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Email Address & Phone / Order Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Email Address <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                      }}
                      placeholder="jane@example.com"
                      className={`w-full px-4 py-3 text-xs border rounded-lg focus:outline-hidden transition-colors ${
                        fieldErrors.email
                          ? "border-rose-500 bg-rose-50/30 focus:border-rose-600"
                          : "border-gray-200 focus:border-black"
                      }`}
                    />
                    {fieldErrors.email && (
                      <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                        {fieldErrors.email}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Phone / Order Number <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.phoneOrOrder}
                      onChange={(e) => setFormData({ ...formData, phoneOrOrder: e.target.value })}
                      placeholder="689-212-8888 or Order #1002"
                      className="w-full px-4 py-3 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {/* Topic / Subject */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Topic / Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-black bg-white transition-colors cursor-pointer"
                  >
                    <option value="">Select a topic...</option>
                    <option value="sizing">Nail Sizing &amp; Fitting Assistance</option>
                    <option value="order">Order Status, Shipping &amp; Returns</option>
                    <option value="wholesale">Wholesale &amp; Salon Retail Partnerships</option>
                    <option value="custom">Custom Handmade Press-On Inquiry</option>
                    <option value="other">General Question</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Your Message <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: "" });
                    }}
                    placeholder="Tell us how we can help you with your press-on nails order, sizing, or wholesale inquiry..."
                    className={`w-full px-4 py-3 text-xs border rounded-lg focus:outline-hidden resize-y transition-colors ${
                      fieldErrors.message
                        ? "border-rose-500 bg-rose-50/30 focus:border-rose-600"
                        : "border-gray-200 focus:border-black"
                    }`}
                  />
                  {fieldErrors.message && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {fieldErrors.message}
                    </span>
                  )}
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
                    {errorMessage}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-neutral-800 text-white font-semibold text-xs uppercase tracking-widest rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? "Sending..." : "Submit Inquiry"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Side Right Column: Quick Contact & Interactive Map (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact & Wholesale Info Box */}
            <div className="bg-white p-6 rounded-3xl border border-rose-100/80 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-3">
                Direct Contact &amp; Wholesale
              </h3>
              
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-800 shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 font-semibold mb-0.5">
                      Phone &amp; SMS (Wholesale &amp; Size Help)
                    </strong>
                    <a
                      href="tel:+16892128888"
                      className="text-sm font-bold text-gray-950 hover:text-rose-700 block transition-colors"
                    >
                      689-212-8888
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-800 shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 font-semibold mb-0.5">
                      Customer Support Email
                    </strong>
                    <a
                      href="mailto:info@x-on.com"
                      className="text-xs font-bold text-gray-950 hover:text-rose-700 block transition-colors"
                    >
                      info@x-on.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Google Map & Location Card */}
            <div className="bg-white p-5 rounded-3xl border border-rose-100/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Location &amp; Map
                  </h3>
                </div>
                <a
                  href="https://www.google.com/maps/place/3168+Bill+Beck+Blvd,+Kissimmee,+FL+34744,+Hoa+K%E1%BB%B3/@28.3421851,-81.384924,96m/data=!3m1!1e3!4m6!3m5!1s0x88dd86f7f805bafd:0x719187b51bbcb7ff!8m2!3d28.3423066!4d-81.3845875!16s%2Fg%2F11bw40bzvw!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDkyMS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-rose-800 hover:text-black flex items-center gap-1 transition-colors"
                >
                  Open Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Map Iframe */}
              <div className="w-full h-[280px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative bg-neutral-100">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d721.285388614116!2d-81.384924!3d28.3421851!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88dd86f7f805bafd%3A0x719187b51bbcb7ff!2s3168%20Bill%20Beck%20Blvd%2C%20Kissimmee%2C%20FL%2034744%2C%20Hoa%20K%E1%BB%B3!5e1!3m2!1svi!2s!4v1791512219321!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full border-0"
                />
              </div>

              <div className="text-[11px] text-gray-600 flex items-start gap-2 pt-1">
                <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Store Location:</strong> 3168 Bill Beck Blvd, Kissimmee, FL 34744, USA
                </span>
              </div>
            </div>

            {/* Operating Hours Summary */}
            <div className="bg-white p-5 rounded-3xl border border-rose-100/80 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-700" />
                Operating Hours
              </h4>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between py-1">
                  <span>Monday – Sunday</span>
                  <span className="font-semibold text-gray-900">9:00 AM – 6:00 PM EST</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* CONSOLIDATED INFORMATION SECTION BELOW (Gom thông tin phụ xuống dưới) */}
        <div className="space-y-8 pt-6 border-t border-rose-100/80">
          
          {/* Brand Intro & Core Promise */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-950 font-serif">
              About X-ON Press-On Nails
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
              X-ON is where modern nail artistry meets effortless beauty. Designed for nail lovers and professionals — delivering easier, faster, and more accessible beauty without compromise.
            </p>
          </div>

          {/* Benefits Grid (Gom 2 Benefit Blocks & Trust) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Benefit 1 */}
            <div className="bg-white p-6 rounded-3xl border border-rose-100/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-800 flex items-center justify-center shrink-0">
                <Gem className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-950">
                Handmade Press-On Nails
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Handcrafted by master nail artists using gel polish. Reusable, salon-grade durability, tailored sizes for an instant luxury manicure.
              </p>
              <ul className="space-y-1.5 text-[11px] text-gray-700 font-medium pt-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  Custom sizing &amp; instant photo confirmation
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  Reusable design with proper care
                </li>
              </ul>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white p-6 rounded-3xl border border-rose-100/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-800 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-950">
                Nail Essentials
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Carefully selected prep tools, adhesive tabs, nail glue, cuticle oils, and files. Everything for flawless application &amp; natural nail protection.
              </p>
              <ul className="space-y-1.5 text-[11px] text-gray-700 font-medium pt-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  Gentle on natural nails, zero damage
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  Professional high-bond adhesives
                </li>
              </ul>
            </div>

            {/* Benefit 3: Trust & Polished Luxury */}
            <div className="bg-white p-6 rounded-3xl border border-rose-100/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-950">
                Polished Luxury Finish
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Strict quality control ensures flawless shine, comfortable fit, and effortless elegance for nail lovers and professionals.
              </p>
              <ul className="space-y-1.5 text-[11px] text-gray-700 font-medium pt-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  Designed for nail lovers &amp; salons
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  Quality, style &amp; performance guaranteed
                </li>
              </ul>
            </div>
          </div>

          {/* Core Value Statement Banner */}
          <div className="bg-gradient-to-r from-rose-950 via-neutral-900 to-rose-950 text-white p-6 sm:p-8 rounded-3xl shadow-md text-center space-y-2">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-rose-200">
              Quality, Style &amp; Performance
            </h4>
            <p className="text-xs sm:text-sm text-rose-100 max-w-3xl mx-auto leading-relaxed font-light">
              Designed for nail lovers and professionals — making beauty easier, faster, and more accessible.
            </p>
          </div>
        </div>

        {/* X-ON Newsletter / Updates Block */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-rose-100 shadow-sm text-center space-y-4 max-w-4xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-widest text-rose-800">
            Stay Connected
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-950 font-serif">
            X-ON Newsletter &amp; Updates
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Subscribe to get early access to new handmade nail collection drops, special wholesale offers, and expert press-on nail care tips.
          </p>

          {newsletterSubscribed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Thank you for subscribing to X-ON updates!</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-4 py-3 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-black transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Subscribe
                </button>
              </div>
              {newsletterError && (
                <p className="text-[11px] text-rose-600 text-left pl-1">{newsletterError}</p>
              )}
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
