import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { DataStore } from "@/lib/dataStore";
import {
  deleteProduct,
  getProductByIdOrSlug,
  MongoUnavailableError,
  updateProduct,
} from "@/lib/productRepository";
import { ProductItem } from "@/types/admin";

function mongoErrorResponse(error: unknown) {
  if (error instanceof MongoUnavailableError) {
    return NextResponse.json(
      { success: false, message: "Product database unavailable" },
      { status: 503 }
    );
  }
  console.error("Product API error:", error);
  return NextResponse.json(
    { success: false, message: "Failed to process product request" },
    { status: 500 }
  );
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const product = await getProductByIdOrSlug(params.id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();

    if (body.name !== undefined && body.name.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Product name must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (body.price !== undefined) {
      const numPrice = Number(body.price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return NextResponse.json(
          { success: false, message: "Price must be a positive number greater than 0" },
          { status: 400 }
        );
      }
    }

    if (body.salePrice !== undefined && body.salePrice !== null && body.salePrice !== "") {
      const numSale = Number(body.salePrice);
      const current =
        body.price !== undefined
          ? Number(body.price)
          : (await getProductByIdOrSlug(params.id))?.price || 0;
      if (isNaN(numSale) || numSale <= 0) {
        return NextResponse.json(
          { success: false, message: "Sale price must be a positive number greater than 0" },
          { status: 400 }
        );
      }
      if (numSale >= current) {
        return NextResponse.json(
          { success: false, message: "Sale price must be strictly lower than regular price" },
          { status: 400 }
        );
      }
    }

    if (body.stock !== undefined) {
      const numStock = Number(body.stock);
      if (isNaN(numStock) || numStock < 0) {
        return NextResponse.json(
          { success: false, message: "Stock cannot be a negative number" },
          { status: 400 }
        );
      }
    }

    const allowedUpdate: Partial<ProductItem> = {};
    if (body.name !== undefined) allowedUpdate.name = body.name.trim();
    if (body.slug !== undefined) allowedUpdate.slug = body.slug.trim();
    if (body.sku !== undefined) allowedUpdate.sku = body.sku.trim();
    if (body.description !== undefined) allowedUpdate.description = body.description;
    if (body.shortDescription !== undefined) {
      allowedUpdate.shortDescription = body.shortDescription;
    }
    if (body.price !== undefined) allowedUpdate.price = Number(body.price);
    if (body.salePrice !== undefined) {
      allowedUpdate.salePrice =
        body.salePrice === null || body.salePrice === ""
          ? null
          : Number(body.salePrice);
    }
    if (body.stock !== undefined) allowedUpdate.stock = Number(body.stock);
    if (body.sizeStock !== undefined) allowedUpdate.sizeStock = body.sizeStock;
    if (Array.isArray(body.images)) allowedUpdate.images = body.images;
    if (body.thumbnail !== undefined) allowedUpdate.thumbnail = body.thumbnail;
    if (body.category !== undefined) allowedUpdate.category = body.category;
    if (body.collection !== undefined) allowedUpdate.collection = body.collection;
    if (Array.isArray(body.shapes)) allowedUpdate.shapes = body.shapes;
    if (Array.isArray(body.sizes)) allowedUpdate.sizes = body.sizes;
    if (Array.isArray(body.tags)) allowedUpdate.tags = body.tags;
    if (body.featured !== undefined) allowedUpdate.featured = Boolean(body.featured);
    if (body.bestSeller !== undefined) allowedUpdate.bestSeller = Boolean(body.bestSeller);
    if (body.comingSoon !== undefined) allowedUpdate.comingSoon = Boolean(body.comingSoon);
    if (body.status === "active" || body.status === "draft" || body.status === "archived") {
      allowedUpdate.status = body.status;
    }

    const updated = await updateProduct(params.id, allowedUpdate);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const orders = DataStore.getOrders({ limit: 500 }).orders;
    const hasActiveOrder = orders.some(
      (o) =>
        o.orderStatus !== "delivered" &&
        o.orderStatus !== "cancelled" &&
        o.items?.some(
          (i) =>
            i.productId === params.id || i.productId?.startsWith(`${params.id}-`)
        )
    );

    if (hasActiveOrder) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete this product because it is currently part of an active unfulfilled order.",
        },
        { status: 400 }
      );
    }

    const success = await deleteProduct(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
