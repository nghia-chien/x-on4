import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  createBlog,
  listBlogs,
  MongoUnavailableError,
  normalizeBlogStatus,
  normalizeLegacyBlogStatuses,
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
      title: sanitizePlainText(String(title), 200),
      slug: autoSlug,
      excerpt: sanitizePlainText(String(body.excerpt || ""), 500),
      content: sanitizeRichText(String(content)),
      thumbnail: sanitizePlainText(String(body.thumbnail || ""), 500),
      author: sanitizePlainText(String(body.author || "X-ON Team"), 100),
      category: sanitizePlainText(String(body.category || "Nail Trends"), 100),
      tags: Array.isArray(body.tags)
        ? body.tags.map((t: unknown) => sanitizePlainText(String(t), 50))
        : [],
      status,
      publishedAt:
        status === "published" ? new Date().toISOString() : undefined,
      seoTitle: sanitizePlainText(String(body.seoTitle || title), 200),
      seoDescription: sanitizePlainText(
        String(body.seoDescription || body.excerpt || ""),
        300
      ),
    });

    return NextResponse.json({ success: true, data: newBlog }, { status: 201 });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
