/**
 * Block history via zustand + immer + zundo.
 * Stores temporal diffs (zundo) instead of full snapshots in the undo stack.
 * Separate `versions` keeps up to 30 named restore points for Version History UI.
 *
 * TipTap migration note: if execCommand becomes a maintenance burden,
 * migrate the document model to TipTap/ProseMirror JSON and keep this store
 * as the outer undo/version layer (or replace with TipTap's built-in history).
 */
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { temporal } from "zundo";
import type { BlogBlock } from "@/components/blog/ArticleBody";
import { ensureBlockIds } from "./blockFactory";

const MAX_VERSIONS = 30;

export type EditorVersion = {
  id: string;
  label: string;
  createdAt: string;
  blocks: BlogBlock[];
};

type EditorBlocksState = {
  blocks: BlogBlock[];
  versions: EditorVersion[];
  setBlocks: (blocks: BlogBlock[]) => void;
  updateBlockById: (id: string, patch: Partial<BlogBlock>) => void;
  replaceAll: (blocks: BlogBlock[]) => void;
  pushVersion: (label?: string) => void;
  restoreVersion: (versionId: string) => boolean;
};

export const useEditorBlocksStore = create<EditorBlocksState>()(
  temporal(
    immer((set, get) => ({
      blocks: [],
      versions: [],
      setBlocks: (blocks) =>
        set((state) => {
          state.blocks = ensureBlockIds(blocks);
        }),
      updateBlockById: (id, patch) =>
        set((state) => {
          const idx = state.blocks.findIndex((b) => b.id === id);
          if (idx === -1) return;
          state.blocks[idx] = { ...state.blocks[idx], ...patch };
        }),
      replaceAll: (blocks) =>
        set((state) => {
          state.blocks = ensureBlockIds(blocks);
        }),
      pushVersion: (label) =>
        set((state) => {
          const entry: EditorVersion = {
            id: `ver-${Date.now()}`,
            label: label || `Version ${state.versions.length + 1}`,
            createdAt: new Date().toISOString(),
            blocks: structuredClone(state.blocks),
          };
          state.versions = [entry, ...state.versions].slice(0, MAX_VERSIONS);
        }),
      restoreVersion: (versionId) => {
        const ver = get().versions.find((v) => v.id === versionId);
        if (!ver) return false;
        set((state) => {
          state.blocks = structuredClone(ver.blocks);
        });
        return true;
      },
    })),
    {
      limit: 50,
      partialize: (state) => ({ blocks: state.blocks }),
    }
  )
);

export function getEditorHistoryMeta() {
  const temporalState = useEditorBlocksStore.temporal.getState();
  return {
    canUndo: temporalState.pastStates.length > 0,
    canRedo: temporalState.futureStates.length > 0,
    undo: () => temporalState.undo(),
    redo: () => temporalState.redo(),
  };
}
