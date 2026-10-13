"use client";


import { apiFetch } from "@/lib/apiClient";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductItem } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package
} from "lucide-react";

export default function AdminProductsPage() {
  const { success, error } = useToast();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shapeFilter, setShapeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (shapeFilter !== "all") params.append("shape", shapeFilter);
      params.append("page", page.toString());
      params.append("limit", "15");

      const res = await apiFetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setProducts(json.data.products);
          setTotalPages(json.data.totalPages);
          setTotalCount(json.data.total);
        }
      }
    } catch (e) {
      console.error(e);
      error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter, statusFilter, shapeFilter, page, error]);

  const fetchCategories = async () => {
    try {
      const res = await apiFetch("/api/categories");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setCategories(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
const res = await apiFetch(`/api/products/${deleteTarget.id}`, {
        method: "DELETE"
        });

      if (res.ok) {
        success(`Product "${deleteTarget.name}" deleted`);
        setDeleteTarget(null);
        fetchProducts();
      } else {
        error("Failed to delete product");
      }
    } catch {
      error("Error deleting product");
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
            Product Management
          </h1>
          
        </div>
        <Link
          href="/admin/products/create"
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-700 focus:outline-none focus:border-amber-500 focus:bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Shape Filter */}
          <select
            value={shapeFilter}
            onChange={(e) => {
              setShapeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-700 focus:outline-none focus:border-amber-500 focus:bg-white"
          >
            <option value="all">All Nail Shapes</option>
            <option value="Almond">Almond</option>
            <option value="Coffin">Coffin</option>
            <option value="Square">Square</option>
            <option value="Oval">Oval</option>
            <option value="Stiletto">Stiletto</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-700 focus:outline-none focus:border-amber-500 focus:bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
          <span>Found {totalCount} products</span>
          {(search || categoryFilter !== "all" || statusFilter !== "all" || shapeFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setStatusFilter("all");
                setShapeFilter("all");
                setPage(1);
              }}
              className="text-amber-600 hover:underline font-medium"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-xs">
            <thead className="bg-neutral-50/80 text-neutral-400 font-semibold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3.5 px-4 min-w-[280px]">Product</th>
                <th className="py-3.5 px-4 whitespace-nowrap">SKU</th>
                <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap">Category & Shape</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Price</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Stock</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <span className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin inline-block mr-2" />
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                          <Image
                            src={p.thumbnail || p.images[0] || "/images/IMG_7098.webp"}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-900 leading-tight">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {p.featured && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800 whitespace-nowrap">
                                Featured
                              </span>
                            )}
                            {p.bestSeller && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-100 text-rose-800 whitespace-nowrap">
                                Best Seller
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                      {p.sku}
                    </td>

                    {/* Category & Shape */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-neutral-900">{p.category}</div>
                      <div className="text-[10px] text-neutral-400">
                        {p.shapes?.join(", ") || "Standard"}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-neutral-900">
                        ${p.price.toFixed(2)}
                      </div>
                      {p.salePrice && (
                        <div className="text-[10px] text-rose-600 font-semibold">
                          Sale: ${p.salePrice.toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          p.stock <= 5
                            ? "text-rose-600"
                            : p.stock <= 10
                            ? "text-amber-600"
                            : "text-neutral-900"
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase inline-block ${
                          p.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : p.status === "draft"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          title="Edit product"
                          className="p-1.5 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          title="Delete product"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 rounded-lg text-neutral-700 font-medium transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 rounded-lg text-neutral-700 font-medium transition-colors flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Product"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
