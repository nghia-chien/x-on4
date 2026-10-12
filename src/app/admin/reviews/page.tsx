"use client";


import { apiFetch } from "@/lib/apiClient";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ReviewItem } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Filter,
  MessageSquare
} from "lucide-react";

export default function AdminReviewsPage() {
  const { success, error } = useToast();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const [deleteTarget, setDeleteTarget] = useState<ReviewItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await apiFetch(`/api/reviews?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setReviews(json.data);
      }
    } catch {
      error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, error]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleUpdateStatus = async (
    id: string,
    newStatus: "approved" | "rejected" | "pending"
  ) => {
    try {
const res = await apiFetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        success(`Review marked as ${newStatus}`);
        fetchReviews();
      } else {
        error("Failed to update review status");
      }
    } catch {
      error("Error updating review");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
const res = await apiFetch(`/api/reviews/${deleteTarget.id}`, {
        method: "DELETE"
        });

      if (res.ok) {
        success("Review deleted");
        setDeleteTarget(null);
        fetchReviews();
      } else {
        error("Failed to delete review");
      }
    } catch {
      error("Error deleting review");
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
            Review & Testimonial Moderation
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Approve, reject, and moderate buyer ratings and social testimonials.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-2">
        <span className="text-xs font-bold uppercase text-neutral-400 mr-2">Filter:</span>
        {(
          [
            { label: "All Reviews", value: "all" },
            { label: "Pending Moderation", value: "pending" },
            { label: "Approved Live", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === tab.value
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <span className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin inline-block" />
          <p className="text-xs text-neutral-500 mt-2">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center text-neutral-400">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
          No reviews found under this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < r.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-neutral-900 ml-1.5">
                      {r.rating}.0
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      r.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : r.status === "rejected"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <p className="text-xs text-neutral-800 leading-relaxed font-normal">
                  &ldquo;{r.review}&rdquo;
                </p>

                {r.productTitle && (
                  <p className="text-[11px] text-neutral-400 mt-2 font-medium">
                    Product: <span className="text-neutral-700">{r.productTitle}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900 text-xs">{r.customerName}</p>
                  <p className="text-[10px] text-neutral-400">{r.date}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  {r.status !== "approved" && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, "approved")}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, "rejected")}
                      className="px-3 py-1 bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 text-neutral-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(r)}
                    title="Delete Review"
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Review"
        message={`Are you sure you want to permanently remove this review by ${deleteTarget?.customerName}?`}
        confirmLabel="Delete Review"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
