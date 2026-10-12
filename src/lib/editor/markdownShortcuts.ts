import type { BlogBlock } from "@/components/blog/ArticleBody";

export type MarkdownShortcutAction =
  | { kind: "heading"; level: number }
  | { kind: "quote" }
  | { kind: "list"; listType: "bullet" | "numbered" }
  | { kind: "code" }
  | { kind: "divider" };

/**
 * Detect markdown-style shortcuts typed at the start of a line.
 * Call after space/enter with the text before the caret.
 */
export function detectMarkdownShortcut(
  textBeforeCursor: string
): MarkdownShortcutAction | null {
  const line = textBeforeCursor.split("\n").pop() ?? "";
  const trimmed = line.replace(/\u00a0/g, " ");

  if (/^#{1,6}\s$/.test(trimmed)) {
    return { kind: "heading", level: trimmed.trim().length };
  }
  if (/^>\s$/.test(trimmed)) return { kind: "quote" };
  if (/^[-*]\s$/.test(trimmed)) return { kind: "list", listType: "bullet" };
  if (/^1\.\s$/.test(trimmed)) return { kind: "list", listType: "numbered" };
  if (/^```$/.test(trimmed.trim())) return { kind: "code" };
  if (/^---$/.test(trimmed.trim())) return { kind: "divider" };
  return null;
}

export function shortcutToBlockType(
  action: MarkdownShortcutAction
): BlogBlock["type"] {
  switch (action.kind) {
    case "heading":
      return "heading";
    case "quote":
      return "quote";
    case "list":
      return "list";
    case "code":
      return "code";
    case "divider":
      return "divider";
  }
}
