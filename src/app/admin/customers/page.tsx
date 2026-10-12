"use client";


import { apiFetch } from "@/lib/apiClient";
import React, { useEffect, useState, useCallback } from "react";
import { CustomerItem, OrderItem } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import {
  Search,
  Users,
  ShoppingBag,
  Mail,
  Phone,
  Calendar,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function AdminCustomersPage() {
  const { success, error } = useToast();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Customer Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<{
    customer: CustomerItem;
    orders: OrderItem[];
  } | null>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<CustomerItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("limit", "15");

      const res = await apiFetch(`/api/customers?${params.toString()}`, {
        });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setCustomers(json.data.customers);
          setTotalPages(json.data.totalPages);
          setTotalCount(json.data.total);
        }
      }
    } catch {
      error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page, error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const viewCustomerDetail = async (id: string) => {
    setIsLoadingCustomer(true);
    try {
const res = await apiFetch(`/api/customers/${id}`, {
        });
      if (res.ok) {
        const json = await res.json();
        if (json.success) setSelectedCustomer(json.data);
      }
    } catch {
      error("Failed to fetch customer profile");
    } finally {
      setIsLoadingCustomer(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
const res = await apiFetch(`/api/customers/${deleteTarget.id}`, {
        method: "DELETE"
        });

      if (res.ok) {
        success(`Customer ${deleteTarget.name} removed`);
        setDeleteTarget(null);
        fetchCustomers();
      } else {
        error("Failed to delete customer");
      }
    } catch {
      error("Error deleting customer");
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
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            View shopper profiles, order history, lifetime spend, and contact records.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-700 focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Customer Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-neutral-50/80 text-neutral-400 font-semibold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3.5 px-4 min-w-[220px]">Customer</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Phone</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Orders</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Total Spent</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Last Order</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <span className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin inline-block mr-2" />
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <button
                            onClick={() => viewCustomerDetail(c.id)}
                            className="font-bold text-neutral-900 hover:text-amber-600 text-left whitespace-nowrap"
                          >
                            {c.name}
                          </button>
                          <div className="text-[11px] text-neutral-400 whitespace-nowrap">{c.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                      {c.phone || "—"}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-neutral-900 whitespace-nowrap">
                      {c.totalOrders}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-neutral-900 whitespace-nowrap">
                      ${c.totalSpent.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500 text-[11px] whitespace-nowrap">
                      {c.lastOrder
                        ? new Date(c.lastOrder).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })
                        : "Never"}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase inline-block ${
                          c.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => viewCustomerDetail(c.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                        >
                          View History
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          title="Delete Customer"
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
              Showing page {page} of {totalPages} ({totalCount} customers)
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

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {selectedCustomer.customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    {selectedCustomer.customer.name}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Member since{" "}
                    {new Date(selectedCustomer.customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                    Total Orders
                  </span>
                  <span className="text-lg font-black text-neutral-900 mt-0.5 block">
                    {selectedCustomer.customer.totalOrders}
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                    Lifetime Spend
                  </span>
                  <span className="text-lg font-black text-neutral-900 mt-0.5 block">
                    ${selectedCustomer.customer.totalSpent.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                    Avg Order Value
                  </span>
                  <span className="text-lg font-black text-neutral-900 mt-0.5 block">
                    $
                    {(
                      selectedCustomer.customer.totalSpent /
                      Math.max(1, selectedCustomer.customer.totalOrders)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Contact & Shipping */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-2">
                <p className="font-bold text-neutral-900 uppercase text-[10px]">Contact Info</p>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{selectedCustomer.customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{selectedCustomer.customer.phone || "No phone registered"}</span>
                </div>
                {selectedCustomer.customer.address && (
                  <p className="text-neutral-500 pt-1">
                    Address: {selectedCustomer.customer.address}
                  </p>
                )}
              </div>

              {/* Order History Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
                  Past Order History ({selectedCustomer.orders.length})
                </h3>
                {selectedCustomer.orders.length > 0 ? (
                  <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100">
                    {selectedCustomer.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 flex items-center justify-between hover:bg-neutral-50"
                      >
                        <div>
                          <p className="font-bold text-neutral-900 font-mono">
                            {ord.orderNumber}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {new Date(ord.createdAt).toLocaleDateString()} •{" "}
                            {ord.items.length} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-neutral-900">
                            ${ord.total.toFixed(2)}
                          </p>
                          <span className="text-[10px] uppercase font-bold text-emerald-700">
                            {ord.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-400 italic">No previous orders on record.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-bold text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Customer Profile"
        message={`Are you sure you want to delete customer record "${deleteTarget?.name}"?`}
        confirmLabel="Delete Customer"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
