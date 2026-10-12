"use client";

import React from "react";
import type { AutosaveStatus } from "@/hooks/editor/useAutosave";

type EditorStatusBarProps = {
  wordCount: number;
  readingMinutes: number;
  blockCount: number;
  saveStatus: AutosaveStatus;
  lastSavedAt: Date | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePreview: () => void;
  onToggleFocus: () => void;
  onShowShortcuts: () => void;
  isPreview: boolean;
  isFocus: boolean;
};

function formatTime(d: Date | null) {
  if (!d) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function EditorStatusBar({
  wordCount,
  readingMinutes,
  blockCount,
  saveStatus,
  lastSavedAt,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onTogglePreview,
  onToggleFocus,
  onShowShortcuts,
  isPreview,
  isFocus,
}: EditorStatusBarProps) {
  const saveLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved" && lastSavedAt
        ? `Saved at ${formatTime(lastSavedAt)}`
        : saveStatus === "error"
          ? "Save failed"
          : "Unsaved changes";

  return (
    <div className="sticky bottom-0 z-40 border-t border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#1a1426]/95 backdrop-blur-md px-3 py-2 flex flex-wrap items-center gap-2 justify-between text-[11px] text-slate-500">
      <div className="flex items-center gap-3">
        <span>
          <strong className="text-slate-800 dark:text-slate-200">{wordCount}</strong> words
        </span>
        <span>·</span>
        <span>{readingMinutes} min read</span>
        <span>·</span>
        <span>{blockCount} blocks</span>
        <span
          className={`ml-1 font-semibold ${
            saveStatus === "saving"
              ? "text-amber-600"
              : saveStatus === "saved"
                ? "text-emerald-600"
                : saveStatus === "error"
                  ? "text-rose-600"
                  : "text-slate-500"
          }`}
        >
          {saveLabel}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={onUndo}
          className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">undo</span>
        </button>
        <button
          type="button"
          title="Redo (Ctrl+Shift+Z)"
          disabled={!canRedo}
          onClick={onRedo}
          className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">redo</span>
        </button>
        <button
          type="button"
          title="Preview"
          onClick={onTogglePreview}
          className={`px-2 py-1 rounded-lg cursor-pointer ${
            isPreview ? "bg-rose-50 text-rose-600" : "hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          Preview
        </button>
        <button
          type="button"
          title="Focus mode"
          onClick={onToggleFocus}
          className={`px-2 py-1 rounded-lg cursor-pointer ${
            isFocus ? "bg-rose-50 text-rose-600" : "hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          Focus
        </button>
        <button
          type="button"
          title="Keyboard shortcuts (?)"
          onClick={onShowShortcuts}
          className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
        >
          ?
        </button>
      </div>
    </div>
  );
}
