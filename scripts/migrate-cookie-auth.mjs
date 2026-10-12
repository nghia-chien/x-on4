import fs from "fs";

const files = [
  "src/components/admin/AdminSidebar.tsx",
  "src/components/admin/ProductForm.tsx",
  "src/components/admin/BlogForm.tsx",
  "src/app/admin/contact/page.tsx",
  "src/app/admin/blog/page.tsx",
  "src/app/admin/coming-soon/page.tsx",
  "src/app/admin/newsletter/page.tsx",
  "src/app/admin/wholesale/page.tsx",
  "src/app/admin/admin-users/page.tsx",
  "src/app/admin/page.tsx",
  "src/app/admin/settings/page.tsx",
  "src/app/admin/products/page.tsx",
  "src/app/admin/orders/[id]/page.tsx",
  "src/app/admin/gallery/page.tsx",
  "src/app/admin/categories/page.tsx",
  "src/app/admin/customers/page.tsx",
  "src/app/admin/orders/page.tsx",
  "src/app/admin/reviews/page.tsx",
];

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log("missing", f);
    continue;
  }
  let s = fs.readFileSync(f, "utf8");
  const orig = s;

  if (!s.includes("admin_token") && !s.includes("Authorization")) {
    console.log("skip", f);
    continue;
  }

  if (!s.includes("@/lib/apiClient")) {
    if (/["']use client["']/.test(s)) {
      s = s.replace(/(["']use client["'];\s*)/, `$1\nimport { apiFetch } from "@/lib/apiClient";\n`);
    } else {
      s = `import { apiFetch } from "@/lib/apiClient";\n` + s;
    }
  }

  s = s.replace(/\s*const token = localStorage\.getItem\(["']admin_token["']\);\s*/g, "\n");
  s = s.replace(
    /\s*const token =\s*\n?\s*typeof window !== ["']undefined["']\s*\n?\s*\?\s*localStorage\.getItem\(["']admin_token["']\)\s*\n?\s*:\s*null;\s*/g,
    "\n"
  );

  // Remove Authorization: `Bearer ${token}`
  s = s.replace(/,?\s*Authorization:\s*`Bearer \$\{token\}`,?/g, "");
  s = s.replace(/Authorization:\s*`Bearer \$\{token\}`,?\s*/g, "");

  // Remove authHeaders helpers
  s = s.replace(
    /const authHeaders = useCallback\(\(\)(?:: Record<string, string>)? => \{[\s\S]*?\}, \[\]\);\s*/g,
    ""
  );
  s = s.replace(/\.\.\.authHeaders\(\),?/g, "");
  s = s.replace(/headers:\s*authHeaders\(\),?/g, "");

  // fetch("/api -> apiFetch("/api
  s = s.replace(/\bfetch\(\s*(["'`])(\/api\/)/g, "apiFetch($1$2");
  s = s.replace(/\bfetch\(\s*(url\.toString\(\))/g, "apiFetch($1");
  s = s.replace(/\bfetch\(\s*(`\$\{)/g, "apiFetch($1");

  // Clean empty headers: { }
  s = s.replace(/headers:\s*\{\s*\},?\s*/g, "");
  // Fix headers: { , "Content-Type"
  s = s.replace(/headers:\s*\{\s*,/g, "headers: {");
  // Fix trailing commas before }
  s = s.replace(/,(\s*\})/g, "$1");

  // Remove credentials: "include" duplicates if we left broken objects — keep fine

  if (s !== orig) {
    fs.writeFileSync(f, s);
    console.log("updated", f);
  } else {
    console.log("nochange", f);
  }
}
