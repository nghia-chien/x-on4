"use client";

import React, { useState, use, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ProductCard, type Product } from "@/components/ProductCard";
import productsData from "@/data/products.json";
import {
  Star,
  ShieldCheck,
  Zap,
  Truck,
  RotateCcw,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Ruler,
  PackageCheck,
} from "lucide-react";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c]";

const DEFAULT_SIZE_INFO: Record<string, { label: string; desc: string }> = {
  XS: { label: "XS", desc: "14 · 10 · 11 · 10 · 7 mm" },
  S: { label: "S", desc: "15 · 11 · 12 · 11 · 8 mm" },
  M: { label: "M", desc: "16 · 12 · 13 · 12 · 9 mm" },
  L: { label: "L", desc: "17 · 13 · 14 · 13 · 10 mm" },
  Custom: { label: "Custom", desc: "Custom Sizing" },
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams.slug;
  const decodedSlug = decodeURIComponent(rawSlug).toLowerCase().trim();

  // Find static product fallback if available
  const staticProduct = (productsData as Product[]).find((p) => {
    const s = (p.slug || "").toLowerCase().trim();
    const id = (p.id || "").toLowerCase().trim();
    return s === decodedSlug || id === decodedSlug || s === rawSlug.toLowerCase() || id === rawSlug.toLowerCase();
  });

  const { addItem, items } = useCart();
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState<string>("S");
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);
  const [productDetails, setProductDetails] = useState<Product | null>(staticProduct || null);
  const [notFoundState, setNotFoundState] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch live product from API to get exact product & stock from DataStore
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveProduct() {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(rawSlug)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setProductDetails(json.data);
          }
        } else if (!staticProduct && isMounted) {
          setNotFoundState(true);
        }
      } catch (err) {
        console.error("Error fetching live product stock:", err);
        if (!staticProduct && isMounted) {
          setNotFoundState(true);
        }
      }
    }
    fetchLiveProduct();
    return () => {
      isMounted = false;
    };
  }, [rawSlug, staticProduct]);

  if (notFoundState && !staticProduct && !productDetails) {
    notFound();
  }

  const raw = productDetails || staticProduct;

  const rawSizes: string[] = Array.isArray(raw?.sizes) && raw.sizes.length > 0
    ? raw.sizes
    : ["XS", "S", "M", "L", "Custom"];

  const sizes = rawSizes.map((sz: string) => ({
    label: sz,
    desc: DEFAULT_SIZE_INFO[sz]?.desc || "Standard Size",
  }));

  // Size-specific stock calculation
  const getSizeStock = (sizeLabel: string): number => {
    if (!raw) return 0;
    if (raw.sizeStock && raw.sizeStock[sizeLabel] !== undefined) {
      const val = raw.sizeStock[sizeLabel];
      return Math.max(0, typeof val === "number" ? val : parseInt(String(val), 10) || 0);
    }
    return Math.max(0, typeof raw.stock === "number" ? raw.stock : 20);
  };

  const currentSizeStock = getSizeStock(selectedSize);

  // Gallery images list: main image + galleryImages/images array (if provided)
  const galleryImages: string[] = [];
  const mainImg =
    (raw as any)?.image ||
    (raw as any)?.thumbnail ||
    (Array.isArray((raw as any)?.images) && (raw as any)?.images[0] ? (raw as any)?.images[0] : undefined) ||
    staticProduct?.image;

  if (mainImg) galleryImages.push(mainImg);

  if (Array.isArray((raw as any)?.galleryImages)) {
    (raw as any).galleryImages.forEach((img: string) => {
      if (img && typeof img === "string" && !galleryImages.includes(img)) galleryImages.push(img);
    });
  }

  if (Array.isArray((raw as any)?.images)) {
    (raw as any).images.forEach((img: string) => {
      if (img && typeof img === "string" && !galleryImages.includes(img)) galleryImages.push(img);
    });
  }

  const fallbackProductImg = staticProduct?.image || "/images/IMG_7098.webp";
  const finalGallery = galleryImages.length > 0 ? galleryImages : [fallbackProductImg];
  const activeImage = selectedImage || mainImg || fallbackProductImg;

  const scrollThumbnails = (direction: "left" | "right") => {
    if (!thumbnailScrollRef.current) return;
    const scrollAmount = 180;
    thumbnailScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const rawPrice = (raw as any)?.price;
  const formattedPrice = typeof rawPrice === "number"
    ? `$${rawPrice.toFixed(2)}`
    : typeof rawPrice === "string" && rawPrice.trim().length > 0
    ? (rawPrice.startsWith("$") ? rawPrice : `$${rawPrice}`)
    : "$24.99";

  const rawSalePrice = (raw as any)?.salePrice;
  const formattedSalePrice = typeof rawSalePrice === "number" && rawSalePrice > 0
    ? `$${rawSalePrice.toFixed(2)}`
    : typeof rawSalePrice === "string" && rawSalePrice.trim().length > 0
    ? (rawSalePrice.startsWith("$") ? rawSalePrice : `$${rawSalePrice}`)
    : raw?.originalPrice || undefined;

  const product = {
    id: raw?.id || "product-detail",
    slug: raw?.slug || rawSlug,
    title: (raw as any)?.title || (raw as any)?.name || staticProduct?.title || "X-ON Handmade Press-On Nails",
    price: formattedSalePrice || formattedPrice,
    originalPrice: formattedSalePrice ? formattedPrice : undefined,
    image: activeImage,
    category: raw?.category || "Handmade Press-On Nails",
    description: raw?.description || "Handcrafted salon-caliber press-on nails made with professional gel and acrylic.",
  };

  // Check how many of this specific variant already in cart
  const cartItem = items.find((i) => i.id === `${product.id}-${selectedSize}`);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const remainingAllowed = Math.max(0, currentSizeStock - inCartQty);
  const displayQuantity = remainingAllowed > 0 ? Math.min(quantity, remainingAllowed) : 0;

  const handleAddToCart = () => {
    if (currentSizeStock <= 0 || remainingAllowed <= 0) return;
    const addedQty = Math.max(1, Math.min(quantity, remainingAllowed));

    addItem(
      {
        id: `${product.id}-${selectedSize}`,
        slug: product.slug,
        title: product.title,
        price: product.price,
        image: product.image,
        size: selectedSize,
        maxStock: currentSizeStock,
      },
      addedQty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const relatedProducts = (productsData as Product[])
    .filter((p) => p.slug !== product.slug && p.id !== product.id)
    .slice(0, 4);

  return (
    <div
      className="relative min-h-screen py-8 sm:py-12 overflow-hidden text-gray-900"
      style={{
        background: `
          radial-gradient(ellipse 60% 40% at 12% 15%, rgba(246, 201, 193, 0.42) 0%, transparent 70%),
          radial-gradient(ellipse 55% 45% at 88% 22%, rgba(250, 236, 233, 0.75) 0%, transparent 70%),
          radial-gradient(ellipse 65% 50% at 30% 55%, rgba(251, 227, 222, 0.50) 0%, transparent 70%),
          radial-gradient(ellipse 60% 45% at 75% 70%, rgba(246, 217, 210, 0.38) 0%, transparent 70%),
          radial-gradient(ellipse 70% 40% at 50% 90%, rgba(253, 244, 241, 0.60) 0%, transparent 70%),
          linear-gradient(180deg, #faece9 0%, #fdf4f1 35%, #ffffff 100%)
        `,
      }}
    >
      {/* Diffused ambient blobs đồng nhất với Shop page */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-[#f6c9c1]/40 blur-[100px]" />
        <div className="absolute top-20 -right-32 w-[550px] h-[550px] rounded-full bg-[#faece9]/80 blur-[110px]" />
        <div className="absolute top-[35%] -left-36 w-[520px] h-[520px] rounded-full bg-[#fbe3de]/55 blur-[120px]" />
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[650px] h-[550px] rounded-full bg-[#fdf4f1]/70 blur-[130px]" />
        <div className="absolute top-[75%] -right-28 w-[520px] h-[520px] rounded-full bg-[#f8dfd8]/50 blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        {/* 1. Breadcrumb chuẩn Shop Page: Màu rose text-[#c9776c], gạch chéo /, hover mịn */}
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-[#c9776c]">
            <li>
              <Link
                href="/"
                className={`hover:text-[#b8897a] transition-colors ${focusRing}`}
              >
                Home
              </Link>
            </li>
            <span className="text-[#c9776c]/60">/</span>
            <li>
              <Link
                href="/shop"
                className={`hover:text-[#b8897a] transition-colors ${focusRing}`}
              >
                Shop
              </Link>
            </li>
            {product.category && (
              <>
                <span className="text-[#c9776c]/60">/</span>
                <li className="hidden sm:inline">
                  <span className="text-gray-600 truncate max-w-[140px]">
                    {product.category}
                  </span>
                </li>
              </>
            )}
            <span className="text-[#c9776c]/60">/</span>
            <li
              className="text-gray-900 font-bold truncate max-w-[180px] sm:max-w-xs"
              aria-current="page"
            >
              {product.title}
            </li>
          </ol>
        </nav>

        {/* 2. Main Product Layout (Hiện đại, rộng rãi, chia 2 cột cân xứng) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* CỘT TRÁI: Gallery ảnh sản phẩm (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Ảnh chính to rõ nét (Tỷ lệ 4:5 sang trọng) */}
            <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden bg-[#f6e6e2]/40 border border-[#eedad7] shadow-xs group">
              <Image
                src={product.image || "/images/IMG_7098.webp"}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />

              {product.originalPrice && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                    Sale
                  </span>
                </div>
              )}

              {/* Mũi tên Prev/Next trên ảnh chính */}
              {finalGallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const curIdx = finalGallery.indexOf(activeImage);
                      const nextIdx = curIdx <= 0 ? finalGallery.length - 1 : curIdx - 1;
                      setSelectedImage(finalGallery[nextIdx]);
                    }}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white text-gray-900 shadow-md border border-[#eedad7] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-10 hover:scale-105"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const curIdx = finalGallery.indexOf(activeImage);
                      const nextIdx = curIdx >= finalGallery.length - 1 ? 0 : curIdx + 1;
                      setSelectedImage(finalGallery[nextIdx]);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white text-gray-900 shadow-md border border-[#eedad7] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-10 hover:scale-105"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Slider Thumbnail nhỏ bên dưới */}
            {finalGallery.length > 1 && (
              <div className="relative group/thumbs pt-1">
                {/* Nút lướt trái */}
                <button
                  type="button"
                  onClick={() => scrollThumbnails("left")}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/95 hover:bg-white text-gray-900 rounded-full shadow-md border border-[#eedad7] flex items-center justify-center transition-all opacity-0 group-hover/thumbs:opacity-100 hover:scale-105 cursor-pointer"
                  aria-label="Scroll thumbnails left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Danh sách thumbnails */}
                <div
                  ref={thumbnailScrollRef}
                  className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-1 px-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
                >
                  {finalGallery.map((img: string, idx: number) => {
                    const isSelected = activeImage === img;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 snap-start ${
                          isSelected
                            ? "border-gray-900 ring-2 ring-gray-900/10 shadow-sm scale-102 bg-white"
                            : "border-[#eedad7] hover:border-gray-400 opacity-70 hover:opacity-100 bg-[#f6e6e2]/30"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.title} thumbnail ${idx + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Nút lướt phải */}
                <button
                  type="button"
                  onClick={() => scrollThumbnails("right")}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/95 hover:bg-white text-gray-900 rounded-full shadow-md border border-[#eedad7] flex items-center justify-center transition-all opacity-0 group-hover/thumbs:opacity-100 hover:scale-105 cursor-pointer"
                  aria-label="Scroll thumbnails right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Thông tin sản phẩm & Đặt hàng (lg:col-span-6) */}
          <div className="lg:col-span-6 rounded-3xl border border-[#eedad7] bg-white/95 backdrop-blur-xs p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9776c] bg-[#fbe3de] border border-[#eedad7] px-3 py-1 rounded-full">
                  {product.category || "Handmade Press-On Nails"}
                </span>

                {/* 5 sao rating */}
                <div className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-[#faece9]/50 px-2.5 py-0.5 rounded-full border border-[#eedad7]/80">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900 text-[11px]">5.0</span>
                  <span className="text-[10px] text-gray-400">&bull; Verified</span>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight leading-snug">
                {product.title}
              </h1>

              {/* Price & In-stock badge */}
              <div className="flex flex-wrap items-baseline gap-3 mt-4 pt-3 border-t border-[#eedad7]/60">
                <span className="text-2xl sm:text-3xl font-bold text-gray-950">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-base sm:text-lg text-gray-400 line-through">
                    {product.originalPrice}
                  </span>
                )}
                {currentSizeStock > 0 ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    In Stock &bull; Ready to Ship
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                    Size {selectedSize} Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Bộ chọn Size hiện đại */}
            <div className="space-y-3 pt-2 border-t border-[#eedad7]/60">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-900">
                  Select Size
                </label>
                <Link
                  href="/sizing-chart"
                  className={`inline-flex items-center gap-1 text-xs text-[#c9776c] hover:underline font-semibold ${focusRing}`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide &amp; Fit</span>
                </Link>
              </div>

              {/* Lưới các ô size */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
                {sizes.map((s) => {
                  const szStock = getSizeStock(s.label);
                  const isSelected = selectedSize === s.label;
                  const isSoldOut = szStock <= 0;

                  return (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setSelectedSize(s.label)}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer relative ${focusRing} ${
                        isSelected
                          ? "border-gray-900 bg-gray-900 text-white shadow-xs scale-[1.02]"
                          : isSoldOut
                          ? "border-[#eedad7] bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed"
                          : "border-[#eedad7] bg-white text-gray-800 hover:border-gray-900 hover:bg-[#fdf4f1]/30"
                      }`}
                    >
                      <span className="block font-bold text-xs sm:text-sm">{s.label}</span>
                      <span
                        className={`block text-[10px] mt-0.5 truncate ${
                          isSelected ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {s.desc}
                      </span>
                      <span
                        className={`block text-[9px] font-bold mt-1 ${
                          isSoldOut
                            ? isSelected
                              ? "text-rose-300"
                              : "text-rose-600"
                            : isSelected
                            ? "text-emerald-300"
                            : "text-emerald-600"
                        }`}
                      >
                        {isSoldOut ? "Sold out" : "In Stock"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Số lượng & Nút Thêm vào giỏ */}
            <div className="space-y-3 pt-3 border-t border-[#eedad7]/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-gray-900">
                  Quantity
                </span>
                {currentSizeStock > 0 && (
                  <span className="text-[11px] text-gray-500">
                    {inCartQty > 0
                      ? `${inCartQty} in cart &bull; ${remainingAllowed} more available`
                      : `${remainingAllowed} max per order`}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Stepper số lượng */}
                <div className="inline-flex items-center border border-[#eedad7] rounded-full bg-white p-1 justify-between sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || remainingAllowed <= 0}
                    className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-[#faece9] rounded-full transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center font-bold text-xs text-gray-900">
                    {displayQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(remainingAllowed, quantity + 1))}
                    disabled={quantity >= remainingAllowed || remainingAllowed <= 0}
                    className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-[#faece9] rounded-full transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Nút Add to Shopping Bag */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={remainingAllowed <= 0 || currentSizeStock <= 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-8 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-sm ${focusRing} ${
                    currentSizeStock <= 0 || remainingAllowed <= 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      : added
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-900 hover:bg-black text-white hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  }`}
                >
                  {added ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Added to Bag!</span>
                    </>
                  ) : currentSizeStock <= 0 ? (
                    <span>Size {selectedSize} - Sold Out</span>
                  ) : remainingAllowed <= 0 ? (
                    <span>Max In Cart ({currentSizeStock} Total)</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Shopping Bag</span>
                    </>
                  )}
                </button>
              </div>

              {/* Thông báo tình trạng tồn kho */}
              {currentSizeStock <= 0 ? (
                <p className="text-[11px] text-rose-600 font-medium pt-1">
                  This size is currently sold out. Please select another size variant.
                </p>
              ) : remainingAllowed <= 0 ? (
                <p className="text-[11px] text-amber-600 font-medium pt-1">
                  You have added all available stock ({currentSizeStock} units) for Size {selectedSize} to your shopping bag.
                </p>
              ) : null}
            </div>

            {/* Quyền lợi & Cam kết chất lượng (Modern Icon Grid) */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#eedad7]/60 text-xs text-gray-700">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#faece9]/40 border border-[#eedad7]">
                <Zap className="w-4 h-4 text-[#c9776c] shrink-0" />
                <span className="font-medium">Cold Gel Tech</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#faece9]/40 border border-[#eedad7]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Zero UV Damage</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#faece9]/40 border border-[#eedad7]">
                <RotateCcw className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="font-medium">Reusable Luxury</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#faece9]/40 border border-[#eedad7]">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium">Free US Ship $50+</span>
              </div>
            </div>

            {/* Bộ sản phẩm bao gồm (What's Included) */}
            <div className="pt-4 border-t border-[#eedad7]/60 space-y-2.5 text-xs text-gray-600">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-900">
                What&apos;s Included In Every Set
              </span>
              <ul className="space-y-1.5 pl-0">
                <li className="flex items-center gap-2">
                  <PackageCheck className="w-3.5 h-3.5 text-[#c9776c] shrink-0" />
                  <span>10 Handcrafted salon-grade press-on nails</span>
                </li>
                <li className="flex items-center gap-2">
                  <PackageCheck className="w-3.5 h-3.5 text-[#c9776c] shrink-0" />
                  <span>Cold Gel Glue adhesive formulation kit</span>
                </li>
                <li className="flex items-center gap-2">
                  <PackageCheck className="w-3.5 h-3.5 text-[#c9776c] shrink-0" />
                  <span>Mini precision buffer &amp; cuticle manicure stick</span>
                </li>
                <li className="flex items-center gap-2">
                  <PackageCheck className="w-3.5 h-3.5 text-[#c9776c] shrink-0" />
                  <span>Alcohol prep wipes &amp; quick application guide</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Sản phẩm liên quan (Related Products) */}
        <section className="pt-12 sm:pt-16 border-t border-[#eedad7]">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#c9776c] block mb-1">
              Complete Your Look
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-gray-900">
              You May Also Love
            </h2>
            <div className="mx-auto h-px w-12 bg-rose-300 mt-3" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
