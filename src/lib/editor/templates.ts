import type { BlogBlock } from "@/components/blog/ArticleBody";
import { createEmptyBlock } from "./blockFactory";

export type EditorTemplate = {
  id: string;
  name: string;
  description: string;
  blocks: BlogBlock[];
};

/** One-click block presets for the Insert → Templates menu. */
export const EDITOR_TEMPLATES: EditorTemplate[] = [
  {
    id: "howto",
    name: "How-to guide",
    description: "H2 + steps + tip callout",
    blocks: [
      createEmptyBlock("heading", { level: 2, text: "How to get started" }),
      createEmptyBlock("paragraph", {
        text: "Introduce the goal in 1–2 sentences.",
      }),
      createEmptyBlock("list", {
        listType: "numbered",
        items: ["Step one", "Step two", "Step three"],
      }),
      createEmptyBlock("callout", {
        calloutVariant: "info",
        text: "Pro tip: keep each step short and actionable.",
      }),
    ],
  },
  {
    id: "review",
    name: "Product review",
    description: "Hero quote + gallery + verdict",
    blocks: [
      createEmptyBlock("heading", { level: 2, text: "First impressions" }),
      createEmptyBlock("quote", {
        text: "A standout press-on set for everyday glam.",
        author: "X-ON Editorial",
      }),
      createEmptyBlock("gallery", { galleryUrls: [] }),
      createEmptyBlock("callout", {
        calloutVariant: "success",
        text: "Verdict: Recommended for date night & events.",
      }),
    ],
  },
  {
    id: "compare",
    name: "Comparison",
    description: "Two-column layout + table",
    blocks: [
      createEmptyBlock("heading", { level: 2, text: "Side-by-side" }),
      createEmptyBlock("columns", { layout: "50-50", columnLayout: "50-50" }),
      createEmptyBlock("table"),
    ],
  },
];
