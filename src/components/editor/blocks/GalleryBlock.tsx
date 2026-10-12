"use client";

import React, { useRef } from "react";
import type { BlogBlock } from "@/components/blog/ArticleBody";
import OptimizedImage from "@/components/common/OptimizedImage";

type GalleryBlockProps = {
  block: BlogBlock;
  onChange: (patch: Partial<BlogBlock>) => void;
  onUploadFiles: (files: File[]) => Promise<string[]>;
};

export function GalleryBlock({ block, onChange, onUploadFiles }: GalleryBlockProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const urls = block.galleryUrls || [];
  const [lightbox, setLightbox] = React.useState<string | null>(null);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = await onUploadFiles(files);
    onChange({ galleryUrls: [...urls, ...uploaded] });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Gallery ({urls.length})
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-900 text-white cursor-pointer"
        >
          Add images
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePick}
        />
      </div>
      {urls.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-[21/9] rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 flex items-center justify-center text-xs text-slate-400 cursor-pointer"
        >
          Drop or browse images
        </button>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {urls.map((url) => (
            <div key={url} className="relative group rounded-xl overflow-hidden aspect-square">
              <button
                type="button"
                onClick={() => setLightbox(url)}
                className="w-full h-full cursor-zoom-in"
              >
                <OptimizedImage
                  src={url}
                  alt="Gallery"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                />
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({ galleryUrls: urls.filter((u) => u !== url) })
                }
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Lightbox"
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
