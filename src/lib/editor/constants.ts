import type { BlogBlock } from "@/components/blog/ArticleBody";

export const FONT_SIZE_OPTIONS = [
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
];

export const FONT_FAMILY_OPTIONS = [
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  { label: "Display", value: "'Playfair Display', Georgia, serif" },
];

export const HEADING_OPTIONS = [
  { label: "Paragraph", level: 0 },
  { label: "Heading 1", level: 1 },
  { label: "Heading 2", level: 2 },
  { label: "Heading 3", level: 3 },
  { label: "Heading 4", level: 4 },
  { label: "Heading 5", level: 5 },
  { label: "Heading 6", level: 6 },
];

export const TEXT_COLOR_PALETTE = [
  { label: "Default", value: "#0f172a" },
  { label: "Rose", value: "#e11d48" },
  { label: "Sky", value: "#0284c7" },
  { label: "Emerald", value: "#059669" },
  { label: "Amber", value: "#d97706" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Slate", value: "#64748b" },
  { label: "White", value: "#ffffff" },
];

export const HIGHLIGHT_COLOR_PALETTE = [
  { label: "None", value: "transparent" },
  { label: "Yellow", value: "#fef08a" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Sky", value: "#bae6fd" },
  { label: "Lavender", value: "#e9d5ff" },
];

export const COLUMN_LAYOUTS = [
  "50-50",
  "33-67",
  "67-33",
  "33-33-33",
  "25-75",
] as const;

export type SlashCommand = {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  icon: string;
  type: BlogBlock["type"];
  extras?: Partial<BlogBlock> & { level?: number };
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "paragraph",
    label: "Text",
    description: "Plain paragraph",
    keywords: ["text", "p", "paragraph"],
    icon: "notes",
    type: "paragraph",
  },
  {
    id: "h1",
    label: "Heading 1",
    description: "Large section title",
    keywords: ["h1", "heading", "title"],
    icon: "format_h1",
    type: "heading",
    extras: { level: 1 },
  },
  {
    id: "h2",
    label: "Heading 2",
    description: "Medium section title",
    keywords: ["h2", "heading"],
    icon: "format_h2",
    type: "heading",
    extras: { level: 2 },
  },
  {
    id: "h3",
    label: "Heading 3",
    description: "Small section title",
    keywords: ["h3", "heading"],
    icon: "format_h3",
    type: "heading",
    extras: { level: 3 },
  },
  {
    id: "image",
    label: "Image",
    description: "Upload or embed an image",
    keywords: ["image", "photo", "img"],
    icon: "image",
    type: "image",
  },
  {
    id: "video",
    label: "Video",
    description: "Upload or embed video",
    keywords: ["video", "youtube"],
    icon: "videocam",
    type: "video",
  },
  {
    id: "quote",
    label: "Quote",
    description: "Capture a quote",
    keywords: ["quote", "blockquote"],
    icon: "format_quote",
    type: "quote",
  },
  {
    id: "bullet",
    label: "Bullet list",
    description: "Unordered list",
    keywords: ["bullet", "ul", "list"],
    icon: "format_list_bulleted",
    type: "list",
    extras: { listType: "bullet" },
  },
  {
    id: "number",
    label: "Numbered list",
    description: "Ordered list",
    keywords: ["number", "ol", "list"],
    icon: "format_list_numbered",
    type: "list",
    extras: { listType: "numbered" },
  },
  {
    id: "table",
    label: "Table",
    description: "Simple data table",
    keywords: ["table", "grid"],
    icon: "table",
    type: "table",
  },
  {
    id: "code",
    label: "Code",
    description: "Code block",
    keywords: ["code", "snippet"],
    icon: "code",
    type: "code",
  },
  {
    id: "callout",
    label: "Callout",
    description: "Info / warn / success / error",
    keywords: ["callout", "info", "warn"],
    icon: "info",
    type: "callout",
  },
  {
    id: "toggle",
    label: "Toggle",
    description: "Collapsible accordion",
    keywords: ["toggle", "accordion", "spoiler"],
    icon: "expand_more",
    type: "toggle",
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Multi-image gallery",
    keywords: ["gallery", "images"],
    icon: "photo_library",
    type: "gallery",
  },
  {
    id: "embed",
    label: "Embed",
    description: "YouTube / Twitter / Instagram",
    keywords: ["embed", "youtube", "twitter", "instagram"],
    icon: "link",
    type: "embed",
  },
  {
    id: "columns",
    label: "Columns",
    description: "Multi-column layout",
    keywords: ["columns", "layout"],
    icon: "view_column",
    type: "columns",
  },
  {
    id: "divider",
    label: "Divider",
    description: "Horizontal rule",
    keywords: ["divider", "hr", "line"],
    icon: "horizontal_rule",
    type: "divider",
  },
];
