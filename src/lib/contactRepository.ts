import mongoose from "mongoose";
import { connectToDatabase, getMongoDiagnostics } from "@/lib/db";
import { ContactMessageModel } from "@/lib/models";
import type {
  ContactMessageItem,
  ContactMessageStatus,
} from "@/types/admin";
import { CONTACT_MESSAGE_STATUSES } from "@/types/admin";

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

type LeanContact = Record<string, unknown> & {
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

function normalizeStatus(status: unknown): ContactMessageStatus {
  const raw = String(status || "").trim().toLowerCase();
  if (CONTACT_MESSAGE_STATUSES.includes(raw as ContactMessageStatus)) {
    return raw as ContactMessageStatus;
  }
  return "new";
}

export function toContactItem(doc: LeanContact): ContactMessageItem {
  return {
    id: String(doc._id ?? ""),
    name: String(doc.name || ""),
    email: String(doc.email || ""),
    phone: doc.phone ? String(doc.phone) : undefined,
    subject: String(doc.subject || "General Inquiry"),
    message: String(doc.message || ""),
    status: normalizeStatus(doc.status),
    createdAt: toIso(doc.createdAt),
  };
}

export async function listContactMessages(params?: {
  status?: string;
  search?: string;
}): Promise<ContactMessageItem[]> {
  await ensureDb();
  const filter: Record<string, unknown> = {};
  if (params?.status && params.status !== "all") {
    filter.status = normalizeStatus(params.status);
  }
  if (params?.search?.trim()) {
    const q = params.search.trim();
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { subject: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
    ];
  }
  const docs = await ContactMessageModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((d) => toContactItem(d as LeanContact));
}

export async function createContactMessage(
  data: Omit<ContactMessageItem, "id" | "createdAt" | "status"> & {
    status?: ContactMessageStatus;
  }
): Promise<ContactMessageItem> {
  await ensureDb();
  const doc = await ContactMessageModel.create({
    name: data.name,
    email: data.email,
    phone: data.phone || "",
    subject: data.subject || "General Inquiry",
    message: data.message,
    status: normalizeStatus(data.status || "new"),
  });
  return toContactItem(doc.toObject() as LeanContact);
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus
): Promise<ContactMessageItem | null> {
  await ensureDb();
  if (!isObjectId(id)) return null;
  const doc = await ContactMessageModel.findByIdAndUpdate(
    id,
    { $set: { status: normalizeStatus(status) } },
    { new: true }
  ).lean();
  return doc ? toContactItem(doc as LeanContact) : null;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  await ensureDb();
  if (!isObjectId(id)) return false;
  const result = await ContactMessageModel.findByIdAndDelete(id);
  return Boolean(result);
}

export async function countNewContactMessages(): Promise<number> {
  await ensureDb();
  return ContactMessageModel.countDocuments({ status: "new" });
}
