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
    "h3",
    "h4",
    "blockquote",
    "a",
    "span",
    "div",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    span: ["class"],
    div: ["class"],
    p: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
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
