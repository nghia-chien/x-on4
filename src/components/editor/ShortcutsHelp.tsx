"use client";

import React from "react";

const ROWS: { keys: string; action: string }[] = [
  { keys: "Ctrl + B / I / U", action: "Bold / Italic / Underline" },
  { keys: "Ctrl + Z / Shift + Z", action: "Undo / Redo" },
  { keys: "Ctrl + S", action: "Save" },
  { keys: "Ctrl + K", action: "Insert link" },
  { keys: "Ctrl + Shift + 1…6", action: "Heading levels" },
  { keys: "Ctrl + Shift + 7 / 8", action: "Numbered / Bullet list" },
  { keys: "Ctrl + D", action: "Duplicate block" },
  { keys: "Ctrl + Shift + ↑ / ↓", action: "Move block" },
  { keys: "/", action: "Slash command menu" },
  { keys: "?", action: "This shortcuts panel" },
  { keys: "# Space", action: "Markdown → Heading" },
  { keys: "> / - / 1. Space", action: "Quote / Bullet / Number" },
  { keys: "``` / ---", action: "Code block / Divider" },
];

type ShortcutsHelpProps = {
  open: boolean;
  onClose: () => void;
};

export function ShortcutsHelp({ open, onClose }: ShortcutsHelpProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1a1426] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Keyboard shortcuts
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
          {ROWS.map((row) => (
            <li
              key={row.keys}
              className="px-5 py-2.5 flex items-center justify-between gap-4 text-xs"
            >
              <span className="text-slate-600 dark:text-slate-300">{row.action}</span>
              <kbd className="font-mono text-[10px] px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                {row.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
