import type { BlogBlock } from "@/components/blog/ArticleBody";

export function stripHtml(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function blockPlainText(block: BlogBlock): string {
  const parts: string[] = [];
  if (block.text) parts.push(stripHtml(block.text));
  if (block.code) parts.push(block.code);
  if (block.caption) parts.push(block.caption);
  if (block.author) parts.push(block.author);
  if (block.toggleTitle) parts.push(block.toggleTitle);
  if (block.leftText) parts.push(stripHtml(block.leftText));
  if (block.rightText) parts.push(stripHtml(block.rightText));
  if (block.items?.length) parts.push(block.items.join(" "));
  if (block.headers?.length) parts.push(block.headers.join(" "));
  if (block.rows?.length) {
    parts.push(block.rows.map((r) => r.join(" ")).join(" "));
  }
  return parts.join(" ");
}

export function countWordsFromBlocks(blocks: BlogBlock[]): number {
  const text = blocks.map(blockPlainText).join(" ").trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/** Average adult reading speed ~200 wpm. */
export function estimateReadingMinutes(blocks: BlogBlock[]): number {
  const words = countWordsFromBlocks(blocks);
  return Math.max(1, Math.ceil(words / 200));
}
