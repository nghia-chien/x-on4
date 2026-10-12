import mongoose from "mongoose";
import { connectToDatabase, getMongoDiagnostics } from "@/lib/db";
import { OrderModel } from "@/lib/models";
import type {
  OrderItem,
  OrderItemSnapshot,
  OrderStatus,
  PaymentStatus,
} from "@/types/admin";

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

type LeanOrder = Record<string, unknown> & {
  _id?: unknown;
  customer?: Record<string, unknown>;
  items?: unknown[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
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

function mapItems(raw: unknown): OrderItemSnapshot[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = (item || {}) as Record<string, unknown>;
    return {
      productId: String(row.productId || ""),
      productName: String(row.productName || "Press-On Nail Set"),
      productImage: String(row.productImage || ""),
      size: String(row.size || "Standard"),
      quantity: Number(row.quantity) || 1,
      price: Number(row.price) || 0,
      subtotal: Number(row.subtotal) || 0,
    };
  });
}

export function toOrderItem(doc: LeanOrder): OrderItem {
  const customer = (doc.customer || {}) as Record<string, unknown>;
  return {
    id: String(doc._id ?? ""),
    orderNumber: String(doc.orderNumber || ""),
    customer: {
      name: String(customer.name || ""),
      email: String(customer.email || ""),
      phone: String(customer.phone || ""),
      address: String(customer.address || ""),
      city: String(customer.city || ""),
      state: String(customer.state || ""),
      zipCode: String(customer.zipCode || ""),
      country: String(customer.country || "United States"),
    },
    items: mapItems(doc.items),
    subtotal: Number(doc.subtotal) || 0,
    discount: Number(doc.discount) || 0,
    shipping: Number(doc.shipping) || 0,
    tax: Number(doc.tax) || 0,
    total: Number(doc.total) || 0,
    paymentMethod: String(doc.paymentMethod || "Credit Card"),
    paymentStatus: (doc.paymentStatus as PaymentStatus) || "pending",
    orderStatus: (doc.orderStatus as OrderStatus) || "pending",
    shippingAddress: String(doc.shippingAddress || ""),
    trackingNumber: String(doc.trackingNumber || ""),
    notes: String(doc.notes || ""),
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
  };
}

export async function listOrders(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  orders: OrderItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await ensureDb();
  const page = Math.max(1, params?.page || 1);
  const limit = Math.min(100, Math.max(1, params?.limit || 20));
  const filter: Record<string, unknown> = {};

  if (params?.status && params.status !== "all") {
    filter.orderStatus = params.status;
  }
  if (params?.search?.trim()) {
    const q = params.search.trim();
    filter.$or = [
      { orderNumber: { $regex: q, $options: "i" } },
      { "customer.name": { $regex: q, $options: "i" } },
      { "customer.email": { $regex: q, $options: "i" } },
    ];
  }

  const [total, docs] = await Promise.all([
    OrderModel.countDocuments(filter),
    OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return {
    orders: docs.map((d) => toOrderItem(d as LeanOrder)),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getOrderById(id: string): Promise<OrderItem | null> {
  await ensureDb();
  if (isObjectId(id)) {
    const doc = await OrderModel.findById(id).lean();
    if (doc) return toOrderItem(doc as LeanOrder);
  }
  const byNumber = await OrderModel.findOne({ orderNumber: id }).lean();
  return byNumber ? toOrderItem(byNumber as LeanOrder) : null;
}

export async function createOrder(
  data: Omit<OrderItem, "id" | "orderNumber" | "createdAt" | "updatedAt">
): Promise<OrderItem> {
  await ensureDb();
  const count = await OrderModel.countDocuments();
  const orderNumber = `XON-${1000 + count + 1}`;
  const doc = await OrderModel.create({
    ...data,
    orderNumber,
    customer: {
      name: data.customer.name,
      email: data.customer.email,
      phone: data.customer.phone || "",
      address: data.customer.address || data.shippingAddress || "",
      city: data.customer.city || "",
      state: data.customer.state || "",
      zipCode: data.customer.zipCode || "",
      country: data.customer.country || "United States",
    },
  });
  return toOrderItem(doc.toObject() as LeanOrder);
}

export async function updateOrder(
  id: string,
  data: Partial<
    Pick<
      OrderItem,
      | "orderStatus"
      | "paymentStatus"
      | "trackingNumber"
      | "notes"
      | "shippingAddress"
    >
  >
): Promise<OrderItem | null> {
  await ensureDb();
  if (!isObjectId(id)) return null;
  const doc = await OrderModel.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  ).lean();
  return doc ? toOrderItem(doc as LeanOrder) : null;
}

export async function deleteOrder(id: string): Promise<boolean> {
  await ensureDb();
  if (!isObjectId(id)) return false;
  const result = await OrderModel.findByIdAndDelete(id);
  return Boolean(result);
}

export async function countAttentionOrders(): Promise<number> {
  await ensureDb();
  return OrderModel.countDocuments({
    orderStatus: { $in: ["pending", "processing"] },
  });
}
