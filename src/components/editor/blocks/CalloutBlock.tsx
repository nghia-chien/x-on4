"use client";

import React from "react";
import type { BlogBlock } from "@/components/blog/ArticleBody";

const VARIANT: Record<
  NonNullable<BlogBlock["calloutVariant"]>,
  { wrap: string; icon: string; label: string }
> = {
  info: {
    wrap: "bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-100",
    icon: "info",
    label: "Info",
  },
  warn: {
    wrap: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100",
    icon: "warning",
    label: "Warning",
  },
  success: {
    wrap: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-100",
    icon: "check_circle",
    label: "Success",
  },
  error: {
    wrap: "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-100",
    icon: "error",
    label: "Error",
  },
};

type CalloutBlockProps = {
  block: BlogBlock;
  onChange: (patch: Partial<BlogBlock>) => void;
};

export function CalloutBlock({ block, onChange }: CalloutBlockProps) {
  const variant = block.calloutVariant || "info";
  const meta = VARIANT[variant];

  return (
    <div className={`rounded-2xl border p-4 ${meta.wrap}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-[18px]">{meta.icon}</span>
        <select
          value={variant}
          onChange={(e) =>
            onChange({
              calloutVariant: e.target.value as BlogBlock["calloutVariant"],
            })
          }
          className="text-[11px] font-bold uppercase bg-transparent outline-none cursor-pointer"
        >
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
        </select>
      </div>
      <textarea
        value={block.text || ""}
        onChange={(e) => onChange({ text: e.target.value })}
        rows={3}
        placeholder="Callout message…"
        className="w-full bg-transparent text-sm outline-none resize-y min-h-[72px]"
      />
    </div>
  );
}
