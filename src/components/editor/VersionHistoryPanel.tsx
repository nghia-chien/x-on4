"use client";

import React from "react";
import type { EditorVersion } from "@/lib/editor/historyStore";

type VersionHistoryPanelProps = {
  open: boolean;
  versions: EditorVersion[];
  onRestore: (id: string) => void;
  onClose: () => void;
  onSnapshot: () => void;
};

export function VersionHistoryPanel({
  open,
  versions,
  onRestore,
  onClose,
  onSnapshot,
}: VersionHistoryPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75] flex justify-end bg-black/40 backdrop-blur-xs">
      <aside className="w-full max-w-sm h-full bg-white dark:bg-[#1a1426] border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Version history
            </h3>
            <p className="text-[11px] text-slate-400">Last 30 snapshots</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="p-3 border-b border-slate-100 dark:border-white/5">
          <button
            type="button"
            onClick={onSnapshot}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Save snapshot now
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {versions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No versions yet. Snapshots appear after autosave or manual save.
            </p>
          ) : (
            versions.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border border-slate-150 dark:border-white/10 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {v.label}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(v.createdAt).toLocaleString()} · {v.blocks.length}{" "}
                      blocks
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRestore(v.id)}
                    className="px-2 py-1 text-[10px] font-bold uppercase rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
