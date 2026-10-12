import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/lib/models";
import type { NailShape, ProductItem } from "@/types/admin";

export class MongoUnavailableError extends Error {
  constructor(message = "MongoDB is not configured or unreachable") {
    super(message);
    this.name = "MongoUnavailableError";
  }
}

type LeanProduct = Record<string, unknown> & {
  _id?: unknown;
  collectionName?: string;
  sizeStock?: Record<string, number> | Map<string, number>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  shapes?: string[];
};

function toIso(value: Date | string | undefined): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function normalizeSizeStock(
  sizeStock: LeanProduct["sizeStock"]
): Record<string, number> | undefined {
  if (!sizeStock) return undefined;
  if (sizeStock instanceof Map) {
    return Object.fromEntries(sizeStock.entries());
  }
  if (typeof sizeStock === "object") {
    return sizeStock as Record<string, number>;
  }
  return undefined;
}

export function toProductItem(doc: LeanProduct): ProductItem {
  const id = String(doc._id ?? "");
  return {
    id,
    name: String(doc.name || ""),
    slug: String(doc.slug || ""),
    sku: String(doc.sku || ""),
    description: String(doc.description || ""),
    shortDescription: doc.shortDescription ? String(doc.shortDescription) : undefined,
    price: Number(doc.price) || 0,
    salePrice:
      doc.salePrice === null || doc.salePrice === undefined
        ? null
        : Number(doc.salePrice),
    stock: Number(doc.stock) || 0,
    sizeStock: normalizeSizeStock(doc.sizeStock),
    images: Array.isArray(doc.images) ? (doc.images as string[]) : [],
    thumbnail: String(doc.thumbnail || ""),
    category: String(doc.category || "Handmade Nails"),
    collection: doc.collectionName ? String(doc.collectionName) : undefined,
    shapes: (Array.isArray(doc.shapes) ? doc.shapes : []) as NailShape[],
    sizes: Array.isArray(doc.sizes) ? (doc.sizes as string[]) : [],
    designThemes: Array.isArray(doc.designThemes)
      ? (doc.designThemes as string[])
      : undefined,
    colors: Array.isArray(doc.colors) ? (doc.colors as string[]) : undefined,
    length: doc.length ? String(doc.length) : undefined,
    lengths: Array.isArray(doc.lengths) ? (doc.lengths as string[]) : undefined,
    productType: doc.productType ? String(doc.productType) : undefined,
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : [],
    featured: Boolean(doc.featured),
    handmadeGripX:
      doc.handmadeGripX !== undefined ? Boolean(doc.handmadeGripX) : undefined,
    bestSeller: Boolean(doc.bestSeller),
    comingSoon: Boolean(doc.comingSoon),
    status:
      doc.status === "draft" || doc.status === "archived" || doc.status === "active"
        ? doc.status
        : "active",
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
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

export async function listProducts(params?: {
  search?: string;
  category?: string;
  status?: string;
  shape?: string;
  page?: number;
  limit?: number;
}): Promise<{
  products: ProductItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await ensureDb();

  const filter: Record<string, unknown> = {};

  if (params?.search?.trim()) {
    const q = escapeRegex(params.search.trim());
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { sku: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
      { collectionName: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
      { designThemes: { $regex: q, $options: "i" } },
      { shapes: { $regex: q, $options: "i" } },
    ];
  }

  if (params?.category && params.category !== "all") {
    filter.category = new RegExp(`^${escapeRegex(params.category)}$`, "i");
  }

  if (params?.status && params.status !== "all") {
    filter.status = params.status;
  }

  if (params?.shape && params.shape !== "all") {
    filter.shapes = new RegExp(`^${escapeRegex(params.shape)}$`, "i");
  }

  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, Math.min(params?.limit || 50, 10_000));
  const skip = (page - 1) * limit;

  const [total, docs] = await Promise.all([
    ProductModel.countDocuments(filter),
    ProductModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);

  return {
    products: (docs as LeanProduct[]).map(toProductItem),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getProductByIdOrSlug(
  idOrSlug: string
): Promise<ProductItem | null> {
  await ensureDb();
  const raw = decodeURIComponent(idOrSlug || "").trim();
  if (!raw) return null;
  const q = raw.toLowerCase();

  const or: Record<string, unknown>[] = [
    { slug: q },
    { sku: new RegExp(`^${escapeRegex(raw)}$`, "i") },
  ];

  if (mongoose.Types.ObjectId.isValid(raw) && String(new mongoose.Types.ObjectId(raw)) === raw) {
    or.push({ _id: new mongoose.Types.ObjectId(raw) });
  }

  const doc = (await ProductModel.findOne({ $or: or }).lean()) as LeanProduct | null;
  return doc ? toProductItem(doc) : null;
}

export async function createProduct(
  data: Omit<ProductItem, "id" | "createdAt" | "updatedAt">
): Promise<ProductItem> {
  await ensureDb();

  const created = await ProductModel.create({
    name: data.name,
    slug: data.slug,
    sku: data.sku,
    description: data.description || "",
    shortDescription: data.shortDescription || "",
    price: data.price,
    salePrice: data.salePrice ?? null,
    stock: data.stock ?? 0,
    sizeStock: data.sizeStock || {},
    images: data.images || [],
    thumbnail: data.thumbnail || "",
    category: data.category || "Handmade Nails",
    collectionName: data.collection || "",
    productType: data.productType || "Handmade Press-On Nails",
    shapes: data.shapes || [],
    sizes: data.sizes || [],
    designThemes: data.designThemes || [],
    colors: data.colors || [],
    length: data.length || "Medium",
    lengths: data.lengths || [],
    tags: data.tags || [],
    featured: Boolean(data.featured),
    handmadeGripX:
      data.handmadeGripX !== undefined ? Boolean(data.handmadeGripX) : true,
    bestSeller: Boolean(data.bestSeller),
    comingSoon: Boolean(data.comingSoon),
    status: data.status || "active",
  });

  return toProductItem(created.toObject() as LeanProduct);
}

export async function updateProduct(
  idOrSlug: string,
  data: Partial<ProductItem>
): Promise<ProductItem | null> {
  await ensureDb();
  const existing = await getProductByIdOrSlug(idOrSlug);
  if (!existing) return null;

  const patch: Record<string, unknown> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.slug !== undefined) patch.slug = data.slug;
  if (data.sku !== undefined) patch.sku = data.sku;
  if (data.description !== undefined) patch.description = data.description;
  if (data.shortDescription !== undefined) patch.shortDescription = data.shortDescription;
  if (data.price !== undefined) patch.price = data.price;
  if (data.salePrice !== undefined) patch.salePrice = data.salePrice;
  if (data.stock !== undefined) patch.stock = data.stock;
  if (data.sizeStock !== undefined) patch.sizeStock = data.sizeStock;
  if (data.images !== undefined) patch.images = data.images;
  if (data.thumbnail !== undefined) patch.thumbnail = data.thumbnail;
  if (data.category !== undefined) patch.category = data.category;
  if (data.collection !== undefined) patch.collectionName = data.collection;
  if (data.productType !== undefined) patch.productType = data.productType;
  if (data.shapes !== undefined) patch.shapes = data.shapes;
  if (data.sizes !== undefined) patch.sizes = data.sizes;
  if (data.designThemes !== undefined) patch.designThemes = data.designThemes;
  if (data.colors !== undefined) patch.colors = data.colors;
  if (data.length !== undefined) patch.length = data.length;
  if (data.lengths !== undefined) patch.lengths = data.lengths;
  if (data.tags !== undefined) patch.tags = data.tags;
  if (data.featured !== undefined) patch.featured = data.featured;
  if (data.handmadeGripX !== undefined) patch.handmadeGripX = data.handmadeGripX;
  if (data.bestSeller !== undefined) patch.bestSeller = data.bestSeller;
  if (data.comingSoon !== undefined) patch.comingSoon = data.comingSoon;
  if (data.status !== undefined) patch.status = data.status;

  const updated = (await ProductModel.findByIdAndUpdate(existing.id, patch, {
    new: true,
    runValidators: true,
  }).lean()) as LeanProduct | null;

  return updated ? toProductItem(updated) : null;
}

export async function deleteProduct(idOrSlug: string): Promise<boolean> {
  await ensureDb();
  const existing = await getProductByIdOrSlug(idOrSlug);
  if (!existing) return false;
  const res = await ProductModel.findByIdAndDelete(existing.id);
  return Boolean(res);
}

export async function findProductForCartItem(item: {
  productId?: string;
  productName?: string;
  name?: string;
  title?: string;
}): Promise<ProductItem | null> {
  await ensureDb();
  const productId = item.productId || "";
  if (productId) {
    const byId = await getProductByIdOrSlug(productId);
    if (byId) return byId;

    // Cart ids are often `${productId}-${size}`
    const base = productId.includes("-")
      ? productId.slice(0, productId.lastIndexOf("-"))
      : productId;
    if (base && base !== productId) {
      const byBase = await getProductByIdOrSlug(base);
      if (byBase) return byBase;
    }
  }

  const name = (item.productName || item.name || item.title || "").trim();
  if (!name) return null;
  const doc = (await ProductModel.findOne({
    name: new RegExp(`^${escapeRegex(name)}$`, "i"),
  }).lean()) as LeanProduct | null;
  return doc ? toProductItem(doc) : null;
}

export async function deductStock(
  productId: string,
  quantity: number
): Promise<void> {
  await ensureDb();
  const product = await getProductByIdOrSlug(productId);
  if (!product) return;
  await ProductModel.findByIdAndUpdate(product.id, {
    $inc: { stock: -Math.abs(quantity) },
  });
  // Clamp at 0 if over-deducted
  await ProductModel.updateOne(
    { _id: product.id, stock: { $lt: 0 } },
    { $set: { stock: 0 } }
  );
}
