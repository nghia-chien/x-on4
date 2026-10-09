"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useCart } from "@/context/CartContext";
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  MapPin,
  Sparkles,
  LogOut,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c]";

export default function MyAccountPage() {
  const router = useRouter();
  const { user, login, register, logout, isLoading } = useAdminAuth();

  // Redirect admin users immediately to admin dashboard
  useEffect(() => {
    if (
      user &&
      (user.role === "Super Admin" ||
        user.role === "Administrator" ||
        user.role === "Admin" ||
        user.role === "Editor")
    ) {
      router.push("/admin");
    }
  }, [user, router]);

  // Auth Forms State
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [regEmail, setRegEmail] = useState("");
  const [regName, setRegName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [regError, setRegError] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Lost Password Modal
  const [lostPasswordOpen, setLostPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Dashboard Active Tab for Logged In Customer
  const [customerTab, setCustomerTab] = useState<"dashboard" | "orders" | "details">("dashboard");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSubmitting(true);

    const res = await login(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.message || "Invalid email or password. Please try again.");
      setLoginSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSubmitting(true);

    const res = await register({
      email: regEmail,
      name: regName || regEmail.split("@")[0],
      password: regPassword,
      role: "Retail Customer",
    });

    if (!res.success) {
      setRegError(res.message || "Failed to create account. Please check your details.");
      setRegSubmitting(false);
    }
  };

  const handleLostPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetEmail.includes("@")) {
      setResetSent(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 text-gray-900">
        <div className="w-10 h-10 border-3 border-[#c9776c] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
          Loading My Account...
        </p>
      </div>
    );
  }

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
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-[#c9776c]">
            <li>
              <Link href="/" className={`hover:text-[#b8897a] transition-colors ${focusRing}`}>
                Home
              </Link>
            </li>
            <span className="text-[#c9776c]/60">/</span>
            <li className="text-gray-900 font-bold" aria-current="page">
              My Account
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <header className="text-center pt-2 pb-4 space-y-3 max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight text-gray-900">
            My Account
          </h1>
          <div className="mx-auto h-px w-16 bg-[#c9776c]" />
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto font-light leading-relaxed">
            {user
              ? `Manage your orders, account details, and VIP perks.`
              : `Sign in to track orders, access your personal profile, and manage saved designs.`}
          </p>
        </header>

        {/* LOGGED IN CUSTOMER DASHBOARD */}
        {user ? (
          <div className="bg-white/90 backdrop-blur-xs rounded-3xl border border-[#eedad7] shadow-sm p-6 sm:p-10 lg:p-12 space-y-8">
            {/* Customer Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#eedad7] gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#c9776c] to-rose-400 text-white font-bold text-xl flex items-center justify-center shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-semibold text-gray-900">
                    Hello, {user.name}
                  </h2>
                  <p className="text-xs text-gray-500 font-light">
                    Role: <span className="font-bold text-[#c9776c] uppercase">{user.role}</span> &bull; {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={logout}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer ${focusRing}`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="flex items-center gap-2 border-b border-[#eedad7] pb-1">
              <button
                type="button"
                onClick={() => setCustomerTab("dashboard")}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  customerTab === "dashboard"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => setCustomerTab("orders")}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  customerTab === "orders"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Orders
              </button>
              <button
                type="button"
                onClick={() => setCustomerTab("details")}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  customerTab === "details"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Account Details
              </button>
            </div>

            {/* Tab Contents */}
            {customerTab === "dashboard" && (
              <div className="space-y-6 pt-2">
                <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                  From your account dashboard you can view your <button onClick={() => setCustomerTab("orders")} className="text-[#c9776c] font-bold underline cursor-pointer">recent orders</button>, manage your shipping and billing addresses, and edit your password and account details.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div
                    onClick={() => setCustomerTab("orders")}
                    className="p-5 rounded-2xl bg-[#faece9]/50 border border-[#eedad7] hover:border-[#c9776c] transition-all cursor-pointer space-y-2 group"
                  >
                    <PackageCheck className="w-6 h-6 text-[#c9776c] group-hover:scale-110 transition-transform" />
                    <h3 className="font-serif font-bold text-sm text-gray-900 uppercase tracking-wider">
                      Orders History
                    </h3>
                    <p className="text-xs text-gray-500 font-light">
                      Track active deliveries &amp; view past orders.
                    </p>
                  </div>

                  <div
                    onClick={() => setCustomerTab("details")}
                    className="p-5 rounded-2xl bg-[#faece9]/50 border border-[#eedad7] hover:border-[#c9776c] transition-all cursor-pointer space-y-2 group"
                  >
                    <User className="w-6 h-6 text-[#c9776c] group-hover:scale-110 transition-transform" />
                    <h3 className="font-serif font-bold text-sm text-gray-900 uppercase tracking-wider">
                      Account Profile
                    </h3>
                    <p className="text-xs text-gray-500 font-light">
                      Update contact name, email &amp; security password.
                    </p>
                  </div>

                  <Link
                    href="/shop"
                    className="p-5 rounded-2xl bg-[#faece9]/50 border border-[#eedad7] hover:border-[#c9776c] transition-all cursor-pointer space-y-2 group block"
                  >
                    <Sparkles className="w-6 h-6 text-[#c9776c] group-hover:scale-110 transition-transform" />
                    <h3 className="font-serif font-bold text-sm text-gray-900 uppercase tracking-wider">
                      VIP Atelier Shop
                    </h3>
                    <p className="text-xs text-gray-500 font-light">
                      Browse handmade nails &amp; exclusive releases.
                    </p>
                  </Link>
                </div>
              </div>
            )}

            {customerTab === "orders" && (
              <div className="space-y-4 pt-2">
                <h3 className="font-serif text-lg font-bold text-gray-900">Your Orders</h3>
                <div className="p-8 text-center border border-dashed border-[#eedad7] rounded-2xl bg-[#faece9]/20 space-y-3">
                  <PackageCheck className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs text-gray-600 font-light">
                    No orders have been placed yet.
                  </p>
                  <Link
                    href="/shop"
                    className={`inline-flex items-center gap-1.5 px-6 py-2.5 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-black transition-all ${focusRing}`}
                  >
                    <span>Browse Shop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {customerTab === "details" && (
              <div className="space-y-4 pt-2 max-w-lg">
                <h3 className="font-serif text-lg font-bold text-gray-900">Account Details</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-500 font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      disabled
                      value={user.name}
                      className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 italic pt-2">
                    To modify account credentials, contact support or log in via Admin portal.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* NOT LOGGED IN: SIDE-BY-SIDE DUAL LOGIN & REGISTER FORMS */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-5xl mx-auto">
            {/* 1. LOGIN FORM */}
            <div className="bg-white/90 backdrop-blur-xs rounded-3xl border border-[#eedad7] shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-gray-900 tracking-tight">
                  Login
                </h2>
                <div className="w-12 h-px bg-[#c9776c] mt-1.5" />
              </div>

              {loginError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
                    Username or email address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="email@example.com"
                      className={`w-full pl-10 pr-4 py-3 bg-white border border-[#eedad7] focus:border-gray-900 rounded-2xl text-xs text-gray-900 placeholder-gray-400 transition-all outline-none ${focusRing}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-4 py-3 bg-white border border-[#eedad7] focus:border-gray-900 rounded-2xl text-xs text-gray-900 placeholder-gray-400 transition-all outline-none ${focusRing}`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 border-[#eedad7] text-gray-900 rounded-xs focus:ring-0 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setLostPasswordOpen(true)}
                    className="text-[#c9776c] font-bold hover:underline cursor-pointer"
                  >
                    Lost your password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loginSubmitting}
                  className={`w-full py-3.5 px-6 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${focusRing}`}
                >
                  {loginSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Log In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 2. REGISTER FORM */}
            <div className="bg-white/90 backdrop-blur-xs rounded-3xl border border-[#eedad7] shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-gray-900 tracking-tight">
                  Register
                </h2>
                <div className="w-12 h-px bg-[#c9776c] mt-1.5" />
              </div>

              {regError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
                    Full Name <span className="text-[#c9776c] font-normal text-[10px]">(optional)</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Jessica Miller"
                      className={`w-full pl-10 pr-4 py-3 bg-white border border-[#eedad7] focus:border-gray-900 rounded-2xl text-xs text-gray-900 placeholder-gray-400 transition-all outline-none ${focusRing}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
                    Email address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="yourname@domain.com"
                      className={`w-full pl-10 pr-4 py-3 bg-white border border-[#eedad7] focus:border-gray-900 rounded-2xl text-xs text-gray-900 placeholder-gray-400 transition-all outline-none ${focusRing}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create a password (min. 6 chars)"
                      className={`w-full pl-10 pr-4 py-3 bg-white border border-[#eedad7] focus:border-gray-900 rounded-2xl text-xs text-gray-900 placeholder-gray-400 transition-all outline-none ${focusRing}`}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-1 text-xs font-light text-gray-600 leading-relaxed">
                  <label className="flex items-start gap-2 cursor-pointer text-gray-700">
                    <input
                      type="checkbox"
                      checked={subscribeNewsletter}
                      onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                      className="w-4 h-4 border-[#eedad7] text-gray-900 rounded-xs focus:ring-0 cursor-pointer mt-0.5"
                    />
                    <span>Subscribe to X-ON Atelier updates &amp; exclusive handmade nail releases.</span>
                  </label>

                  <p className="text-[11px] text-gray-500 leading-normal border-t border-[#eedad7]/60 pt-2 font-light">
                    Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our{" "}
                    <Link href="/privacy-policy" className="text-[#c9776c] font-bold underline">
                      privacy policy
                    </Link>.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={regSubmitting}
                  className={`w-full py-3.5 px-6 bg-[#c9776c] hover:bg-[#b8897a] text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${focusRing}`}
                >
                  {regSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Register</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* LOST PASSWORD MODAL */}
        {lostPasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => {
                setLostPasswordOpen(false);
                setResetSent(false);
              }}
            />
            <div className="relative bg-white rounded-3xl border border-[#eedad7] shadow-2xl p-6 sm:p-8 max-w-md w-full z-10 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-gray-900">
                  Reset Password
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setLostPasswordOpen(false);
                    setResetSent(false);
                  }}
                  className="text-gray-400 hover:text-gray-900 text-xs font-bold uppercase tracking-wider p-1"
                >
                  Close
                </button>
              </div>

              {resetSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Password Reset Link Sent</span>
                  </div>
                  <p className="font-light">
                    If an account associated with <strong>{resetEmail}</strong> exists, you will receive an email with instructions to reset your password.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLostPasswordSubmit} className="space-y-4">
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    Lost your password? Please enter your username or email address. You will receive a link to create a new password via email.
                  </p>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
                      Username or email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="yourname@domain.com"
                      className={`w-full px-4 py-2.5 bg-white border border-[#eedad7] focus:border-gray-900 rounded-2xl text-xs text-gray-900 transition-all outline-none ${focusRing}`}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-3 px-6 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all ${focusRing}`}
                  >
                    Reset Password
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
