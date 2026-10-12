"use client";


import { apiFetch } from "@/lib/apiClient";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { NailShape, NAIL_SHAPES, ProductItem } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import {
  ArrowLeft,
  Upload,
  X,
  Sparkles,
  Check,
  Plus,
  FolderPlus,
  Palette,
  Tag,
  Layers,
  Scissors,
  Ruler,
  ShoppingBag
} from "lucide-react";

interface ProductFormProps {
  initialData?: ProductItem;
  isEdit?: boolean;
}

const DEFAULT_SIZES = ["XS", "S", "M", "L", "Custom"];

const DEFAULT_DESIGN_THEMES = [
  "3D",
  "Flower",
  "Y2K",
  "Cat Eye",
  "Minimalist",
  "French Tip",
  "Glitter",
  "Chrome",
  "Gradient",
  "Cute / Cartoon",
  "Abstract",
];

const DEFAULT_COLORS = [
  { name: "Pink", hex: "#f472b6" },
  { name: "Nude / Beige", hex: "#e2cbaf" },
  { name: "White", hex: "#ffffff", border: true },
  { name: "Red / Crimson", hex: "#e11d48" },
  { name: "Black", hex: "#18181b" },
  { name: "Blue", hex: "#38bdf8" },
  { name: "Purple / Lavender", hex: "#c084fc" },
  { name: "Green / Emerald", hex: "#4ade80" },
  { name: "Gold / Shimmer", hex: "#eab308" },
  { name: "Silver / Chrome", hex: "#cbd5e1" },
  { name: "Pastel", hex: "#fed7aa" },
  { name: "Multi-color", hex: "linear-gradient(135deg, #f472b6, #38bdf8, #facc15)" },
];

const DEFAULT_LENGTHS = ["Short", "Medium", "Long", "Extra Long"];

const DEFAULT_PRODUCT_TYPES = [
  "Handmade Press-On Nails",
  "Best Seller",
  "Cold Gel Glue",
  "Cold Gel Remover",
  "Press-On Nails",
  "Accessories & Care",
  "Bundle & Save",
];

