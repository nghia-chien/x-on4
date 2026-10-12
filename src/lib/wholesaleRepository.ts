import mongoose from "mongoose";
import { connectToDatabase, getMongoDiagnostics } from "@/lib/db";
import { WholesaleRequestModel } from "@/lib/models";
import type {
  WholesaleRequestItem,
  WholesaleRequestStatus,
} from "@/types/admin";
import { WHOLESALE_REQUEST_STATUSES } from "@/types/admin";

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

type LeanWholesale = Record<string, unknown> & {
  _id?: unknown;
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

function normalizeStatus(status: unknown): WholesaleRequestStatus {
  const raw = String(status || "").trim().toLowerCase();
  if (
    WHOLESALE_REQUEST_STATUSES.includes(raw as WholesaleRequestStatus)
  ) {
    return raw as WholesaleRequestStatus;
  }
  return "new";
}

export function toWholesaleItem(doc: LeanWholesale): WholesaleRequestItem {
  return {
    id: String(doc._id ?? ""),
    businessName: String(doc.businessName || ""),
    contactName: String(doc.contactName || ""),
    email: String(doc.email || ""),
    phone: String(doc.phone || ""),
    website: doc.website ? String(doc.website) : undefined,
    taxId: doc.taxId ? String(doc.taxId) : undefined,
    businessType: doc.businessType ? String(doc.businessType) : undefined,
    location: doc.location ? String(doc.location) : undefined,
    quantity: doc.quantity ? String(doc.quantity) : undefined,
    message: doc.message ? String(doc.message) : undefined,
    status: normalizeStatus(doc.status),
    adminNotes: doc.adminNotes ? String(doc.adminNotes) : "",
    createdAt: toIso(doc.createdAt),
  };
}

export async function listWholesale(params?: {
  status?: string;
}): Promise<WholesaleRequestItem[]> {
  await ensureDb();
  const filter: Record<string, unknown> = {};
  if (params?.status && params.status !== "all") {
    filter.status = normalizeStatus(params.status);
  }
  const docs = await WholesaleRequestModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((d) => toWholesaleItem(d as LeanWholesale));
}

export async function createWholesale(
  data: Omit<WholesaleRequestItem, "id" | "createdAt">
): Promise<WholesaleRequestItem> {
  await ensureDb();
  const doc = await WholesaleRequestModel.create({
    ...data,
    status: normalizeStatus(data.status),
  });
  return toWholesaleItem(doc.toObject() as LeanWholesale);
}

export async function updateWholesale(
  id: string,
  data: Partial<Pick<WholesaleRequestItem, "status" | "adminNotes">>
): Promise<WholesaleRequestItem | null> {
  await ensureDb();
  if (!isObjectId(id)) return null;
  const patch: Record<string, unknown> = {};
  if (data.status !== undefined) patch.status = normalizeStatus(data.status);
  if (typeof data.adminNotes === "string") patch.adminNotes = data.adminNotes;
  const doc = await WholesaleRequestModel.findByIdAndUpdate(
    id,
    { $set: patch },
    { new: true }
  ).lean();
  return doc ? toWholesaleItem(doc as LeanWholesale) : null;
}

export async function deleteWholesale(id: string): Promise<boolean> {
  await ensureDb();
  if (!isObjectId(id)) return false;
  const result = await WholesaleRequestModel.findByIdAndDelete(id);
  return Boolean(result);
}

export async function countNewWholesale(): Promise<number> {
  await ensureDb();
  return WholesaleRequestModel.countDocuments({ status: "new" });
}
