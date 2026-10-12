"use client";

import { useCallback, useMemo, useState } from "react";
import { SLASH_COMMANDS, type SlashCommand } from "@/lib/editor/constants";

export type SlashMenuState = {
  open: boolean;
  query: string;
  position: { top: number; left: number } | null;
  activeIndex: number;
  filtered: SlashCommand[];
  openAt: (pos: { top: number; left: number }, query?: string) => void;
  setQuery: (q: string) => void;
  close: () => void;
  move: (delta: number) => void;
  selected: SlashCommand | null;
};

export function useSlashMenu(): SlashMenuState {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q)) ||
        c.description.toLowerCase().includes(q)
    );
  }, [query]);

  const openAt = useCallback((pos: { top: number; left: number }, q = "") => {
    setPosition(pos);
    setQuery(q);
    setActiveIndex(0);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setPosition(null);
    setActiveIndex(0);
  }, []);

  const move = useCallback(
    (delta: number) => {
      if (!filtered.length) return;
      setActiveIndex((i) => (i + delta + filtered.length) % filtered.length);
    },
    [filtered.length]
  );

  return {
    open,
    query,
    position,
    activeIndex,
    filtered,
    openAt,
    setQuery: (q: string) => {
      setQuery(q);
      setActiveIndex(0);
    },
    close,
    move,
    selected: filtered[activeIndex] || null,
  };
}
