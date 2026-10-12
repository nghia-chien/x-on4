import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { DataStore } from "@/lib/dataStore";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const blog = DataStore.getBlogById(params.id);
  if (!blog) {
    return NextResponse.json(
      { success: false, message: "Blog post not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: blog });
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
    if (body.status === "published" && !body.publishedAt) {
      body.publishedAt = new Date().toISOString();
    }
    const updated = DataStore.updateBlog(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Blog post not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update blog error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const success = DataStore.deleteBlog(params.id);
  if (!success) {
    return NextResponse.json(
      { success: false, message: "Blog post not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, message: "Blog post deleted successfully" });
}
