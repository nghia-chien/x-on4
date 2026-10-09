"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminRole, AdminUser } from "@/types/admin";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: AdminRole;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: AdminRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicAuthPage = pathname === "/admin/login" || pathname === "/admin/register";

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUser(json.data);
          setToken("active-cookie-session");
        } else {
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setUser(json.data.user);
        setToken(json.data.token || "active-cookie-session");
        setIsLoading(false);
        router.push("/admin");
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, message: json.message || "Failed to sign in" };
      }
    } catch (err) {
      console.error("Login request error:", err);
      setIsLoading(false);
      return { success: false, message: "Network error during sign in" };
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setUser(json.data.user);
        setToken(json.data.token || "active-cookie-session");
        setIsLoading(false);
        router.push("/admin");
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, message: json.message || "Failed to create account" };
      }
    } catch (err) {
      console.error("Register request error:", err);
      setIsLoading(false);
      return { success: false, message: "Network error during registration" };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      router.push("/admin/login");
    }
  };

  const hasRole = useCallback(
    (allowedRoles: AdminRole[]) => {
      if (!user) return false;
      // Super Admin and Administrator have unrestricted access across all admin features
      if (user.role === "Super Admin" || user.role === "Administrator") {
        return true;
      }
      return allowedRoles.includes(user.role);
    },
    [user]
  );

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        hasRole,
        refreshUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
