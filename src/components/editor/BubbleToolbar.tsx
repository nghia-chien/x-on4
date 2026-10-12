"use client";

import React from "react";

type BubbleToolbarProps = {
  visible: boolean;
  top: number;
  left: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrike?: boolean;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrike: () => void;
  onCode: () => void;
  onLink: () => void;
  onColor: () => void;
  onHighlight: () => void;
};

function ToolBtn({
  active,
  title,
  icon,
  onClick,
}: {
  active?: boolean;
  title: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
        active
          ? "bg-rose-500 text-white"
          : "text-slate-200 hover:bg-white/10"
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}

/** Floating selection toolbar (Notion/Medium style). */
export function BubbleToolbar({
  visible,
  top,
  left,
  isBold,
  isItalic,
  isUnderline,
  isStrike,
  onBold,
  onItalic,
  onUnderline,
  onStrike,
  onCode,
  onLink,
  onColor,
  onHighlight,
}: BubbleToolbarProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed z-[70] -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-1 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl backdrop-blur-md"
      style={{ top, left }}
      role="toolbar"
      aria-label="Text formatting"
    >
      <ToolBtn active={isBold} title="Bold (Ctrl+B)" icon="format_bold" onClick={onBold} />
      <ToolBtn active={isItalic} title="Italic (Ctrl+I)" icon="format_italic" onClick={onItalic} />
      <ToolBtn
        active={isUnderline}
        title="Underline (Ctrl+U)"
        icon="format_underlined"
        onClick={onUnderline}
      />
      <ToolBtn
        active={isStrike}
        title="Strikethrough"
        icon="format_strikethrough"
        onClick={onStrike}
      />
      <div className="w-px h-5 bg-white/15 mx-0.5" />
      <ToolBtn title="Inline code" icon="code" onClick={onCode} />
      <ToolBtn title="Link (Ctrl+K)" icon="link" onClick={onLink} />
      <ToolBtn title="Text color" icon="format_color_text" onClick={onColor} />
      <ToolBtn title="Highlight" icon="ink_highlighter" onClick={onHighlight} />
    </div>
  );
}
