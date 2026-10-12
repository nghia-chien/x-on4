import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { BlogPostModel } from "@/lib/models";
import type { BlogPostItem, BlogPostStatus } from "@/types/admin";
import { BLOG_POST_STATUSES } from "@/types/admin";

export class MongoUnavailableError extends Error {
  constructor(message = "MongoDB is not configured or unreachable") {
    super(message);
    this.name = "MongoUnavailableError";
  }
}

type LeanBlog = Record<string, unknown> & {
  _id?: unknown;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  publishedAt?: Date | string;
};

function toIso(value: Date | string | undefined): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function normalizeBlogStatus(status: unknown): BlogPostStatus {
  const raw = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (raw === "draft" || raw === "published" || raw === "archived") return raw;
  return "draft";
}

export function toBlogPostItem(doc: LeanBlog): BlogPostItem {
  return {
    id: String(doc._id ?? ""),
    title: String(doc.title || ""),
    slug: String(doc.slug || ""),
    excerpt: String(doc.excerpt || ""),
    content: String(doc.content || ""),
    thumbnail: String(doc.thumbnail || ""),
    author: String(doc.author || "X-ON Team"),
    category: String(doc.category || "Nail Care & Trends"),
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : [],
    status: normalizeBlogStatus(doc.status),
    publishedAt: toIso(doc.publishedAt),
    seoTitle: doc.seoTitle ? String(doc.seoTitle) : undefined,
    seoDescription: doc.seoDescription ? String(doc.seoDescription) : undefined,
    createdAt: toIso(doc.createdAt) || new Date().toISOString(),
    updatedAt: toIso(doc.updatedAt) || new Date().toISOString(),
  };
}

async function ensureDb() {
  const conn = await connectToDatabase();
  if (!conn) throw new MongoUnavailableError();
  return conn;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isObjectId(id: string): boolean {
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    String(new mongoose.Types.ObjectId(id)) === id
  );
}

/** Match both legacy Title Case and normalized lowercase statuses in Mongo */
function statusFilter(status: string): Record<string, unknown> {
  const normalized = normalizeBlogStatus(status);
  const legacy =
    normalized.charAt(0).toUpperCase() + normalized.slice(1); // Published
  return { $in: [normalized, legacy, status] };
}

export async function listBlogs(params?: {
  status?: string;
  search?: string;
}): Promise<BlogPostItem[]> {
  await ensureDb();
  const filter: Record<string, unknown> = {};

  if (params?.status && params.status !== "all") {
    filter.status = statusFilter(params.status);
  }

  if (params?.search?.trim()) {
    const q = escapeRegex(params.search.trim());
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { excerpt: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
      { author: { $regex: q, $options: "i" } },
    ];
  }

  const docs = (await BlogPostModel.find(filter)
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean()) as LeanBlog[];

  return docs.map(toBlogPostItem);
}

export async function getBlogByIdOrSlug(
  idOrSlug: string
): Promise<BlogPostItem | null> {
  await ensureDb();
  const raw = decodeURIComponent(idOrSlug || "").trim();
  if (!raw) return null;
  const q = raw.toLowerCase();

  const or: Record<string, unknown>[] = [{ slug: q }, { slug: raw }];
  if (isObjectId(raw)) {
    or.push({ _id: new mongoose.Types.ObjectId(raw) });
  }

  const doc = (await BlogPostModel.findOne({ $or: or }).lean()) as LeanBlog | null;
  return doc ? toBlogPostItem(doc) : null;
}

export async function createBlog(
  data: Omit<BlogPostItem, "id" | "createdAt" | "updatedAt">
): Promise<BlogPostItem> {
  await ensureDb();
  const status = normalizeBlogStatus(data.status || "draft");
  const created = await BlogPostModel.create({
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || "",
    content: data.content || "",
    thumbnail: data.thumbnail || "",
    author: data.author || "X-ON Team",
    category: data.category || "Nail Care & Trends",
    tags: data.tags || [],
    status,
    publishedAt:
      status === "published"
        ? data.publishedAt
          ? new Date(data.publishedAt)
          : new Date()
        : undefined,
    seoTitle: data.seoTitle || "",
    seoDescription: data.seoDescription || "",
  });
  return toBlogPostItem(created.toObject() as LeanBlog);
}

export async function updateBlog(
  idOrSlug: string,
  data: Partial<BlogPostItem>
): Promise<BlogPostItem | null> {
  await ensureDb();
  const existing = await getBlogByIdOrSlug(idOrSlug);
  if (!existing) return null;

  const patch: Record<string, unknown> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.slug !== undefined) patch.slug = data.slug;
  if (data.excerpt !== undefined) patch.excerpt = data.excerpt;
  if (data.content !== undefined) patch.content = data.content;
  if (data.thumbnail !== undefined) patch.thumbnail = data.thumbnail;
  if (data.author !== undefined) patch.author = data.author;
  if (data.category !== undefined) patch.category = data.category;
  if (data.tags !== undefined) patch.tags = data.tags;
  if (data.seoTitle !== undefined) patch.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) patch.seoDescription = data.seoDescription;

  if (data.status !== undefined) {
    const status = normalizeBlogStatus(data.status);
    if (!BLOG_POST_STATUSES.includes(status)) {
      throw new Error(`Invalid blog status: ${data.status}`);
    }
    patch.status = status;
    if (status === "published" && !data.publishedAt && !existing.publishedAt) {
      patch.publishedAt = new Date();
    }
  }
  if (data.publishedAt !== undefined) {
    patch.publishedAt = new Date(data.publishedAt);
  }

  const updated = (await BlogPostModel.findByIdAndUpdate(existing.id, patch, {
    new: true,
    runValidators: true,
  }).lean()) as LeanBlog | null;

  return updated ? toBlogPostItem(updated) : null;
}

export async function deleteBlog(idOrSlug: string): Promise<boolean> {
  await ensureDb();
  const existing = await getBlogByIdOrSlug(idOrSlug);
  if (!existing) return false;
  const res = await BlogPostModel.findByIdAndDelete(existing.id);
  return Boolean(res);
}

let legacyStatusHealed = false;

/** Normalize legacy Title-Case statuses once per process (idempotent). */
export async function normalizeLegacyBlogStatuses(): Promise<number> {
  if (legacyStatusHealed) return 0;
  await ensureDb();
  // Bypass schema enum cast by using native collection update
  const col = BlogPostModel.collection;
  const ops = [
    col.updateMany({ status: "Published" }, { $set: { status: "published" } }),
    col.updateMany({ status: "Draft" }, { $set: { status: "draft" } }),
    col.updateMany({ status: "Archived" }, { $set: { status: "archived" } }),
  ];
  const results = await Promise.all(ops);
  legacyStatusHealed = true;
  return results.reduce((sum, r) => sum + (r.modifiedCount || 0), 0);
}
