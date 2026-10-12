# Professional Blog Editor modules

## Install

```bash
npm i immer zundo zustand @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities sonner
```

(`@dnd-kit/*` and `sonner` are already in this repo.)

## Layout

```
src/lib/editor/          # paste, factory, stats, history (immer+zundo), constants
src/hooks/editor/        # autosave, bubble, slash, beforeunload, drop
src/components/editor/   # UI overlays + new block types
```

## Integration into `AdminEditor.tsx`

1. Import modules from `@/lib/editor` and `@/components/editor`.
2. Use **block `id`** (not index) for focus / update / delete / DnD.
3. Keep `/api/upload` contract unchanged.
4. Replace `alert()` / `confirm()` with `toast` (sonner) + `ConfirmDialog`.
5. Wrap the block list with `DndContext` + `SortableContext` and `SortableBlockWrapper`.

## TipTap note

`document.execCommand` is deprecated. For a future large refactor, migrate the
contenteditable layer to TipTap/ProseMirror while keeping block JSON + these
overlays (slash, bubble, status, versions).
