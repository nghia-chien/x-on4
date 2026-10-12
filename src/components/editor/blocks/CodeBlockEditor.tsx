"use client";

import React from "react";
import type { BlogBlock } from "@/components/blog/ArticleBody";

const LANGS = [
  "plaintext",
  "javascript",
  "typescript",
  "tsx",
  "css",
  "html",
  "json",
  "bash",
  "python",
];

type CodeBlockEditorProps = {
  block: BlogBlock;
  onChange: (patch: Partial<BlogBlock>) => void;
};

/** Lightweight code editor (Prism/Shiki can be layered later). */
export function CodeBlockEditor({ block, onChange }: CodeBlockEditorProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-400">Code</span>
        <select
          value={block.language || "plaintext"}
          onChange={(e) => onChange({ language: e.target.value })}
          className="text-[11px] bg-slate-900 text-slate-200 rounded-md px-2 py-1 outline-none cursor-pointer"
        >
          {LANGS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={block.code || block.text || ""}
        onChange={(e) => onChange({ code: e.target.value, text: e.target.value })}
        spellCheck={false}
        rows={8}
        placeholder="// Write code…"
        className="w-full p-4 bg-transparent text-[#4cd7f6] font-mono text-xs sm:text-sm outline-none resize-y min-h-[160px]"
      />
    </div>
  );
}
