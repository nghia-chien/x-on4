import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { AdminUserModel } from "@/lib/models";
import type { AdminRole, AdminUser, AdminUserWithPassword, OAuthAccount } from "@/types/admin";

export class MongoUnavailableError extends Error {
  constructor(message = "MongoDB is not configured or unreachable") {
    super(message);
    this.name = "MongoUnavailableError";
  }
}

const VALID_ROLES: readonly AdminRole[] = ["Admin", "Customer", "Wholesale"];

/** Map legacy / migrated role labels to normalized AdminRole */
export function normalizeRole(role: unknown): AdminRole {
  const raw = String(role || "").trim();
  if (VALID_ROLES.includes(raw as AdminRole)) return raw as AdminRole;

  const lower = raw.toLowerCase();
  if (lower.includes("admin") || lower === "administrator") return "Admin";
  if (lower.includes("wholesale") || lower.includes("b2b") || lower.includes("partner")) {
    return "Wholesale";
  }
  if (lower.includes("customer") || lower.includes("retail") || lower.includes("vip")) {
    return "Customer";
  }
  return "Customer";
}

type LeanAdmin = Record<string, unknown> & {
  _id?: unknown;
  createdAt?: Date | string;
  lastLogin?: Date | string;
  accounts?: OAuthAccount[];
};

function toIso(value: Date | string | undefined): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function toAdminUser(doc: LeanAdmin, withPassword = false): AdminUser | AdminUserWithPassword {
  const base: AdminUser = {
    id: String(doc._id ?? ""),
    name: String(doc.name || ""),
    email: String(doc.email || "").toLowerCase(),
    role: normalizeRole(doc.role),
    status: doc.status === "inactive" ? "inactive" : "active",
    lastLogin: toIso(doc.lastLogin as Date | string | undefined),
    createdAt: toIso(doc.createdAt as Date | string | undefined) || new Date().toISOString(),
    avatar: doc.avatar ? String(doc.avatar) : undefined,
    accounts: Array.isArray(doc.accounts) ? (doc.accounts as OAuthAccount[]) : undefined,
  };

  if (withPassword) {
    return {
      ...base,
      passwordHash: doc.passwordHash ? String(doc.passwordHash) : undefined,
    };
  }
  return base;
}

async function ensureDb() {
  const conn = await connectToDatabase();
  if (!conn) throw new MongoUnavailableError();
  return conn;
}

function isObjectId(id: string): boolean {
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    String(new mongoose.Types.ObjectId(id)) === id
  );
}

export async function listAdmins(): Promise<AdminUser[]> {
  await ensureDb();
  const docs = (await AdminUserModel.find().sort({ createdAt: -1 }).lean()) as LeanAdmin[];
  return docs.map((d) => toAdminUser(d) as AdminUser);
}

export async function getAdminByEmail(
  email: string,
  withPassword = false
): Promise<AdminUser | AdminUserWithPassword | null> {
  await ensureDb();
  const doc = (await AdminUserModel.findOne({
    email: email.trim().toLowerCase(),
  }).lean()) as LeanAdmin | null;
  return doc ? toAdminUser(doc, withPassword) : null;
}

export async function getAdminById(
  id: string,
  withPassword = false
): Promise<AdminUser | AdminUserWithPassword | null> {
  await ensureDb();
  if (!id) return null;

  let doc: LeanAdmin | null = null;
  if (isObjectId(id)) {
    doc = (await AdminUserModel.findById(id).lean()) as LeanAdmin | null;
  }
  if (!doc) {
    doc = (await AdminUserModel.findOne({ email: id.toLowerCase() }).lean()) as LeanAdmin | null;
  }
  return doc ? toAdminUser(doc, withPassword) : null;
}

export async function createAdmin(data: {
  name: string;
  email: string;
  passwordHash?: string;
  role?: AdminRole;
  status?: "active" | "inactive";
  avatar?: string;
  accounts?: OAuthAccount[];
}): Promise<AdminUser> {
  await ensureDb();
  const created = await AdminUserModel.create({
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    passwordHash: data.passwordHash || "",
    role: normalizeRole(data.role || "Customer"),
    status: data.status || "active",
    avatar: data.avatar || "",
    accounts: data.accounts || [],
  });
  return toAdminUser(created.toObject() as LeanAdmin) as AdminUser;
}

export async function updateAdmin(
  id: string,
  data: Partial<AdminUserWithPassword>
): Promise<AdminUser | null> {
  await ensureDb();
  const existing = await getAdminById(id);
  if (!existing) return null;

  const patch: Record<string, unknown> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.email !== undefined) patch.email = data.email.trim().toLowerCase();
  if (data.role !== undefined) patch.role = normalizeRole(data.role);
  if (data.status !== undefined) patch.status = data.status;
  if (data.passwordHash !== undefined) patch.passwordHash = data.passwordHash;
  if (data.avatar !== undefined) patch.avatar = data.avatar;
  if (data.accounts !== undefined) patch.accounts = data.accounts;
  if (data.lastLogin !== undefined) patch.lastLogin = new Date(data.lastLogin);

  // Guard: cannot demote/remove last Admin
  if (existing.role === "Admin") {
    const demoting =
      (data.role !== undefined && normalizeRole(data.role) !== "Admin") ||
      data.status === "inactive";
    if (demoting) {
      const adminCount = await AdminUserModel.countDocuments({
        role: "Admin",
        status: "active",
      });
      if (adminCount <= 1) {
        return null;
      }
    }
  }

  const updated = (await AdminUserModel.findByIdAndUpdate(existing.id, patch, {
    new: true,
    runValidators: true,
  }).lean()) as LeanAdmin | null;

  return updated ? (toAdminUser(updated) as AdminUser) : null;
}

export async function deleteAdmin(id: string): Promise<boolean> {
  await ensureDb();
  const existing = await getAdminById(id);
  if (!existing) return false;

  if (existing.role === "Admin") {
    const adminCount = await AdminUserModel.countDocuments({ role: "Admin" });
    if (adminCount <= 1) return false;
  }

  const res = await AdminUserModel.findByIdAndDelete(existing.id);
  return Boolean(res);
}

export async function countActiveAdmins(): Promise<number> {
  await ensureDb();
  return AdminUserModel.countDocuments({ role: "Admin", status: "active" });
}

export function isBcryptHash(value: string | undefined): boolean {
  return Boolean(value && /^\$2[aby]\$\d{2}\$/.test(value));
}
