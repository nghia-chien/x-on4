import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { DataStore } from "@/lib/dataStore";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  const blogs = DataStore.getBlogs({ status, search });
  return NextResponse.json({ success: true, data: blogs });
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { title, slug, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "Article title and content are required" },
        { status: 400 }
      );
    }

    const autoSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const newBlog = DataStore.createBlog({
      title,
      slug: autoSlug,
      excerpt: body.excerpt || "",
      content,
      thumbnail: body.thumbnail || "/images/IMG_7098.webp",
      author: body.author || "X-ON Team",
      category: body.category || "Nail Trends",
      tags: body.tags || [],
      status: body.status || "draft",
      publishedAt: body.status === "published" ? new Date().toISOString() : undefined,
      seoTitle: body.seoTitle || title,
      seoDescription: body.seoDescription || body.excerpt || "",
    });

    return NextResponse.json({ success: true, data: newBlog }, { status: 201 });
  } catch (error) {
    console.error("Create blog error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
