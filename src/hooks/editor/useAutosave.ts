"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounced autosave — fires `onSave` after `debounceMs` of quiet time.
 */
export function useAutosave(options: {
  isDirty: boolean;
  debounceMs?: number;
  enabled?: boolean;
  onSave: () => Promise<void> | void;
}) {
  const { isDirty, debounceMs = 4000, enabled = true, onSave } = options;
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const runSave = useCallback(async () => {
    setStatus("saving");
    try {
      await onSaveRef.current();
      setLastSavedAt(new Date());
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!enabled || !isDirty) return;
    clearTimer();
    timerRef.current = setTimeout(() => {
      void runSave();
    }, debounceMs);
    return clearTimer;
  }, [isDirty, enabled, debounceMs, runSave]);

  return { status, lastSavedAt, saveNow: runSave };
}
