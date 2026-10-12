/**
 * Paste / Word RTF helpers for the blog WYSIWYG editor.
 * Kept separate so AdminEditor stays focused on UI orchestration.
 */

/** Convert legacy Markdown snippets to HTML for initial block load. */
export function mdToHtml(str?: string): string {
  if (!str) return "";
  return str
    .replace(
      /!\[(.*?)\]\((.*?)\)/g,
      '<img src="$2" alt="$1" class="my-3 max-h-[420px] max-w-full rounded-xl object-cover block mx-auto shadow-lg" />'
    )
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)([^\*]+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/~~(.*?)~~/g, "<del>$1</del>")
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-rose-600 dark:text-rose-400 hover:underline font-medium">$1</a>'
    );
}

/** Strip nested Word-style align wrappers. */
export function cleanAlignTags(str?: string): string {
  if (!str) return "";
  let cleaned = str;
  while (/<div align="(?:left|center|right)"[^>]*>([\s\S]*?)<\/div>/i.test(cleaned)) {
    cleaned = cleaned.replace(
      /<div align="(?:left|center|right)"[^>]*>([\s\S]*?)<\/div>/gi,
      "$1"
    );
  }
  cleaned = cleaned
    .replace(/<div align="(?:left|center|right)"[^>]*>/gi, "")
    .replace(/<\/div>/gi, "");
  return cleaned;
}

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

