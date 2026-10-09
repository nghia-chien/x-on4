"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Eye, EyeOff, Lock, Mail, User, Shield, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AdminRole } from "@/types/admin";

const ROLES: { role: AdminRole; label: string; desc: string }[] = [
  { role: "Administrator", label: "Administrator", desc: "Full control over all store features, users, and settings." },
  { role: "Admin", label: "Store Manager", desc: "Manage products, orders, blog, wholesale, and customers." },
  { role: "Editor", label: "Content Editor", desc: "Manage catalog products, blog articles, and reviews." },
  { role: "Wholesale Partner", label: "B2B Partner", desc: "Access wholesale pricing and bulk order submissions." },
  { role: "Retail Customer", label: "VIP Customer", desc: "Personal shopping profile and order history." },
];

export default function AdminRegisterPage() {
  const { register } = useAdminAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("Admin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    const res = await register({
      name,
      email,
      password,
      role,
    });

    if (!res.success) {
      setErrorMessage(res.message || "Failed to create account. Please check your inputs.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F7] font-sans selection:bg-indigo-600 selection:text-white flex items-center justify-center p-6 sm:p-10 lg:p-16">
      {/* Centered Main Box with 50:50 ratio */}
      <div className="w-full max-w-5xl bg-white border border-neutral-200 shadow-2xl shadow-neutral-900/10 grid grid-cols-1 lg:grid-cols-2 items-stretch overflow-hidden">
        {/* LEFT COLUMN: 50% Image & Value Props */}
        <div className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-[720px] w-full bg-neutral-100 overflow-hidden flex flex-col justify-between p-8 sm:p-10">
          <Image
            src="/images/login-nail-hero.webp"
            alt="X-ON Luxury Nails Atelier"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/80 text-rose-300 text-[10px] font-bold uppercase tracking-widest backdrop-blur-xs">
              <Shield className="w-3.5 h-3.5 text-rose-400" /> Account Registration
            </span>
          </div>

          <div className="relative z-10 bg-neutral-950/80 text-white p-6 border border-white/10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              Join the X-ON Atelier Team &amp; Management Portal
            </h2>
            <ul className="text-xs text-neutral-300 space-y-1.5 font-light">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Granular role-based permissions &amp; access control</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Live product catalog &amp; order management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Encrypted JWT sessions with automatic cookie refresh</span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: 50% Registration Form */}
        <div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12 xl:p-14 bg-white">
          <div>
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <Image
                src="/images/logo-xon-clean.webp"
                alt="X-ON Nails Logo"
                width={130}
                height={70}
                priority
                className="w-28 h-14 object-contain object-left"
              />

              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-indigo-600 transition-colors py-1.5 px-3 border border-neutral-200 hover:border-indigo-600"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                Create Admin Account
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Already have an account?{" "}
                <Link href="/admin/login" className="text-indigo-600 font-bold hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jessica Miller"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm text-neutral-900 placeholder-neutral-400 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@xonails.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm text-neutral-900 placeholder-neutral-400 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
                  Assign Account Role (Permissions)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-xs font-semibold text-neutral-900 transition-all outline-none cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label} — {r.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm text-neutral-900 placeholder-neutral-400 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                      Confirm Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-neutral-500 hover:text-neutral-900 flex items-center gap-0.5 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm text-neutral-900 placeholder-neutral-400 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account &amp; Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
