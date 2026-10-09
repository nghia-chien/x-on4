"use client";

import React, { useState, useEffect } from "react";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { usePathname, useRouter } from "next/navigation";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAdminAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isPublicAuthPage = pathname === "/admin/login" || pathname === "/admin/register";

  useEffect(() => {
    if (!isLoading && !user && !isPublicAuthPage) {
      router.push("/admin/login");
    }
  }, [isLoading, user, isPublicAuthPage, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white gap-4 font-sans">
        <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          Authenticating X-ON Admin Session...
        </p>
      </div>
    );
  }

  // If on login or register page, render clean full-page auth screen without sidebar
  if (isPublicAuthPage) {
    return <>{children}</>;
  }

  // If not logged in, render null while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col antialiased font-sans">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <AdminHeader onOpenMobileMenu={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </ToastProvider>
    </AdminAuthProvider>
  );
}
