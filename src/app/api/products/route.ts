import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  createProduct,
  listProducts,
  MongoUnavailableError,
} from "@/lib/productRepository";

export const runtime = "nodejs";
export const maxDuration = 30;

function mongoErrorResponse(error: unknown) {
  if (error instanceof MongoUnavailableError) {
    return NextResponse.json(
      {
        success: false,
        message: "Product database unavailable",
        code: error.code,
        hint: error.hint,
      },
      { status: 503 }
    );
  }
  console.error("Products API error:", error);
  return NextResponse.json(
    { success: false, message: "Failed to process products request" },
    { status: 500 }
  );
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;
    const shape = searchParams.get("shape") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = await listProducts({
      search,
      category,
      status,
      shape,
      page,
      limit,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, slug, sku, price } = body;

    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Product name must be at least 3 characters" },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        { success: false, message: "Price must be a positive number greater than 0" },
        { status: 400 }
      );
    }

    let numericSalePrice: number | null = null;
    if (body.salePrice !== undefined && body.salePrice !== null && body.salePrice !== "") {
      numericSalePrice = Number(body.salePrice);
      if (isNaN(numericSalePrice) || numericSalePrice <= 0) {
        return NextResponse.json(
          { success: false, message: "Sale price must be a positive number greater than 0" },
          { status: 400 }
        );
      }
      if (numericSalePrice >= numericPrice) {
        return NextResponse.json(
          { success: false, message: "Sale price must be strictly lower than regular price" },
          { status: 400 }
        );
      }
    }

    const numericStock = Math.max(0, parseInt(body.stock) || 0);

    const autoSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const autoSku = sku?.trim() || `XON-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await listProducts({ search: autoSku, limit: 50 });
    const isSkuTaken = existing.products.some(
      (p) => p.sku?.toLowerCase() === autoSku.toLowerCase()
    );
    if (isSkuTaken) {
      return NextResponse.json(
        { success: false, message: `SKU "${autoSku}" already exists. Please choose a unique SKU.` },
        { status: 400 }
      );
    }

    const newProduct = await createProduct({
      name: name.trim(),
      slug: autoSlug,
      sku: autoSku,
      description: body.description || "",
      shortDescription: body.shortDescription || "",
      price: numericPrice,
      salePrice: numericSalePrice,
      stock: numericStock,
      sizeStock: body.sizeStock || undefined,
      images:
        Array.isArray(body.images) && body.images.length > 0
          ? body.images
          : [],
      thumbnail: body.thumbnail || body.images?.[0] || "",
      category: body.category || "Handmade Nails",
      collection: body.collection || "",
      shapes: body.shapes || ["Almond"],
      sizes: body.sizes || ["XS", "S", "M", "L"],
      designThemes: body.designThemes || [],
      length: body.length || "Extra Long",
      tags: body.tags || [],
      featured: Boolean(body.featured !== undefined ? body.featured : body.handmadeGripX),
      handmadeGripX: Boolean(
        body.handmadeGripX !== undefined ? body.handmadeGripX : body.featured
      ),
      bestSeller: Boolean(body.bestSeller),
      comingSoon: Boolean(body.comingSoon),
      status: body.status || "active",
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
