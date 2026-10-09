"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white font-sans">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          Redirecting to Registration...
        </span>
      </div>
    </div>
  );
}
