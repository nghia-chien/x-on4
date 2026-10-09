"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { DashboardStats } from "@/types/admin";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Briefcase,
  ArrowUpRight,
  AlertCircle,
  Plus,
  Sparkles,
  RefreshCw,
  FileText,
  Settings,
  CheckCircle2,
  Mail,
  Building2,
  Layers,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inquiriesTab, setInquiriesTab] = useState<"wholesale" | "contact">("wholesale");

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      }
    } catch (e) {
      console.error("Failed to load dashboard stats:", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  // 6 KPI cards strictly aligned with real DataStore calculations & linking to screens
  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00",
      subtext: "Gross paid earnings",
      href: "/admin/orders",
      icon: DollarSign,
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50/80",
    },
    {
      title: "Total Orders",
      value: stats ? stats.totalOrders.toString() : "0",
      subtext: stats?.pendingOrders ? `${stats.pendingOrders} pending fulfillment` : "All order states logged",
      href: "/admin/orders",
      icon: ShoppingBag,
      textColor: "text-[#c9776c]",
      bgColor: "bg-rose-50/80",
    },
    {
      title: "Active Products",
      value: stats ? stats.totalProducts.toString() : "0",
      subtext: "Live press-on sets",
      href: "/admin/products",
      icon: Package,
      textColor: "text-indigo-700",
      bgColor: "bg-indigo-50/80",
    },
    {
      title: "Total Customers",
      value: stats ? stats.totalCustomers.toString() : "0",
      subtext: "Registered profiles",
      href: "/admin/customers",
      icon: Users,
      textColor: "text-sky-700",
      bgColor: "bg-sky-50/80",
    },
    {
      title: "VIP Club Members",
      value: stats ? (stats.vipSubscribersCount ?? 0).toString() : "0",
      subtext: "Email subscribers",
      href: "/admin/newsletter",
      icon: Sparkles,
      textColor: "text-purple-700",
      bgColor: "bg-purple-50/80",
    },
    {
      title: "Wholesale & Leads",
      value: stats ? ((stats.wholesaleRequests ?? 0) + (stats.contactMessagesCount ?? 0)).toString() : "0",
      subtext: "Partner & contact leads",
      href: "/admin/wholesale",
      icon: Briefcase,
      textColor: "text-amber-700",
      bgColor: "bg-amber-50/80",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c9776c] animate-pulse" />
            <h1 className="text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Shop Overview
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
            Real-time operations &amp; inventory control panel for X-ON Nails Atelier
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1 sm:flex-initial py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold"
            title="Refresh Store Analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/products?new=true"
            className="flex-1 sm:flex-initial py-2 px-3.5 bg-[#c9776c] hover:bg-[#b5675c] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions Panel - Mobile Optimized Grid */}
      <div className="bg-neutral-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm space-y-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c9776c]">
            Quick Admin Shortcuts
          </span>
          <h2 className="text-xs sm:text-sm font-bold text-white mt-0.5">
            Frequent Creation &amp; Store Actions
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <Link
            href="/admin/products?new=true"
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-semibold rounded-xl border border-white/15 transition-all flex items-center justify-center sm:justify-start gap-1.5"
          >
            <Package className="w-3.5 h-3.5 text-rose-300" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/blog?new=true"
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-semibold rounded-xl border border-white/15 transition-all flex items-center justify-center sm:justify-start gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Add Blog Post</span>
          </Link>
          <Link
            href="/admin/gallery?new=true"
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-semibold rounded-xl border border-white/15 transition-all flex items-center justify-center sm:justify-start gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-sky-300" />
            <span>Add Gallery Item</span>
          </Link>
          <Link
            href="/admin/settings"
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-semibold rounded-xl border border-white/15 transition-all flex items-center justify-center sm:justify-start gap-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-purple-300" />
            <span>Edit Store Info</span>
          </Link>
        </div>
      </div>

      {/* 6 Clickable KPI Cards - Responsive Grid 2 Cols on Mobile, 3 on Tablet, 6 on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="bg-white rounded-2xl border border-neutral-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between hover:border-[#c9776c]/40 hover:shadow-xs transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 truncate mr-1">
                  {card.title}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${card.bgColor} ${card.textColor} shrink-0`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  {isLoading ? (
                    <div className="h-6 w-16 bg-neutral-100 animate-pulse rounded" />
                  ) : (
                    card.value
                  )}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5 truncate">
                  {card.subtext}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Grid Layout: Orders, Wholesale/Inquiries, Best Sellers, Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left Column (2 Cols): Orders Table + Wholesale/Inquiries Tabbed Panel */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Recent Orders Panel - Responsive Card View on Mobile */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-6 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-neutral-900">Recent Orders</h2>
                <p className="text-[11px] sm:text-xs text-neutral-400">Purchases awaiting fulfillment</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-[#c9776c] hover:text-[#b5675c] flex items-center gap-1 transition-colors"
              >
                <span>All Orders</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-neutral-400 font-semibold uppercase tracking-wider border-b border-neutral-100">
                  <tr>
                    <th className="pb-3 whitespace-nowrap">Order ID</th>
                    <th className="pb-3 min-w-[140px]">Customer</th>
                    <th className="pb-3 whitespace-nowrap">Amount</th>
                    <th className="pb-3 whitespace-nowrap">Payment</th>
                    <th className="pb-3 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="py-3"><div className="h-4 w-16 bg-neutral-100 animate-pulse rounded" /></td>
                        <td className="py-3"><div className="h-4 w-28 bg-neutral-100 animate-pulse rounded" /></td>
                        <td className="py-3"><div className="h-4 w-12 bg-neutral-100 animate-pulse rounded" /></td>
                        <td className="py-3"><div className="h-4 w-14 bg-neutral-100 animate-pulse rounded" /></td>
                        <td className="py-3"><div className="h-4 w-16 bg-neutral-100 animate-pulse rounded" /></td>
                      </tr>
                    ))
                  ) : stats?.recentOrders?.length ? (
                    stats.recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 font-semibold text-neutral-900 whitespace-nowrap">
                          <Link href={`/admin/orders/${ord.id}`} className="hover:text-[#c9776c] hover:underline">
                            {ord.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3">
                          <div className="font-medium text-neutral-900 whitespace-nowrap">{ord.customer.name}</div>
                          <div className="text-[11px] text-neutral-400 whitespace-nowrap">{ord.customer.email}</div>
                        </td>
                        <td className="py-3 font-bold text-neutral-900 whitespace-nowrap">
                          ${ord.total.toFixed(2)}
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase inline-block ${
                              ord.paymentStatus === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                                : "bg-amber-50 text-amber-700 border border-amber-200/80"
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase inline-block ${
                              ord.orderStatus === "delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : ord.orderStatus === "shipped"
                                ? "bg-sky-100 text-sky-800"
                                : ord.orderStatus === "processing"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-400 text-xs">
                        No recent customer orders.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Card List View */}
            <div className="sm:hidden space-y-2.5">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 bg-neutral-50 rounded-xl animate-pulse h-16" />
                ))
              ) : stats?.recentOrders?.length ? (
                stats.recentOrders.map((ord) => (
                  <Link
                    key={ord.id}
                    href={`/admin/orders/${ord.id}`}
                    className="block p-3 bg-neutral-50/70 hover:bg-neutral-100/60 rounded-xl border border-neutral-200/60 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-neutral-900">{ord.orderNumber}</span>
                      <span className="font-bold text-xs text-[#c9776c]">${ord.total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="truncate">{ord.customer.name}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[9px] uppercase">
                        {ord.orderStatus}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-6 text-center text-neutral-400 text-xs">No recent customer orders.</div>
              )}
            </div>
          </div>

          {/* Wholesale Applications & Contact Inquiries Panel */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-6 shadow-2xs flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setInquiriesTab("wholesale")}
                  className={`text-[11px] sm:text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    inquiriesTab === "wholesale"
                      ? "bg-[#c9776c] text-white shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  Wholesale ({stats?.recentWholesale?.length ?? 0})
                </button>
                <button
                  onClick={() => setInquiriesTab("contact")}
                  className={`text-[11px] sm:text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    inquiriesTab === "contact"
                      ? "bg-[#c9776c] text-white shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  Messages ({stats?.recentContacts?.length ?? 0})
                </button>
              </div>

              <Link
                href={inquiriesTab === "wholesale" ? "/admin/wholesale" : "/admin/contact"}
                className="text-xs font-bold text-[#c9776c] hover:text-[#b5675c] flex items-center gap-1 self-end sm:self-auto"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Wholesale Tab View */}
            {inquiriesTab === "wholesale" && (
              <div className="space-y-2.5">
                {stats?.recentWholesale?.length ? (
                  stats.recentWholesale.map((w) => (
                    <div
                      key={w.id}
                      className="p-2.5 sm:p-3 bg-neutral-50/70 hover:bg-neutral-100/60 rounded-xl border border-neutral-200/60 flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-neutral-900 truncate">{w.businessName}</p>
                            <span className="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-700 font-bold rounded uppercase shrink-0">
                              {w.status}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate">
                            {w.contactName} ({w.email})
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/admin/wholesale"
                        className="text-xs font-semibold text-neutral-600 hover:text-[#c9776c] shrink-0"
                      >
                        Review
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-neutral-400 space-y-1">
                    <Briefcase className="w-5 h-5 text-neutral-300 mx-auto" />
                    <p className="text-xs">No pending wholesale requests.</p>
                  </div>
                )}
              </div>
            )}

            {/* Contact Messages Tab View */}
            {inquiriesTab === "contact" && (
              <div className="space-y-2.5">
                {stats?.recentContacts?.length ? (
                  stats.recentContacts.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 sm:p-3 bg-neutral-50/70 hover:bg-neutral-100/60 rounded-xl border border-neutral-200/60 flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-1.5 bg-sky-100 text-sky-800 rounded-lg shrink-0 mt-0.5">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-neutral-900 truncate">{c.subject}</p>
                            <span className="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 font-bold rounded uppercase shrink-0">
                              {c.status}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate">
                            From: {c.name} ({c.email})
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/admin/contact"
                        className="text-xs font-semibold text-neutral-600 hover:text-[#c9776c] shrink-0"
                      >
                        Reply
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-neutral-400 space-y-1">
                    <Mail className="w-5 h-5 text-neutral-300 mx-auto" />
                    <p className="text-xs">No contact messages received yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Best Sellers & Low Stock Warning */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Top Best Sellers Card */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-2xs">
            <h2 className="text-xs sm:text-sm font-bold text-neutral-900 mb-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Top Best Sellers</span>
            </h2>
            <p className="text-[11px] text-neutral-400 mb-3">Highest volume press-on nail sets</p>

            <div className="space-y-2.5">
              {stats?.bestSellingProducts?.length ? (
                stats.bestSellingProducts.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-neutral-50 transition-colors">
                    <div className="relative w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-100">
                      <Image
                        src={item.image || "/images/IMG_7098.webp"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {item.quantitySold} sets sold
                      </p>
                    </div>
                    <div className="text-xs font-extrabold text-neutral-900">
                      ${item.revenue.toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-neutral-400 text-xs">
                  No sales data recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Warning Card */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center gap-1.5 mb-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <h2 className="text-xs sm:text-sm font-bold text-neutral-900">
                Low Stock Warning
              </h2>
            </div>
            <p className="text-[11px] text-neutral-400 mb-3">Inventory items requiring restock</p>

            <div className="space-y-2">
              {stats?.lowStockProducts?.length ? (
                stats.lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-rose-50/50 border border-rose-100 text-xs"
                  >
                    <div className="truncate mr-2">
                      <p className="font-semibold text-neutral-900 truncate text-[11px]">{p.name}</p>
                      <p className="text-[9px] text-neutral-500">{p.sku}</p>
                    </div>
                    <Link
                      href={`/admin/products?search=${encodeURIComponent(p.sku)}`}
                      className="px-2 py-0.5 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[9px] shrink-0 transition-colors"
                    >
                      {p.stock} left
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px]">Inventory levels healthy</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
