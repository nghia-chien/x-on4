import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  deleteBlog,
  getBlogByIdOrSlug,
  MongoUnavailableError,
  normalizeBlogStatus,
  updateBlog,
} from "@/lib/blogRepository";
import { sanitizePlainText, sanitizeRichText } from "@/lib/sanitize";

function mongoErrorResponse(error: unknown) {
  if (error instanceof MongoUnavailableError) {
    return NextResponse.json(
      { success: false, message: "Blog database unavailable" },
      { status: 503 }
    );
  }
  console.error("Blog API error:", error);
  return NextResponse.json(
    { success: false, message: "Failed to process blog request" },
    { status: 500 }
  );
}

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const blog = await getBlogByIdOrSlug(params.id);
    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog post not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: blog });
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
    if (body.status !== undefined) {
      body.status = normalizeBlogStatus(body.status);
    }
    if (body.status === "published" && !body.publishedAt) {
      body.publishedAt = new Date().toISOString();
    }
    if (body.title !== undefined) body.title = sanitizePlainText(String(body.title), 200);
    if (body.excerpt !== undefined) {
      body.excerpt = sanitizePlainText(String(body.excerpt), 500);
    }
    if (body.content !== undefined) {
      body.content = sanitizeRichText(String(body.content));
    }
    if (body.author !== undefined) {
      body.author = sanitizePlainText(String(body.author), 100);
    }
    if (body.category !== undefined) {
      body.category = sanitizePlainText(String(body.category), 100);
    }

    const updated = await updateBlog(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Blog post not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { errorResponse } = await requireAuth(_req);
  if (errorResponse) return errorResponse;

  try {
    const success = await deleteBlog(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Blog post not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
