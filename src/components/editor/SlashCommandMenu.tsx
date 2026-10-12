"use client";

import React from "react";
import type { SlashCommand } from "@/lib/editor/constants";

type SlashCommandMenuProps = {
  open: boolean;
  top: number;
  left: number;
  query: string;
  items: SlashCommand[];
  activeIndex: number;
  onHover: (index: number) => void;
  onSelect: (cmd: SlashCommand) => void;
  onClose: () => void;
};

export function SlashCommandMenu({
  open,
  top,
  left,
  query,
  items,
  activeIndex,
  onHover,
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  if (!open) return null;

  return (
    <div
      className="fixed z-[70] w-72 max-h-80 overflow-y-auto rounded-2xl bg-white dark:bg-[#1a1426] border border-slate-200 dark:border-white/10 shadow-2xl"
      style={{ top, left }}
      role="listbox"
      aria-label="Slash commands"
    >
      <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Insert block {query ? `· /${query}` : ""}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs cursor-pointer"
        >
          Esc
        </button>
      </div>
      {items.length === 0 ? (
        <p className="px-3 py-4 text-xs text-slate-400">No matching blocks</p>
      ) : (
        <ul className="py-1">
          {items.map((item, idx) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={idx === activeIndex}
                onMouseEnter={() => onHover(idx)}
                onClick={() => onSelect(item)}
                className={`w-full px-3 py-2 flex items-start gap-2.5 text-left cursor-pointer ${
                  idx === activeIndex
                    ? "bg-rose-50 dark:bg-rose-500/10"
                    : "hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-rose-500 mt-0.5">
                  {item.icon}
                </span>
                <span>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">
                    {item.label}
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    {item.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
