"use client";


import { apiFetch } from "@/lib/apiClient";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { OrderItem, OrderStatus, PaymentStatus } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import {
  ArrowLeft,
  Truck,
  CreditCard,
  User,
  MapPin,
  Clock,
  Save,
  PackageCheck
} from "lucide-react";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { success, error } = useToast();

  const [order, setOrder] = useState<OrderItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Editable fields
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
apiFetch(`/api/orders/${id}`, {
      })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const ord = json.data;
          setOrder(ord);
          setOrderStatus(ord.orderStatus);
          setPaymentStatus(ord.paymentStatus);
          setTrackingNumber(ord.trackingNumber || "");
          setShippingAddress(ord.shippingAddress || ord.customer.address || "");
          setNotes(ord.notes || "");
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
const res = await apiFetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderStatus,
          paymentStatus,
          trackingNumber,
          shippingAddress,
          notes
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success("Order updated successfully");
        setOrder(json.data);
      } else {
        error(json.message || "Failed to update order");
      }
    } catch {
      error("Error saving order changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <span className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin inline-block" />
        <p className="text-xs text-neutral-500 mt-2">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 text-center text-neutral-500">
        Order not found or has been removed.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-neutral-900 font-mono">
                Order #{order.orderNumber}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-xs uppercase ${
                  order.orderStatus === "delivered"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : order.orderStatus === "shipped"
                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                    : order.orderStatus === "processing"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={isSaving}
          className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {isSaving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Items & Payment Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Ordered Items ({order.items.length})
            </h2>

            <div className="divide-y divide-neutral-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                    <Image
                      src={item.productImage || "/images/IMG_7098.webp"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-neutral-900 text-sm truncate">
                      {item.productName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                      <span className="px-2 py-0.5 bg-neutral-100 rounded-md font-semibold text-neutral-700">
                        Size: {item.size}
                      </span>
                      <span>Qty: {item.quantity}</span>
                      <span>•</span>
                      <span>${item.price.toFixed(2)} each</span>
                    </div>
                  </div>
                  <div className="text-sm font-extrabold text-neutral-900">
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financials / Breakdown */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 sm:p-6 space-y-3 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Payment Summary
            </h2>

            <div className="flex justify-between text-neutral-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-neutral-900">
                ${order.subtotal.toFixed(2)}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Promotional Discount</span>
                <span className="font-semibold">-${order.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600">
              <span>Shipping & Handling</span>
              <span className="font-semibold text-neutral-900">
                {order.shipping === 0 ? "FREE" : `$${order.shipping.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-neutral-600">
              <span>Estimated Tax</span>
              <span className="font-semibold text-neutral-900">
                ${order.tax.toFixed(2)}
              </span>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-between text-sm font-black text-neutral-900">
              <span>Grand Total</span>
              <span className="text-base">${order.total.toFixed(2)}</span>
            </div>

            <div className="pt-2 flex items-center gap-2 text-neutral-500 text-[11px]">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Paid via {order.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer & Fulfillment Management */}
        <div className="space-y-6">
          {/* Order Status & Payment Status Control */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Fulfillment Status
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Order Status
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing (Handcrafting)</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="pending">Pending Payment</option>
                <option value="paid">Paid & Settled</option>
                <option value="failed">Payment Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Tracking Number (USPS / FedEx)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. USPS9400100029384"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 space-y-4 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Customer Details
            </h2>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-neutral-900">
                <User className="w-4 h-4 text-neutral-400" />
                <span>{order.customer.name}</span>
              </div>
              <p className="text-neutral-500 pl-6">{order.customer.email}</p>
              <p className="text-neutral-500 pl-6">{order.customer.phone}</p>
            </div>

            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-neutral-900">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <span>Shipping Destination</span>
              </div>
              <textarea
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            {/* Admin Internal Notes */}
            <div className="pt-2 border-t border-neutral-100">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Internal Staff Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add special packaging notes, custom sizing requests, or client communications..."
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
