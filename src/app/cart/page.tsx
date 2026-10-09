"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  CheckCircle2,
  Truck,
  CreditCard,
  AlertCircle,
} from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Los Angeles");
  const [state, setState] = useState("CA");
  const [zipCode, setZipCode] = useState("90024");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card (Online)");

  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99;
  const tax = subtotal * 0.0825;
  const total = subtotal + shipping + tax;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        customer: {
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || "+1 (555) 000-1234",
          address: `${address.trim()}, ${city.trim()}, ${state.trim()} ${zipCode.trim()}`,
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          country: "United States",
        },
        items: items.map((item) => ({
          productId: item.id,
          productName: item.title,
          productImage: item.image || "/images/IMG_7098.webp",
          size: item.size || "Standard",
          quantity: item.quantity,
          price: item.priceNumber,
          subtotal: item.priceNumber * item.quantity,
        })),
        subtotal,
        shipping,
        tax,
        total,
        paymentMethod,
        paymentStatus: "paid",
        orderStatus: "processing",
        shippingAddress: `${address.trim()}, ${city.trim()}, ${state.trim()} ${zipCode.trim()}`,
        notes: notes.trim(),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        setCreatedOrder(json.data);
        clearCart();
        setCheckingOut(false);
      } else {
        setErrorMsg(json.message || "Failed to place order. Please review your cart.");
      }
    } catch {
      setErrorMsg("Network error placing order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdOrder) {
    return (
      <div className="bg-white min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-xl w-full text-center space-y-6 bg-neutral-50 p-6 sm:p-10 rounded-3xl border border-neutral-200/80 shadow-lg">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase">
              Order Confirmed #{createdOrder.orderNumber}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-950 font-serif mt-2">
              Thank You For Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
              Your order has been received successfully. Your nail set is being handcrafted with care by X-ON nail artists.
            </p>
          </div>

          {/* Order Snapshot Details */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-neutral-200/80 text-left space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-neutral-100">
              <span className="text-neutral-500">Order Number:</span>
              <span className="font-mono font-bold text-neutral-900">{createdOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-neutral-100">
              <span className="text-neutral-500">Customer:</span>
              <span className="font-semibold text-neutral-900">{createdOrder.customer?.name} ({createdOrder.customer?.email})</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-neutral-100">
              <span className="text-neutral-500">Shipping Address:</span>
              <span className="font-medium text-neutral-800 text-right max-w-xs truncate">{createdOrder.shippingAddress}</span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-sm text-neutral-900">
              <span>Total Paid:</span>
              <span className="text-emerald-600">${createdOrder.total?.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center pt-2">
            <Link
              href="/shop"
              className="px-8 py-3 bg-black hover:bg-neutral-800 text-white font-semibold text-xs uppercase tracking-widest rounded-full transition-colors shadow-md"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white min-h-screen py-12 sm:py-20 overflow-hidden">
      {/* Background Motifs */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-gray-950 font-serif">
            Your Shopping Bag
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {items.length === 0
              ? "Your bag is currently empty."
              : `Review your items (${items.length}) before proceeding to checkout.`}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto stroke-1" />
            <h2 className="text-lg font-semibold text-gray-900">Your bag is empty</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Explore our handmade press-ons and cold gel adhesive formulations.
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 bg-black text-white text-xs font-semibold uppercase tracking-widest rounded-full hover:bg-neutral-800 transition-colors shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Items List (2 cols) */}
            <div className="lg:col-span-2 divide-y divide-gray-100">
              {items.map((item) => {
                const maxStock = item.maxStock ?? 99;
                const isMaxReached = item.quantity >= maxStock;

                return (
                  <div key={item.id} className="py-6 flex gap-6 items-center">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-50 shrink-0 border border-gray-100">
                      <Image
                        src={item.image || "/images/IMG_7098.webp"}
                        alt={item.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.slug}`}
                        className="text-sm font-semibold text-gray-950 hover:text-rose-700 line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      {item.size && (
                        <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>
                      )}
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {item.price}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            disabled={isMaxReached}
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title={isMaxReached ? `Maximum available stock reached (${maxStock} items)` : "Increase quantity"}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {isMaxReached && (
                          <span className="text-[11px] text-amber-600 font-medium">
                            Max reached ({maxStock} available)
                          </span>
                        )}

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer ml-auto sm:ml-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-gray-950">
                        ${(item.priceNumber * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary & Checkout Form (1 col) */}
            <div className="bg-neutral-50 p-6 sm:p-8 rounded-2xl border border-gray-100 space-y-6 h-fit">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-extrabold text-gray-950">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {!checkingOut ? (
                <button
                  onClick={() => setCheckingOut(true)}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-semibold text-xs uppercase tracking-widest rounded-md shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-3.5 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      Customer &amp; Shipping Info
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCheckingOut(false)}
                      className="text-[11px] text-neutral-400 hover:text-neutral-700 underline"
                    >
                      Hide Form
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Emily Watson"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="emily@example.com"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 234-5678"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Ocean Blvd, Apt 4B"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* City, State, Zip Code */}
                  {/*
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-1">Zip Code</label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  */}

                  {/* Payment Method */}
                  {/*
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Credit Card (Online)">Credit Card (Visa / Mastercard / Amex)</option>
                      <option value="Apple Pay / Google Pay">Apple Pay / Google Pay</option>
                      <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                    </select>
                  </div>
                  */}

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special nail sizing notes or delivery instructions..."
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-widest rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting && (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    <span>
                      {isSubmitting
                        ? "Processing Order..."
                        : `Place Order & Save to Dashboard ($${total.toFixed(2)})`}
                    </span>
                  </button>
                </form>
              )}

              <div className="pt-2 text-[11px] text-gray-500 space-y-1.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>256-Bit SSL Encrypted &amp; Secure Checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
