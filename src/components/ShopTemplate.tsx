"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ProductCard, type Product } from "@/components/ProductCard";
import productsData from "@/data/products.json";
import { mapApiProduct, type ApiProductInput } from "@/lib/productMapper";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// ==========================================
// CONSTANTS & FILTER DEFINITIONS
// ==========================================

export const SHAPE_DEFINITIONS = [
  { id: "almond", name: "Almond", img: "/images/shape-almond.webp" },
  { id: "coffin", name: "Coffin", img: "/images/shape-coffin.webp" },
  { id: "oval", name: "Oval", img: "/images/shape-oval.webp" },
  { id: "round", name: "Round", img: "/images/shape-round.webp" },
  { id: "square", name: "Square", img: "/images/shape-square.webp" },
  { id: "stiletto", name: "Stiletto", img: "/images/shape-stiletto.webp" },
] as const;

export const PRODUCT_TYPE_DEFINITIONS = [
  {
    id: "best-sellers",
    label: "Best Sellers",
    matches: (p: Product) =>
      p.bestSeller === true ||
      Boolean(p.category?.toLowerCase().includes("best")) ||
      p.title.toLowerCase().includes("best") ||
      p.slug.toLowerCase().includes("best"),
  },
  {
    id: "handmade-grip-x-nails",
    label: "Handmade Press-On Nails",
    matches: (p: Product) =>
      p.handmadeGripX === true ||
      p.featured === true ||
      Boolean(p.category?.toLowerCase().includes("handmade")) ||
      Boolean(p.category?.toLowerCase().includes("grip-x")) ||
      p.title.toLowerCase().includes("handmade") ||
      p.slug.toLowerCase().includes("handmade"),
  },
  {
    id: "nail-essentials",
    label: "Nail Essentials",
    matches: (p: Product) =>
      p.slug.includes("glue") ||
      p.title.toLowerCase().includes("glue") ||
      p.slug.includes("remover") ||
      p.title.toLowerCase().includes("remover"),
  },
] as const;

// Helper to match design themes
export function matchesDesignTheme(p: Product, theme: string): boolean {
  const slugLower = theme.toLowerCase();
  const hasThemeMatch =
    Array.isArray(p.designThemes) &&
    p.designThemes.some(
      (t) => t.toLowerCase() === slugLower || t.toLowerCase().includes(slugLower)
    );
  return (
    hasThemeMatch ||
    p.title.toLowerCase().includes(slugLower) ||
    Boolean(p.category?.toLowerCase().includes(slugLower)) ||
    p.slug.toLowerCase().includes(slugLower)
  );
}

// Pure price parser
export function parsePrice(priceStr?: string): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export interface PresetFilters {
  type?: string[];
  shape?: string[];
  theme?: string[];
}

export interface ShopTemplateProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  presetFilters?: PresetFilters;
}

const ITEMS_PER_PAGE = 12;

