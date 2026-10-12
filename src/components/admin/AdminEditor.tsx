"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast, Toaster } from "sonner";
import {
  compressImageFile,
  optimizeImageUrl,
  formatVideoEmbedUrl,
} from "@/lib/mediaOptimizer";
import OptimizedImage from "@/components/common/OptimizedImage";
import PromptModal, { PromptModalProps } from "@/components/common/PromptModal";
import ImageUploadModal from "@/components/common/ImageUploadModal";
import { BlogBlock } from "@/components/blog/ArticleBody";
import {
  mdToHtml,
  cleanAlignTags,
  readFileAsBase64,
  extractImagesFromRtf,
  cleanPastedHtml,
  createBlockId,
  createEmptyBlock,
  ensureBlockIds,
  duplicateBlock,
  moveBlockById,
  reorderBlocksByIds,
  findBlockIndexById,
  countWordsFromBlocks,
  estimateReadingMinutes,
  EDITOR_TEMPLATES,
  getEditorHistoryMeta,
  useEditorBlocksStore,
} from "@/lib/editor";
import { useAutosave } from "@/hooks/editor/useAutosave";
import { useBubbleToolbar } from "@/hooks/editor/useBubbleToolbar";
import { useSlashMenu } from "@/hooks/editor/useSlashMenu";
import { useBeforeUnload } from "@/hooks/editor/useBeforeUnload";
import { useDropMedia } from "@/hooks/editor/useDropMedia";
import {
  BubbleToolbar,
  SlashCommandMenu,
  EditorStatusBar,
  ConfirmDialog,
  SeoPreviewCard,
  VersionHistoryPanel,
  ShortcutsHelp,
  DropOverlay,
  SortableBlockWrapper,
  CalloutBlock,
  ToggleBlock,
  GalleryBlock,
  EmbedBlock,
  CodeBlockEditor,
} from "@/components/editor";

// Rich WYSIWYG ContentEditable Block Component
interface RichEditableBlockProps {
  html: string;
  onChange: (newHtml: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onSelectionChange?: (e: React.SyntheticEvent) => void;
  onPasteImage?: (file: File) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  inputRef?: React.RefCallback<HTMLDivElement> | React.MutableRefObject<HTMLDivElement | null>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  blockId?: string;
  field?: string;
}

function RichEditableBlock({
  html,
  onChange,
  onFocus,
  onBlur,
  onSelectionChange,
  onPasteImage,
  placeholder,
  className = "",
  style = {},
  inputRef,
  onKeyDown,
  blockId,
  field,
}: RichEditableBlockProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (inputRef) {
      if (typeof inputRef === "function") {
        inputRef(innerRef.current);
      } else {
        inputRef.current = innerRef.current;
      }
    }
  }, [inputRef]);

  // Sync content when changed from outside
  useEffect(() => {
    if (innerRef.current) {
      const current = innerRef.current.innerHTML;
      const target = html || "";
      if (current !== target && document.activeElement !== innerRef.current) {
        innerRef.current.innerHTML = target;
      }
    }
  }, [html]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isComposingRef.current) return;
    const newHtml = e.currentTarget.innerHTML;
    const isCleanEmpty =
      !newHtml || newHtml === "<br>" || newHtml === "<p><br></p>";
    onChange(isCleanEmpty ? "" : newHtml);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Check all image files in clipboard
    const items = clipboardData.items;
    const pastedImageFiles: File[] = [];
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const f = items[i].getAsFile();
          if (f) pastedImageFiles.push(f);
        }
      }
    }

    const htmlData = clipboardData.getData("text/html");
    const rtfData = clipboardData.getData("text/rtf");
    const plainText = clipboardData.getData("text/plain");

    // Pure image paste (no accompanying text or HTML)
    if (pastedImageFiles.length > 0 && (!plainText || !plainText.trim()) && (!htmlData || !htmlData.trim())) {
      e.preventDefault();
      onPasteImage?.(pastedImageFiles[0]);
      return;
    }

    e.preventDefault();

    // Extract images from RTF (Word clipboard)
    let rtfImages = extractImagesFromRtf(rtfData);
    if (rtfImages.length === 0 && pastedImageFiles.length > 0) {
      for (const imgFile of pastedImageFiles) {
        const fileBase64 = await readFileAsBase64(imgFile);
        if (fileBase64) {
          rtfImages.push(fileBase64);
        }
      }
    }

    if (htmlData && htmlData.trim()) {
      const cleanHtml = cleanPastedHtml(htmlData, rtfImages);
      document.execCommand("insertHTML", false, cleanHtml);
    } else if (plainText) {
      document.execCommand("insertText", false, plainText);
    }

    if (innerRef.current) {
      const newHtml = innerRef.current.innerHTML;
      const isCleanEmpty =
        !newHtml || newHtml === "<br>" || newHtml === "<p><br></p>";
      onChange(isCleanEmpty ? "" : newHtml);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = innerRef.current;
    if (!el) return;

    // If clicked directly on the container background/space below elements
    if (e.target === el) {
      const lastChild = el.lastElementChild;
      if (
        lastChild &&
        (lastChild.tagName === "IMG" ||
          lastChild.tagName === "FIGURE" ||
          lastChild.tagName === "DIV" ||
          lastChild.tagName === "TABLE")
      ) {
        let p = el.querySelector(":scope > p:last-child") as HTMLElement | null;
        if (!p || p === lastChild) {
          p = document.createElement("p");
          p.innerHTML = "<br>";
          el.appendChild(p);
        }
        const range = document.createRange();
        range.setStart(p, 0);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        onChange(el.innerHTML);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.key === "Enter" && !e.shiftKey) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        let node: Node | null = range.commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        const isNearImg =
          (node as HTMLElement)?.tagName === "IMG" ||
          (node as HTMLElement)?.querySelector?.("img");
        if (isNearImg) {
          e.preventDefault();
          const p = document.createElement("p");
          p.innerHTML = "<br>";
          const targetNode = (node as HTMLElement).tagName === "IMG" ? (node as HTMLElement) : (node as HTMLElement).querySelector("img")!;
          if (targetNode.parentNode) {
            targetNode.parentNode.insertBefore(p, targetNode.nextSibling);
          } else {
            innerRef.current?.appendChild(p);
          }
          const newRange = document.createRange();
          newRange.setStart(p, 0);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          if (innerRef.current) {
            onChange(innerRef.current.innerHTML);
          }
        }
      }
    }
  };

  return (
    <div
      ref={innerRef}
      contentEditable
      suppressContentEditableWarning
      data-block-id={blockId}
      data-field={field}
      onInput={handleInput}
      onClick={handleClick}
      onCompositionStart={() => {
        isComposingRef.current = true;
      }}
      onCompositionEnd={(e) => {
        isComposingRef.current = false;
        handleInput(e);
      }}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      onFocus={(e) => {
        onFocus?.(e);
        onSelectionChange?.(e);
      }}
      onBlur={(e) => {
        onBlur?.(e);
      }}
      onKeyUp={onSelectionChange}
      onMouseUp={onSelectionChange}
      onSelect={onSelectionChange}
      className={`${className} outline-none cursor-text relative`}
      style={style}
      data-placeholder={placeholder}
    />
  );
}

// Interactive Resizable Image Block Component
interface ResizableImageBlockProps {
  block: BlogBlock;
  onUpdate: (updates: Partial<BlogBlock>) => void;
  onDelete: () => void;
  onReplace: () => void;
  onPaste?: () => void;
}

function ResizableImageBlock({
  block,
  onUpdate,
  onDelete,
  onReplace,
  onPaste,
}: ResizableImageBlockProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialWidthPx, setInitialWidthPx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentWidth = block.width || "100%";
  const currentAlign = block.align || "center";

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDragStartX(e.clientX);
    if (containerRef.current) {
      setInitialWidthPx(containerRef.current.offsetWidth);
    }
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const parentWidth =
        containerRef.current.parentElement?.offsetWidth || window.innerWidth;
      const deltaX = (e.clientX - dragStartX) * 2;
      const newPx = Math.max(120, Math.min(parentWidth, initialWidthPx + deltaX));
      const percentage = Math.round((newPx / parentWidth) * 100);
      const clampedPercent = Math.max(20, Math.min(100, percentage));
      onUpdate({ width: `${clampedPercent}%` });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, dragStartX, initialWidthPx, onUpdate]);

  const alignClass =
    currentAlign === "left"
      ? "mr-auto items-start text-left"
      : currentAlign === "right"
        ? "ml-auto items-end text-right"
        : "mx-auto items-center text-center";

  return (
    <div
      className={`my-6 max-w-full flex flex-col ${alignClass} group/img relative transition-all duration-200`}
      style={{ width: currentWidth }}
      ref={containerRef}
    >
      <div className="relative w-full rounded-2xl overflow-hidden group/preview">
        <OptimizedImage
          src={block.url}
          alt={block.caption || "WebP Image"}
          sizes="(max-width: 768px) 100vw, 1000px"
          containerClassName="w-full max-h-[520px] rounded-2xl"
          className="w-full max-h-[520px] object-cover rounded-2xl block mx-auto transition-transform duration-500 hover:scale-[1.005]"
        />

        {/* Loading Overlay (Black screen with animated loading indicator) */}
        {block.isLoading && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-20 min-h-[220px] text-white p-4 animate-in fade-in duration-200">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-3 border-rose-500/20 border-t-rose-500 animate-spin" />
              <span className="material-symbols-outlined absolute text-rose-400 text-lg animate-pulse">
                upload
              </span>
            </div>
            <div className="text-center space-y-1">
              <div className="text-sm font-bold text-white tracking-wide">
                Đang tải ảnh lên...
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Tối ưu hóa nén chuẩn WebP tốc độ cao
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-3 right-3 opacity-0 group-hover/preview:opacity-100 flex items-center gap-1.5 backdrop-blur-md bg-slate-900/80 p-1 rounded-xl shadow-md transition-all z-10">
          {onPaste && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onPaste}
              className="p-1.5 rounded-lg text-purple-300 hover:bg-purple-600 hover:text-white transition-all active:scale-95"
              title="Paste image from clipboard (Ctrl+V)"
            >
              <span className="material-symbols-outlined text-[16px]">
                content_paste
              </span>
            </button>
          )}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onReplace}
            className="p-1.5 rounded-lg text-sky-300 hover:bg-sky-600 hover:text-white transition-all active:scale-95"
            title="Replace image from computer"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onDelete}
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
            title="Delete image"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>

        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-2 right-2 w-6 h-6 rounded-lg bg-black/70 hover:bg-[#ff5167] text-white flex items-center justify-center cursor-nwse-resize shadow-md backdrop-blur-md opacity-0 group-hover/preview:opacity-100 transition-opacity z-10"
          title="Drag to resize image"
        >
          <span className="material-symbols-outlined text-[14px]">drag_pan</span>
        </div>
      </div>

      <div className="w-full mt-2 text-center">
        <input
          value={block.caption || ""}
          onChange={(e) => onUpdate({ caption: e.target.value })}
          className="w-full text-center bg-transparent text-xs text-slate-500 dark:text-[#a898be] italic outline-none hover:text-slate-700 dark:hover:text-[#e8dff1] focus:text-sky-600 dark:focus:text-[#4cd7f6] transition-colors"
          placeholder="Enter image caption (.webp)..."
        />
      </div>
    </div>
  );
}