function hexToBase64(hexStr: string, mimeType: string): string | null {
  try {
    const cleanHex = hexStr.replace(/[^0-9a-fA-F]/g, "");
    if (cleanHex.length < 32 || cleanHex.length % 2 !== 0) return null;

    const byteCount = cleanHex.length / 2;
    const u8 = new Uint8Array(byteCount);
    for (let i = 0; i < byteCount; i++) {
      u8[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
    }

    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < u8.length; i += chunkSize) {
      const chunk = u8.subarray(i, Math.min(i + chunkSize, u8.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return `data:${mimeType};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

/** Extract embedded images from Word text/rtf clipboard payload. */
export function extractImagesFromRtf(rtf: string): string[] {
  if (!rtf) return [];
  const results: string[] = [];
  try {
    let searchIdx = 0;
    while ((searchIdx = rtf.indexOf("\\pict", searchIdx)) !== -1) {
      const startBrace = rtf.lastIndexOf("{", searchIdx);
      if (startBrace === -1) {
        searchIdx += 5;
        continue;
      }

      let depth = 1;
      let endIdx = startBrace + 1;
      while (endIdx < rtf.length && depth > 0) {
        const char = rtf[endIdx];
        if (char === "\\") {
          endIdx += 2;
          continue;
        }
        if (char === "{") depth++;
        else if (char === "}") depth--;
        endIdx++;
      }

      const pictBlock = rtf.slice(startBrace, endIdx);
      searchIdx = endIdx;

      let mime = "image/png";
      if (pictBlock.includes("\\jpegblip") || pictBlock.includes("\\jpgblip")) {
        mime = "image/jpeg";
      } else if (pictBlock.includes("\\pngblip")) {
        mime = "image/png";
      }

      let rawHex = "";
      const blipMatch = pictBlock.match(
        /\\(pngblip|jpegblip|jpgblip|emfblip|wmetafile\d*|dibitmap\d*)[^\r\n0-9a-fA-F]*([0-9a-fA-F\s\r\n]{64,})/i
      );
      if (blipMatch?.[2]) {
        rawHex = blipMatch[2].replace(/[^0-9a-fA-F]/g, "");
      } else {
        const hexMatches = pictBlock.match(/[0-9a-fA-F\s\r\n]{64,}/g);
        if (hexMatches) {
          for (const seq of hexMatches) {
            const clean = seq.replace(/[^0-9a-fA-F]/g, "");
            if (clean.length > rawHex.length) rawHex = clean;
          }
        }
      }

      if (rawHex.length >= 64) {
        const hexLower = rawHex.toLowerCase();
        if (hexLower.startsWith("ffd8ff")) mime = "image/jpeg";
        else if (hexLower.startsWith("89504e47")) mime = "image/png";
        else if (hexLower.startsWith("47494638")) mime = "image/gif";
        else if (hexLower.startsWith("424d")) mime = "image/bmp";
        else if (hexLower.startsWith("52494646") && hexLower.includes("57454250")) {
          mime = "image/webp";
        }

        const base64Url = hexToBase64(rawHex, mime);
        if (base64Url) results.push(base64Url);
      }
    }
  } catch (err) {
    console.warn("RTF image parsing error:", err);
  }
  return results;
}

/** Clean pasted HTML and replace Word file:// images with RTF-extracted data URLs. */
export function cleanPastedHtml(html: string, rtfImages: string[] = []): string {
  if (!html) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    doc.querySelectorAll("meta, style, script, link, xml, head").forEach((el) => el.remove());

    doc.querySelectorAll("font").forEach((fontEl) => {
      const parent = fontEl.parentNode;
      if (parent) {
        while (fontEl.firstChild) parent.insertBefore(fontEl.firstChild, fontEl);
        parent.removeChild(fontEl);
      }
    });

    let rtfImgIndex = 0;

    doc.querySelectorAll("v\\:imagedata, imagedata").forEach((vmlEl) => {
      const src = vmlEl.getAttribute("src") || "";
      if (
        src.startsWith("file:") ||
        src.startsWith("cid:") ||
        src.startsWith("blob:") ||
        !src
      ) {
        if (rtfImages.length > rtfImgIndex) {
          const img = doc.createElement("img");
          img.src = rtfImages[rtfImgIndex++];
          img.className =
            "my-3 max-h-[420px] max-w-full rounded-xl object-cover block mx-auto shadow-lg text-center select-none";
          img.setAttribute("contenteditable", "false");
          vmlEl.parentNode?.replaceChild(img, vmlEl);
        } else {
          vmlEl.remove();
        }
      }
    });

    doc.querySelectorAll("img").forEach((img) => {
      let src = img.getAttribute("src") || "";
      const isLocalOrInvalid =
        src.startsWith("file:") ||
        src.startsWith("blob:") ||
        src.startsWith("cid:") ||
        src.startsWith("webkit-fake-url:") ||
        !src.trim();

      if (isLocalOrInvalid) {
        if (rtfImages.length > rtfImgIndex) {
          src = rtfImages[rtfImgIndex++];
          img.setAttribute("src", src);
        } else {
          img.remove();
          return;
        }
      }

      img.className =
        "my-3 max-h-[420px] max-w-full rounded-xl object-cover block mx-auto shadow-lg text-center select-none";
      img.setAttribute("contenteditable", "false");
      img.removeAttribute("align");
      img.removeAttribute("width");
      img.removeAttribute("height");

      const pAfter = doc.createElement("p");
      pAfter.innerHTML = "<br>";
      if (img.nextSibling) img.parentNode?.insertBefore(pAfter, img.nextSibling);
      else img.parentNode?.appendChild(pAfter);
    });

    doc.body.querySelectorAll("*").forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.backgroundColor = "";
      htmlEl.style.background = "";
      htmlEl.style.backgroundImage = "";
      htmlEl.style.backgroundClip = "";
      htmlEl.removeAttribute("bgcolor");

      if (htmlEl.getAttribute("color")) htmlEl.removeAttribute("color");

      if (htmlEl.className && htmlEl.tagName !== "IMG") {
        const cleanedClass = htmlEl.className
          .split(" ")
          .filter(
            (c) =>
              !c.startsWith("Mso") &&
              !c.startsWith("docs-") &&
              !c.startsWith("Apple-")
          )
          .join(" ");
        if (cleanedClass) htmlEl.className = cleanedClass;
        else htmlEl.removeAttribute("class");
      }

      if (htmlEl.tagName.toLowerCase() === "figure") {
        htmlEl.className = "my-4 text-center block mx-auto";
        htmlEl.removeAttribute("align");
      }

      if (!htmlEl.getAttribute("style") || htmlEl.getAttribute("style")?.trim() === "") {
        htmlEl.removeAttribute("style");
      }
    });

    const lastChild = doc.body.lastElementChild;
    if (
      lastChild &&
      (lastChild.tagName === "IMG" ||
        lastChild.tagName === "FIGURE" ||
        lastChild.tagName === "TABLE" ||
        lastChild.tagName === "DIV" ||
        lastChild.tagName === "BLOCKQUOTE")
    ) {
      const p = doc.createElement("p");
      p.innerHTML = "<br>";
      doc.body.appendChild(p);
    }

    return doc.body.innerHTML || html;
  } catch {
    return html;
  }
}
