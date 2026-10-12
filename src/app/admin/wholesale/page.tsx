"use client";

import React, { useEffect, useState, useCallback } from "react";
import { WholesaleRequestItem } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import {
  Briefcase,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  Trash2,
  Save,
  CheckCircle2,
  X,
  Eye,
} from "lucide-react";

export default function AdminWholesalePage() {
  const { success, error } = useToast();
  const [requests, setRequests] = useState<WholesaleRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Notes drawer / modal
  const [activeItem, setActiveItem] = useState<WholesaleRequestItem | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState<WholesaleRequestItem["status"]>("new");
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<WholesaleRequestItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWholesale = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/wholesale?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) setRequests(json.data);
      }
    } catch {
      error("Failed to load wholesale leads");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, error]);

  useEffect(() => {
    fetchWholesale();
  }, [fetchWholesale]);

  const openEdit = (item: WholesaleRequestItem) => {
    setActiveItem(item);
    setAdminNotes(item.adminNotes || "");
    setStatus(item.status);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/wholesale/${activeItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNotes }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success("Wholesale application updated");
        setActiveItem(null);
        fetchWholesale();
      } else {
        error(json.message || "Failed to update wholesale request");
      }
    } catch {
      error("Error updating request");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/wholesale/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        success("Wholesale lead removed");
        setDeleteTarget(null);
        fetchWholesale();
      } else {
        error("Failed to delete lead");
      }
    } catch {
      error("Error deleting wholesale lead");
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
            Wholesale & B2B Partnership Requests
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Review wholesale applications from nail salons, spas, beauty bars, and boutiques.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold uppercase text-neutral-400 mr-2">Status:</span>
        {(
          [
            { label: "All Inquiries", value: "all" },
            { label: "New Leads", value: "new" },
            { label: "Contacted", value: "contacted" },
            { label: "Approved Partner", value: "approved" },
            { label: "Converted", value: "converted" },
            { label: "Rejected", value: "rejected" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs">
            <thead className="bg-neutral-50/80 text-neutral-400 font-semibold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3.5 px-4 min-w-[200px]">Business / Salon</th>
                <th className="py-3.5 px-4 min-w-[180px]">Contact Person</th>
                <th className="py-3.5 px-4 min-w-[160px]">Website / Social</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tax ID / Permit</th>
                <th className="py-3.5 px-4 min-w-[200px]">Details &amp; Volume</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Submitted</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <span className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin inline-block mr-2" />
                    Loading wholesale leads...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                    No wholesale requests found.
                  </td>
                </tr>
              ) : (
                requests.map((w) => (
                  <tr key={w.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-neutral-900 leading-tight">{w.businessName}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900 whitespace-nowrap">{w.contactName}</div>
                      <div className="text-[11px] text-neutral-400 whitespace-nowrap">{w.email} • {w.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {w.website ? (
                        <span className="text-neutral-800 font-mono text-[11px] truncate max-w-[160px] block">
                          {w.website}
                        </span>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                      {w.taxId ? (
                        <span className="text-neutral-800 font-semibold">{w.taxId}</span>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {w.message ? (
                        <p className="text-[11px] text-neutral-600 line-clamp-2 max-w-xs">
                          {w.message}
                        </p>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase inline-block ${
                          w.status === "approved" || w.status === "converted"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : w.status === "contacted"
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : w.status === "rejected"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500 text-[11px] whitespace-nowrap">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(w)}
                          title="View & Review Details"
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(w)}
                          title="Delete Lead"
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

      {/* Review / Note Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  {activeItem.businessName}
                </h2>
                <p className="text-xs text-neutral-400">
                  Submitted by {activeItem.contactName} ({activeItem.email})
                </p>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              {/* Application Details Summary */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Contact Person:</span>
                  <span className="font-semibold text-neutral-900">{activeItem.contactName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Business / Salon:</span>
                  <span className="font-semibold text-neutral-900">{activeItem.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Email:</span>
                  <span className="font-semibold text-neutral-900 font-mono">{activeItem.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Phone:</span>
                  <span className="font-semibold text-neutral-900">{activeItem.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Website / Social:</span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    {activeItem.website || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Tax ID / Permit:</span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    {activeItem.taxId || "—"}
                  </span>
                </div>
                {activeItem.message && (
                  <div className="pt-2 border-t border-neutral-200">
                    <span className="text-neutral-400 block mb-0.5">Details &amp; Estimated Volume:</span>
                    <p className="text-neutral-800 italic">{activeItem.message}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Status Pipeline
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as WholesaleRequestItem["status"])
                  }
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="approved">Approved</option>
                  <option value="converted">Converted to Account</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Internal Staff Communication Notes
                </label>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record call logs, price quotations, catalog dispatches..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
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
                  <span>Save Lead Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Wholesale Application"
        message={`Are you sure you want to delete the wholesale inquiry from "${deleteTarget?.businessName}"?`}
        confirmLabel="Delete Request"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
