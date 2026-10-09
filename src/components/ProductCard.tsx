"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Eye, Check, Loader2, AlertCircle } from "lucide-react";

export interface Product {
  id: string;
  slug: string;
  title: string;
  price: string;
  originalPrice?: string;
  image: string;
  category?: string;
  shapes?: string[];
  designThemes?: string[];
  colors?: string[];
  colorOptions?: { name: string; hex: string; border?: boolean }[];
  sizes?: string[];
  sizeStock?: Record<string, number>;
  length?: string;
  lengths?: string[];
  galleryImages?: string[];
  images?: string[];
  bestSeller?: boolean;
  handmadeGripX?: boolean;
  featured?: boolean;
  url: string;
  description?: string;
  stock?: number;
  status?: string;
}

export interface ProductCardProps {
  product: Product;
  variant?: "default" | "shop";
  showVariants?: boolean;
}

export function ProductCard({
  product,
  variant = "shop",
  showVariants = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [quickAddStatus, setQuickAddStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const hasMultipleVariants =
    (Array.isArray(product.sizes) && product.sizes.length > 1) ||
    (Array.isArray(product.lengths) && product.lengths.length > 1);

  // In-stock sizes
  const inStockSizes = React.useMemo(() => {
    if (!Array.isArray(product.sizes) || product.sizes.length === 0) return [];
    if (!product.sizeStock) return product.sizes;
    return product.sizes.filter((s) => {
      const stock = product.sizeStock?.[s] ?? product.sizeStock?.[s.toUpperCase()] ?? 1;
      return Number(stock) > 0;
    });
  }, [product.sizes, product.sizeStock]);

  const handleQuickAdd = () => {
    if (isOutOfStock || quickAddStatus === "loading") return;
    setQuickAddStatus("loading");

    setTimeout(() => {
      try {
        const result = addItem({
          id: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          image: product.image,
          size: product.sizes?.[0],
          maxStock: product.stock ?? 25,
        });

        if (result && result.success) {
          setQuickAddStatus("success");
          setTimeout(() => setQuickAddStatus("idle"), 1800);
        } else {
          setQuickAddStatus("error");
          setErrorMessage(result?.message || "Could not add item");
          setTimeout(() => setQuickAddStatus("idle"), 2200);
        }
      } catch {
        setQuickAddStatus("error");
        setErrorMessage("Error adding to bag");
        setTimeout(() => setQuickAddStatus("idle"), 2200);
      }
    }, 250);
  };

  if (variant === "shop") {
    return (
      <div className="group relative flex flex-col rounded-2xl border border-[#eedad7] bg-white overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        {/* Product Image (4:5 aspect ratio) */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f6e6e2]/40">
          <Link
            href={`/product/${product.slug}`}
            className="relative block w-full h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c]"
          >
            <Image
              src={product.image || "/images/IMG_7098.webp"}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover object-center group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
                isOutOfStock ? "opacity-50 grayscale-[25%]" : ""
              }`}
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
            {isOutOfStock ? (
              <span className="bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                Out of stock
              </span>
            ) : (
              <>
                {product.originalPrice && (
                  <span className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    Sale
                  </span>
                )}
                {product.bestSeller && (
                  <span className="bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    Best seller
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1">
          {/* Category */}
          <div className="h-4 mb-1">
            {product.category && (
              <p className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 truncate">
                {product.category}
              </p>
            )}
          </div>

          {/* Title (fixed 2 lines) */}
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide line-clamp-2 h-9 sm:h-10 hover:text-[#c9776c] transition-colors">
            <Link
              href={`/product/${product.slug}`}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c]"
            >
              {product.title}
            </Link>
          </h3>

          {/* Price & Variant Chips on the same row */}
          <div className="mt-2.5 flex items-center justify-between gap-1.5 min-h-[26px]">
            <div className="flex items-baseline gap-1.5 shrink-0 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-gray-950">
                {product.price}
              </span>
              {product.originalPrice && (
                <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                  {product.originalPrice}
                </span>
              )}
            </div>

            {/* In-stock Size Chips (omitted by default) */}
            {showVariants && inStockSizes.length > 0 && (
              <div className="flex items-center gap-1 shrink-0 overflow-hidden">
                {inStockSizes.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="inline-block text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-[#eedad7] text-neutral-600 bg-[#fdf4f1]/60"
                    title={`Size ${s}`}
                  >
                    {s}
                  </span>
                ))}
                {inStockSizes.length > 3 && (
                  <span className="text-[9px] text-neutral-400 font-medium">
                    +{inStockSizes.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* CTA Action */}
          <div className="mt-auto pt-3">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-400 uppercase tracking-wider text-[11px] font-bold cursor-not-allowed"
              >
                Out of Stock
              </button>
            ) : hasMultipleVariants ? (
              <Link
                href={`/product/${product.slug}`}
                className="block w-full py-2.5 rounded-lg border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white uppercase tracking-wider text-[11px] font-bold text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c]"
              >
                Select Options
              </Link>
            ) : (
              <button
                onClick={handleQuickAdd}
                disabled={quickAddStatus === "loading"}
                className={`w-full py-2.5 rounded-lg border uppercase tracking-wider text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c] ${
                  quickAddStatus === "success"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : quickAddStatus === "error"
                    ? "bg-rose-600 text-white border-rose-600"
                    : "border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                }`}
              >
                {quickAddStatus === "loading" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...
                  </>
                ) : quickAddStatus === "success" ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Added to Bag
                  </>
                ) : quickAddStatus === "error" ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" /> {errorMessage || "Limit Reached"}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default Variant (retains 100% of previous look & behavior)
  return (
    <div className="group relative flex flex-col bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
          <Image
            src={product.image || "/images/IMG_7098.webp"}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              Out of stock
            </span>
          ) : product.originalPrice ? (
            <span className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              Sale
            </span>
          ) : null}
        </div>

        {/* Quick Add Overlay Button on Hover */}
        <div className="absolute inset-x-2 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1.5">
          {!isOutOfStock ? (
            <button
              onClick={() =>
                addItem({
                  id: product.id,
                  slug: product.slug,
                  title: product.title,
                  price: product.price,
                  image: product.image,
                  maxStock: product.stock ?? 25,
                })
              }
              className="flex-1 bg-black/90 hover:bg-black text-white text-xs font-semibold py-2 px-3 rounded-md backdrop-blur-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
            </button>
          ) : (
            <span className="flex-1 bg-neutral-800/80 text-white text-[11px] font-semibold py-2 px-3 rounded-md text-center">
              Out of stock
            </span>
          )}
          <Link
            href={`/product/${product.slug}`}
            className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-md backdrop-blur-xs flex items-center justify-center shadow-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3.5 flex flex-col flex-1">
        {product.category && (
          <p className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 mb-1">
            {product.category}
          </p>
        )}
        <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 hover:text-rose-700 transition-colors mb-1.5">
          <Link href={`/product/${product.slug}`}>{product.title}</Link>
        </h3>

        <div className="mt-auto flex items-center justify-between gap-1.5 pt-1 min-h-[26px]">
          <div className="flex items-baseline gap-1.5 shrink-0 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-gray-950">
              {product.price}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                {product.originalPrice}
              </span>
            )}
          </div>
          {showVariants && inStockSizes.length > 0 && (
            <div className="flex items-center gap-1 shrink-0 overflow-hidden">
              {inStockSizes.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="inline-block text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-[#eedad7] text-neutral-600 bg-[#fdf4f1]/60"
                  title={`Size ${s}`}
                >
                  {s}
                </span>
              ))}
              {inStockSizes.length > 3 && (
                <span className="text-[9px] text-neutral-400 font-medium">
                  +{inStockSizes.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
