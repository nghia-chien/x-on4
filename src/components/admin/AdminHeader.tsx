"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  Menu,
  User,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
}

export function AdminHeader({ onOpenMobileMenu }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((seg, idx) => {
    const url = "/" + pathSegments.slice(0, idx + 1).join("/");
    const label =
      seg === "admin"
        ? "Dashboard"
        : seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    return { url, label };
  });

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-neutral-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb path */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-neutral-500">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.url}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
                {isLast ? (
                  <span className="text-neutral-900 font-semibold">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.url}
                    className="hover:text-neutral-800 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: User profile dropdown */}
      <div className="flex items-center gap-3">

        {/* User profile dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-neutral-900 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-amber-600 font-medium">
                  {user.role}
                </span>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-neutral-100">
                  <p className="text-xs font-bold text-neutral-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-neutral-400" />
                    <span>Store Settings</span>
                  </Link>

                  {user.role === "Admin" && (
                    <Link
                      href="/admin/admin-users"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                    >
                      <User className="w-4 h-4 text-neutral-400" />
                      <span>Admin Accounts</span>
                    </Link>
                  )}
                </div>

                <div className="border-t border-neutral-100 pt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
