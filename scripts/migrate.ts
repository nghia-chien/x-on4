/**
 * X-ON migration dry-run script.
 * Usage: npx tsx scripts/migrate.ts --dry-run
 *
 * Dry-run only: validates documents with `new Model(data)` + validateSync(),
 * never calls save/insertMany/create/updateOne.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Model } from "mongoose";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const root = resolve(__dirname, "..");
loadEnvFile(resolve(root, ".env.local"));
loadEnvFile(resolve(root, ".env"));

const isDryRun = process.argv.includes("--dry-run");
const wantsApply = process.argv.includes("--apply");

if (wantsApply) {
  console.error(
    "❌ --apply is out of scope for this plan. Re-run with --dry-run only after explicit approval."
  );
  process.exit(1);
}

if (!isDryRun) {
  console.error("Usage: npx tsx scripts/migrate.ts --dry-run");
  process.exit(1);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function maskUri(uri: string): string {
  try {
    const u = new URL(uri);
    if (u.password) u.password = "***";
    if (u.username) u.username = "***";
    return `${u.protocol}//${u.username ? "***:***@" : ""}${u.host}${u.pathname}`;
  } catch {
    return "[configured, masked]";
  }
}

type Warning = string;

function stripMeta<T extends Record<string, unknown>>(
  doc: T,
  extraOmit: string[] = []
): Record<string, unknown> {
  const omit = new Set(["id", "createdAt", "updatedAt", "_id", ...extraOmit]);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(doc)) {
    if (omit.has(k)) continue;
    out[k] = v;
  }
  return out;
}

function validateDoc(
  ModelCtor: Model<unknown>,
  data: Record<string, unknown>,
  entityLabel: string,
  entityId: string,
  warnings: Warning[]
): boolean {
  try {
    const doc = new ModelCtor(data);
    const err = doc.validateSync();
    if (err) {
      const details = Object.values(err.errors || {})
        .map((e) => (e as { message?: string }).message || String(e))
        .join("; ");
      warnings.push(`${entityLabel} ${entityId}: ${details}`);
      return false;
    }
    return true;
  } catch (e) {
    warnings.push(`${entityLabel} ${entityId}: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}

function collectAssetPaths(value: unknown, into: Set<string>) {
  if (typeof value === "string") {
    if (value.startsWith("/images/") || value.startsWith("/videos/")) {
      into.add(value);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectAssetPaths(item, into);
    return;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectAssetPaths(v, into);
    }
  }
}

function classifyAssets(paths: string[]) {
  const product_images = new Set<string>();
  const category_images = new Set<string>();
  const blog_images = new Set<string>();
  const gallery_images = new Set<string>();
  const videos = new Set<string>();
  const other_images = new Set<string>();

  for (const p of paths) {
    if (p.startsWith("/videos/")) {
      videos.add(p);
      continue;
    }
    other_images.add(p);
  }

  return { product_images, category_images, blog_images, gallery_images, videos, other_images };
}

async function main() {
  console.log("=== X-ON Migration Dry-run ===");

  const allowDemo = process.env.ALLOW_DEMO_ACCOUNTS;
  if (allowDemo === "true") {
    console.error(
      "[FAIL] ALLOW_DEMO_ACCOUNTS=true — refuse migration while demo accounts are enabled"
    );
    process.exit(1);
  }
  console.log("[OK] ALLOW_DEMO_ACCOUNTS=false — demo accounts excluded");

  const adminEmail = process.env.ADMIN_EMAIL?.trim() || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (!adminEmail || !isValidEmail(adminEmail) || adminPassword.length < 12) {
    console.log(
      "[WARN] ADMIN_EMAIL/ADMIN_PASSWORD missing or invalid (email format, password >= 12 chars)"
    );
  } else {
    console.log("[OK] ADMIN_EMAIL/ADMIN_PASSWORD configured (values not printed)");
  }

  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || "";
  if (!mongoUri) {
    console.log("[WARN] MongoDB URI not configured — dry-run continues (no writes)");
  } else {
    console.log(`[OK] MongoDB URI configured (${maskUri(mongoUri)})`);
  }
  console.log("");

  // Dynamic imports after env load so DataStore bootstrap sees env
  const { DataStore } = await import("../src/lib/dataStore");
  const {
    AdminUserModel,
    ProductModel,
    CategoryModel,
    GalleryModel,
    BlogPostModel,
    OrderModel,
    CustomerModel,
    WholesaleRequestModel,
    NewsletterModel,
    SettingsModel,
    ComingSoonModel,
    ContactMessageModel,
  } = await import("../src/lib/models");

  const warnings: Warning[] = [];

  // --- Collect documents ---
  const isDemoAdmin = (a: { id?: string; email?: string }) =>
    (a.email || "").toLowerCase().endsWith("@xonails.com") ||
    a.id === "admin-1" ||
    a.id === "admin-2" ||
    a.id === "admin-3";

  const admins = DataStore.getAdmins().filter((a) => !isDemoAdmin(a));
  const productsResult = DataStore.getProducts({ limit: 10_000 });
  const products = productsResult.products;
  const categories = DataStore.getCategories();
  const gallery = DataStore.getGallery();
  const blogs = DataStore.getBlogs();
  const ordersResult = DataStore.getOrders({ limit: 10_000 });
  const orders = ordersResult.orders;
  const customersResult = DataStore.getCustomers({ limit: 10_000 });
  const customers = customersResult.customers;
  const wholesale = DataStore.getWholesale();
  const newsletter = DataStore.getNewsletter();
  const settings = DataStore.getSettings();
  const comingSoon = DataStore.getComingSoon();
  const contacts = DataStore.getContactMessages();

  // --- Validate (no save) ---
  for (const a of admins) {
    // getAdmins strips passwordHash; supply placeholder so schema can validate other fields
    validateDoc(
      AdminUserModel as Model<unknown>,
      {
        ...stripMeta(a as unknown as Record<string, unknown>, ["avatar", "accounts", "lastLogin"]),
        passwordHash: "dry-run-placeholder-hash",
      },
      "Admin",
      a.id || a.email,
      warnings
    );
  }

  for (const p of products) {
    const raw = p as unknown as Record<string, unknown>;
    const { collection, colorOptions, ...rest } = stripMeta(raw);
    validateDoc(
      ProductModel as Model<unknown>,
      {
        ...rest,
        collectionName: collection || "",
      },
      "Product",
      p.id || p.slug,
      warnings
    );
  }

  for (const c of categories) {
    validateDoc(
      CategoryModel as Model<unknown>,
      stripMeta(c as unknown as Record<string, unknown>),
      "Category",
      c.id || c.slug,
      warnings
    );
  }

  for (const g of gallery) {
    validateDoc(
      GalleryModel as Model<unknown>,
      stripMeta(g as unknown as Record<string, unknown>),
      "Gallery",
      g.id || g.title,
      warnings
    );
  }

  for (const b of blogs) {
    validateDoc(
      BlogPostModel as Model<unknown>,
      stripMeta(b as unknown as Record<string, unknown>),
      "BlogPost",
      b.id || b.slug,
      warnings
    );
  }

  for (const o of orders) {
    validateDoc(
      OrderModel as Model<unknown>,
      stripMeta(o as unknown as Record<string, unknown>),
      "Order",
      o.id || o.orderNumber,
      warnings
    );
  }

  for (const c of customers) {
    validateDoc(
      CustomerModel as Model<unknown>,
      stripMeta(c as unknown as Record<string, unknown>),
      "Customer",
      c.id || c.email,
      warnings
    );
  }

  for (const w of wholesale) {
    validateDoc(
      WholesaleRequestModel as Model<unknown>,
      stripMeta(w as unknown as Record<string, unknown>),
      "Wholesale",
      w.id || w.email,
      warnings
    );
  }

  for (const n of newsletter) {
    validateDoc(
      NewsletterModel as Model<unknown>,
      stripMeta(n as unknown as Record<string, unknown>),
      "Newsletter",
      n.id || n.email,
      warnings
    );
  }

  validateDoc(
    SettingsModel as Model<unknown>,
    settings as unknown as Record<string, unknown>,
    "Settings",
    "site-settings",
    warnings
  );

  for (const item of comingSoon) {
    validateDoc(
      ComingSoonModel as Model<unknown>,
      stripMeta(item as unknown as Record<string, unknown>),
      "ComingSoon",
      item.id || item.productName,
      warnings
    );
  }

  for (const m of contacts) {
    validateDoc(
      ContactMessageModel as Model<unknown>,
      stripMeta(m as unknown as Record<string, unknown>),
      "Contact",
      m.id || m.email,
      warnings
    );
  }

  // --- Asset inventory ---
  const allAssets = new Set<string>();
  const productAssets = new Set<string>();
  const categoryAssets = new Set<string>();
  const blogAssets = new Set<string>();
  const galleryAssets = new Set<string>();
  const videoAssets = new Set<string>();

  for (const p of products) {
    collectAssetPaths(p.images, productAssets);
    collectAssetPaths(p.thumbnail, productAssets);
  }
  for (const c of categories) {
    collectAssetPaths(c.image, categoryAssets);
  }
  for (const b of blogs) {
    collectAssetPaths(b.thumbnail, blogAssets);
  }
  for (const g of gallery) {
    collectAssetPaths(g.image, galleryAssets);
  }
  for (const item of comingSoon) {
    collectAssetPaths(item.image, productAssets);
  }
  collectAssetPaths(settings, allAssets);

  for (const s of [
    ...productAssets,
    ...categoryAssets,
    ...blogAssets,
    ...galleryAssets,
    ...allAssets,
  ]) {
    if (s.startsWith("/videos/")) videoAssets.add(s);
  }

  // Scan collected sets for videos misplaced in image lists
  for (const set of [productAssets, categoryAssets, blogAssets, galleryAssets]) {
    for (const p of [...set]) {
      if (p.startsWith("/videos/")) {
        set.delete(p);
        videoAssets.add(p);
      }
    }
  }

  const missingThumbnails = products.filter((p) => !p.thumbnail).length;
  const localImageHint =
    [...productAssets, ...categoryAssets, ...blogAssets, ...galleryAssets].length > 0;

  console.log("📦 DOCUMENTS TO MIGRATE:");
  console.log(`  Admin Users:      ${admins.length}  (env-bootstrapped only, demo excluded)`);
  console.log(`  Products:         ${products.length}`);
  console.log(`  Categories:       ${categories.length}`);
  console.log(`  Gallery Items:    ${gallery.length}`);
  console.log(`  Blog Posts:       ${blogs.length}`);
  console.log(`  Orders:           ${orders.length}`);
  console.log(`  Customers:        ${customers.length}`);
  console.log(`  Wholesale:        ${wholesale.length}`);
  console.log(`  Newsletter:       ${newsletter.length}`);
  console.log(`  Coming Soon:      ${comingSoon.length}`);
  console.log(`  Contact Messages: ${contacts.length}`);
  console.log(`  Settings:         1`);
  console.log("");

  const sample = (set: Set<string>, n = 3) => {
    const arr = [...set];
    if (arr.length === 0) return "";
    const shown = arr.slice(0, n).join(", ");
    return arr.length > n ? `  (${shown}, ...)` : `  (${shown})`;
  };

  console.log("🖼️  ASSETS TO UPLOAD (Cloudinary):");
  console.log(
    `  Category images:  ${categoryAssets.size}${sample(categoryAssets)}`
  );
  console.log(`  Blog thumbnails:  ${blogAssets.size}${sample(blogAssets)}`);
  console.log(`  Gallery images:   ${galleryAssets.size}${sample(galleryAssets)}`);
  console.log(`  Videos:           ${videoAssets.size}${sample(videoAssets)}`);
  console.log(
    `  Product images:   ${productAssets.size}${sample(productAssets)}`
  );
  console.log("");

  console.log("⚠️  WARNINGS:");
  if (warnings.length === 0 && missingThumbnails === 0 && !localImageHint) {
    console.log("  (none)");
  } else {
    if (missingThumbnails > 0) {
      console.log(`  - ${missingThumbnails} products: missing thumbnail`);
    }
    if (localImageHint) {
      console.log(
        "  - All image paths are local (/images/...) — upload before MongoDB migration"
      );
    }
    for (const w of warnings) {
      console.log(`  - ${w}`);
    }
  }
  console.log("");

  console.log("✅ Dry-run complete. No data written.");
  console.log(
    "   Run with --apply to execute (requires your explicit approval first)."
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration dry-run failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
