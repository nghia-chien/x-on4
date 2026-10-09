"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white font-sans">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          Redirecting to Sign In...
        </span>
      </div>
    </div>
  );
}
