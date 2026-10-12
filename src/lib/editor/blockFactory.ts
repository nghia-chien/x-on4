import type { BlogBlock } from "@/components/blog/ArticleBody";

export function createBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function findBlockIndexById(blocks: BlogBlock[], id: string): number {
  return blocks.findIndex((b) => b.id === id);
}

export function ensureBlockIds(blocks: BlogBlock[]): BlogBlock[] {
  return blocks.map((b) => (b.id ? b : { ...b, id: createBlockId() }));
}

export function duplicateBlock(block: BlogBlock): BlogBlock {
  return {
    ...structuredClone(block),
    id: createBlockId(),
  };
}

export function moveBlockById(
  blocks: BlogBlock[],
  id: string,
  direction: "up" | "down"
): BlogBlock[] {
  const idx = findBlockIndexById(blocks, id);
  if (idx < 0) return blocks;
  const target = direction === "up" ? idx - 1 : idx + 1;
  if (target < 0 || target >= blocks.length) return blocks;
  const next = [...blocks];
  const [item] = next.splice(idx, 1);
  next.splice(target, 0, item);
  return next;
}

export function reorderBlocksByIds(
  blocks: BlogBlock[],
  orderedIds: string[]
): BlogBlock[] {
  const map = new Map(blocks.map((b) => [b.id || "", b]));
  const ordered: BlogBlock[] = [];
  for (const id of orderedIds) {
    const block = map.get(id);
    if (block) {
      ordered.push(block);
      map.delete(id);
    }
  }
  for (const leftover of map.values()) ordered.push(leftover);
  return ordered;
}

type BlockExtras = Partial<BlogBlock> & { level?: number };

/** Factory for new blocks — block `id` is always set (source of truth). */
export function createEmptyBlock(
  type: BlogBlock["type"],
  extras: BlockExtras = {}
): BlogBlock {
  const id = createBlockId();
  const base: BlogBlock = {
    id,
    type,
    padding: extras.padding || "normal",
    bgStyle: extras.bgStyle || "transparent",
    ...extras,
  };

  switch (type) {
    case "heading":
      return { ...base, type: "heading", level: extras.level || 2, text: "" };
    case "paragraph":
      return { ...base, type: "paragraph", text: "" };
    case "quote":
      return { ...base, type: "quote", text: "", author: "" };
    case "list":
      return {
        ...base,
        type: "list",
        listType: extras.listType || "bullet",
        items: [""],
      };
    case "table":
      return {
        ...base,
        type: "table",
        headers: ["Column 1", "Column 2", "Column 3"],
        rows: [
          ["", "", ""],
          ["", "", ""],
        ],
      };
    case "code":
      return {
        ...base,
        type: "code",
        code: "",
        language: extras.language || "plaintext",
      };
    case "columns":
      return {
        ...base,
        type: "columns",
        layout: extras.layout || "50-50",
        columnLayout: extras.columnLayout || "50-50",
        leftType: "text",
        rightType: "text",
        leftText: "",
        rightText: "",
      };
    case "divider":
      return { ...base, type: "divider" };
    case "image":
      return { ...base, type: "image", url: extras.url || "", caption: "" };
    case "video":
      return { ...base, type: "video", url: extras.url || "", caption: "" };
    case "callout":
      return {
        ...base,
        type: "callout",
        text: "",
        calloutVariant: extras.calloutVariant || "info",
      };
    case "toggle":
      return {
        ...base,
        type: "toggle",
        toggleTitle: extras.toggleTitle || "Toggle section",
        toggleOpen: true,
        text: "",
      };
    case "gallery":
      return { ...base, type: "gallery", galleryUrls: extras.galleryUrls || [] };
    case "embed":
      return {
        ...base,
        type: "embed",
        url: extras.url || "",
        embedProvider: extras.embedProvider || "generic",
      };
    default:
      return { ...base, type: "paragraph", text: "" };
  }
}
