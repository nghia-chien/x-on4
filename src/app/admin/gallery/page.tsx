"use client";


import { apiFetch } from "@/lib/apiClient";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { GalleryItem } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X,
  Upload
} from "lucide-react";

export default function AdminGalleryPage() {
  const { success, error } = useToast();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("/images/IMG_7098.webp");
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("Artisan Showcase");
  const [status, setStatus] = useState<"published" | "unpublished">("published");
  const [displayOrder, setDisplayOrder] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGallery = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/gallery");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setGallery(json.data);
      }
    } catch {
      error("Failed to load gallery items");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle("");
    setDescription("");
    setImage("/images/IMG_7098.webp");
    setProduct("");
    setCategory("Artisan Showcase");
    setStatus("published");
    setDisplayOrder((gallery.length + 1).toString());
    setModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || "");
    setImage(item.image);
    setProduct(item.product || "");
    setCategory(item.category || "Artisan Showcase");
    setStatus(item.status);
    setDisplayOrder(item.displayOrder.toString());
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.url) {
          setImage(json.data.url);
          success("Image uploaded");
        }
      }
    } catch {
      error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) {
      error("Title and image are required");
      return;
    }

    setIsSaving(true);
    try {
const payload = {
        title,
        description,
        image,
        product,
        category,
        status,
        displayOrder: Number(displayOrder || 0)
      };

      const url = editingItem ? `/api/gallery/${editingItem.id}` : "/api/gallery";
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
        success(editingItem ? "Gallery item updated" : "Gallery item created");
        setModalOpen(false);
        fetchGallery();
      } else {
        error(json.message || "Failed to save item");
      }
    } catch {
      error("Error saving gallery item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
const res = await apiFetch(`/api/gallery/${deleteTarget.id}`, {
        method: "DELETE"
        });

      if (res.ok) {
        success("Gallery item deleted");
        setDeleteTarget(null);
        fetchGallery();
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
            Gallery & Lookbook Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Curate customer photoshoot galleries and visual lookbooks.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Photo to Gallery</span>
        </button>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <span className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin inline-block" />
          <p className="text-xs text-neutral-500 mt-2">Loading gallery photos...</p>
        </div>
      ) : gallery.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center text-neutral-400">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
          No gallery images added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-square bg-neutral-100 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="300px"
                />
                <span
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider shadow-xs ${
                    item.status === "published"
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-800 text-neutral-200"
                  }`}
                >
                  {item.status}
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md font-mono text-[10px] bg-black/60 text-white backdrop-blur-xs">
                  #{item.displayOrder}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                    {item.description || "—"}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium truncate max-w-[120px]">
                    {item.category || "General"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      title="Edit Item"
                      className="p-1.5 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      title="Delete Item"
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Gallery */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h2 className="text-base font-bold text-neutral-900">
                {editingItem ? "Edit Gallery Item" : "Add Photo to Gallery"}
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
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Golden Shimmer Stiletto Real-life Set"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Image URL / Upload
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="/images/IMG_7098.webp"
                    className="flex-1 px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                  <label className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief note or customer quote..."
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
                      setStatus(e.target.value as "published" | "unpublished")
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
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
                  <span>{editingItem ? "Update Photo" : "Add Photo"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Gallery Photo"
        message={`Are you sure you want to delete "${deleteTarget?.title}" from the gallery?`}
        confirmLabel="Delete Photo"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
