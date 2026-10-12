"use client";

import React from "react";

type SeoPreviewCardProps = {
  title: string;
  slug: string;
  description: string;
  siteName?: string;
};

/** Live mock of a Google search result for SEO fields. */
export function SeoPreviewCard({
  title,
  slug,
  description,
  siteName = "xonails.com",
}: SeoPreviewCardProps) {
  const displayTitle = title.trim() || "Untitled article";
  const displayDesc =
    description.trim() || "Add a meta description to improve click-through rate.";
  const path = slug.trim() || "your-article-slug";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#120d20] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          SEO preview
        </h4>
        <span className="text-[10px] text-slate-400">
          Title {displayTitle.length}/60 · Desc {displayDesc.length}/160
        </span>
      </div>
      <div className="space-y-1 font-sans">
        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">
          https://{siteName}/blog/{path}
        </p>
        <p
          className={`text-base leading-snug text-[#1a0dab] dark:text-sky-400 line-clamp-2 ${
            displayTitle.length > 60 ? "decoration-rose-400 underline decoration-wavy" : ""
          }`}
        >
          {displayTitle}
        </p>
        <p
          className={`text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 ${
            displayDesc.length > 160 ? "decoration-rose-400 underline decoration-wavy" : ""
          }`}
        >
          {displayDesc}
        </p>
      </div>
    </div>
  );
}
