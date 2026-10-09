"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-800" />
              <h2 className="text-lg font-semibold tracking-wide text-gray-900 uppercase">
                Shopping Cart ({items.length})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <ShoppingBag className="w-10 h-10 stroke-1" />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-sm text-gray-500 max-w-xs mb-6">
                  Explore our handcrafted Grip-X press-on nail collections and cold gel tech.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors uppercase tracking-wider"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <Image
                      src={item.image || "/images/IMG_7098.webp"}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-gray-900 hover:text-rose-600 line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    {item.size && (
                      <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>
                    )}
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {item.price}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-gray-100 text-gray-600 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-medium text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.quantity >= (item.maxStock ?? 99)}
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title={
                            item.quantity >= (item.maxStock ?? 99)
                              ? `Maximum available stock reached (${item.maxStock ?? 99} items)`
                              : ""
                          }
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.quantity >= (item.maxStock ?? 99) && (
                        <span className="text-[10px] text-amber-600 font-medium">
                          Max ({item.maxStock})
                        </span>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer checkout */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50 space-y-4">
              <div className="flex items-center justify-between text-base font-semibold text-gray-900">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">
                Shipping and taxes calculated at checkout. Free shipping on orders over $50.
              </p>
              <div className="space-y-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full block py-3 bg-black hover:bg-neutral-800 text-white text-center text-sm font-semibold tracking-wider uppercase rounded-md transition-colors shadow-sm"
                >
                  View Cart & Checkout
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full py-2.5 text-center text-xs text-gray-500 hover:text-gray-900 uppercase font-medium tracking-wider"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
