"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SortableBlockWrapperProps = {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
};

/** Drag handle + sortable shell. Block `id` is the DnD identity (not index). */
export function SortableBlockWrapper({
  id,
  children,
  disabled = false,
}: SortableBlockWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative pl-8">
      <button
        type="button"
        title="Drag to reorder"
        className="absolute left-0 top-2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
      </button>
      {children}
    </div>
  );
}
