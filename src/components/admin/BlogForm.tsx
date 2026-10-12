"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BlogPostItem } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import AdminEditor, { BlogPostData } from "./AdminEditor";

interface BlogFormProps {
  initialData?: BlogPostItem;
  isEdit?: boolean;
}

export function BlogForm({ initialData, isEdit = false }: BlogFormProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const handleSave = async (data: BlogPostData) => {
    try {
      const token = localStorage.getItem("admin_token");
      const payload = {
        title: data.title,
        slug: data.slug,
        excerpt: data.summary || data.excerpt || "",
        content: data.content,
        thumbnail: data.coverImage || data.thumbnail || "/images/IMG_7098.webp",
        author: data.authorName || data.author || "X-ON Nail Artist",
        category: data.category || "Nail Tutorials & Care",
        tags: data.tags || initialData?.tags || [],
        status: data.status || (data.isPublic ? "published" : "draft"),
        seoTitle: data.seoTitle || data.title,
        seoDescription: data.seoDescription || data.summary || data.excerpt || "",
      };

      const url =
        isEdit && initialData?.id
          ? `/api/blog/${initialData.id}`
          : "/api/blog";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success(isEdit ? "Article updated successfully!" : "Article published successfully!");
        router.push("/admin/blog");
      } else {
        error(json.message || "Error saving article.");
      }
    } catch {
      error("An error occurred while saving the article.");
    }
  };

  const handleExit = () => {
    router.push("/admin/blog");
  };

  const mappedPostToEdit: BlogPostData | undefined = initialData
    ? {
        id: initialData.id,
        title: initialData.title,
        slug: initialData.slug,
        summary: initialData.excerpt,
        excerpt: initialData.excerpt,
        content: initialData.content,
        thumbnail: initialData.thumbnail,
        coverImage: initialData.thumbnail,
        category: initialData.category,
        author: initialData.author,
        authorName: initialData.author,
        tags: initialData.tags,
        status: initialData.status,
        isPublic: initialData.status === "published",
        seoTitle: initialData.seoTitle,
        seoDescription: initialData.seoDescription,
        metaDesc: initialData.seoDescription,
      }
    : undefined;

  return (
    <AdminEditor
      postToEdit={mappedPostToEdit}
      onSave={handleSave}
      onExit={handleExit}
      isEdit={isEdit}
    />
  );
}
