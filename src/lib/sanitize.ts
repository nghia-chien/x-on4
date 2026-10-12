import sanitizeHtml from "sanitize-html";

const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "b",
    "i",
    "u",
    "strong",
    "em",
    "p",
    "br",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "a",
    "span",
    "div",
    "figure",
    "figcaption",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "code",
    "pre",
    "hr",
    "del",
    "mark",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    span: ["class", "style"],
    div: ["class", "style", "align"],
    p: ["class", "style"],
    img: ["src", "alt", "loading", "decoding", "class", "width", "height"],
    figure: ["class", "style"],
    figcaption: ["class"],
    ul: ["class"],
    ol: ["class"],
    li: ["class"],
    table: ["class"],
    th: ["class"],
    td: ["class"],
    h1: ["class", "style"],
    h2: ["class", "style"],
    h3: ["class", "style"],
    h4: ["class", "style"],
  },
  allowedSchemes: ["http", "https", "mailto", "data"],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

/** Strip XSS from rich-text HTML before persist / render */
export function sanitizeRichText(dirty: string): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty, RICH_TEXT_OPTIONS);
}

/** Plain-text fields (contact/wholesale) — strip all tags */
export function sanitizePlainText(dirty: string, maxLen = 2000): string {
  const stripped = sanitizeHtml(String(dirty || ""), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
  return stripped.slice(0, maxLen);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim()) && email.trim().length <= 254;
}
