"use client";

import React from "react";

export function DropOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-3xl border-2 border-dashed border-rose-400 bg-rose-500/10 backdrop-blur-[2px]">
      <div className="px-5 py-4 rounded-2xl bg-white/90 dark:bg-[#1a1426]/90 shadow-xl text-center">
        <span className="material-symbols-outlined text-rose-500 text-3xl">
          upload_file
        </span>
        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
          Drop images or videos to upload
        </p>
        <p className="text-[11px] text-slate-500">Uses the existing /api/upload endpoint</p>
      </div>
    </div>
  );
}
