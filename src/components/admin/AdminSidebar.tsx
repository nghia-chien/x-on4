"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  Briefcase,
  FileText,
  Mail,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Users,
  ShieldAlert,
} from "lucide-react";
import { AdminRole } from "@/types/admin";

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
}

export function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAdminAuth();
  const [counts, setCounts] = React.useState<{
    wholesale: number;
    vipClub: number;
    contact: number;
    orders: number;
  }>({
    wholesale: 0,
    vipClub: 0,
    contact: 0,
    orders: 0,
  });

  React.useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("/api/admin/sidebar-counts");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setCounts(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sidebar counts:", err);
      }
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
    roles?: AdminRole[];
  }[] = [
    { label: "DASHBOARD", href: "/admin", icon: Home, exact: true },
    { label: "PRODUCT", href: "/admin/products", icon: ShoppingBag, roles: ["Super Admin", "Administrator", "Admin", "Editor"] },
    { label: "ORDER", href: "/admin/orders", icon: ShoppingCart, roles: ["Super Admin", "Administrator", "Admin"] },
    { label: "WHOLESALE", href: "/admin/wholesale", icon: Briefcase, roles: ["Super Admin", "Administrator", "Admin", "Wholesale Partner"] },
    { label: "JOURNAL", href: "/admin/blog", icon: FileText, roles: ["Super Admin", "Administrator", "Admin", "Editor"] },
    { label: "VIP CLUB", href: "/admin/newsletter", icon: Sparkles, roles: ["Super Admin", "Administrator", "Admin"] },
    { label: "CONTACT", href: "/admin/contact", icon: Mail, roles: ["Super Admin", "Administrator", "Admin", "Editor"] },
    { label: "ADMIN USERS", href: "/admin/admin-users", icon: Users, roles: ["Super Admin", "Administrator"] },
  ];

  const getBadgeCount = (label: string) => {
    switch (label) {
      case "WHOLESALE":
        return counts.wholesale;
      case "VIP CLUB":
        return counts.vipClub;
      case "CONTACT":
        return counts.contact;
      case "ORDER":
        return counts.orders;
      default:
        return 0;
    }
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return hasRole(item.roles);
  });

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-neutral-700 select-none">
      {/* Brand Header: Centered Large Logo linking to Main Store */}
      <div className="relative h-20 flex items-center justify-center px-3 border-b border-neutral-200">
        <Link
          href="/"
          title="Return to Main Website"
          className={`relative block transition-transform hover:scale-105 ${isCollapsed && !isMobileOpen ? "h-11 w-11" : "h-14 w-36 sm:w-44"
            }`}
          onClick={() => setIsMobileOpen(false)}
        >
          <Image
            src="/images/logo-xon.webp"
            alt="X-ON Nails"
            fill
            priority
            unoptimized
            sizes="200px"
            className="object-contain object-center"
          />
        </Link>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 p-1.5 hover:bg-neutral-100 rounded-lg cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 p-1.5 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-2">
          {(!isCollapsed || isMobileOpen) && "Management"}
        </div>

        {filteredNavItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          const badgeCount = getBadgeCount(item.label);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${active
                  ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80"
                }`}
              title={isCollapsed && !isMobileOpen ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${active ? "text-indigo-600" : "text-neutral-400 group-hover:text-neutral-600"
                  }`}
              />
              {(!isCollapsed || isMobileOpen) && (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {badgeCount > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-all shrink-0 ${
                        active
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : item.label === "WHOLESALE"
                          ? "bg-indigo-100 text-indigo-700 font-bold"
                          : item.label === "VIP CLUB"
                          ? "bg-amber-100 text-amber-800 font-bold"
                          : item.label === "CONTACT"
                          ? "bg-rose-100 text-rose-700 font-bold"
                          : "bg-neutral-200 text-neutral-800"
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </>
              )}

              {/* Active indicator dot or badge for collapsed sidebar */}
              {isCollapsed && !isMobileOpen && (
                <>
                  {badgeCount > 0 ? (
                    <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  ) : active ? (
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  ) : null}
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick links & User Info bottom bar */}
      <div className="p-3 border-t border-neutral-200 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>View Live Store</span>}
        </Link>

        {user && (
          <div
            className={`flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-200 ${isCollapsed && !isMobileOpen ? "justify-center" : ""
              }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-neutral-900 truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium truncate">{user.role}</span>
                </div>
              )}
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <button
                onClick={() => logout()}
                title="Logout"
                className="text-neutral-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out border-r border-neutral-200 bg-white ${isCollapsed ? "w-20" : "w-64"
          }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out bg-white border-r border-neutral-200 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
