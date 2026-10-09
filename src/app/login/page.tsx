"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
} from "lucide-react";

export default function AuthPage() {
  const { login, register } = useAdminAuth();

  // Mode: "login" or "register"
  const [mode, setMode] = useState<"login" | "register">("login");

  // Real-time Date State
  const [currentDate, setCurrentDate] = useState<{ month: string; year: string; fullDate: string }>({
    month: "Oct",
    year: "2026",
    fullDate: "",
  });

  useEffect(() => {
    const now = new Date();
    const monthStr = now.toLocaleString("en-US", { month: "short" });
    const yearStr = now.getFullYear().toString();
    const fullStr = now.toLocaleString("en-US", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    setCurrentDate({ month: monthStr, year: yearStr, fullDate: fullStr });
  }, []);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // Validation Shake & Red Field Highlighting States (NO text error message alert box)
  const [shakeLogin, setShakeLogin] = useState(false);
  const [shakeRegister, setShakeRegister] = useState(false);
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});

  // API submitting status
  const [isLoading, setIsLoading] = useState(false);

  // Clear invalid errors on input change
  const handleInputChange = (field: string, value: string, setter: (v: string) => void) => {
    setter(value);
    if (invalidFields[field]) {
      setInvalidFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  const triggerShake = (isReg: boolean, badFields: string[]) => {
    const fieldMap: Record<string, boolean> = {};
    badFields.forEach((f) => (fieldMap[f] = true));
    setInvalidFields(fieldMap);

    if (isReg) {
      setShakeRegister(true);
      setTimeout(() => setShakeRegister(false), 600);
    } else {
      setShakeLogin(true);
      setTimeout(() => setShakeLogin(false), 600);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bad: string[] = [];
    if (!loginEmail.trim()) bad.push("loginEmail");
    if (!loginPassword.trim()) bad.push("loginPassword");

    if (bad.length > 0) {
      triggerShake(false, bad);
      return;
    }

    setIsLoading(true);
    const res = await login(loginEmail, loginPassword);
    if (!res.success) {
      triggerShake(false, ["loginEmail", "loginPassword"]);
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bad: string[] = [];
    if (!regEmail.trim()) bad.push("regEmail");
    if (!regPassword.trim() || regPassword.length < 6) bad.push("regPassword");
    if (!regConfirmPassword.trim() || regConfirmPassword !== regPassword) bad.push("regConfirmPassword");

    if (bad.length > 0) {
      triggerShake(true, bad);
      return;
    }

    setIsLoading(true);

    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
    });

    if (!res.success) {
      triggerShake(true, ["regEmail", "regPassword"]);
      setIsLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setMode("login");
    setLoginEmail(demoEmail);
    setLoginPassword("Admin@123456");
    setInvalidFields({});
  };

  const isLogin = mode === "login";

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-[#e6d3cf] font-sans flex items-center justify-center p-3 sm:p-4 lg:p-6 relative">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f3dbd6]/80 via-[#e4c7c2]/70 to-[#d2a7a2]/80 pointer-events-none" />

      {/* Shake Keyframe Styles inline */}
      <style jsx global>{`
        @keyframes shakeHard {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-8px); }
          30%, 60%, 90% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shakeHard 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>

      {/* MAIN CONTAINER FOR 1-SCREEN VIEW WITHOUT SCROLLING */}
      <div className="relative z-10 w-full max-w-5xl h-full max-h-[630px] grid grid-cols-12 gap-4 items-stretch">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN (COL-SPAN-6): FORM BLOCK + TALL VIDEO REFERENCE BLOCK */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-between gap-3 h-full">
          
          {/* BLOCK 1: AUTH FORM CARD WITH VIBRATION & SHAKE VALIDATION */}
          <div className="bg-white/45 backdrop-blur-xl border border-white/70 shadow-xl shadow-rose-950/5 rounded-[28px] p-5 sm:p-6 flex flex-col justify-between flex-1 relative overflow-hidden">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <Link href="/" className="inline-block">
                  <Image
                    src="/images/logo-xon-clean.webp"
                    alt="X-ON Nails Logo"
                    width={110}
                    height={50}
                    priority
                    className="w-24 h-9 object-contain object-left"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMode(isLogin ? "register" : "login");
                    setInvalidFields({});
                  }}
                  className="px-3.5 py-1.5 bg-white/80 hover:bg-white text-neutral-900 text-[11px] font-bold rounded-full transition-all cursor-pointer shadow-2xs border border-white"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </div>

              {/* Title Header */}
              <div className="mb-3">
                <h1 className="font-serif text-2xl font-bold tracking-tight text-neutral-900">
                  {isLogin ? "Log in" : "Sign up"}
                </h1>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  {isLogin ? "Welcome back to X-ON Atelier." : "Create your X-ON member profile."}
                </p>
              </div>

              {/* SLIDING FORMS CONTAINER WITH SHAKE */}
              <div className="relative overflow-hidden w-full transition-all">
                
                {/* LOGIN FORM SLIDE */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    shakeLogin ? "animate-shake" : ""
                  } ${
                    isLogin ? "translate-x-0 opacity-100 relative z-10" : "-translate-x-full opacity-0 absolute inset-0 pointer-events-none"
                  }`}
                >
                  <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                    <div className="relative">
                      <Mail
                        className={`w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                          invalidFields.loginEmail ? "text-rose-500" : "text-neutral-400"
                        }`}
                      />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => handleInputChange("loginEmail", e.target.value, setLoginEmail)}
                        placeholder="e-mail address"
                        className={`w-full pl-10 pr-3 py-2.5 bg-white/70 hover:bg-white focus:bg-white text-xs text-neutral-900 placeholder-neutral-500 transition-all outline-none rounded-full shadow-2xs ${
                          invalidFields.loginEmail
                            ? "border-2 border-rose-500 bg-rose-50/60 ring-2 ring-rose-200"
                            : "border border-white focus:border-[#c9776c]"
                        }`}
                      />
                    </div>

                    <div className="relative">
                      <Lock
                        className={`w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                          invalidFields.loginPassword ? "text-rose-500" : "text-neutral-400"
                        }`}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => handleInputChange("loginPassword", e.target.value, setLoginPassword)}
                        placeholder="password"
                        className={`w-full pl-10 pr-20 py-2.5 bg-white/70 hover:bg-white focus:bg-white text-xs text-neutral-900 placeholder-neutral-500 transition-all outline-none rounded-full shadow-2xs ${
                          invalidFields.loginPassword
                            ? "border-2 border-rose-500 bg-rose-50/60 ring-2 ring-rose-200"
                            : "border border-white focus:border-[#c9776c]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => triggerShake(false, ["loginPassword"])}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-0.5 bg-white/90 hover:bg-white text-[10px] font-semibold text-neutral-600 rounded-full border border-neutral-200 transition-all cursor-pointer"
                      >
                        I forgot
                      </button>
                    </div>

                    <div className="pt-1 flex items-center justify-between gap-3">
                      <p className="text-[10px] text-neutral-600 font-light leading-snug max-w-[190px]">
                        Join the press-on nail revolution. Handmade luxury.
                      </p>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-black text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shrink-0"
                      >
                        {isLoading ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* REGISTER FORM SLIDE */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    shakeRegister ? "animate-shake" : ""
                  } ${
                    !isLogin ? "translate-x-0 opacity-100 relative z-10" : "translate-x-full opacity-0 absolute inset-0 pointer-events-none"
                  }`}
                >
                  <form onSubmit={handleRegisterSubmit} className="space-y-2">
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="full name (optional)"
                        className="w-full pl-10 pr-3 py-2 bg-white/70 hover:bg-white focus:bg-white border border-white focus:border-[#c9776c] text-xs text-neutral-900 placeholder-neutral-500 transition-all outline-none rounded-full shadow-2xs"
                      />
                    </div>

                    <div className="relative">
                      <Mail
                        className={`w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                          invalidFields.regEmail ? "text-rose-500" : "text-neutral-400"
                        }`}
                      />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => handleInputChange("regEmail", e.target.value, setRegEmail)}
                        placeholder="e-mail address *"
                        className={`w-full pl-10 pr-3 py-2 bg-white/70 hover:bg-white focus:bg-white text-xs text-neutral-900 placeholder-neutral-500 transition-all outline-none rounded-full shadow-2xs ${
                          invalidFields.regEmail
                            ? "border-2 border-rose-500 bg-rose-50/60 ring-2 ring-rose-200"
                            : "border border-white focus:border-[#c9776c]"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Lock
                          className={`w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                            invalidFields.regPassword ? "text-rose-500" : "text-neutral-400"
                          }`}
                        />
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => handleInputChange("regPassword", e.target.value, setRegPassword)}
                          placeholder="password *"
                          className={`w-full pl-10 pr-2 py-2 bg-white/70 hover:bg-white focus:bg-white text-xs text-neutral-900 placeholder-neutral-500 transition-all outline-none rounded-full shadow-2xs ${
                            invalidFields.regPassword
                              ? "border-2 border-rose-500 bg-rose-50/60 ring-2 ring-rose-200"
                              : "border border-white focus:border-[#c9776c]"
                          }`}
                        />
                      </div>
                      <div className="relative">
                        <Lock
                          className={`w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                            invalidFields.regConfirmPassword ? "text-rose-500" : "text-neutral-400"
                          }`}
                        />
                        <input
                          type="password"
                          value={regConfirmPassword}
                          onChange={(e) => handleInputChange("regConfirmPassword", e.target.value, setRegConfirmPassword)}
                          placeholder="confirm *"
                          className={`w-full pl-10 pr-2 py-2 bg-white/70 hover:bg-white focus:bg-white text-xs text-neutral-900 placeholder-neutral-500 transition-all outline-none rounded-full shadow-2xs ${
                            invalidFields.regConfirmPassword
                              ? "border-2 border-rose-500 bg-rose-50/60 ring-2 ring-rose-200"
                              : "border border-white focus:border-[#c9776c]"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-neutral-500">Fast VIP Registration</span>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-10 h-10 rounded-full bg-[#c9776c] hover:bg-[#b5675c] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shrink-0"
                      >
                        {isLoading ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* SOCIAL LOGIN DIVIDER & BUTTONS */}
              <div className="mt-3 pt-2.5 border-t border-black/5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-neutral-200/80 flex-1" />
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Or continue with</span>
                  <div className="h-px bg-neutral-200/80 flex-1" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* GOOGLE LOGIN */}
                  <button
                    type="button"
                    onClick={() => {
                      setDemoAccount("customer@xonails.com");
                    }}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-neutral-50 active:scale-98 text-neutral-700 text-xs font-semibold rounded-full border border-neutral-200/80 shadow-2xs transition-all cursor-pointer group"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* FACEBOOK LOGIN */}
                  <button
                    type="button"
                    onClick={() => {
                      setDemoAccount("customer@xonails.com");
                    }}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-[#1877F2] hover:bg-[#166fe5] active:scale-98 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Demo Footer */}
            <div className="pt-2 mt-2 border-t border-black/5 flex items-center justify-between text-[10px]">
              <span className="text-neutral-500 font-medium">Demo shortcut:</span>
              <div className="flex gap-2 font-bold text-neutral-900">
                <button type="button" onClick={() => setDemoAccount("customer@xonails.com")} className="hover:text-[#c9776c] underline cursor-pointer">User</button>
                <span>•</span>
                <button type="button" onClick={() => setDemoAccount("admin@xonails.com")} className="hover:text-[#c9776c] underline cursor-pointer">Admin</button>
                <span>•</span>
                <button type="button" onClick={() => setDemoAccount("wholesale@xonails.com")} className="hover:text-[#c9776c] underline cursor-pointer">Wholesale</button>
              </div>
            </div>
          </div>

          {/* BLOCK 2: STANDALONE VIDEO REFERENCE CARD */}
          <div className="bg-neutral-900 text-white rounded-[24px] p-5 flex items-center justify-between relative overflow-hidden group shadow-lg h-[160px] shrink-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none"
            >
              <source src="/videos/1K34PRO84_DMCL0D.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-1">
              <h3 className="text-2xl font-bold tracking-tight font-serif text-white">
                References
              </h3>
              <p className="text-xs text-neutral-300 font-light">
                Handmade Press-on Atelier Showcase
              </p>
            </div>

            <Link
              href="/shop"
              className="relative z-10 px-4 py-2.5 bg-white/20 hover:bg-white hover:text-black text-white text-xs font-bold rounded-full transition-all duration-300 flex items-center gap-1.5 backdrop-blur-md border border-white/30 cursor-pointer"
            >
              <span>Discover</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (COL-SPAN-6): COMPACT BLOCK 3 WITH REALTIME DATE & SHOP BG */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-6 bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-rose-950/10 rounded-[32px] p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden h-full">
          
          {/* BACKGROUND IMAGE FROM SHOP AS REQUESTED */}
          <Image
            src="/images/shop-irl-bg.webp"
            alt="X-ON Shop Background"
            fill
            priority
            sizes="50vw"
            className="object-cover object-center opacity-15 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/80 pointer-events-none" />

          {/* Top Header Typography with REALTIME Month & Year */}
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-4xl sm:text-5xl font-bold tracking-tighter text-neutral-900 font-serif block">
                {currentDate.month}
              </span>
              <span className="text-3xl sm:text-4xl font-light tracking-tight text-neutral-400 font-serif block -mt-1">
                {currentDate.year}
              </span>
            </div>

            <div className="text-right text-[11px] text-neutral-500 font-medium">
              <p className="font-semibold text-neutral-800">Minimalism style</p>
              <p className="text-neutral-400">{currentDate.fullDate}</p>
            </div>
          </div>

          {/* Center Graphic & Glassmorphism Orb Art */}
          <div className="relative my-2 py-2 flex items-center justify-center flex-1 z-10">
            {/* Glowing Pink Sphere */}
            <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-[#f09a90] via-[#e57d72] to-[#c9776c] shadow-xl shadow-[#c9776c]/40 relative overflow-hidden flex items-center justify-center animate-pulse">
              <Image
                src="/images/login-nail-hero.webp"
                alt="Nail Art Showcase"
                fill
                priority
                sizes="250px"
                className="object-cover opacity-45 mix-blend-overlay scale-105"
              />
            </div>

            {/* Frosted Glass Overlay Card */}
            <div className="absolute left-2 sm:left-4 w-36 sm:w-44 h-36 sm:h-40 bg-white/65 backdrop-blur-md border border-white/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-md">
              <p className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest">
                X-ON Atelier
              </p>
              <div className="text-[10px] text-neutral-800 space-y-0.5">
                <p className="font-bold">Exclusive Drops {currentDate.year}</p>
                <p className="text-[9px] text-neutral-600">Handcrafted Atelier</p>
                <p className="text-[9px] text-neutral-600">Pinterest Collection</p>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer with Dynamic Embedded Switch Button */}
          <div className="relative z-10 flex items-center justify-between pt-3 border-t border-neutral-200/70">
            <div>
              <p className="text-xs font-bold text-neutral-900">
                {isLogin ? "New to X-ON Atelier?" : "Already registered?"}
              </p>
              <p className="text-[10px] text-neutral-500">
                {isLogin ? "Create your account for VIP access" : "Sign in to access your saved profile"}
              </p>
            </div>

            {/* DYNAMIC EMBEDDED BUTTON SWITCH */}
            <button
              type="button"
              onClick={() => {
                setMode(isLogin ? "register" : "login");
                setInvalidFields({});
              }}
              className="group flex items-center bg-neutral-900 hover:bg-black text-white pl-4 pr-1.5 py-2 rounded-full transition-all duration-300 cursor-pointer shadow-md"
            >
              <span className="text-xs font-bold mr-2.5">
                {isLogin ? "Sign up here" : "Login here"}
              </span>
              <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white group-hover:text-black flex items-center justify-center transition-all">
                <ArrowRight className="w-3.5 h-3.5 text-white group-hover:text-black transition-colors" />
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
