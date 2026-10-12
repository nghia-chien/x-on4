"use client";

import { useEffect, useState } from "react";

export type BubbleToolbarState = {
  visible: boolean;
  rect: { top: number; left: number; width: number } | null;
  isCollapsed: boolean;
};

/** Track text selection to position a floating bubble toolbar. */
export function useBubbleToolbar(editorRootSelector = "[data-editor-canvas]") {
  const [state, setState] = useState<BubbleToolbarState>({
    visible: false,
    rect: null,
    isCollapsed: true,
  });

  useEffect(() => {
    const update = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        setState({ visible: false, rect: null, isCollapsed: true });
        return;
      }

      const range = sel.getRangeAt(0);
      const collapsed = sel.isCollapsed;
      const root = (range.commonAncestorContainer as Node).parentElement?.closest(
        editorRootSelector
      );

      if (!root || collapsed || !sel.toString().trim()) {
        setState({ visible: false, rect: null, isCollapsed: collapsed });
        return;
      }

      const rect = range.getBoundingClientRect();
      setState({
        visible: true,
        isCollapsed: false,
        rect: {
          top: rect.top + window.scrollY - 48,
          left: rect.left + window.scrollX + rect.width / 2,
          width: rect.width,
        },
      });
    };

    document.addEventListener("selectionchange", update);
    window.addEventListener("scroll", update, true);
    return () => {
      document.removeEventListener("selectionchange", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [editorRootSelector]);

  return state;
}
