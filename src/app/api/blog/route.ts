import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  createBlog,
  listBlogs,
  MongoUnavailableError,
  normalizeBlogStatus,
  normalizeLegacyBlogStatuses,
} from "@/lib/blogRepository";

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

export async function GET(req: NextRequest) {
  try {
    // Heal legacy Title-Case statuses once per process cold start (idempotent)
    await normalizeLegacyBlogStatuses().catch(() => 0);

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const blogs = await listBlogs({ status, search });
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    return mongoErrorResponse(error);
  }
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

    const status = normalizeBlogStatus(body.status || "draft");

    const newBlog = await createBlog({
      title,
      slug: autoSlug,
      excerpt: body.excerpt || "",
      content,
      thumbnail: body.thumbnail || "",
      author: body.author || "X-ON Team",
      category: body.category || "Nail Trends",
      tags: body.tags || [],
      status,
      publishedAt:
        status === "published" ? new Date().toISOString() : undefined,
      seoTitle: body.seoTitle || title,
      seoDescription: body.seoDescription || body.excerpt || "",
    });

    return NextResponse.json({ success: true, data: newBlog }, { status: 201 });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