// Interactive Resizable Column Image Component
interface ColumnImageResizableProps {
  imageUrl?: string;
  caption?: string;
  imageHeight?: string;
  onUpdate: (updates: { height?: string; caption?: string }) => void;
  onUploadClick: () => void;
  onPasteClick?: () => void;
  onDelete: () => void;
}

function ColumnImageResizable({
  imageUrl,
  caption,
  imageHeight,
  onUpdate,
  onUploadClick,
  onPasteClick,
  onDelete,
}: ColumnImageResizableProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [initialHeightPx, setInitialHeightPx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isCustomPx = Boolean(
    imageHeight && typeof imageHeight === "string" && imageHeight.includes("px")
  );
  const currentRatio =
    !imageHeight || imageHeight === "auto" ? "auto" : imageHeight;

  const getContainerStyle = (): React.CSSProperties => {
    if (isCustomPx) return { height: imageHeight };
    if (imageHeight === "16:9") return { aspectRatio: "16/9" };
    if (imageHeight === "4:3") return { aspectRatio: "4/3" };
    if (imageHeight === "1:1") return { aspectRatio: "1/1" };
    return { aspectRatio: "4/3" };
  };

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDragStartY(e.clientY);
    if (containerRef.current) {
      setInitialHeightPx(containerRef.current.offsetHeight);
    }
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - dragStartY;
      const newHeight = Math.max(100, Math.min(800, initialHeightPx + deltaY));
      onUpdate({ height: `${newHeight}px` });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, dragStartY, initialHeightPx, onUpdate]);

  return (
    <div className="relative group/colimg flex flex-col items-center w-full">
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden transition-all duration-200"
        style={getContainerStyle()}
      >
        <OptimizedImage
          src={imageUrl}
          alt={caption || "Column Image"}
          containerClassName="w-full h-full rounded-2xl"
          className="w-full h-full object-cover rounded-2xl block mx-auto"
        />

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/colimg:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-10">
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onUploadClick}
              className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
              title="Replace image from computer"
            >
              <span className="material-symbols-outlined text-[14px]">upload</span>
              <span>Replace</span>
            </button>
            {onPasteClick && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={onPasteClick}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
                title="Paste from clipboard (Ctrl+V)"
              >
                <span className="material-symbols-outlined text-[14px]">
                  content_paste
                </span>
                <span>Paste</span>
              </button>
            )}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onDelete}
              className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs shadow-md active:scale-95 transition-all cursor-pointer"
              title="Delete image"
            >
              <span className="material-symbols-outlined text-[14px]">delete</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10 text-[10px] text-white">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onUpdate({ height: "auto" })}
              className={`px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${currentRatio === "auto" && !isCustomPx
                ? "bg-rose-500 text-white"
                : "hover:bg-white/20 text-slate-200"
                }`}
              title="Auto balanced ratio"
            >
              Auto
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onUpdate({ height: "4:3" })}
              className={`px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${currentRatio === "4:3"
                ? "bg-rose-500 text-white"
                : "hover:bg-white/20 text-slate-200"
                }`}
              title="4:3 Ratio"
            >
              4:3
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onUpdate({ height: "16:9" })}
              className={`px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${currentRatio === "16:9"
                ? "bg-rose-500 text-white"
                : "hover:bg-white/20 text-slate-200"
                }`}
              title="16:9 Ratio"
            >
              16:9
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onUpdate({ height: "1:1" })}
              className={`px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${currentRatio === "1:1"
                ? "bg-rose-500 text-white"
                : "hover:bg-white/20 text-slate-200"
                }`}
              title="1:1 Square"
            >
              1:1
            </button>
            {isCustomPx && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onUpdate({ height: "auto" })}
                className="px-1.5 py-0.5 rounded font-medium text-amber-300 hover:bg-white/20 flex items-center gap-0.5 cursor-pointer"
                title="Reset to auto ratio"
              >
                <span className="material-symbols-outlined text-[11px]">
                  restart_alt
                </span>
                <span>{imageHeight}</span>
              </button>
            )}
          </div>
        </div>

        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-2 right-2 w-6 h-6 rounded-lg bg-black/70 hover:bg-[#ff5167] text-white flex items-center justify-center cursor-ns-resize shadow-md backdrop-blur-md opacity-0 group-hover/colimg:opacity-100 transition-opacity z-20"
          title="Drag up/down to adjust image height"
        >
          <span className="material-symbols-outlined text-[14px]">height</span>
        </div>
      </div>
    </div>
  );
}

const FONT_SIZE_OPTIONS = [
  { size: "12", label: "Small", value: "12px" },
  { size: "14", label: "Compact", value: "14px" },
  { size: "16", label: "Normal", value: "16px" },
  { size: "18", label: "Medium", value: "18px" },
  { size: "20", label: "Lead", value: "20px" },
  { size: "24", label: "H3 Heading", value: "24px" },
  { size: "28", label: "H2 Heading", value: "28px" },
  { size: "34", label: "H1 Title", value: "34px" },
];

const FONT_FAMILY_OPTIONS = [
  { name: "Inter", label: "Inter (Sans Modern)", desc: "Sans Modern", value: "var(--font-sans, Inter, sans-serif)" },
  { name: "Playfair", label: "Playfair (Luxury Serif)", desc: "Luxury Serif", value: "var(--font-serif, 'Playfair Display', Georgia, serif)" },
  { name: "Roboto", label: "Roboto (Clean Sans)", desc: "Clean Sans", value: "'Roboto', sans-serif" },
  { name: "Montserrat", label: "Montserrat (Geometric)", desc: "Geometric", value: "'Montserrat', sans-serif" },
  { name: "Mono", label: "Mono (Code Style)", desc: "Code Style", value: "ui-monospace, SFMono-Regular, monospace" },
];

const HEADING_OPTIONS = [
  { level: 1, label: "H1", name: "Heading 1", desc: "Title / Main Headline", tag: "h1" },
  { level: 2, label: "H2", name: "Heading 2", desc: "Section Header", tag: "h2" },
  { level: 3, label: "H3", name: "Heading 3", desc: "Sub-section", tag: "h3" },
  { level: 4, label: "H4", name: "Heading 4", desc: "Minor Heading", tag: "h4" },
  { level: 5, label: "H5", name: "Heading 5", desc: "Small Sub-title", tag: "h5" },
  { level: 6, label: "H6", name: "Heading 6", desc: "Paragraph Label", tag: "h6" },
];

const TEXT_COLOR_PALETTE = [
  { label: "Default Dark", value: "#0f172a" },
  { label: "Muted Gray", value: "#64748b" },
  { label: "Signature Rose", value: "#e11d48" },
  { label: "Vibrant Coral", value: "#ff5167" },
  { label: "Ruby Red", value: "#dc2626" },
  { label: "Warm Amber", value: "#d97706" },
  { label: "Emerald Green", value: "#059669" },
  { label: "Ocean Sky", value: "#0284c7" },
  { label: "Royal Indigo", value: "#4f46e5" },
  { label: "Purple Velvet", value: "#7c3aed" },
];

const HIGHLIGHT_COLOR_PALETTE = [
  { label: "None / Clear", value: "transparent" },
  { label: "Soft Yellow", value: "#fef08a" },
  { label: "Pastel Pink", value: "#fecdd3" },
  { label: "Fresh Green", value: "#bbf7d0" },
  { label: "Sky Blue", value: "#bae6fd" },
  { label: "Lavender", value: "#e9d5ff" },
];

export interface BlogPostData {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  summary?: string;
  content: string;
  blocks?: BlogBlock[];
  thumbnail?: string;
  coverImage?: string;
  category: string;
  author?: string;
  authorName?: string;
  tags?: string[];
  status?: "draft" | "published" | "archived";
  isPublic?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metaDesc?: string;
}

export interface AdminEditorProps {
  postToEdit?: BlogPostData;
  onSave?: (data: BlogPostData) => Promise<void> | void;
  onExit?: () => void;
  isEdit?: boolean;
}

