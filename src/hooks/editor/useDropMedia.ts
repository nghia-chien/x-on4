"use client";

import { useCallback, useState } from "react";

/** Track desktop file drag-over for the editor drop overlay. */
export function useDropMedia() {
  const [isDragging, setIsDragging] = useState(false);
  let dragDepth = 0;

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragDepth += 1;
    if (e.dataTransfer?.types?.includes("Files")) setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragDepth -= 1;
    if (dragDepth <= 0) {
      dragDepth = 0;
      setIsDragging(false);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDropEnd = useCallback(() => {
    dragDepth = 0;
    setIsDragging(false);
  }, []);

  return { isDragging, onDragEnter, onDragLeave, onDragOver, onDropEnd };
}
