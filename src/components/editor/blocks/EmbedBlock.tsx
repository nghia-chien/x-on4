"use client";

import React from "react";
import type { BlogBlock } from "@/components/blog/ArticleBody";
import { formatVideoEmbedUrl } from "@/lib/mediaOptimizer";

function detectProvider(url: string): BlogBlock["embedProvider"] {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("instagram.com")) return "instagram";
  return "generic";
}

type EmbedBlockProps = {
  block: BlogBlock;
  onChange: (patch: Partial<BlogBlock>) => void;
};

export function EmbedBlock({ block, onChange }: EmbedBlockProps) {
  const url = block.url || "";
  const provider = block.embedProvider || detectProvider(url);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-white/10 p-3">
      <input
        value={url}
        onChange={(e) => {
          const next = e.target.value;
          onChange({
            url: next,
            embedProvider: detectProvider(next),
          });
        }}
        placeholder="Paste YouTube / Twitter / Instagram URL…"
        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs outline-none"
      />
      {url ? (
        provider === "youtube" ? (
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              src={formatVideoEmbedUrl(url)}
              title="YouTube embed"
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-sky-600 hover:underline break-all"
          >
            Open {provider} embed → {url}
          </a>
        )
      ) : (
        <p className="text-xs text-slate-400 text-center py-6">
          Embed preview appears after pasting a URL
        </p>
      )}
    </div>
  );
}