export default function AdminEditor({
  postToEdit,
  onSave,
  onExit,
}: AdminEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const columnFileInputRef = useRef<HTMLInputElement>(null);
  const replaceImageFileInputRef = useRef<HTMLInputElement>(null);

  const [replaceTargetBlockId, setReplaceTargetBlockId] = useState<string | null>(null);
  const [columnUploadTarget, setColumnUploadTarget] = useState<{
    blockId: string;
    side: "left" | "right";
  } | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  /** Prefer block id as source of truth; index is derived when needed. */
  const targetBlockIdRef = useRef<string | null>(null);
  const targetBlockIndexRef = useRef<number | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // Document Fields
  const [title, setTitle] = useState(postToEdit?.title || "");
  const [summary, setSummary] = useState(
    postToEdit?.summary || postToEdit?.excerpt || ""
  );
  const [category, setCategory] = useState(
    postToEdit?.category || "Nail Tutorials & Care"
  );
  const [authorName, setAuthorName] = useState(
    postToEdit?.authorName || postToEdit?.author || "X-ON Nail Artist"
  );
  const [coverImage, setCoverImage] = useState(
    postToEdit?.coverImage || postToEdit?.thumbnail || ""
  );
  const [slug, setSlug] = useState(postToEdit?.slug || "");
  const [metaDesc, setMetaDesc] = useState(
    postToEdit?.metaDesc || postToEdit?.seoDescription || ""
  );
  const [tags, setTags] = useState<string[]>(postToEdit?.tags || []);
  const [newTagInput, setNewTagInput] = useState("");

  // Initial Blocks
  const getInitialBlocks = useCallback((): BlogBlock[] => {
    if (
      postToEdit?.blocks &&
      Array.isArray(postToEdit.blocks) &&
      postToEdit.blocks.length > 0
    ) {
      return postToEdit.blocks.map((b) => {
        if (b.type === "columns") {
          return {
            ...b,
            leftText: mdToHtml(cleanAlignTags(b.leftText || "")),
            rightText: mdToHtml(cleanAlignTags(b.rightText || "")),
          };
        }
        let text = b.text || "";
        if (/<div align=/i.test(text)) {
          text = cleanAlignTags(text);
        }
        return { ...b, text: mdToHtml(text) };
      });
    }

    if (postToEdit?.content) {
      try {
        const parsed = JSON.parse(postToEdit.content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
          return parsed;
        }
      } catch {
        return [
          {
            id: "block-init-content",
            type: "paragraph",
            text: mdToHtml(postToEdit.content),
          },
        ];
      }
    }

    return ensureBlockIds([{ id: createBlockId(), type: "paragraph", text: "" }]);
  }, [postToEdit]);

  const [blocks, setBlocks] = useState<BlogBlock[]>(() =>
    ensureBlockIds(getInitialBlocks())
  );
  const blocksRef = useRef<BlogBlock[]>(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const setTargetBlockId = useCallback((id: string | null) => {
    targetBlockIdRef.current = id;
    if (!id) {
      targetBlockIndexRef.current = null;
      return;
    }
    const idx = findBlockIndexById(blocksRef.current, id);
    targetBlockIndexRef.current = idx === -1 ? null : idx;
  }, []);

  // Sync into zustand+zundo store for diff-based undo / version history
  const storeSetBlocks = useEditorBlocksStore((s) => s.setBlocks);
  const storeVersions = useEditorBlocksStore((s) => s.versions);
  const storePushVersion = useEditorBlocksStore((s) => s.pushVersion);
  const storeRestoreVersion = useEditorBlocksStore((s) => s.restoreVersion);
  useEffect(() => {
    storeSetBlocks(blocks);
  }, [blocks, storeSetBlocks]);

  const [isPublic, setIsPublic] = useState(
    postToEdit?.status !== undefined
      ? postToEdit.status === "published"
      : true
  );

  // Local history kept for compatibility; also mirrored via zundo store
  const [history, setHistory] = useState<BlogBlock[][]>([
    ensureBlockIds(getInitialBlocks()),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    blockId: string;
    label: string;
  } | null>(null);

  const bubble = useBubbleToolbar("[data-editor-canvas]");
  const slash = useSlashMenu();
  const dropMedia = useDropMedia();
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const wordCount = useMemo(() => countWordsFromBlocks(blocks), [blocks]);
  const readingMinutes = useMemo(
    () => estimateReadingMinutes(blocks),
    [blocks]
  );

  const pushHistory = (newBlocks: BlogBlock[]) => {
    const next = ensureBlockIds(newBlocks);
    setBlocks(next);
    setIsDirty(true);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(next);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    storeSetBlocks(next);
  };

  const handleUndo = () => {
    const meta = getEditorHistoryMeta();
    if (meta.canUndo) {
      meta.undo();
      const latest = useEditorBlocksStore.getState().blocks;
      setBlocks(latest);
      setIsDirty(true);
      return;
    }
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setBlocks(history[newIdx]);
      setIsDirty(true);
    }
  };

  const handleRedo = () => {
    const meta = getEditorHistoryMeta();
    if (meta.canRedo) {
      meta.redo();
      const latest = useEditorBlocksStore.getState().blocks;
      setBlocks(latest);
      setIsDirty(true);
      return;
    }
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setBlocks(history[newIdx]);
      setIsDirty(true);
    }
  };

  const historyMeta = getEditorHistoryMeta();
  const canUndo = historyMeta.canUndo || historyIndex > 0;
  const canRedo =
    historyMeta.canRedo || historyIndex < history.length - 1;

  // Focus & Toolbar Active States
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const [isStrikethroughActive, setIsStrikethroughActive] = useState(false);
  const [isSubscriptActive, setIsSubscriptActive] = useState(false);
  const [isSuperscriptActive, setIsSuperscriptActive] = useState(false);
  const [isBulletListActive, setIsBulletListActive] = useState(false);
  const [isNumberedListActive, setIsNumberedListActive] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState("16px");
  const [selectedFontFamily, setSelectedFontFamily] = useState("Inter");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">("left");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number } | null>(null);

  const toggleDropdown = (name: string, e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    if (activeDropdown === name) {
      setActiveDropdown(null);
      setDropdownCoords(null);
    } else {
      if (e?.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        const popupWidth = name === "fontFamily" ? 192 : name === "textColor" ? 210 : 160;
        const left = Math.max(8, Math.min(rect.left, window.innerWidth - popupWidth - 12));
        setDropdownCoords({ top: rect.bottom + 6, left });
      }
      setActiveDropdown(name);
    }
  };

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
    setDropdownCoords(null);
  };

  const isTextColorPickerOpen = activeDropdown === "textColor";
  const isHighlightPickerOpen = activeDropdown === "highlight";
  const isFontSizeDropdownOpen = activeDropdown === "fontSize";
  const isFontFamilyDropdownOpen = activeDropdown === "fontFamily";
  const isHeadingDropdownOpen = activeDropdown === "heading";
  const isVideoDropdownOpen = activeDropdown === "video";

  const [selectedHeadingLevel, setSelectedHeadingLevel] = useState<number>(2);
  const [customColorHex, setCustomColorHex] = useState("#ff5167");
  const [isSaving, setIsSaving] = useState(false);
  const summaryTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize summary textarea to display full content without scrollbars
  useEffect(() => {
    if (summaryTextareaRef.current) {
      summaryTextareaRef.current.style.height = "auto";
      summaryTextareaRef.current.style.height = `${summaryTextareaRef.current.scrollHeight}px`;
    }
  }, [summary]);

  // Modals
  const [promptModal, setPromptModal] = useState<PromptModalProps>({
    isOpen: false,
    title: "",
    description: "",
    placeholder: "",
    defaultValue: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    icon: "link",
    iconColor: "sky",
    onConfirm: () => { },
    onCancel: () => { },
  });

  const openPrompt = (props: Partial<PromptModalProps>) => {
    setPromptModal({
      isOpen: true,
      title: props.title || "Enter Information",
      description: props.description || "",
      placeholder: props.placeholder || "https://...",
      defaultValue: props.defaultValue || "",
      confirmText: props.confirmText || "Confirm",
      cancelText: props.cancelText || "Cancel",
      icon: props.icon || "link",
      iconColor: props.iconColor || "sky",
      onConfirm: (val: string) => {
        setPromptModal((prev) => ({ ...prev, isOpen: false }));
        props.onConfirm?.(val);
      },
      onCancel: () => {
        setPromptModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Selection & Active State Tracking
  const saveCurrentSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      let container: Node | null = range.commonAncestorContainer;
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement;
      }
      // ONLY update savedSelection if inside an editable content block in our editor
      if (container && (container as HTMLElement).closest?.("[contenteditable='true'], [data-block-id], input, textarea")) {
        savedSelectionRef.current = range.cloneRange();
        const blockEl = (container as HTMLElement).closest?.("[data-block-id]") as HTMLElement | null;
        if (blockEl) {
          const blockId = blockEl.getAttribute("data-block-id");
          if (blockId) {
            setTargetBlockId(blockId);
          }
        }
      }
    }
  }, [setTargetBlockId]);

  const restoreSavedSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  }, []);

  const updateToolbarActiveStates = useCallback(() => {
    try {
      setIsBoldActive(document.queryCommandState("bold"));
      setIsItalicActive(document.queryCommandState("italic"));
      setIsUnderlineActive(document.queryCommandState("underline"));
      setIsStrikethroughActive(document.queryCommandState("strikeThrough"));
      setIsSubscriptActive(document.queryCommandState("subscript"));
      setIsSuperscriptActive(document.queryCommandState("superscript"));
      setIsBulletListActive(document.queryCommandState("insertUnorderedList"));
      setIsNumberedListActive(document.queryCommandState("insertOrderedList"));
    } catch {
      // ignore
    }
  }, []);

  const handleSelectionOrFocusChange = useCallback(() => {
    saveCurrentSelection();
    updateToolbarActiveStates();
  }, [saveCurrentSelection, updateToolbarActiveStates]);

  useEffect(() => {
    const onDocSelectionChange = () => {
      handleSelectionOrFocusChange();
    };
    document.addEventListener("selectionchange", onDocSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", onDocSelectionChange);
    };
  }, [handleSelectionOrFocusChange]);

  // Sync ContentEditable DOM into React Blocks State
  const syncActiveBlockContent = useCallback(() => {
    const sel = window.getSelection();
    let container: Node | null = null;
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      container = range.commonAncestorContainer;
    } else if (savedSelectionRef.current) {
      container = savedSelectionRef.current.commonAncestorContainer;
    }
    if (container && container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement;
    }
    const editableEl = (container as HTMLElement)?.closest?.("[data-block-id]") as HTMLElement | null;
    if (editableEl) {
      const blockId = editableEl.getAttribute("data-block-id");
      const field = editableEl.getAttribute("data-field");
      if (blockId) {
        const newHtml = editableEl.innerHTML;
        const isCleanEmpty = !newHtml || newHtml === "<br>" || newHtml === "<p><br></p>";
        const finalHtml = isCleanEmpty ? "" : newHtml;

        setBlocks((prev) =>
          prev.map((b) => {
            if (b.id !== blockId) return b;
            if (field === "left") return { ...b, leftText: finalHtml };
            if (field === "right") return { ...b, rightText: finalHtml };
            return { ...b, text: finalHtml };
          })
        );
      }
    }
  }, []);

  // Text formatting executor on highlighted (selected) text
  const executeCommand = (cmd: string, val: string | undefined = undefined) => {
    restoreSavedSelection();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(cmd, false, val);
    saveCurrentSelection();
    updateToolbarActiveStates();
    syncActiveBlockContent();
  };

  // Apply Font Size to Selected Text
  const applyFontSizeToSelection = (size: string) => {
    restoreSavedSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setSelectedFontSize(size);
      closeAllDropdowns();
      return;
    }

    const range = sel.getRangeAt(0);
    const selectedHtml = range.cloneContents();
    const span = document.createElement("span");
    span.style.fontSize = size;
    span.appendChild(selectedHtml);

    range.deleteContents();
    range.insertNode(span);

    // Re-select inserted span content
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(newRange);
    savedSelectionRef.current = newRange;

    setSelectedFontSize(size);
    closeAllDropdowns();
    syncActiveBlockContent();
  };

  // Apply Font Family to Selected Text
  const applyFontFamilyToSelection = (fontCss: string, fontName: string) => {
    restoreSavedSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setSelectedFontFamily(fontName);
      closeAllDropdowns();
      return;
    }

    const range = sel.getRangeAt(0);
    const selectedHtml = range.cloneContents();
    const span = document.createElement("span");
    span.style.fontFamily = fontCss;
    span.appendChild(selectedHtml);

    range.deleteContents();
    range.insertNode(span);

    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(newRange);
    savedSelectionRef.current = newRange;

    setSelectedFontFamily(fontName);
    closeAllDropdowns();
    syncActiveBlockContent();
  };

  // Apply Text Color (Foreground)
  const applyTextColorToSelection = (color: string) => {
    restoreSavedSelection();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("foreColor", false, color);
    closeAllDropdowns();
    syncActiveBlockContent();
  };

  // Apply Highlight / Background Color
  const applyHighlightColorToSelection = (color: string) => {
    restoreSavedSelection();
    document.execCommand("styleWithCSS", false, "true");
    if (color === "transparent") {
      document.execCommand("removeFormat", false, undefined);
    } else {
      document.execCommand("hiliteColor", false, color);
    }
    closeAllDropdowns();
    syncActiveBlockContent();
  };

  // Apply Inline Code Tag to Highlighted Text
  const applyInlineCodeToSelection = () => {
    restoreSavedSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const selectedHtml = range.cloneContents();
    const code = document.createElement("code");
    code.className =
      "bg-slate-100 dark:bg-[#2c2835] text-rose-600 dark:text-[#ff5167] px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200 dark:border-transparent";
    code.appendChild(selectedHtml);

    range.deleteContents();
    range.insertNode(code);

    const newRange = document.createRange();
    newRange.selectNodeContents(code);
    sel.removeAllRanges();
    sel.addRange(newRange);
    savedSelectionRef.current = newRange;

    syncActiveBlockContent();
  };

  // Clear Formatting on Highlighted Text
  const applyClearFormatting = () => {
    restoreSavedSelection();
    document.execCommand("removeFormat", false, undefined);
    document.execCommand("unlink", false, undefined);
    syncActiveBlockContent();
  };

  // Apply Hyperlink to Selected Text or Insert Link
  const applyLinkToSelection = (url: string) => {
    if (!url) return;
    restoreSavedSelection();
    const sel = window.getSelection();

    let range: Range | null = null;
    if (sel && sel.rangeCount > 0) {
      range = sel.getRangeAt(0);
    } else if (savedSelectionRef.current) {
      range = savedSelectionRef.current;
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    if (!range) return;

    if (!range.collapsed) {
      const selectedHtml = range.cloneContents();
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "text-rose-600 dark:text-rose-400 hover:underline font-medium cursor-pointer";
      a.appendChild(selectedHtml);

      range.deleteContents();
      range.insertNode(a);

      const newRange = document.createRange();
      newRange.selectNode(a);
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
      savedSelectionRef.current = newRange;
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "text-rose-600 dark:text-rose-400 hover:underline font-medium cursor-pointer";
      a.textContent = url;

      range.insertNode(a);

      const newRange = document.createRange();
      newRange.setStartAfter(a);
      newRange.setEndAfter(a);
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
      savedSelectionRef.current = newRange;
    }

    syncActiveBlockContent();
  };

  // Upload image handler to /api/upload
  const uploadImageToServer = async (file: File): Promise<string> => {
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 1400,
        maxHeight: 1400,
        quality: 0.82,
      });
      const formData = new FormData();
      formData.append("file", compressed.blob, file.name || "image.webp");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.url) {
          return json.data.url;
        }
      }
      return compressed.base64;
    } catch {
      return await readFileAsBase64(file);
    }
  };

  // Upload video handler to /api/upload
  const uploadVideoToServer = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file, file.name || "video.mp4");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.url) {
          return json.data.url;
        }
      }
      return await readFileAsBase64(file);
    } catch {
      return await readFileAsBase64(file);
    }
  };

  // Apply Heading Level to Current Block or Highlighted Text
  const applyHeadingToSelection = (level: number) => {
    setSelectedHeadingLevel(level);
    closeAllDropdowns();

    restoreSavedSelection();

    // If we have an active target block
    if (targetBlockIndexRef.current !== null && blocks[targetBlockIndexRef.current]) {
      const activeIdx = targetBlockIndexRef.current;
      const activeBlock = blocks[activeIdx];

      if (activeBlock && (activeBlock.type === "paragraph" || activeBlock.type === "heading")) {
        if (activeBlock.id) {
          updateBlock(activeBlock.id, { type: "heading", level });
          return;
        }
      }
    }

    // Otherwise insert new heading block at current position
    addBlock("heading", undefined, level);
  };

  // Apply Alignment to Selection and Current Block
  const applyAlignmentToSelection = (align: "left" | "center" | "right" | "justify") => {
    setTextAlign(align);
    const cmd =
      align === "left"
        ? "justifyLeft"
        : align === "center"
        ? "justifyCenter"
        : align === "right"
        ? "justifyRight"
        : "justifyFull";
    executeCommand(cmd);

    if (targetBlockIndexRef.current !== null && blocks[targetBlockIndexRef.current]) {
      const activeBlock = blocks[targetBlockIndexRef.current];
      if (activeBlock?.id) {
        updateBlock(activeBlock.id, { align });
      }
    }
  };

  // Block Manipulation Handlers
  const addBlock = (type: BlogBlock["type"], targetIdx?: number, level?: number) => {
    let currentIdx = targetIdx !== undefined ? targetIdx : targetBlockIndexRef.current;
    if (currentIdx === null || currentIdx === undefined || currentIdx < 0 || currentIdx >= blocks.length) {
      currentIdx = blocks.length - 1;
    }

    const currentBlock = blocks[currentIdx];
    const isCurrentEmptyParagraph =
      currentBlock &&
      currentBlock.type === "paragraph" &&
      (!currentBlock.text ||
        currentBlock.text.trim() === "" ||
        currentBlock.text === "<br>" ||
        currentBlock.text === "<p><br></p>");

    let newBlock: BlogBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
    };

    if (type === "heading") {
      newBlock.text = "";
      newBlock.align = "left";
      newBlock.level = level || selectedHeadingLevel || 2;
    } else if (type === "paragraph") {
      newBlock.text = "";
      newBlock.align = "left";
    } else if (type === "quote") {
      newBlock.text = "";
      newBlock.author = "";
    } else if (type === "list") {
      newBlock.listType = "bullet";
      newBlock.items = [""];
    } else if (type === "table") {
      newBlock.headers = ["Header 1", "Header 2", "Header 3"];
      newBlock.rows = [
        ["Data 1", "Data 2", "Data 3"],
        ["Data 4", "Data 5", "Data 6"],
      ];
    } else if (type === "code") {
      newBlock = createEmptyBlock("code", { language: "plaintext" });
    } else if (type === "columns") {
      newBlock = createEmptyBlock("columns", {
        layout: "50-50",
        columnLayout: "50-50",
      });
    } else if (
      type === "callout" ||
      type === "toggle" ||
      type === "gallery" ||
      type === "embed" ||
      type === "divider" ||
      type === "image" ||
      type === "video"
    ) {
      newBlock = createEmptyBlock(type, level ? { level } : {});
    }

    // Always create a follow-up paragraph block underneath for rich blocks
    const needsFollowUpParagraph = [
      "quote",
      "table",
      "columns",
      "video",
      "code",
      "divider",
      "callout",
      "toggle",
      "gallery",
      "embed",
    ].includes(type);

    const followUpParagraphId = `block-${Date.now() + 1}-${Math.random().toString(36).substring(2, 6)}`;
    const followUpParagraph: BlogBlock = {
      id: followUpParagraphId,
      type: "paragraph",
      text: "",
      align: "left",
    };

    const nextBlocks = [...blocks];

    if (isCurrentEmptyParagraph) {
      if (needsFollowUpParagraph) {
        nextBlocks.splice(currentIdx, 1, newBlock, followUpParagraph);
        targetBlockIndexRef.current = currentIdx;
      } else {
        nextBlocks.splice(currentIdx, 1, newBlock);
        targetBlockIndexRef.current = currentIdx;
      }
    } else {
      const insertIdx = currentIdx + 1;
      if (needsFollowUpParagraph) {
        nextBlocks.splice(insertIdx, 0, newBlock, followUpParagraph);
        targetBlockIndexRef.current = insertIdx;
      } else {
        nextBlocks.splice(insertIdx, 0, newBlock);
        targetBlockIndexRef.current = insertIdx;
      }
    }

    pushHistory(nextBlocks);

    // Auto-focus the newly created block
    setTimeout(() => {
      if (type === "quote") {
        const quoteInput = document.querySelector(
          `[data-block-id="${newBlock.id}"] textarea, [data-block-id="${newBlock.id}"] input`
        ) as HTMLElement;
        quoteInput?.focus();
      } else if (type === "table") {
        const firstCell = document.querySelector(
          `[data-block-id="${newBlock.id}"] input`
        ) as HTMLElement;
        firstCell?.focus();
      } else if (type === "paragraph" || type === "heading") {
        const el = document.querySelector(
          `[data-block-id="${newBlock.id}"] [contenteditable="true"]`
        ) as HTMLElement;
        el?.focus();
      }
    }, 50);
  };

  const updateBlock = (blockId: string | undefined, updates: Partial<BlogBlock>) => {
    if (!blockId) return;
    const next = blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
    setBlocks(next);
    setIsDirty(true);
  };

  const deleteBlock = (blockId: string) => {
    if (blocks.length <= 1) {
      setBlocks([{ id: createBlockId(), type: "paragraph", text: "" }]);
      return;
    }
    const target = blocks.find((b) => b.id === blockId);
    if (
      target &&
      (target.type === "table" ||
        target.type === "columns" ||
        target.type === "gallery")
    ) {
      setDeleteConfirm({ blockId, label: target.type });
      return;
    }
    pushHistory(blocks.filter((b) => b.id !== blockId));
  };

  const confirmDeleteBlock = () => {
    if (!deleteConfirm) return;
    if (blocks.length <= 1) {
      setDeleteConfirm(null);
      return;
    }
    pushHistory(blocks.filter((b) => b.id !== deleteConfirm.blockId));
    setDeleteConfirm(null);
    toast.success("Block deleted");
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const id = blocks[index]?.id;
    if (!id) return;
    pushHistory(moveBlockById(blocks, id, direction));
  };

  // Handle image upload from computer
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempImgId = `img-${Date.now()}`;
    const previewUrl = URL.createObjectURL(file);
    const newParagraphId = `block-${Date.now() + 1}`;

    const newImgBlock: BlogBlock = {
      id: tempImgId,
      type: "image",
      url: previewUrl,
      caption: "",
      width: "100%",
      align: "center",
      isLoading: true,
    };

    const newParagraphBlock: BlogBlock = {
      id: newParagraphId,
      type: "paragraph",
      text: "",
      align: "left",
    };

    let currentIdx = targetBlockIndexRef.current;
    if (currentIdx === null || currentIdx === undefined || currentIdx < 0 || currentIdx >= blocks.length) {
      currentIdx = blocks.length - 1;
    }

    const currentBlock = blocks[currentIdx];
    const isCurrentEmptyParagraph =
      currentBlock &&
      currentBlock.type === "paragraph" &&
      (!currentBlock.text ||
        currentBlock.text.trim() === "" ||
        currentBlock.text === "<br>" ||
        currentBlock.text === "<p><br></p>");

    const next = [...blocks];
    if (isCurrentEmptyParagraph) {
      next.splice(currentIdx, 1, newImgBlock, newParagraphBlock);
      targetBlockIndexRef.current = currentIdx + 1;
    } else {
      next.splice(currentIdx + 1, 0, newImgBlock, newParagraphBlock);
      targetBlockIndexRef.current = currentIdx + 2;
    }

    pushHistory(next);

    if (fileInputRef.current) fileInputRef.current.value = "";

    setTimeout(() => {
      const el = document.querySelector(`[data-block-id="${newParagraphId}"]`) as HTMLElement;
      el?.focus();
    }, 50);

    try {
      const finalUrl = await uploadImageToServer(file);
      updateBlock(tempImgId, { url: finalUrl, isLoading: false });
    } catch (err) {
      console.error("Upload error", err);
      updateBlock(tempImgId, { isLoading: false });
    }
  };

  // Handle video upload from computer
  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempVidId = `vid-${Date.now()}`;
    const previewUrl = URL.createObjectURL(file);
    const newParagraphId = `block-${Date.now() + 1}`;

    const newVidBlock: BlogBlock = {
      id: tempVidId,
      type: "video",
      url: previewUrl,
      caption: "",
      isLoading: true,
    };

    const newParagraphBlock: BlogBlock = {
      id: newParagraphId,
      type: "paragraph",
      text: "",
      align: "left",
    };

    let currentIdx = targetBlockIndexRef.current;
    if (currentIdx === null || currentIdx === undefined || currentIdx < 0 || currentIdx >= blocks.length) {
      currentIdx = blocks.length - 1;
    }

    const currentBlock = blocks[currentIdx];
    const isCurrentEmptyParagraph =
      currentBlock &&
      currentBlock.type === "paragraph" &&
      (!currentBlock.text ||
        currentBlock.text.trim() === "" ||
        currentBlock.text === "<br>" ||
        currentBlock.text === "<p><br></p>");

    const next = [...blocks];
    if (isCurrentEmptyParagraph) {
      next.splice(currentIdx, 1, newVidBlock, newParagraphBlock);
      targetBlockIndexRef.current = currentIdx + 1;
    } else {
      next.splice(currentIdx + 1, 0, newVidBlock, newParagraphBlock);
      targetBlockIndexRef.current = currentIdx + 2;
    }

    pushHistory(next);

    if (videoFileInputRef.current) videoFileInputRef.current.value = "";

    setTimeout(() => {
      const el = document.querySelector(`[data-block-id="${newParagraphId}"]`) as HTMLElement;
      el?.focus();
    }, 50);

    setIsUploadingVideo(true);
    try {
      const finalUrl = await uploadVideoToServer(file);
      updateBlock(tempVidId, { url: finalUrl, isLoading: false });
    } catch (err) {
      console.error("Video upload error", err);
      updateBlock(tempVidId, { isLoading: false });
      toast.error("Không thể tải video lên, vui lòng thử lại!");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Handle Cover Image Upload
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const url = await uploadImageToServer(file);
      setCoverImage(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = "";
    }
  };

  // Save document
  const handleSaveDocument = useCallback(async () => {
    if (!title.trim()) {
      toast.error("Please enter an article title!");
      return;
    }

    setIsSaving(true);
    try {
      const finalSlug =
        slug.trim() ||
        title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");

      const payload: BlogPostData = {
        id: postToEdit?.id,
        title: title.trim(),
        slug: finalSlug,
        summary: summary.trim(),
        excerpt: summary.trim(),
        content: JSON.stringify(blocksRef.current),
        blocks: blocksRef.current,
        thumbnail: coverImage || "/images/IMG_7098.webp",
        coverImage: coverImage || "/images/IMG_7098.webp",
        category,
        author: authorName,
        authorName,
        tags,
        status: isPublic ? "published" : "draft",
        isPublic,
        seoTitle: title.trim(),
        seoDescription: metaDesc || summary.trim(),
        metaDesc: metaDesc || summary.trim(),
      };

      if (onSave) {
        await onSave(payload);
      }
      storePushVersion("Manual save");
      setIsDirty(false);
      toast.success("Article saved");
    } catch (err) {
      console.error("Save error", err);
      toast.error("An error occurred while saving the article.");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [
    title,
    slug,
    summary,
    coverImage,
    category,
    authorName,
    tags,
    isPublic,
    metaDesc,
    onSave,
    postToEdit?.id,
    storePushVersion,
  ]);

  const { status: autosaveStatus, lastSavedAt, saveNow } = useAutosave({
    isDirty,
    debounceMs: 4000,
    enabled: Boolean(onSave) && Boolean(title.trim()),
    onSave: handleSaveDocument,
  });
  useBeforeUnload(isDirty);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = blocks.map((b) => b.id!).filter(Boolean);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const nextIds = [...ids];
    const [moved] = nextIds.splice(oldIndex, 1);
    nextIds.splice(newIndex, 0, moved);
    pushHistory(reorderBlocksByIds(blocks, nextIds));
  };

  const insertSlashCommand = (type: BlogBlock["type"], extras?: Partial<BlogBlock> & { level?: number }) => {
    const activeId = targetBlockIdRef.current;
    const idx = activeId
      ? findBlockIndexById(blocks, activeId)
      : targetBlockIndexRef.current;
    const insertAt = idx === null || idx < 0 ? blocks.length : idx + 1;
    const fresh = createEmptyBlock(type, extras || {});
    const next = [...blocks];
    next.splice(insertAt, 0, fresh);
    pushHistory(next);
    setTargetBlockId(fresh.id || null);
    slash.close();
  };

  // Global shortcuts: Ctrl+S, ?, Ctrl+D, move block, headings
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveNow();
        return;
      }
      if (e.key === "?" && !meta && !(e.target as HTMLElement)?.closest?.("input, textarea, [contenteditable='true']")) {
        setShowShortcuts(true);
        return;
      }
      if (meta && e.key.toLowerCase() === "d" && targetBlockIdRef.current) {
        e.preventDefault();
        const id = targetBlockIdRef.current;
        const idx = findBlockIndexById(blocksRef.current, id);
        if (idx < 0) return;
        const copy = duplicateBlock(blocksRef.current[idx]);
        const next = [...blocksRef.current];
        next.splice(idx + 1, 0, copy);
        pushHistory(next);
        setTargetBlockId(copy.id || null);
        return;
      }
      if (meta && e.shiftKey && (e.key === "ArrowUp" || e.key === "ArrowDown") && targetBlockIdRef.current) {
        e.preventDefault();
        pushHistory(
          moveBlockById(
            blocksRef.current,
            targetBlockIdRef.current,
            e.key === "ArrowUp" ? "up" : "down"
          )
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveNow]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#100c18] text-slate-900 dark:text-[#e8dff1] transition-colors pb-20">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileSelect}
      />
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
        className="hidden"
        onChange={handleVideoFileSelect}
      />
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
      />
      <input
        ref={replaceImageFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !replaceTargetBlockId) return;
          const targetId = replaceTargetBlockId;
          const previewUrl = URL.createObjectURL(file);
          updateBlock(targetId, { url: previewUrl, isLoading: true });
          setReplaceTargetBlockId(null);
          if (replaceImageFileInputRef.current)
            replaceImageFileInputRef.current.value = "";
          try {
            const url = await uploadImageToServer(file);
            updateBlock(targetId, { url, isLoading: false });
          } catch {
            updateBlock(targetId, { isLoading: false });
          }
        }}
      />
      <input
        ref={columnFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !columnUploadTarget) return;
          const { blockId, side } = columnUploadTarget;
          const previewUrl = URL.createObjectURL(file);
          if (side === "left") {
            updateBlock(blockId, { leftImageUrl: previewUrl, leftType: "image" });
          } else {
            updateBlock(blockId, { rightImageUrl: previewUrl, rightType: "image" });
          }
          setColumnUploadTarget(null);
          if (columnFileInputRef.current) columnFileInputRef.current.value = "";
          try {
            const url = await uploadImageToServer(file);
            if (side === "left") {
              updateBlock(blockId, { leftImageUrl: url });
            } else {
              updateBlock(blockId, { rightImageUrl: url });
            }
          } catch {
            // Keep preview URL
          }
        }}
      />

      {/* Transparent Backdrop to close any open dropdowns when clicking outside */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-[9990]"
          onClick={closeAllDropdowns}
        />
      )}

      {/* Top Action Bar: Navigation, Title & Publish/Save */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="w-full bg-white dark:bg-[#1a1426] rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-[#2c2835] flex items-center justify-between gap-3">
          {/* Left: Back & Title/Status */}
          <div className="flex items-center gap-2.5 min-w-0">
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <div className="h-4 w-px bg-slate-200 dark:bg-[#2c2835] shrink-0" />

            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {title || "Untitled Article"}
            </span>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                isPublic
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              {isPublic ? "Published" : "Draft"}
            </span>
          </div>

          {/* Right: Save / Publish */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveDocument}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
            >
              {isSaving ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[16px]">publish</span>
              )}
              <span>{isPublic ? "Publish" : "Save Draft"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor Body */}
        <main className="lg:col-span-8 space-y-6">

          {/* Article Container Card */}
          <div className="bg-white dark:bg-[#1a1426] rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-[#2c2835] space-y-6">
            
            {/* Formatting Toolbar (Embedded neatly inside Article Card, single row with horizontal scroll) */}
            <div className="sticky top-4 z-30 bg-slate-50/95 dark:bg-[#151022]/95 backdrop-blur-md rounded-2xl p-2 border border-slate-200/80 dark:border-white/10 shadow-xs max-w-full overflow-hidden">
              <div className="w-full flex items-center gap-1 sm:gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-0.5 scroll-smooth whitespace-nowrap">
                {/* Font Family Dropdown */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      saveCurrentSelection();
                    }}
                    onClick={(e) => toggleDropdown("fontFamily", e)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-0.5 transition-colors cursor-pointer ${
                      isFontFamilyDropdownOpen
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-transparent"
                    }`}
                    title="Font Family"
                  >
                    <span className="font-medium text-xs max-w-[64px] truncate">{selectedFontFamily}</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                  </button>
                  {isFontFamilyDropdownOpen && dropdownCoords && (
                    <div
                      style={{ top: dropdownCoords.top, left: dropdownCoords.left }}
                      className="fixed z-[9999] w-48 bg-white dark:bg-[#1f1a29] rounded-xl shadow-2xl border border-slate-200 dark:border-[#2c2835] p-1.5 animate-in fade-in zoom-in-95 duration-100 space-y-0.5 max-h-64 overflow-y-auto"
                    >
                      {FONT_FAMILY_OPTIONS.map((f) => {
                        const isSelected =
                          selectedFontFamily === f.name || selectedFontFamily === f.label.split(" ")[0];
                        return (
                          <button
                            key={f.label}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              applyFontFamilyToSelection(f.value, f.name);
                              closeAllDropdowns();
                            }}
                            className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-rose-500 text-white font-bold"
                                : "text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600"
                            }`}
                          >
                            <span style={{ fontFamily: f.value }} className="font-medium">
                              {f.name}
                            </span>
                            <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                              {f.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Font Size Dropdown */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      saveCurrentSelection();
                    }}
                    onClick={(e) => toggleDropdown("fontSize", e)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-0.5 transition-colors cursor-pointer ${
                      isFontSizeDropdownOpen
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-transparent"
                    }`}
                    title="Font Size"
                  >
                    <span className="material-symbols-outlined text-[13px]">format_size</span>
                    <span className="font-bold min-w-3 text-center text-xs">
                      {String(selectedFontSize).replace(/[^0-9]/g, "") || "16"}
                    </span>
                    <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                  </button>
                  {isFontSizeDropdownOpen && dropdownCoords && (
                    <div
                      style={{ top: dropdownCoords.top, left: dropdownCoords.left }}
                      className="fixed z-[9999] w-36 bg-white dark:bg-[#1f1a29] rounded-xl shadow-2xl border border-slate-200 dark:border-[#2c2835] p-1.5 animate-in fade-in zoom-in-95 duration-100 space-y-0.5 max-h-64 overflow-y-auto"
                    >
                      {FONT_SIZE_OPTIONS.map((opt) => {
                        const currentNum = String(selectedFontSize).replace(/[^0-9]/g, "");
                        const isSelected = currentNum === opt.size || selectedFontSize === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              applyFontSizeToSelection(opt.value);
                              closeAllDropdowns();
                            }}
                            className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-rose-500 text-white font-bold"
                                : "text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600"
                            }`}
                          >
                            <span className="font-bold">{opt.size}</span>
                            <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Heading Level Dropdown (H1 - H6) */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => toggleDropdown("heading", e)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-0.5 transition-colors cursor-pointer ${
                      isHeadingDropdownOpen
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-transparent"
                    }`}
                    title="Choose Heading Level (H1 - H6)"
                  >
                    <span className="material-symbols-outlined text-[13px]">title</span>
                    <span className="text-xs">H{selectedHeadingLevel}</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                  </button>
                  {isHeadingDropdownOpen && dropdownCoords && (
                    <div
                      style={{ top: dropdownCoords.top, left: dropdownCoords.left }}
                      className="fixed z-[9999] w-36 bg-white dark:bg-[#1f1a29] rounded-xl shadow-2xl border border-slate-200 dark:border-[#2c2835] p-1.5 animate-in fade-in zoom-in-95 duration-100 space-y-0.5 max-h-72 overflow-y-auto"
                    >
                      {HEADING_OPTIONS.map((h) => {
                        const isSelected = selectedHeadingLevel === h.level;
                        return (
                          <button
                            key={h.level}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              applyHeadingToSelection(h.level);
                              closeAllDropdowns();
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? "bg-rose-500 text-white font-bold"
                                : "text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600"
                            }`}
                          >
                            <span
                              className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-100 dark:bg-white/10 text-rose-500"
                              }`}
                            >
                              {h.label}
                            </span>
                            <span className={`text-xs ${isSelected ? "text-white font-bold" : "font-medium"}`}>
                              {h.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="h-4 w-px bg-slate-200 dark:bg-[#2c2835] shrink-0 mx-0.5" />

                {/* Inline Formatting Tools */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => executeCommand("bold")}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      isBoldActive
                        ? "bg-rose-500/15 text-rose-600 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10"
                    }`}
                    title="Bold (Ctrl+B)"
                  >
                    <span className="material-symbols-outlined text-[15px]">format_bold</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => executeCommand("italic")}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      isItalicActive
                        ? "bg-rose-500/15 text-rose-600 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10"
                    }`}
                    title="Italic (Ctrl+I)"
                  >
                    <span className="material-symbols-outlined text-[15px]">format_italic</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => executeCommand("underline")}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      isUnderlineActive
                        ? "bg-rose-500/15 text-rose-600 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10"
                    }`}
                    title="Underline (Ctrl+U)"
                  >
                    <span className="material-symbols-outlined text-[15px]">format_underlined</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => executeCommand("strikeThrough")}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      isStrikethroughActive
                        ? "bg-rose-500/15 text-rose-600 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10"
                    }`}
                    title="Strikethrough"
                  >
                    <span className="material-symbols-outlined text-[15px]">strikethrough_s</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={applyInlineCodeToSelection}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Inline Code Tag"
                  >
                    <span className="material-symbols-outlined text-[15px]">code</span>
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-200 dark:bg-[#2c2835] shrink-0 mx-0.5" />

                {/* Text Color Picker */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => toggleDropdown("textColor", e)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      isTextColorPickerOpen
                        ? "bg-rose-500/15 text-rose-600"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10"
                    }`}
                    title="Text Color"
                  >
                    <span className="material-symbols-outlined text-[15px] text-rose-500">
                      format_color_text
                    </span>
                  </button>
                  {isTextColorPickerOpen && dropdownCoords && (
                    <div
                      style={{ top: dropdownCoords.top, left: dropdownCoords.left }}
                      className="fixed z-[9999] w-52 bg-white dark:bg-[#1f1a29] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#2c2835] p-3 animate-in fade-in zoom-in-95 duration-100 space-y-2"
                    >
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Text Color
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {TEXT_COLOR_PALETTE.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              applyTextColorToSelection(c.value);
                              closeAllDropdowns();
                            }}
                            style={{ backgroundColor: c.value }}
                            className="w-7 h-7 rounded-lg border border-white/20 shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
                            title={c.label}
                          />
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                        <input
                          type="color"
                          value={customColorHex}
                          onChange={(e) => setCustomColorHex(e.target.value)}
                          className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                        />
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            applyTextColorToSelection(customColorHex);
                            closeAllDropdowns();
                          }}
                          className="flex-1 py-1 bg-slate-100 dark:bg-white/10 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Apply Hex
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Highlight Background Picker */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => toggleDropdown("highlight", e)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      isHighlightPickerOpen
                        ? "bg-amber-500/15 text-amber-600"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10"
                    }`}
                    title="Highlight Background"
                  >
                    <span className="material-symbols-outlined text-[15px] text-amber-500">
                      ink_highlighter
                    </span>
                  </button>
                  {isHighlightPickerOpen && dropdownCoords && (
                    <div
                      style={{ top: dropdownCoords.top, left: dropdownCoords.left }}
                      className="fixed z-[9999] w-48 bg-white dark:bg-[#1f1a29] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#2c2835] p-3 animate-in fade-in zoom-in-95 duration-100 space-y-2"
                    >
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Highlight Color
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {HIGHLIGHT_COLOR_PALETTE.map((c) => (
                          <button
                            key={c.label}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              applyHighlightColorToSelection(c.value);
                              closeAllDropdowns();
                            }}
                            style={{
                              backgroundColor: c.value === "transparent" ? "#f1f5f9" : c.value,
                            }}
                            className="py-1 px-1.5 rounded-lg text-[10px] font-medium text-slate-800 border border-slate-300 dark:border-white/10 shadow-xs hover:scale-105 transition-all cursor-pointer text-center"
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Clear Formatting */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={applyClearFormatting}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title="Clear Formatting"
                >
                  <span className="material-symbols-outlined text-[15px]">format_clear</span>
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-[#2c2835] shrink-0 mx-0.5" />

                {/* Alignments */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyAlignmentToSelection("left")}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      textAlign === "left"
                        ? "bg-rose-500/15 text-rose-600 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10"
                    }`}
                    title="Align Left"
                  >
                    <span className="material-symbols-outlined text-[15px]">format_align_left</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyAlignmentToSelection("center")}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      textAlign === "center"
                        ? "bg-rose-500/15 text-rose-600 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10"
                    }`}
                    title="Align Center"
                  >
                    <span className="material-symbols-outlined text-[15px]">format_align_center</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyAlignmentToSelection("right")}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      textAlign === "right"
                        ? "bg-rose-500/15 text-rose-600 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10"
                    }`}
                    title="Align Right"
                  >
                    <span className="material-symbols-outlined text-[15px]">format_align_right</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyAlignmentToSelection("justify")}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      textAlign === "justify"
                        ? "bg-rose-500/15 text-rose-600 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10"
                    }`}
                    title="Justify"
                  >
                    <span className="material-symbols-outlined text-[15px]">format_align_justify</span>
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-200 dark:bg-[#2c2835] shrink-0 mx-0.5" />

                {/* Lists */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => executeCommand("insertUnorderedList")}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      isBulletListActive
                        ? "bg-rose-500/15 text-rose-600 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10"
                    }`}
                    title="Bullet List"
                  >
                    <span className="material-symbols-outlined text-[15px]">format_list_bulleted</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => executeCommand("insertOrderedList")}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      isNumberedListActive
                        ? "bg-rose-500/15 text-rose-600 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10"
                    }`}
                    title="Numbered List"
                  >
                    <span className="material-symbols-outlined text-[15px]">format_list_numbered</span>
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-200 dark:bg-[#2c2835] shrink-0 mx-0.5" />

                {/* Insert Link & Media */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      saveCurrentSelection();
                    }}
                    onClick={() => {
                      saveCurrentSelection();
                      openPrompt({
                        title: "Insert Hyperlink",
                        description: "Enter destination URL for selected text:",
                        placeholder: "https://example.com...",
                        icon: "link",
                        iconColor: "sky",
                        onConfirm: (url) => {
                          applyLinkToSelection(url);
                        },
                      });
                    }}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-transparent transition-colors flex items-center gap-1 cursor-pointer"
                    title="Insert Link"
                  >
                    <span className="material-symbols-outlined text-[15px]">link</span>
                    <span>Link</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-transparent transition-colors flex items-center gap-1 cursor-pointer"
                    title="Upload WebP Image"
                  >
                    <span className="material-symbols-outlined text-[15px]">image</span>
                    <span>Image</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => videoFileInputRef.current?.click()}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-transparent transition-colors flex items-center gap-1 cursor-pointer"
                    title="Tải video từ máy (MP4, WebM, MOV...)"
                  >
                    {isUploadingVideo ? (
                      <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-rose-500 rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[15px]">smart_display</span>
                    )}
                    <span>Video</span>
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-200 dark:bg-[#2c2835] shrink-0 mx-0.5" />

                {/* Quick Add Block Shortcuts */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addBlock("quote")}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-transparent transition-colors flex items-center gap-1 cursor-pointer"
                    title="Add Quote Block"
                  >
                    <span className="material-symbols-outlined text-[15px]">format_quote</span>
                    <span>Quote</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addBlock("table")}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-transparent transition-colors flex items-center gap-1 cursor-pointer"
                    title="Add Table Block"
                  >
                    <span className="material-symbols-outlined text-[15px]">table_chart</span>
                    <span>Table</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addBlock("columns")}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-transparent transition-colors flex items-center gap-1 cursor-pointer"
                    title="Add 2-Column Block"
                  >
                    <span className="material-symbols-outlined text-[15px]">view_column</span>
                    <span>2-Col</span>
                  </button>

                  <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-0.5" />

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addBlock("callout")}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-transparent transition-colors cursor-pointer"
                    title="Callout"
                  >
                    Callout
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addBlock("toggle")}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-transparent transition-colors cursor-pointer"
                    title="Toggle"
                  >
                    Toggle
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addBlock("gallery")}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-transparent transition-colors cursor-pointer"
                    title="Gallery"
                  >
                    Gallery
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addBlock("embed")}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-transparent transition-colors cursor-pointer"
                    title="Embed"
                  >
                    Embed
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowVersions(true)}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-transparent transition-colors cursor-pointer"
                    title="Version history"
                  >
                    History
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const tpl = EDITOR_TEMPLATES[0];
                      if (!tpl) return;
                      pushHistory([...blocks, ...tpl.blocks.map((b) => ({ ...b, id: createBlockId() }))]);
                      toast.success(`Inserted template: ${tpl.name}`);
                    }}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-transparent transition-colors cursor-pointer"
                    title="Insert template"
                  >
                    Template
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(blocks, null, 2)], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `xon-article-blocks-${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Exported blocks JSON");
                    }}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-transparent transition-colors cursor-pointer"
                    title="Export JSON"
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Article Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="w-full text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white bg-transparent border-none outline-none placeholder-slate-300 dark:placeholder-slate-600 tracking-tight leading-tight font-serif"
              />
            </div>

            {/* Excerpt / Lead Paragraph - Auto Expanding Full Height */}
            <div>
              <textarea
                ref={summaryTextareaRef}
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  if (summaryTextareaRef.current) {
                    summaryTextareaRef.current.style.height = "auto";
                    summaryTextareaRef.current.style.height = `${summaryTextareaRef.current.scrollHeight}px`;
                  }
                }}
                placeholder="Enter article excerpt or lead overview..."
                rows={1}
                className="w-full text-sm sm:text-base text-slate-600 dark:text-[#ad8888] bg-slate-50 dark:bg-[#120d20] p-4 rounded-2xl border border-slate-200 dark:border-white/5 outline-none resize-none leading-relaxed italic overflow-hidden transition-[height] duration-75"
              />
            </div>

            {/* Block Sequence Editor */}
            <div
              data-editor-canvas
              className="relative space-y-6 pt-4 border-t border-slate-100 dark:border-white/5"
              onDragEnter={dropMedia.onDragEnter}
              onDragLeave={dropMedia.onDragLeave}
              onDragOver={dropMedia.onDragOver}
              onDrop={async (e) => {
                e.preventDefault();
                dropMedia.onDropEnd();
                const files = Array.from(e.dataTransfer.files || []);
                const images = files.filter((f) => f.type.startsWith("image/"));
                const videos = files.filter((f) => f.type.startsWith("video/"));
                if (images[0]) {
                  const dt = new DataTransfer();
                  dt.items.add(images[0]);
                  if (fileInputRef.current) {
                    fileInputRef.current.files = dt.files;
                    fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
                  }
                } else if (videos[0]) {
                  const dt = new DataTransfer();
                  dt.items.add(videos[0]);
                  if (videoFileInputRef.current) {
                    videoFileInputRef.current.files = dt.files;
                    videoFileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
                  }
                }
              }}
            >
              <DropOverlay visible={dropMedia.isDragging} />
              <DndContext
                sensors={dndSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((b) => b.id!).filter(Boolean)}
                  strategy={verticalListSortingStrategy}
                >
              {blocks.map((block, idx) => {
                const blockId = block.id || `block-${idx}`;

                return (
                  <SortableBlockWrapper key={blockId} id={blockId} disabled={isPreview}>
                  <div
                    onClick={() => setTargetBlockId(blockId)}
                    onFocus={() => setTargetBlockId(blockId)}
                    className={`relative group/block transition-all ${
                      block.type === "paragraph" || block.type === "image" || block.type === "heading" || block.type === "video"
                        ? "p-0 bg-transparent border-none"
                        : "rounded-2xl p-4 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/80 dark:hover:bg-white/[0.04] border border-transparent hover:border-slate-200 dark:border-white/10"
                    }`}
                  >
                    {/* Hover Block Controls */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover/block:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-[#201a30] shadow-md border border-slate-200 dark:border-white/10 rounded-xl p-1 z-20">
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => moveBlock(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_upward
                        </span>
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => moveBlock(idx, "down")}
                        disabled={idx === blocks.length - 1}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_downward
                        </span>
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => deleteBlock(blockId)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete Block"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    </div>

                    {/* Block Content Renderers */}
                    {block.type === "heading" && (
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const currentLvl = block.level || 2;
                            const nextLvl = (currentLvl % 6) + 1;
                            updateBlock(blockId, { level: nextLvl });
                          }}
                          className="text-rose-600 dark:text-rose-400 font-mono text-xs font-bold mt-1.5 select-none bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Click to cycle heading level (H1 - H6)"
                        >
                          H{block.level || 2}
                        </button>
                        <span className="text-rose-500 font-mono text-lg font-bold mt-1 select-none">
                          {String(idx + 1).padStart(2, "0")}.
                        </span>
                        <RichEditableBlock
                          html={block.text || ""}
                          placeholder={`Enter Heading ${block.level || 2}...`}
                          blockId={blockId}
                          onFocus={() => {
                            targetBlockIndexRef.current = idx;
                            handleSelectionOrFocusChange();
                          }}
                          onSelectionChange={() => {
                            targetBlockIndexRef.current = idx;
                            handleSelectionOrFocusChange();
                          }}
                          onChange={(newHtml) =>
                            updateBlock(blockId, { text: newHtml })
                          }
                          className={`flex-1 font-bold text-slate-900 dark:text-white ${
                            (block.level === 1 && "text-2xl sm:text-3xl font-extrabold") ||
                            (block.level === 3 && "text-lg sm:text-xl") ||
                            (block.level === 4 && "text-base sm:text-lg") ||
                            (block.level === 5 && "text-sm sm:text-base") ||
                            (block.level === 6 && "text-xs sm:text-sm") ||
                            "text-xl sm:text-2xl"
                          }`}
                        />
                      </div>
                    )}

                    {block.type === "paragraph" && (
                      <RichEditableBlock
                        html={block.text || ""}
                        placeholder="Write paragraph content here (Press Ctrl+V to paste images directly)..."
                        blockId={blockId}
                        onFocus={() => {
                          targetBlockIndexRef.current = idx;
                          handleSelectionOrFocusChange();
                        }}
                        onSelectionChange={() => {
                          targetBlockIndexRef.current = idx;
                          handleSelectionOrFocusChange();
                        }}
                        onPasteImage={async (file) => {
                          const url = await uploadImageToServer(file);
                          const newImgBlock: BlogBlock = {
                            id: `img-${Date.now()}`,
                            type: "image",
                            url,
                            caption: "",
                            width: "100%",
                            align: "center",
                          };
                          const newParagraphId = `block-${Date.now() + 1}`;
                          const newParagraphBlock: BlogBlock = {
                            id: newParagraphId,
                            type: "paragraph",
                            text: "",
                            align: "left",
                          };
                          const next = [...blocks];
                          next.splice(idx + 1, 0, newImgBlock, newParagraphBlock);
                          targetBlockIndexRef.current = idx + 2;
                          pushHistory(next);
                          setTimeout(() => {
                            const el = document.querySelector(`[data-block-id="${newParagraphId}"]`) as HTMLElement;
                            el?.focus();
                          }, 50);
                        }}
                        onChange={(newHtml) =>
                          updateBlock(blockId, { text: newHtml })
                        }
                        className="text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed min-h-[36px]"
                      />
                    )}

                    {block.type === "image" && (
                      <div className="space-y-2">
                        <ResizableImageBlock
                          block={block}
                          onUpdate={(updates) => updateBlock(blockId, updates)}
                          onDelete={() => deleteBlock(blockId)}
                          onReplace={() => {
                            setReplaceTargetBlockId(blockId);
                            replaceImageFileInputRef.current?.click();
                          }}
                        />
                      </div>
                    )}

                    {block.type === "quote" && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#161127] border-l-4 border-rose-500 space-y-2.5 shadow-sm">
                        <textarea
                          value={block.text || ""}
                          onFocus={() => {
                            targetBlockIndexRef.current = idx;
                          }}
                          onChange={(e) => {
                            updateBlock(blockId, { text: e.target.value });
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          placeholder="Nhập nội dung trích dẫn (Quote)..."
                          rows={2}
                          className="w-full bg-transparent text-base sm:text-lg italic font-medium text-slate-800 dark:text-slate-200 outline-none resize-none"
                        />
                        <input
                          type="text"
                          value={block.author || ""}
                          onFocus={() => {
                            targetBlockIndexRef.current = idx;
                          }}
                          onChange={(e) =>
                            updateBlock(blockId, { author: e.target.value })
                          }
                          placeholder="— Tác giả / Nguồn trích dẫn..."
                          className="w-full bg-transparent text-xs font-semibold text-rose-600 dark:text-rose-400 outline-none"
                        />
                      </div>
                    )}

                    {block.type === "columns" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                            Left Column
                          </span>
                          {block.leftType === "image" && block.leftImageUrl ? (
                            <ColumnImageResizable
                              imageUrl={block.leftImageUrl}
                              caption={block.leftImageCaption}
                              imageHeight={block.leftImageHeight}
                              onUpdate={(up) =>
                                updateBlock(blockId, {
                                  leftImageHeight: up.height,
                                  leftImageCaption: up.caption,
                                })
                              }
                              onUploadClick={() => {
                                setColumnUploadTarget({ blockId, side: "left" });
                                columnFileInputRef.current?.click();
                              }}
                              onDelete={() =>
                                updateBlock(blockId, {
                                  leftType: "text",
                                  leftImageUrl: "",
                                })
                              }
                            />
                          ) : (
                            <RichEditableBlock
                              html={block.leftText || ""}
                              placeholder="Enter left column content..."
                              blockId={blockId}
                              field="left"
                              onFocus={() => {
                                targetBlockIndexRef.current = idx;
                                handleSelectionOrFocusChange();
                              }}
                              onSelectionChange={() => {
                                targetBlockIndexRef.current = idx;
                                handleSelectionOrFocusChange();
                              }}
                              onChange={(html) =>
                                updateBlock(blockId, { leftText: html })
                              }
                              className="text-sm sm:text-base leading-relaxed p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 min-h-[80px]"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-500">
                            Right Column
                          </span>
                          {block.rightType === "image" && block.rightImageUrl ? (
                            <ColumnImageResizable
                              imageUrl={block.rightImageUrl}
                              caption={block.rightImageCaption}
                              imageHeight={block.rightImageHeight}
                              onUpdate={(up) =>
                                updateBlock(blockId, {
                                  rightImageHeight: up.height,
                                  rightImageCaption: up.caption,
                                })
                              }
                              onUploadClick={() => {
                                setColumnUploadTarget({ blockId, side: "right" });
                                columnFileInputRef.current?.click();
                              }}
                              onDelete={() =>
                                updateBlock(blockId, {
                                  rightType: "text",
                                  rightImageUrl: "",
                                })
                              }
                            />
                          ) : (
                            <RichEditableBlock
                              html={block.rightText || ""}
                              placeholder="Enter right column content..."
                              blockId={blockId}
                              field="right"
                              onFocus={() => {
                                targetBlockIndexRef.current = idx;
                                handleSelectionOrFocusChange();
                              }}
                              onSelectionChange={() => {
                                targetBlockIndexRef.current = idx;
                                handleSelectionOrFocusChange();
                              }}
                              onChange={(html) =>
                                updateBlock(blockId, { rightText: html })
                              }
                              className="text-sm sm:text-base leading-relaxed p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 min-h-[80px]"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {block.type === "video" && (
                      <div className="space-y-2 my-4">
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black max-w-3xl mx-auto shadow-lg flex items-center justify-center">
                          {block.isLoading ? (
                            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-20 text-white p-4 animate-in fade-in duration-200">
                              <div className="relative flex items-center justify-center">
                                <div className="w-14 h-14 rounded-full border-3 border-rose-500/20 border-t-rose-500 animate-spin" />
                                <span className="material-symbols-outlined absolute text-rose-400 text-xl animate-pulse">
                                  movie
                                </span>
                              </div>
                              <div className="text-center space-y-1">
                                <div className="text-sm font-bold text-white tracking-wide">
                                  Đang tải video lên...
                                </div>
                                <div className="text-[11px] text-slate-400 font-medium">
                                  Đang tối ưu hóa định dạng video tốc độ cao
                                </div>
                              </div>
                            </div>
                          ) : block.url?.startsWith("data:") ||
                            block.url?.startsWith("blob:") ||
                            block.url?.includes("/video/upload/") ||
                            block.url?.includes(".mp4") ||
                            block.url?.includes(".webm") ||
                            block.url?.includes(".mov") ? (
                            <video
                              src={block.url}
                              controls
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <iframe
                              src={formatVideoEmbedUrl(block.url)}
                              title={block.caption || "Video Embed"}
                              className="w-full h-full border-0"
                              allowFullScreen
                            />
                          )}
                        </div>
                        <input
                          type="text"
                          value={block.caption || ""}
                          onFocus={() => {
                            targetBlockIndexRef.current = idx;
                          }}
                          onChange={(e) =>
                            updateBlock(blockId, { caption: e.target.value })
                          }
                          placeholder="Thêm chú thích video (không bắt buộc)..."
                          className="w-full text-center text-xs text-slate-500 dark:text-slate-400 italic bg-transparent outline-none border-b border-transparent focus:border-slate-300 dark:focus:border-white/20 py-1"
                        />
                      </div>
                    )}

                    {block.type === "table" && (
                      <div className="space-y-2">
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                              <tr>
                                {block.headers?.map((h, hIdx) => (
                                  <th key={hIdx} className="p-2.5">
                                    <input
                                      value={h}
                                      onFocus={() => {
                                        targetBlockIndexRef.current = idx;
                                      }}
                                      onChange={(e) => {
                                        const nextH = [...(block.headers || [])];
                                        nextH[hIdx] = e.target.value;
                                        updateBlock(blockId, { headers: nextH });
                                      }}
                                      className="w-full bg-transparent font-bold text-rose-600 dark:text-rose-400 outline-none text-xs uppercase"
                                      placeholder={`Cột ${hIdx + 1}`}
                                    />
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                              {block.rows?.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-2.5">
                                      <input
                                        value={cell}
                                        onFocus={() => {
                                          targetBlockIndexRef.current = idx;
                                        }}
                                        onChange={(e) => {
                                          const nextRows = [...(block.rows || [])];
                                          nextRows[rIdx][cIdx] = e.target.value;
                                          updateBlock(blockId, { rows: nextRows });
                                        }}
                                        className="w-full bg-transparent text-slate-800 dark:text-slate-200 outline-none text-xs"
                                        placeholder="..."
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Table Controls */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const nextRows = [...(block.rows || [])];
                              const colCount = block.headers?.length || (nextRows[0]?.length ?? 3);
                              nextRows.push(Array(colCount).fill(""));
                              updateBlock(blockId, { rows: nextRows });
                            }}
                            className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-500 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            title="Thêm hàng mới"
                          >
                            <span className="material-symbols-outlined text-[13px]">add</span>
                            <span>Thêm hàng</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const nextHeaders = [...(block.headers || [])];
                              nextHeaders.push(`Cột ${nextHeaders.length + 1}`);
                              const nextRows = (block.rows || []).map((r) => [...r, ""]);
                              updateBlock(blockId, { headers: nextHeaders, rows: nextRows });
                            }}
                            className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-500 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            title="Thêm cột mới"
                          >
                            <span className="material-symbols-outlined text-[13px]">add</span>
                            <span>Thêm cột</span>
                          </button>
                          {block.rows && block.rows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextRows = block.rows?.slice(0, -1) || [];
                                updateBlock(blockId, { rows: nextRows });
                              }}
                              className="px-2 py-1 text-xs font-medium text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Xóa hàng cuối"
                            >
                              <span className="material-symbols-outlined text-[13px]">remove</span>
                              <span>Xóa hàng</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {block.type === "code" && (
                      <CodeBlockEditor
                        block={block}
                        onChange={(patch) => updateBlock(blockId, patch)}
                      />
                    )}

                    {block.type === "callout" && (
                      <CalloutBlock
                        block={block}
                        onChange={(patch) => updateBlock(blockId, patch)}
                      />
                    )}

                    {block.type === "toggle" && (
                      <ToggleBlock
                        block={block}
                        onChange={(patch) => updateBlock(blockId, patch)}
                      />
                    )}

                    {block.type === "gallery" && (
                      <GalleryBlock
                        block={block}
                        onChange={(patch) => updateBlock(blockId, patch)}
                        onUploadFiles={async (files) => {
                          const urls: string[] = [];
                          for (const file of files) {
                            urls.push(await uploadImageToServer(file));
                          }
                          return urls;
                        }}
                      />
                    )}

                    {block.type === "embed" && (
                      <EmbedBlock
                        block={block}
                        onChange={(patch) => updateBlock(blockId, patch)}
                      />
                    )}

                    {block.type === "divider" && (
                      <hr className="my-4 border-t-2 border-dashed border-slate-200 dark:border-white/10" />
                    )}
                  </div>
                  </SortableBlockWrapper>
                );
              })}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Settings & Publishing Controls */}
        <aside
          className={`lg:col-span-4 space-y-6 ${
            isFocusMode ? "hidden" : ""
          }`}
        >
          <SeoPreviewCard
            title={title}
            slug={slug}
            description={metaDesc || summary}
          />

          {/* Cover Image Card */}
          <div className="bg-white dark:bg-[#1a1426] rounded-3xl p-5 shadow-lg border border-slate-200 dark:border-[#2c2835] space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500 text-[20px]">
                image
              </span>
              <span>Article Cover Image (.webp)</span>
            </h3>

            {coverImage ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-md group">
                <OptimizedImage
                  src={coverImage}
                  alt="Article Cover"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-900 rounded-xl font-bold text-xs shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Replace Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="px-3 py-1.5 bg-rose-500 text-white rounded-xl font-bold text-xs shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={isUploadingCover}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#2c2835] flex flex-col items-center justify-center p-4 hover:border-rose-500 dark:hover:border-rose-500 transition-colors cursor-pointer bg-slate-50 dark:bg-white/[0.02]"
              >
                {isUploadingCover ? (
                  <span className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-slate-400 text-[32px] mb-1">
                      add_photo_alternate
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Upload WebP Cover
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Automatically optimized to high-speed WebP
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Publishing Information Card */}
          <div className="bg-white dark:bg-[#1a1426] rounded-3xl p-5 shadow-lg border border-slate-200 dark:border-[#2c2835] space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-500 text-[20px]">
                settings
              </span>
              <span>Publishing Settings</span>
            </h3>

            {/* Slug */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Permanent Link (Slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-from-title"
                className="w-full bg-slate-50 dark:bg-[#120d20] border border-slate-200 dark:border-[#2c2835] rounded-xl px-3 py-2 text-xs font-mono outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* Publishing Status Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Publishing Status:
              </span>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${isPublic
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  }`}
              >
                {isPublic ? "Published" : "Draft"}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Prompt Modal */}
      <PromptModal {...promptModal} />

      <Toaster richColors position="top-center" />

      <BubbleToolbar
        visible={bubble.visible && !isPreview}
        top={bubble.rect?.top || 0}
        left={bubble.rect?.left || 0}
        isBold={isBoldActive}
        isItalic={isItalicActive}
        isUnderline={isUnderlineActive}
        isStrike={isStrikethroughActive}
        onBold={() => executeCommand("bold")}
        onItalic={() => executeCommand("italic")}
        onUnderline={() => executeCommand("underline")}
        onStrike={() => executeCommand("strikeThrough")}
        onCode={() => applyInlineCodeToSelection()}
        onLink={() =>
          openPrompt({
            title: "Insert link",
            placeholder: "https://...",
            onConfirm: (url) => applyLinkToSelection(url),
          })
        }
        onColor={() => toggleDropdown("textColor")}
        onHighlight={() => toggleDropdown("highlight")}
      />

      <SlashCommandMenu
        open={slash.open}
        top={slash.position?.top || 0}
        left={slash.position?.left || 0}
        query={slash.query}
        items={slash.filtered}
        activeIndex={slash.activeIndex}
        onHover={(i) => {
          /* set via move when keyboard; hover updates selection visually */
          for (let n = 0; n < Math.abs(i - slash.activeIndex); n++) {
            slash.move(i > slash.activeIndex ? 1 : -1);
          }
        }}
        onSelect={(cmd) => insertSlashCommand(cmd.type, cmd.extras)}
        onClose={slash.close}
      />

      <EditorStatusBar
        wordCount={wordCount}
        readingMinutes={readingMinutes}
        blockCount={blocks.length}
        saveStatus={autosaveStatus === "idle" && isDirty ? "idle" : autosaveStatus}
        lastSavedAt={lastSavedAt}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onTogglePreview={() => setIsPreview((v) => !v)}
        onToggleFocus={() => setIsFocusMode((v) => !v)}
        onShowShortcuts={() => setShowShortcuts(true)}
        isPreview={isPreview}
        isFocus={isFocusMode}
      />

      <ShortcutsHelp open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      <VersionHistoryPanel
        open={showVersions}
        versions={storeVersions}
        onClose={() => setShowVersions(false)}
        onSnapshot={() => {
          storePushVersion("Manual snapshot");
          toast.success("Snapshot saved");
        }}
        onRestore={(id) => {
          if (storeRestoreVersion(id)) {
            const restored = useEditorBlocksStore.getState().blocks;
            pushHistory(restored);
            toast.success("Version restored");
            setShowVersions(false);
          }
        }}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete block?"
        message={`Delete this ${deleteConfirm?.label || "block"}? This cannot be undone from the trash (use Undo if needed).`}
        confirmLabel="Delete"
        onConfirm={confirmDeleteBlock}
        onClose={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
