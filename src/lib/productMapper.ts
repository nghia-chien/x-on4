import { Product } from "@/components/ProductCard";

export interface ApiProductInput {
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
  price?: number | string;
  salePrice?: number | string | null;
  originalPrice?: number | string | null;
  image?: string;
  thumbnail?: string;
  images?: string[];
  category?: string;
  shapes?: string[];
  designThemes?: string[];
  colors?: string[];
  colorOptions?: { name: string; hex: string; border?: boolean }[];
  sizes?: string[];
  sizeStock?: Record<string, number>;
  length?: string;
  lengths?: string[];
  bestSeller?: boolean;
  handmadeGripX?: boolean;
  featured?: boolean;
  url?: string;
  description?: string;
  shortDescription?: string;
  stock?: number;
  status?: string;
}

export function mapApiProduct(p: ApiProductInput): Product {
  const formatPrice = (val: unknown): string | undefined => {
    if (val === undefined || val === null || val === "") return undefined;
    if (typeof val === "number") return `$${val.toFixed(2)}`;
    const str = String(val).trim();
    if (str === ".99" || str === "0.99") return "$24.99";
    if (str.startsWith("$")) return str;
    return `$${str}`;
  };

  const regPrice = formatPrice(p.price) || "$24.99";
  const salePrice = formatPrice(p.salePrice);

  // When on sale: active price is salePrice, original regular price is struck through
  const activePrice = salePrice ? salePrice : regPrice;
  const originalPrice = salePrice
    ? regPrice
    : p.originalPrice
    ? formatPrice(p.originalPrice)
    : undefined;

  const resolvedSlug = p.slug || p.id || "product";

  return {
    id: p.id || p.slug || "product",
    slug: resolvedSlug,
    title: p.name || p.title || "X-ON Nails",
    price: activePrice,
    originalPrice: originalPrice,
    image: p.thumbnail || p.images?.[0] || p.image || "/images/IMG_7098.webp",
    category: p.category || "Handmade Grip-X Nails",
    shapes: Array.isArray(p.shapes) ? p.shapes : ["Almond", "Coffin"],
    designThemes: Array.isArray(p.designThemes) ? p.designThemes : [],
    colors: Array.isArray(p.colors) ? p.colors : [],
    colorOptions: Array.isArray(p.colorOptions) ? p.colorOptions : undefined,
    sizes: Array.isArray(p.sizes) ? p.sizes : ["XS", "S", "M", "L"],
    sizeStock: p.sizeStock || undefined,
    length: p.length || "Extra Long",
    lengths: Array.isArray(p.lengths) ? p.lengths : [p.length || "Extra Long"],
    bestSeller: Boolean(p.bestSeller),
    handmadeGripX: Boolean(p.handmadeGripX !== undefined ? p.handmadeGripX : p.featured),
    featured: Boolean(p.featured !== undefined ? p.featured : p.handmadeGripX),
    url: p.url || `/product/${resolvedSlug}`,
    description: p.description || p.shortDescription || "",
    stock: typeof p.stock === "number" ? p.stock : 20,
    status: p.status || "active",
  };
}

