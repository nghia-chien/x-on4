"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield, ArrowLeft, UserPlus, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("admin@xonails.com");
  const [password, setPassword] = useState("Admin@123456");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const res = await login(email, password);
    if (!res.success) {
      setErrorMessage(res.message || "Failed to sign in. Please check your credentials.");
      setIsLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Admin@123456");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#F0F2F7] font-sans selection:bg-indigo-600 selection:text-white flex items-center justify-center p-6 sm:p-10 lg:p-16">
      {/* Centered Main Box with 50:50 ratio */}
      <div className="w-full max-w-5xl bg-white border border-neutral-200 shadow-2xl shadow-neutral-900/10 grid grid-cols-1 lg:grid-cols-2 items-stretch overflow-hidden">
        {/* LEFT COLUMN: 50% Image */}
        <div className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-[680px] w-full bg-neutral-100 overflow-hidden flex flex-col justify-between p-8 sm:p-10">
          <Image
            src="/images/login-nail-hero.webp"
            alt="X-ON Luxury Nails"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/80 text-pink-300 text-[10px] font-bold uppercase tracking-widest backdrop-blur-xs">
              <Shield className="w-3.5 h-3.5 text-pink-400" /> Secure Admin Portal
            </span>
          </div>

          <div className="relative z-10 bg-neutral-950/80 text-white p-6 border border-white/10 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-pink-300">
              X-ON Luxury Nails Atelier
            </p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              Get access to your personal hub for clarity and productivity
            </h2>

            {/* Quick Demo Test Accounts */}
            <div className="pt-2 border-t border-white/10">
              <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-2 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-amber-400" /> Quick Demo Test Accounts:
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setDemoAccount("admin@xonails.com")}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold border border-white/15 transition-all cursor-pointer"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => setDemoAccount("wholesale@xonails.com")}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold border border-white/15 transition-all cursor-pointer"
                >
                  Wholesale Partner
                </button>
                <button
                  type="button"
                  onClick={() => setDemoAccount("customer@xonails.com")}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold border border-white/15 transition-all cursor-pointer"
                >
                  VIP Customer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 50% Form */}
        <div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12 xl:p-14 bg-white">
          <div>
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8">
              <Image
                src="/images/logo-xon-clean.webp"
                alt="X-ON Nails Logo"
                width={130}
                height={70}
                priority
                className="w-32 h-16 object-contain object-left"
              />

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-indigo-600 transition-colors py-1.5 px-3 border border-neutral-200 hover:border-indigo-600"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Store</span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                  Sign in to Admin
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Don&apos;t have an account yet?{" "}
                  <Link href="/admin/register" className="text-indigo-600 font-bold hover:underline">
                    Register here
                  </Link>
                </p>
              </div>

              <Link
                href="/admin/register"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                  Your email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@xonails.com"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm text-neutral-900 placeholder-neutral-400 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm text-neutral-900 placeholder-neutral-400 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-700 hover:text-neutral-900">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border-neutral-300 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <Link href="/admin/register" className="text-xs text-indigo-600 font-semibold hover:underline">
                  Create new account
                </Link>
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
                    <span>Get Started</span>
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