export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove Vietnamese accents
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getKnownColorHex(name: string): string {
  if (!name) return "#cbd5e1";
  const trimmed = name.trim();
  if (trimmed.startsWith("#") || trimmed.startsWith("rgb") || trimmed.startsWith("linear-gradient")) {
    return trimmed;
  }
  const lower = trimmed.toLowerCase();
  const KNOWN_COLORS: Record<string, string> = {
    orange: "#f97316",
    coral: "#fb7185",
    pink: "#f472b6",
    "hot pink": "#ec4899",
    rose: "#f43f5e",
    nude: "#e2cbaf",
    beige: "#e2cbaf",
    white: "#ffffff",
    red: "#e11d48",
    crimson: "#e11d48",
    black: "#18181b",
    blue: "#38bdf8",
    "sky blue": "#0ea5e9",
    navy: "#1e3a8a",
    purple: "#c084fc",
    lavender: "#c084fc",
    violet: "#8b5cf6",
    green: "#4ade80",
    emerald: "#10b981",
    mint: "#6ee7b7",
    olive: "#84cc16",
    gold: "#eab308",
    yellow: "#facc15",
    amber: "#f59e0b",
    silver: "#cbd5e1",
    gray: "#9ca3af",
    grey: "#9ca3af",
    charcoal: "#374151",
    brown: "#78350f",
    mocha: "#5c3d2e",
    pastel: "#fed7aa",
    cyan: "#06b6d4",
    teal: "#14b8a6",
    turquoise: "#2dd4bf",
    magenta: "#d946ef",
    plum: "#701a75",
    peach: "#fbcfe8",
    maroon: "#881337"
  };

  for (const [key, hex] of Object.entries(KNOWN_COLORS)) {
    if (lower.includes(key)) {
      return hex;
    }
  }

  return "#e2cbaf";
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Form Fields
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugManual, setIsSlugManual] = useState<boolean>(Boolean(isEdit && initialData?.slug));
  const [sku, setSku] = useState(initialData?.sku || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ""
  );
  const [price, setPrice] = useState(initialData?.price ? initialData.price.toString() : "24.99");
  const [salePrice, setSalePrice] = useState(
    initialData?.salePrice ? initialData.salePrice.toString() : ""
  );
  const [category, setCategory] = useState(
    initialData?.category || "Handmade Nails"
  );
  const [productType, setProductType] = useState<string>(
    initialData?.productType || "Handmade Press-On Nails"
  );

  // 1. Shapes
  const [shapes, setShapes] = useState<NailShape[]>(
    initialData?.shapes && initialData.shapes.length > 0
      ? initialData.shapes
      : ["Almond", "Coffin"]
  );

  // 2. Design Themes
  const [availableThemes, setAvailableThemes] = useState<string[]>(DEFAULT_DESIGN_THEMES);
  const [designThemes, setDesignThemes] = useState<string[]>(
    initialData?.designThemes && initialData.designThemes.length > 0
      ? initialData.designThemes
      : ["3D", "Flower"]
  );
  const [customThemeInput, setCustomThemeInput] = useState("");

  // 3. Colors
  const [availableColors, setAvailableColors] = useState<{ name: string; hex: string; border?: boolean }[]>(() => {
    const list = [...DEFAULT_COLORS];
    if (Array.isArray(initialData?.colorOptions) && initialData.colorOptions.length > 0) {
      initialData.colorOptions.forEach((co) => {
        const existingIdx = list.findIndex((item) => item.name.toLowerCase() === co.name.toLowerCase());
        if (existingIdx >= 0) {
          list[existingIdx] = { ...list[existingIdx], hex: co.hex || list[existingIdx].hex };
        } else {
          list.push({ name: co.name, hex: co.hex || getKnownColorHex(co.name), border: co.border });
        }
      });
    } else if (initialData?.colors) {
      initialData.colors.forEach((c) => {
        if (!list.some((item) => item.name.toLowerCase() === c.toLowerCase())) {
          list.push({ name: c, hex: getKnownColorHex(c) });
        }
      });
    }
    return list;
  });
  const [colors, setColors] = useState<string[]>(
    initialData?.colors && initialData.colors.length > 0
      ? initialData.colors
      : ["Pink", "Nude / Beige"]
  );
  const [customColorHex, setCustomColorHex] = useState("#f97316");
  const [customColorName, setCustomColorName] = useState("");

  // 4. Sizes & Stock Breakdown
  const [sizes, setSizes] = useState<string[]>(
    initialData?.sizes && initialData.sizes.length > 0
      ? initialData.sizes
      : ["XS", "S", "M", "L"]
  );
  const [sizeStock, setSizeStock] = useState<Record<string, number>>(() => {
    if (initialData?.sizeStock && Object.keys(initialData.sizeStock).length > 0) {
      return initialData.sizeStock;
    }
    const init: Record<string, number> = {};
    const defaultSizes = initialData?.sizes || ["XS", "S", "M", "L"];
    const baseEach = Math.max(1, Math.floor((initialData?.stock || 20) / (defaultSizes.length || 1)));
    defaultSizes.forEach((sz) => {
      init[sz] = baseEach;
    });
    return init;
  });
  const [stock, setStock] = useState(() => {
    if (initialData?.stock !== undefined) return initialData.stock.toString();
    const initSizes = initialData?.sizes || ["XS", "S", "M", "L"];
    return (initSizes.length * 5).toString();
  });

  // 5. Length
  const [length, setLength] = useState<string>(
    initialData?.length || "Medium"
  );

  // 6. Badges & Tags
  const [collection, setCollection] = useState(initialData?.collection || "Spring Luxe 2026");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(
    initialData?.tags && initialData.tags.length > 0
      ? initialData.tags
      : ["handmade", "grip-x", "reusable"]
  );
  const [bestSeller, setBestSeller] = useState(initialData?.bestSeller || false);
  const [handmadeGripX, setHandmadeGripX] = useState(
    initialData?.handmadeGripX !== undefined
      ? initialData.handmadeGripX
      : (initialData?.featured ?? true)
  );
  const [status, setStatus] = useState<"active" | "draft" | "archived">(
    initialData?.status || "active"
  );

  // Images
  const [images, setImages] = useState<string[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : ["/images/IMG_7098.webp"]
  );
  const [thumbnail, setThumbnail] = useState(
    initialData?.thumbnail || initialData?.images?.[0] || "/images/IMG_7098.webp"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    apiFetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setCategories(data.data);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleCreateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    setIsCreatingCategory(true);
    try {
const res = await apiFetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: trimmed })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success(`Category "${trimmed}" added`);
        setCategories((prev) => [...prev, json.data]);
        setCategory(json.data.name);
        setNewCategoryName("");
        setIsAddingCategory(false);
      } else {
        error(json.message || "Failed to add category");
      }
    } catch {
      error("Error creating category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Auto generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManual) {
      setSlug(generateSlug(val));
    }
  };

  const handleManualSlugChange = (val: string) => {
    setSlug(val);
    setIsSlugManual(true);
  };

  const handleSyncSlug = () => {
    setIsSlugManual(false);
    setSlug(generateSlug(name));
  };

  // 1. Shapes Toggles
  const toggleShape = (shape: NailShape) => {
    if (shapes.includes(shape)) {
      setShapes(shapes.filter((s) => s !== shape));
    } else {
      setShapes([...shapes, shape]);
    }
  };

  // 2. Theme Toggles
  const toggleDesignTheme = (theme: string) => {
    if (designThemes.includes(theme)) {
      setDesignThemes(designThemes.filter((t) => t !== theme));
    } else {
      setDesignThemes([...designThemes, theme]);
    }
  };

  const handleAddCustomTheme = () => {
    const val = customThemeInput.trim();
    if (!val) return;
    if (!availableThemes.includes(val)) {
      setAvailableThemes([...availableThemes, val]);
    }
    if (!designThemes.includes(val)) {
      setDesignThemes([...designThemes, val]);
    }
    setCustomThemeInput("");
  };

  // 3. Color Toggles
  const toggleColor = (colorName: string) => {
    if (colors.includes(colorName)) {
      setColors(colors.filter((c) => c !== colorName));
    } else {
      setColors([...colors, colorName]);
    }
  };

  const handleDeleteColor = (colorName: string) => {
    setAvailableColors((prev) => prev.filter((c) => c.name !== colorName));
    setColors((prev) => prev.filter((c) => c !== colorName));
  };

  const handleResetColors = () => {
    setAvailableColors(DEFAULT_COLORS);
  };

  const handleAddCustomColor = () => {
    const nameVal = customColorName.trim() || customColorHex;
    if (!nameVal) return;
    if (!availableColors.some((c) => c.name.toLowerCase() === nameVal.toLowerCase())) {
      setAvailableColors((prev) => [...prev, { name: nameVal, hex: customColorHex }]);
    }
    if (!colors.includes(nameVal)) {
      setColors((prev) => [...prev, nameVal]);
    }
    setCustomColorName("");
  };

  // 4. Size & Stock Matrix
  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      const nextSizes = sizes.filter((s) => s !== size);
      setSizes(nextSizes);
      const nextStock = { ...sizeStock };
      delete nextStock[size];
      setSizeStock(nextStock);
      const total = Object.values(nextStock).reduce((a, b) => a + (Number(b) || 0), 0);
      setStock(total.toString());
    } else {
      const nextSizes = [...sizes, size];
      setSizes(nextSizes);
      const nextStock = { ...sizeStock, [size]: 5 };
      setSizeStock(nextStock);
      const total = Object.values(nextStock).reduce((a, b) => a + (Number(b) || 0), 0);
      setStock(total.toString());
    }
  };

  const handleSizeStockChange = (size: string, qty: number) => {
    const validQty = Math.max(0, isNaN(qty) ? 0 : qty);
    const updated = { ...sizeStock, [size]: validQty };
    setSizeStock(updated);
    const total = Object.values(updated).reduce((a, b) => a + (Number(b) || 0), 0);
    setStock(total.toString());
  };

  // 5. Tags
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Upload Images
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    let failedCount = 0;

    try {
await Promise.all(
        fileList.map(async (file) => {
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
                uploadedUrls.push(json.data.url);
              } else {
                failedCount++;
              }
            } else {
              failedCount++;
            }
          } catch {
            failedCount++;
          }
        })
      );

      if (uploadedUrls.length > 0) {
        setImages((prev) => {
          const combined = [...prev, ...uploadedUrls];
          if (!thumbnail && combined.length > 0) {
            setThumbnail(combined[0]);
          }
          return combined;
        });
        success(`Successfully uploaded ${uploadedUrls.length} image(s)`);
      }

      if (failedCount > 0) {
        error(`Failed to upload ${failedCount} image(s)`);
      }
    } catch {
      error("Failed to process image uploads");
    } finally {
      setIsUploading(false);
      // Reset input value so user can upload same or more files
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleRemoveImage = (imgUrl: string) => {
    const updated = images.filter((img) => img !== imgUrl);
    setImages(updated);
    if (thumbnail === imgUrl) {
      setThumbnail(updated[0] || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 3) {
      error("Product title must be at least 3 characters long");
      return;
    }

    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      error("Regular price must be a positive number greater than $0.00");
      return;
    }

    let numSalePrice: number | null = null;
    if (salePrice && salePrice.trim() !== "") {
      numSalePrice = Number(salePrice);
      if (isNaN(numSalePrice) || numSalePrice <= 0) {
        error("Sale price must be greater than $0.00");
        return;
      }
      if (numSalePrice >= numPrice) {
        error("Sale price must be strictly lower than regular price");
        return;
      }
    }

    const numStock = parseInt(stock) || 0;
    if (numStock < 0) {
      error("Stock inventory cannot be negative");
      return;
    }

    if (images.length === 0) {
      error("Please upload at least 1 product image before publishing");
      return;
    }

    setIsSubmitting(true);
    try {
const finalSlug = slug.trim() || generateSlug(trimmedName) || `product-${Date.now()}`;
      const payload: Partial<ProductItem> = {
        name: trimmedName,
        slug: finalSlug,
        sku: sku.trim() || `XON-${Math.floor(1000 + Math.random() * 9000)}`,
        description,
        shortDescription,
        price: numPrice,
        salePrice: numSalePrice,
        stock: numStock,
        sizeStock,
        category,
        collection,
        productType,
        shapes,
        sizes,
        designThemes,
        colors,
        colorOptions: availableColors.filter((c) => colors.includes(c.name)),
        length,
        lengths: [length],
        tags,
        featured: handmadeGripX,
        handmadeGripX,
        bestSeller,
        status,
        images: images.length > 0 ? images : ["/images/IMG_7098.webp"],
        thumbnail: thumbnail || images[0] || "/images/IMG_7098.webp"
      };

      const url = isEdit && initialData ? `/api/products/${initialData.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success(isEdit ? "Product updated successfully" : "Product created successfully");
        router.push("/admin/products");
      } else {
        error(json.message || "Failed to save product");
      }
    } catch {
      error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
              {isEdit ? `Edit: ${initialData?.name}` : "Create New Product"}
            </h1>
            <p className="text-xs text-neutral-500">
              Configure details, photography, shapes, design theme, colors, sizing, length, and pricing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{isEdit ? "Update Product" : "Publish Product"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Details & Variants (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-600" />
              <span>General Information</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Handmade Velvet Cat Eye Shimmer Press-On Nails"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Slug (URL)
                  </label>
                  <button
                    type="button"
                    onClick={handleSyncSlug}
                    title="Auto-sync slug from product title"
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Sync</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleManualSlugChange(e.target.value)}
                  placeholder="handmade-velvet-cat-eye"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="XON-7098"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary displayed on product cards and quick view..."
                className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Full Description & Nail Application Guide
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive details on nail craftsmanship, materials, wear time, and removal tips..."
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Pricing and Stock */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>Pricing & Inventory</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Regular Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="24.99"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Sale Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="19.99 (Optional)"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-rose-600 font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Total Stock Quantity
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="20"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* ATTRIBUTES 1: SHAPES & COLORS */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-600" />
              <span>Nail Shapes & Colors</span>
            </h2>

            {/* 1. SHAPES */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Available Shapes ({shapes.length} selected)
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {NAIL_SHAPES.map((shape) => {
                  const isSelected = shapes.includes(shape);
                  return (
                    <button
                      type="button"
                      key={shape}
                      onClick={() => toggleShape(shape)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isSelected
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs font-bold"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      <span>{shape}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. COLORS */}
            <div className="pt-4 border-t border-neutral-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-rose-600" />
                    <span>Color Palette ({colors.length} selected)</span>
                  </label>
                  {availableColors.length !== DEFAULT_COLORS.length && (
                    <button
                      type="button"
                      onClick={handleResetColors}
                      className="text-[10px] text-neutral-400 hover:text-neutral-700 underline font-medium cursor-pointer"
                    >
                      Reset Defaults
                    </button>
                  )}
                </div>

                {/* Color Picker + Name Input + Add Button */}
                <div className="flex items-center gap-1.5 bg-neutral-50 p-1 rounded-xl border border-neutral-200 shadow-2xs">
                  {/* Color Picker square */}
                  <div
                    className="relative flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden border border-neutral-300 shadow-xs shrink-0 cursor-pointer"
                    style={{ backgroundColor: customColorHex }}
                    title="Click to pick custom color on palette"
                  >
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </div>

                  <input
                    type="text"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomColor();
                      }
                    }}
                    placeholder="Color Name (e.g. Orange, Coral)"
                    className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-rose-500 w-36 sm:w-48"
                  />

                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    title="Add custom color"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableColors.map((c) => {
                  const isSelected = colors.includes(c.name);
                  return (
                    <div
                      key={c.name}
                      onClick={() => toggleColor(c.name)}
                      className={`group/pill px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border select-none ${
                        isSelected
                          ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-2xs"
                        style={{
                          background: c.hex,
                          border: c.border ? "1px solid #d4d4d8" : "none"
                        }}
                      />
                      <span>{c.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-amber-400 shrink-0" />}

                      {/* Delete Color Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteColor(c.name);
                        }}
                        className={`p-0.5 rounded-full transition-all cursor-pointer opacity-70 hover:opacity-100 ${
                          isSelected
                            ? "hover:bg-neutral-800 text-neutral-300 hover:text-white"
                            : "hover:bg-neutral-200 text-neutral-400 hover:text-rose-600"
                        }`}
                        title={`Delete "${c.name}"`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ATTRIBUTES 2: SIZES & INVENTORY PER SIZE */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-amber-600" />
              <span>Nail Sizes & Inventory Breakdown</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Available Sizes ({sizes.length} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_SIZES.map((sz) => {
                  const isSelected = sizes.includes(sz);
                  return (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-neutral-900 text-white shadow-xs font-bold"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>Size {sz}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quantity Per Size Breakdown */}
              {sizes.length > 0 && (
                <div className="mt-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-neutral-900">
                        Stock Quantity Allocated Per Size
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        Adjust individual units for each size variant
                      </p>
                    </div>
                    <div className="text-xs font-bold px-3 py-1 bg-white border border-neutral-200 rounded-xl text-neutral-900 shadow-2xs">
                      Total Stock: <span className="text-amber-600 font-extrabold">{stock}</span> units
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                    {sizes.map((sz) => (
                      <div
                        key={sz}
                        className="bg-white p-3 rounded-xl border border-neutral-200/90 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-neutral-900 text-white">
                            {sz}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-medium">units</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleSizeStockChange(sz, (sizeStock[sz] || 0) - 1)
                            }
                            className="w-6 h-6 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={sizeStock[sz] ?? 0}
                            onChange={(e) =>
                              handleSizeStockChange(sz, parseInt(e.target.value) || 0)
                            }
                            className="w-full py-1 text-center bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-extrabold text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleSizeStockChange(sz, (sizeStock[sz] || 0) + 1)
                            }
                            className="w-6 h-6 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Gallery & Thumbnail */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Product Images & Photography
              </h2>
              <span className="text-xs text-neutral-500">
                Star icon sets primary thumbnail
              </span>
            </div>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-neutral-200 hover:border-amber-500 rounded-2xl p-6 text-center transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                id="product-image-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <label
                htmlFor="product-image-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-neutral-900">
                  {isUploading ? "Uploading to Cloudinary..." : "Click to upload product photos"}
                </div>
                <div className="text-[11px] text-neutral-400">
                  PNG, JPG, WebP (Cloudinary CDN optimized)
                </div>
              </label>
            </div>

            {/* Image Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((img, idx) => {
                const isThumb = thumbnail === img;
                return (
                  <div
                    key={idx}
                    className={`group relative aspect-square rounded-xl bg-neutral-100 overflow-hidden border-2 transition-all ${
                      isThumb ? "border-amber-500 ring-2 ring-amber-500/20" : "border-neutral-200"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Product image ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="150px"
                    />

                    {/* Thumbnail Badge */}
                    {isThumb && (
                      <span className="absolute bottom-1.5 left-1.5 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase shadow-xs">
                        Thumbnail
                      </span>
                    )}

                    {/* Action buttons on hover */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setThumbnail(img)}
                        title="Set as Primary Thumbnail"
                        className="p-1 bg-black/70 hover:bg-black text-white rounded-md transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img)}
                        title="Delete Image"
                        className="p-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Organization, Type, Theme, Length (1 col) */}
        <div className="space-y-6">
          {/* Status & Badges */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Status & Badges
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "active" | "draft" | "archived")
                }
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="active">Active (Live in Store)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="pt-3 border-t border-neutral-100 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={bestSeller}
                  onChange={(e) => setBestSeller(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block group-hover:text-black transition-colors">
                    BEST SELLER
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Feature in Best Seller section & filter tab
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={handmadeGripX}
                  onChange={(e) => setHandmadeGripX(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block group-hover:text-black transition-colors">
                    HANDMADE X-ON NAILS
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Feature in Handmade Grip-X Nails catalog
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Product Type & Category */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-5">
            {/* 1. PRODUCT TYPE */}
            <div>
              <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Product Type</span>
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-neutral-900 shadow-2xs cursor-pointer"
              >
                {DEFAULT_PRODUCT_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. CATEGORY */}
            <div className="pt-3 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Category
                </label>
                {!isAddingCategory && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                )}
              </div>

              {/* Quick Add Category Form */}
              {isAddingCategory && (
                <div className="mb-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                      <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
                      New Category
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName("");
                      }}
                      className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateCategory();
                        }
                      }}
                      placeholder="e.g. Handmade Nails"
                      className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-amber-600"
                    />
                    <button
                      type="button"
                      disabled={isCreatingCategory || !newCategoryName.trim()}
                      onClick={() => handleCreateCategory()}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:border-neutral-900 shadow-2xs cursor-pointer"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Handmade Nails">Handmade Nails</option>
                    <option value="Handmade Grip-X Nails">Handmade Grip-X Nails</option>
                    <option value="Ready to Ship">Ready to Ship</option>
                    <option value="Accessories & Care">Accessories & Care</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* DESIGN THEME */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>DESIGN THEME ({designThemes.length})</span>
              </h3>
            </div>

            <div className="flex gap-1.5 mb-2">
              <input
                type="text"
                value={customThemeInput}
                onChange={(e) => setCustomThemeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomTheme();
                  }
                }}
                placeholder="+ Add Theme"
                className="flex-1 px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-[11px] text-neutral-900 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTheme}
                className="px-2.5 py-1 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 text-[11px] font-bold"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {availableThemes.map((theme) => {
                const isChecked = designThemes.includes(theme);
                return (
                  <button
                    type="button"
                    key={theme}
                    onClick={() => toggleDesignTheme(theme)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                      isChecked
                        ? "bg-rose-700 text-white font-bold shadow-2xs"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                    <span>{theme}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LENGTH */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
              NAIL LENGTH
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_LENGTHS.map((len) => {
                const isSelected = length === len;
                return (
                  <button
                    type="button"
                    key={len}
                    onClick={() => setLength(len)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                        : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {len}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
