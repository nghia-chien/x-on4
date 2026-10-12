import mongoose from "mongoose";
import { connectToDatabase, getMongoDiagnostics } from "@/lib/db";
import { NewsletterModel } from "@/lib/models";
import type { NewsletterStatus, NewsletterSubscriberItem } from "@/types/admin";
import { NEWSLETTER_STATUSES } from "@/types/admin";

export class MongoUnavailableError extends Error {
  code: string | null;
  hint: string | null;

  constructor(message = "MongoDB is not configured or unreachable") {
    const diag = getMongoDiagnostics();
    super(diag.hint || message);
    this.name = "MongoUnavailableError";
    this.code = diag.code;
    this.hint = diag.hint;
  }
}

type LeanNewsletter = Record<string, unknown> & {
  _id?: unknown;
  subscribedAt?: Date | string;
  createdAt?: Date | string;
};

function toIso(value: Date | string | undefined): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function isObjectId(id: string): boolean {
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    String(new mongoose.Types.ObjectId(id)) === id
  );
}

async function ensureDb() {
  const conn = await connectToDatabase();
  if (!conn) throw new MongoUnavailableError();
  return conn;
}

function normalizeStatus(status: unknown): NewsletterStatus {
  const raw = String(status || "").trim().toLowerCase();
  if (NEWSLETTER_STATUSES.includes(raw as NewsletterStatus)) {
    return raw as NewsletterStatus;
  }
  return "subscribed";
}

export function toNewsletterItem(doc: LeanNewsletter): NewsletterSubscriberItem {
  return {
    id: String(doc._id ?? ""),
    email: String(doc.email || "").toLowerCase(),
    status: normalizeStatus(doc.status),
    subscribedAt: toIso(doc.subscribedAt || doc.createdAt),
  };
}

export async function listNewsletter(): Promise<NewsletterSubscriberItem[]> {
  await ensureDb();
  const docs = await NewsletterModel.find()
    .sort({ subscribedAt: -1, createdAt: -1 })
    .lean();
  return docs.map((d) => toNewsletterItem(d as LeanNewsletter));
}

export async function createNewsletter(
  email: string
): Promise<NewsletterSubscriberItem> {
  await ensureDb();
  const normalized = email.trim().toLowerCase();
  const existing = await NewsletterModel.findOne({ email: normalized }).lean();
  if (existing) return toNewsletterItem(existing as LeanNewsletter);

  const doc = await NewsletterModel.create({
    email: normalized,
    status: "subscribed",
    subscribedAt: new Date(),
  });
  return toNewsletterItem(doc.toObject() as LeanNewsletter);
}

export async function deleteNewsletter(id: string): Promise<boolean> {
  await ensureDb();
  if (isObjectId(id)) {
    const byId = await NewsletterModel.findByIdAndDelete(id);
    if (byId) return true;
  }
  const byEmail = await NewsletterModel.findOneAndDelete({
    email: id.trim().toLowerCase(),
  });
  return Boolean(byEmail);
}

export async function countRecentNewsletter(days = 7): Promise<number> {
  await ensureDb();
  const since = new Date(Date.now() - days * 86400000);
  return NewsletterModel.countDocuments({
    $or: [{ subscribedAt: { $gte: since } }, { createdAt: { $gte: since } }],
  });
}
