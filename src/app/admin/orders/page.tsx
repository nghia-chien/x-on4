"use client";


import { apiFetch } from "@/lib/apiClient";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { OrderItem, OrderStatus, PaymentStatus } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import {
  Search,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2
} from "lucide-react";

export default function AdminOrdersPage() {
  const { success, error } = useToast();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<OrderItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("limit", "15");

      const res = await apiFetch(`/api/orders?${params.toString()}`, {
        });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setOrders(json.data.orders);
          setTotalPages(json.data.totalPages);
          setTotalCount(json.data.total);
        }
      }
    } catch {
      error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page, error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
const res = await apiFetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });

      if (res.ok) {
        success("Order status updated");
        fetchOrders();
      } else {
        error("Failed to update status");
      }
    } catch {
      error("Error updating order status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
const res = await apiFetch(`/api/orders/${deleteTarget.id}`, {
        method: "DELETE"
        });

      if (res.ok) {
        success(`Order ${deleteTarget.orderNumber} deleted`);
        setDeleteTarget(null);
        fetchOrders();
      } else {
        error("Failed to delete order");
      }
    } catch {
      error("Error deleting order");
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
            Order Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Track customer orders, fulfillment statuses, tracking numbers, and payments.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order number or customer name/email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { label: "All", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Processing", value: "processing" },
              { label: "Shipped", value: "shipped" },
              { label: "Delivered", value: "delivered" },
              { label: "Cancelled", value: "cancelled" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.value
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-neutral-50/80 text-neutral-400 font-semibold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Order #</th>
                <th className="py-3.5 px-4 min-w-[200px]">Customer</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Items</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Total</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Payment</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Order Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Date</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <span className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin inline-block mr-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-bold text-neutral-900 font-mono whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="hover:text-amber-600 hover:underline"
                      >
                        {ord.orderNumber}
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900 whitespace-nowrap">{ord.customer.name}</div>
                      <div className="text-[11px] text-neutral-400 whitespace-nowrap">{ord.customer.email}</div>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4 font-medium text-neutral-700 whitespace-nowrap">
                      {ord.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 font-bold text-neutral-900 whitespace-nowrap">
                      ${ord.total.toFixed(2)}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase inline-block ${
                          ord.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : ord.paymentStatus === "failed"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>

                    {/* Order Status with Quick Selector */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(ord.id, e.target.value as OrderStatus)
                        }
                        className={`text-[11px] font-bold uppercase rounded-lg px-2 py-1 border transition-colors cursor-pointer ${
                          ord.orderStatus === "delivered"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : ord.orderStatus === "shipped"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : ord.orderStatus === "processing"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : ord.orderStatus === "cancelled"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-neutral-500 text-[11px] whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          title="View Order Details"
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(ord)}
                          title="Delete Order"
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
              Showing page {page} of {totalPages} ({totalCount} orders)
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
        title="Delete Order Record"
        message={`Are you sure you want to permanently delete order ${deleteTarget?.orderNumber}?`}
        confirmLabel="Delete Order"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