export function ShopTemplate({
  title,
  breadcrumbs = [{ label: "Home", href: "/" }, { label: "Shop" }],
  presetFilters,
}: ShopTemplateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state
  const qParam = searchParams.get("q") ?? searchParams.get("search") ?? "";
  const shapeParam = searchParams.get("shape") ?? "";
  const typeParam = searchParams.get("type") ?? "";
  const themeParam = searchParams.get("theme") ?? "";
  const maxPriceParam = searchParams.get("maxPrice") ?? "";
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
  const sortParam = searchParams.get("sort") ?? "default";

  // Data state
  const [productsList, setProductsList] = useState<Product[]>(() =>
    (productsData as unknown as ApiProductInput[]).map(mapApiProduct)
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Search input state with debounce
  const [searchInput, setSearchInput] = useState<string>(qParam);

  // Dynamic maximum price from catalog
  const highestCatalogPrice = useMemo(() => {
    if (productsList.length === 0) return 120;
    const prices = productsList.map((p) => parsePrice(p.price));
    return Math.max(...prices, 100);
  }, [productsList]);

  const SLIDER_MAX = useMemo(() => {
    return Math.max(120, Math.ceil(highestCatalogPrice / 10) * 10);
  }, [highestCatalogPrice]);

  // Price slider state
  const [sliderMax, setSliderMax] = useState<number>(() => {
    const parsed = parseFloat(maxPriceParam);
    return !isNaN(parsed) && parsed > 0 ? parsed : 120;
  });

  // Selected multi-select states (split by comma from URL)
  const selectedShapes = useMemo<string[]>(() => {
    return shapeParam ? shapeParam.split(",").filter(Boolean) : [];
  }, [shapeParam]);

  const selectedTypes = useMemo<string[]>(() => {
    return typeParam ? typeParam.split(",").filter(Boolean) : [];
  }, [typeParam]);

  const selectedThemes = useMemo<string[]>(() => {
    return themeParam ? themeParam.split(",").filter(Boolean) : [];
  }, [themeParam]);

  // Drawer ref & accessibility
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement | null>(null);
  const gridTopRef = useRef<HTMLDivElement | null>(null);

  // Synchronize search input if URL changes externally
  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  // Synchronize price slider if URL changes externally
  useEffect(() => {
    if (maxPriceParam) {
      const parsed = parseFloat(maxPriceParam);
      if (!isNaN(parsed)) setSliderMax(parsed);
    } else {
      setSliderMax(SLIDER_MAX);
    }
  }, [maxPriceParam, SLIDER_MAX]);

  // Load live products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/products?limit=500&status=active");
      if (!res.ok) throw new Error("Failed to load products from server");
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data.products)) {
        // Filter out drafts or inactive products
        const published = json.data.products.filter(
          (p: { status?: string }) => !p.status || p.status === "active"
        );
        if (published.length > 0) {
          setProductsList(published.map(mapApiProduct));
        }
      }
    } catch (err) {
      console.error(err);
      setLoadError("We couldn't load the latest inventory. Showing offline catalog.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL helper
  const updateParams = useCallback(
    (newParams: Record<string, string | null | undefined>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (resetPage) {
        params.delete("page");
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Debounced search sync
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== qParam) {
        updateParams({ q: searchInput.trim() ? searchInput.trim() : null });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, qParam, updateParams]);

  // Commit price slider filter
  const handlePriceFilterCommit = () => {
    if (sliderMax >= SLIDER_MAX) {
      updateParams({ maxPrice: null });
    } else {
      updateParams({ maxPrice: sliderMax.toString() });
    }
  };

  // Toggle shape
  const toggleShape = (shapeName: string) => {
    const lower = shapeName.toLowerCase();
    const updated = selectedShapes.includes(lower)
      ? selectedShapes.filter((s) => s !== lower)
      : [...selectedShapes, lower];
    updateParams({ shape: updated.length > 0 ? updated.join(",") : null });
  };

  // Toggle type
  const toggleType = (typeId: string) => {
    const updated = selectedTypes.includes(typeId)
      ? selectedTypes.filter((t) => t !== typeId)
      : [...selectedTypes, typeId];
    updateParams({ type: updated.length > 0 ? updated.join(",") : null });
  };

  // Clear single filter
  const removeFilterChip = (type: "q" | "price" | "shape" | "type" | "theme", value?: string) => {
    if (type === "q") {
      setSearchInput("");
      updateParams({ q: null });
    } else if (type === "price") {
      setSliderMax(SLIDER_MAX);
      updateParams({ maxPrice: null });
    } else if (type === "shape" && value) {
      const updated = selectedShapes.filter((s) => s !== value);
      updateParams({ shape: updated.length > 0 ? updated.join(",") : null });
    } else if (type === "type" && value) {
      const updated = selectedTypes.filter((t) => t !== value);
      updateParams({ type: updated.length > 0 ? updated.join(",") : null });
    } else if (type === "theme" && value) {
      const updated = selectedThemes.filter((t) => t !== value);
      updateParams({ theme: updated.length > 0 ? updated.join(",") : null });
    }
  };

  // Clear all non-preset filters
  const clearAllFilters = () => {
    setSearchInput("");
    setSliderMax(SLIDER_MAX);
    updateParams({
      q: null,
      shape: null,
      type: null,
      theme: null,
      maxPrice: null,
      sort: null,
    });
  };

  // Check if non-preset filters are active
  const hasActiveFilters = Boolean(
    qParam ||
    shapeParam ||
    typeParam ||
    themeParam ||
    maxPriceParam ||
    sortParam !== "default"
  );

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let result = productsList.filter((p) => {
      // 1. Only published / active
      if (p.status && p.status !== "active") return false;

      // 2. Preset filters (fixed context)
      if (presetFilters?.type && presetFilters.type.length > 0) {
        const matchesPresetType = presetFilters.type.some((pt) => {
          const def = PRODUCT_TYPE_DEFINITIONS.find((d) => d.id === pt);
          if (def) return def.matches(p);
          if (pt === "cold-gel-glue") return p.slug.includes("glue") || p.title.toLowerCase().includes("glue");
          if (pt === "cold-gel-remover") return p.slug.includes("remover") || p.title.toLowerCase().includes("remover");
          return p.category?.toLowerCase().includes(pt.toLowerCase()) || p.slug.toLowerCase().includes(pt.toLowerCase());
        });
        if (!matchesPresetType) return false;
      }

      if (presetFilters?.theme && presetFilters.theme.length > 0) {
        const matchesPresetTheme = presetFilters.theme.some((theme) =>
          matchesDesignTheme(p, theme)
        );
        if (!matchesPresetTheme) return false;
      }

      if (presetFilters?.shape && presetFilters.shape.length > 0) {
        const matchesPresetShape = presetFilters.shape.some((shape) =>
          p.shapes?.some((s) => s.toLowerCase() === shape.toLowerCase())
        );
        if (!matchesPresetShape) return false;
      }

      // 3. Search query (title)
      if (qParam.trim()) {
        const qLower = qParam.trim().toLowerCase();
        if (!p.title.toLowerCase().includes(qLower)) return false;
      }

      // 4. Shape filter (multi-select)
      if (selectedShapes.length > 0) {
        const matchesAnyShape = selectedShapes.some((shape) => {
          const sLower = shape.toLowerCase();
          return (
            p.shapes?.some((s) => s.toLowerCase().includes(sLower)) ||
            p.title.toLowerCase().includes(sLower)
          );
        });
        if (!matchesAnyShape) return false;
      }

      // 5. Product Type filter (multi-select)
      if (selectedTypes.length > 0) {
        const matchesAnyType = selectedTypes.some((typeId) => {
          const def = PRODUCT_TYPE_DEFINITIONS.find((d) => d.id === typeId);
          if (def) return def.matches(p);
          return false;
        });
        if (!matchesAnyType) return false;
      }

      // 6. Design Theme filter (multi-select)
      if (selectedThemes.length > 0) {
        const matchesAnyTheme = selectedThemes.some((th) => matchesDesignTheme(p, th));
        if (!matchesAnyTheme) return false;
      }

      // 7. Price range filter via slider
      if (maxPriceParam) {
        const maxVal = parseFloat(maxPriceParam);
        if (!isNaN(maxVal) && parsePrice(p.price) > maxVal) return false;
      }

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      const pA = parsePrice(a.price);
      const pB = parsePrice(b.price);
      if (sortParam === "price-low") return pA - pB;
      if (sortParam === "price-high") return pB - pA;
      if (sortParam === "title-asc") return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [
    productsList,
    presetFilters,
    qParam,
    selectedShapes,
    selectedTypes,
    selectedThemes,
    maxPriceParam,
    sortParam,
  ]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, pageParam), totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    updateParams({ page: newPage.toString() }, false);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Native Dialog Modal Drawer Helpers
  const openDrawer = () => {
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
      document.body.style.overflow = "hidden";
    }
  };

  const closeDrawer = () => {
    if (dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
      document.body.style.overflow = "";
      drawerTriggerRef.current?.focus();
    }
  };

  // Close drawer if viewport reaches desktop (lg: >= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && dialogRef.current?.open) {
        closeDrawer();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync body scroll lock on native dialog close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCloseEvent = () => {
      document.body.style.overflow = "";
    };

    dialog.addEventListener("close", handleCloseEvent);
    return () => {
      dialog.removeEventListener("close", handleCloseEvent);
      document.body.style.overflow = "";
    };
  }, []);

  // Shared Filter Controls markup
  const renderFilterControls = (isDrawer = false) => (
    <div className="space-y-6 text-xs text-gray-700">
      {/* Search Input */}
      <div>
        <label
          htmlFor={isDrawer ? "shop-search-drawer" : "shop-search-sidebar"}
          className="block text-[11px] font-bold uppercase tracking-wider text-gray-900 mb-2"
        >
          Search Nails
        </label>
        <div className="relative">
          <input
            id={isDrawer ? "shop-search-drawer" : "shop-search-sidebar"}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                updateParams({ q: searchInput.trim() ? searchInput.trim() : null });
              }
            }}
            placeholder="Search by title..."
            className="w-full pl-3 pr-8 py-2 text-xs border border-[#eedad7] rounded-lg bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c] transition-colors"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateParams({ q: null });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Price Slider Filter (Kéo thay vì nhập) */}
      <div className="border-t border-[#f3dedb] pt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">
            Filter by price
          </h4>
          {maxPriceParam && (
            <button
              type="button"
              onClick={() => {
                setSliderMax(SLIDER_MAX);
                updateParams({ maxPrice: null });
              }}
              className="text-[10px] text-[#c9776c] hover:underline font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <input
          type="range"
          min="0"
          max={SLIDER_MAX}
          step="1"
          value={sliderMax}
          onChange={(e) => setSliderMax(Number(e.target.value))}
          className="w-full accent-gray-900 cursor-pointer h-2 bg-[#eedad7] rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9776c]"
          aria-label="Filter products by maximum price"
        />

        <div className="flex items-center justify-between text-xs text-gray-600 mt-2.5 font-medium">
          <span>
            Price: $0 — <strong className="text-gray-900">${sliderMax}</strong>
          </span>
          <button
            type="button"
            onClick={handlePriceFilterCommit}
            className="px-3 py-1 bg-gray-900 text-white text-[10px] uppercase font-bold tracking-wider rounded-md hover:bg-black transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Shapes (Multi-select) */}
      <div className="border-t border-[#f3dedb] pt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">
            Nail Shapes
          </h4>
          {selectedShapes.length > 0 && (
            <button
              type="button"
              onClick={() => updateParams({ shape: null })}
              className="text-[10px] text-[#c9776c] hover:underline font-semibold cursor-pointer"
            >
              Clear ({selectedShapes.length})
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SHAPE_DEFINITIONS.map((s) => {
            const isSelected = selectedShapes.includes(s.name.toLowerCase());
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleShape(s.name)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c] ${isSelected
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-[#eedad7] hover:border-gray-900"
                  }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Types (Multi-select in ONE constant) */}
      <div className="border-t border-[#f3dedb] pt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">
            Product Types
          </h4>
          {selectedTypes.length > 0 && (
            <button
              type="button"
              onClick={() => updateParams({ type: null })}
              className="text-[10px] text-[#c9776c] hover:underline font-semibold cursor-pointer"
            >
              Clear ({selectedTypes.length})
            </button>
          )}
        </div>
        <div className="space-y-2">
          {PRODUCT_TYPE_DEFINITIONS.map((t) => {
            const isChecked = selectedTypes.includes(t.id);
            return (
              <label
                key={t.id}
                className="flex items-center gap-2.5 cursor-pointer hover:text-black transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleType(t.id)}
                  className="rounded-sm accent-[#c9776c] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9776c]"
                />
                <span className={isChecked ? "font-bold text-gray-900" : ""}>{t.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="relative min-h-screen py-8 sm:py-12"
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
      {/* Organic mottled diffused ambient blobs (hiệu ứng loang lổ tự nhiên, cùng bảng màu) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-[#f6c9c1]/40 blur-[100px]" />
        <div className="absolute top-20 -right-32 w-[550px] h-[550px] rounded-full bg-[#faece9]/80 blur-[110px]" />
        <div className="absolute top-[35%] -left-36 w-[520px] h-[520px] rounded-full bg-[#fbe3de]/55 blur-[120px]" />
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[650px] h-[550px] rounded-full bg-[#fdf4f1]/70 blur-[130px]" />
        <div className="absolute top-[75%] -right-28 w-[520px] h-[520px] rounded-full bg-[#f8dfd8]/50 blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Eyebrow */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-[#c9776c]">
            {breadcrumbs.map((b, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li key={idx} className="flex items-center gap-1.5">
                  {b.href && !isLast ? (
                    <Link
                      href={b.href}
                      className="hover:text-[#b8897a] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9776c]"
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-gray-700" aria-current={isLast ? "page" : undefined}>
                      {b.label}
                    </span>
                  )}
                  {!isLast && <span className="text-[#c9776c]/60">/</span>}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Header Title Section: Single H1 + Rose Line */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-gray-800">
            {title}
          </h1>
          <div className="w-12 h-px bg-rose-300 mt-3" />
        </div>

        {/* Top Shape Category Visual Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-4 mb-8">
          {SHAPE_DEFINITIONS.map((s) => {
            const isSelected = selectedShapes.includes(s.name.toLowerCase());
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => toggleShape(s.name)}
                className={`group flex flex-col items-center justify-between p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${isSelected
                  ? "bg-white border-gray-900 ring-2 ring-gray-900/10 shadow-sm -translate-y-0.5"
                  : "bg-white/70 hover:bg-white border-[#eedad7] hover:border-gray-400 hover:shadow-xs"
                  }`}
              >
                <div className="relative w-16 h-20 sm:w-20 sm:h-24 mb-1 flex items-center justify-center">
                  <Image
                    src={s.img}
                    alt={s.name}
                    fill
                    sizes="96px"
                    className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center truncate w-full ${isSelected ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
                    }`}
                >
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Grid Content Area */}
        <div ref={gridTopRef} className="scroll-mt-24" />

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Desktop Left Sticky Filter Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 p-5 rounded-2xl 
    bg-gray-100/30 
    backdrop-blur-xl 
    border border-white/50 
    shadow-lg shadow-rose-950/50 
    ring-1 ring-[#eedad7]/50">
              <div className="flex items-center justify-between border-b border-[#f3dedb] pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Filters
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[10px] text-[#c9776c] hover:underline font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {renderFilterControls(false)}
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <main className="w-full min-w-0">
            {/* Controls Bar: Mobile Filters Button, Results Count & Sort Dropdown */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#eedad7]">
              {/* Left: Mobile/Tablet Filters Drawer Trigger */}
              <div className="flex items-center gap-3">
                <button
                  ref={drawerTriggerRef}
                  type="button"
                  onClick={openDrawer}
                  className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-900 bg-white/80 backdrop-blur-md text-gray-900 hover:bg-gray-900 hover:text-white uppercase tracking-wider text-[11px] font-bold transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c]"
                  aria-haspopup="dialog"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-[#c9776c]" />
                  )}
                </button>

                {/* Results count (reserved space) */}
                <p className="text-xs text-gray-600 font-medium h-5 flex items-center">
                  {isLoading
                    ? "Loading catalog..."
                    : `Showing ${filteredProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      totalItems
                    )} of ${totalItems} results`}
                </p>
              </div>

              {/* Right: Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="shop-sort" className="text-xs text-gray-500 font-medium hidden sm:inline">
                  Sort:
                </label>
                <select
                  id="shop-sort"
                  value={sortParam}
                  onChange={(e) => updateParams({ sort: e.target.value === "default" ? null : e.target.value })}
                  className="px-3 py-1.5 text-xs border border-[#eedad7] rounded-lg bg-white/80 backdrop-blur-md text-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c] cursor-pointer"
                >
                  <option value="default">Default sorting</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="title-asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Active Filter Chips Row (Reserved height to prevent layout shift) */}
            <div className="min-h-[28px] mb-5">
              {(hasActiveFilters || presetFilters) && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Preset non-removable chips */}
                  {presetFilters?.type?.map((t) => {
                    const label =
                      PRODUCT_TYPE_DEFINITIONS.find((d) => d.id === t)?.label ??
                      t.replace(/-/g, " ").toUpperCase();
                    return (
                      <span
                        key={`preset-type-${t}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-200 text-neutral-800 border border-neutral-300"
                        title="Preset Category Filter"
                      >
                        {label}
                      </span>
                    );
                  })}
                  {presetFilters?.theme?.map((th) => (
                    <span
                      key={`preset-theme-${th}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-200 text-neutral-800 border border-neutral-300"
                      title="Preset Theme Filter"
                    >
                      Theme: {th}
                    </span>
                  ))}

                  {/* Removable search chip */}
                  {qParam && (
                    <button
                      type="button"
                      onClick={() => removeFilterChip("q")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-[#eedad7] text-gray-800 hover:border-black transition-colors cursor-pointer"
                    >
                      &quot;{qParam}&quot;
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}

                  {/* Removable price chip */}
                  {maxPriceParam && (
                    <button
                      type="button"
                      onClick={() => removeFilterChip("price")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-[#eedad7] text-gray-800 hover:border-black transition-colors cursor-pointer"
                    >
                      Up to ${maxPriceParam}
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}

                  {/* Removable shape chips */}
                  {selectedShapes.map((shape) => (
                    <button
                      key={`chip-shape-${shape}`}
                      type="button"
                      onClick={() => removeFilterChip("shape", shape)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-[#eedad7] text-gray-800 hover:border-black transition-colors cursor-pointer"
                    >
                      {shape}
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  ))}

                  {/* Removable type chips */}
                  {selectedTypes.map((typeId) => {
                    const label =
                      PRODUCT_TYPE_DEFINITIONS.find((d) => d.id === typeId)?.label ?? typeId;
                    return (
                      <button
                        key={`chip-type-${typeId}`}
                        type="button"
                        onClick={() => removeFilterChip("type", typeId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-[#eedad7] text-gray-800 hover:border-black transition-colors cursor-pointer"
                      >
                        {label}
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    );
                  })}

                  {/* Removable theme chips */}
                  {selectedThemes.map((th) => (
                    <button
                      key={`chip-theme-${th}`}
                      type="button"
                      onClick={() => removeFilterChip("theme", th)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-[#eedad7] text-gray-800 hover:border-black transition-colors cursor-pointer"
                    >
                      Theme: {th}
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  ))}

                  {/* Clear all button */}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-[11px] font-bold text-[#c9776c] hover:underline uppercase tracking-wider ml-1 cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Error Message with Retry */}
            {loadError && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loadError}</span>
                </div>
                <button
                  type="button"
                  onClick={fetchProducts}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-rose-300 rounded-md font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            )}

            {/* Loading Skeletons State */}
            {isLoading ? (
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="rounded-2xl border border-[#eedad7] bg-white overflow-hidden p-3.5 flex flex-col animate-pulse"
                  >
                    <div className="aspect-[4/5] w-full rounded-xl bg-[#f6e6e2]/60 mb-3" />
                    <div className="h-3 w-16 bg-[#f6e6e2] rounded-sm mb-2" />
                    <div className="h-4 w-full bg-[#f6e6e2] rounded-sm mb-1" />
                    <div className="h-4 w-3/4 bg-[#f6e6e2] rounded-sm mb-3" />
                    <div className="h-4 w-12 bg-[#f6e6e2] rounded-sm mb-4" />
                    <div className="mt-auto h-9 w-full bg-[#f6e6e2] rounded-lg" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              /* Empty State */
              <div className="py-20 text-center rounded-2xl border border-[#eedad7] bg-white/60 p-8">
                <p className="text-sm font-medium text-gray-700">
                  No products were found matching your selection.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Try adjusting your keywords, price range, or clearing filters.
                </p>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-6 py-2.5 rounded-full border border-gray-900 bg-gray-900 text-white uppercase tracking-wider text-[11px] font-bold hover:bg-black transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c]"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              /* Product Grid */
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {paginatedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} variant="shop" />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-12 flex items-center justify-center gap-1.5"
              >
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label="Previous Page"
                  className="p-2 rounded-lg border border-[#eedad7] bg-white text-gray-700 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9776c]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  // Show first, last, current, and +/- 1 neighbors
                  const isVisible =
                    pNum === 1 ||
                    pNum === totalPages ||
                    Math.abs(pNum - currentPage) <= 1;

                  if (!isVisible) {
                    if (pNum === 2 || pNum === totalPages - 1) {
                      return (
                        <span key={`ellipsis-${pNum}`} className="px-2 text-xs text-gray-400">
                          …
                        </span>
                      );
                    }
                    return null;
                  }

                  const isCurrent = pNum === currentPage;
                  return (
                    <button
                      key={`page-${pNum}`}
                      type="button"
                      onClick={() => handlePageChange(pNum)}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`min-w-9 h-9 px-3 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9776c] ${isCurrent
                        ? "bg-gray-900 text-white"
                        : "bg-white border border-[#eedad7] text-gray-700 hover:border-gray-900"
                        }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  aria-label="Next Page"
                  className="p-2 rounded-lg border border-[#eedad7] bg-white text-gray-700 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9776c]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </main>
        </div>
      </div>

      {/* Accessible Native <dialog> Filter Drawer for Tablet & Mobile */}
      <dialog
        ref={dialogRef}
        aria-labelledby="filter-drawer-title"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDrawer();
        }}
        className="[&:not([open])]:hidden fixed inset-0 m-0 ml-auto h-full max-h-screen w-full max-w-sm sm:max-w-md bg-white/90 backdrop-blur-2xl p-0 shadow-2xl border-l border-[#eedad7] z-50 backdrop:bg-black/40 backdrop:backdrop-blur-md motion-reduce:transition-none"
      >
        <div className="flex flex-col h-full overflow-hidden bg-white/95 backdrop-blur-xl">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f3dedb] bg-[#fdf4f1]/80 backdrop-blur-md">
            <h2 id="filter-drawer-title" className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Filter Products
            </h2>
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close filters drawer"
              className="p-1 rounded-full text-gray-500 hover:text-black hover:bg-black/5 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9776c]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {renderFilterControls(true)}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-[#f3dedb] bg-[#fdf4f1]/80 backdrop-blur-md flex gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  clearAllFilters();
                }}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={closeDrawer}
              className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
            >
              Apply & Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
