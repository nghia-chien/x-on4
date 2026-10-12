"use client";


import { apiFetch } from "@/lib/apiClient";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ComingSoonItem } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  X,
  Sparkles
} from "lucide-react";

export default function AdminComingSoonPage() {
  const { success, error } = useToast();
  const [items, setItems] = useState<ComingSoonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ComingSoonItem | null>(null);
  const [productName, setProductName] = useState("");
  const [image, setImage] = useState("/images/IMG_7104.webp");
  const [description, setDescription] = useState("");
  const [expectedReleaseDate, setExpectedReleaseDate] = useState("2026-11-01");
  const [status, setStatus] = useState<ComingSoonItem["status"]>(
    "coming_soon"
  );
  const [displayOrder, setDisplayOrder] = useState("1");
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<ComingSoonItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/coming-soon");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setItems(json.data);
      }
    } catch {
      error("Failed to load coming soon items");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreateModal = () => {
    setEditingItem(null);
    setProductName("");
    setImage("/images/IMG_7104.webp");
    setDescription("");
    setExpectedReleaseDate("2026-11-01");
    setStatus("coming_soon");
    setDisplayOrder((items.length + 1).toString());
    setModalOpen(true);
  };

  const openEditModal = (item: ComingSoonItem) => {
    setEditingItem(item);
    setProductName(item.productName);
    setImage(item.image);
    setDescription(item.description);
    setExpectedReleaseDate(item.expectedReleaseDate || "");
    setStatus(item.status);
    setDisplayOrder(item.displayOrder.toString());
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !image.trim()) {
      error("Product name and image are required");
      return;
    }

    setIsSaving(true);
    try {
const payload = {
        productName,
        image,
        description,
        expectedReleaseDate,
        status,
        displayOrder: Number(displayOrder || 0)
      };

      const url = editingItem
        ? `/api/coming-soon/${editingItem.id}`
        : "/api/coming-soon";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success(editingItem ? "Teaser updated" : "Coming soon item created");
        setModalOpen(false);
        fetchItems();
      } else {
        error(json.message || "Failed to save item");
      }
    } catch {
      error("Error saving teaser item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
const res = await apiFetch(`/api/coming-soon/${deleteTarget.id}`, {
        method: "DELETE"
        });

      if (res.ok) {
        success("Item deleted");
        setDeleteTarget(null);
        fetchItems();
      } else {
        error("Failed to delete item");
      }
    } catch {
      error("Error deleting item");
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
            Coming Soon & Teaser Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Build hype for upcoming press-on nail collections and seasonal releases.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Teaser Product</span>
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <span className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin inline-block" />
          <p className="text-xs text-neutral-500 mt-2">Loading upcoming releases...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center text-neutral-400">
          <Clock className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
          No upcoming teasers created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] bg-neutral-100">
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase shadow-xs ${
                      item.status === "coming_soon"
                        ? "bg-amber-500 text-white"
                        : item.status === "published"
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-800 text-neutral-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-bold text-neutral-900">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>

                  {item.expectedReleaseDate && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-neutral-700">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>Target: {item.expectedReleaseDate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-mono text-neutral-400">#{item.displayOrder}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    title="Edit Item"
                    className="p-1.5 text-neutral-400 hover:text-amber-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    title="Delete Item"
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h2 className="text-base font-bold text-neutral-900">
                {editingItem ? "Edit Teaser" : "Add Coming Soon Teaser"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Holographic Chrome Press-On Collection"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Image Path / URL *
                </label>
                <input
                  type="text"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="/images/IMG_7104.webp"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Teaser Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell buyers what to expect..."
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Expected Launch Date
                </label>
                <input
                  type="date"
                  value={expectedReleaseDate}
                  onChange={(e) => setExpectedReleaseDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as ComingSoonItem["status"]
                      )
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="coming_soon">Coming Soon</option>
                    <option value="published">Published</option>
                    <option value="released">Released</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{editingItem ? "Update" : "Create"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Coming Soon Teaser"
        message={`Are you sure you want to delete teaser "${deleteTarget?.productName}"?`}
        confirmLabel="Delete Teaser"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
