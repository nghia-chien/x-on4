"use client";

import React from "react";
import type { BlogBlock } from "@/components/blog/ArticleBody";

type ToggleBlockProps = {
  block: BlogBlock;
  onChange: (patch: Partial<BlogBlock>) => void;
};

export function ToggleBlock({ block, onChange }: ToggleBlockProps) {
  const open = block.toggleOpen !== false;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => onChange({ toggleOpen: !open })}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-white/5 text-left cursor-pointer"
      >
        <span
          className={`material-symbols-outlined text-[18px] transition-transform ${
            open ? "rotate-90" : ""
          }`}
        >
          chevron_right
        </span>
        <input
          value={block.toggleTitle || ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onChange({ toggleTitle: e.target.value })}
          placeholder="Toggle title"
          className="flex-1 bg-transparent text-sm font-bold outline-none text-slate-900 dark:text-white"
        />
      </button>
      {open && (
        <textarea
          value={block.text || ""}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={4}
          placeholder="Hidden content…"
          className="w-full px-3 py-2.5 text-sm bg-white dark:bg-transparent outline-none resize-y min-h-[96px]"
        />
      )}
    </div>
  );
}
