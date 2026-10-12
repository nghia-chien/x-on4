"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogPostItem } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  FileText,
  Search,
  Calendar,
} from "lucide-react";

export default function AdminBlogPage() {
  const { success, error } = useToast();
  const [blogs, setBlogs] = useState<BlogPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [deleteTarget, setDeleteTarget] = useState<BlogPostItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/blog?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setBlogs(json.data);
      }
    } catch {
      error("Failed to load blog posts");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchBlogs]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/blog/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        success(`Article "${deleteTarget.title}" deleted`);
        setDeleteTarget(null);
        fetchBlogs();
      } else {
        error("Failed to delete article");
      }
    } catch {
      error("Error deleting blog article");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Journal & Editorial Content
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Publish nail tutorials, maintenance guides, and beauty trend reports.
          </p>
        </div>
        <Link
          href="/admin/blog/create"
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search article titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-700 focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Articles</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-neutral-50/80 text-neutral-400 font-semibold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3.5 px-4 min-w-[280px]">Article</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Author</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Category</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Date</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <span className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin inline-block mr-2" />
                    Loading articles...
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                    No blog posts found.
                  </td>
                </tr>
              ) : (
                blogs.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-10 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                          <Image
                            src={b.thumbnail || "/images/IMG_7098.webp"}
                            alt={b.title}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 line-clamp-1 leading-tight">
                            {b.title}
                          </p>
                          <p className="text-[11px] text-neutral-400 font-mono">
                            /{b.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-700 font-medium whitespace-nowrap">{b.author}</td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[10px] font-semibold inline-block">
                        {b.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase inline-block ${
                          b.status === "published"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : b.status === "draft"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500 text-[11px] whitespace-nowrap">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/blog/${b.id}/edit`}
                          title="Edit Article"
                          className="p-1.5 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(b)}
                          title="Delete Article"
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Blog Article"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete Article"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
