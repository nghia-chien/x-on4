"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  Menu,
  ShoppingBag,
  Search,
  Heart,
  ChevronDown,
  X,
  Loader2,
  TrendingUp,
  Clock,
  ArrowRight,
  User,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface SearchProductItem {
  id: string | number;
  name?: string;
  title?: string;
  slug: string;
  price: number | string;
  salePrice?: number | null;
  image?: string;
  thumbnail?: string;
  images?: string[];
  category?: string;
  shapes?: string[];
}

const POPULAR_SEARCHES = [
  "Handmade X-On",
  "Best Seller",
  "3D",
  "Y2K",
  "Flower",
  "Almond",
  "Coffin",
  "Cold Gel Glue",
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopExpanded, setShopExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProductItem[]>([]);
  const [totalSearchMatches, setTotalSearchMatches] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const isShopBlockedRef = useRef(false);
  const shopBlockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { openCart, totalCount, subtotal } = useCart();
  const { user: authUser, logout: authLogout } = useAdminAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  const handleAccountClick = () => {
    if (!authUser) {
      router.push("/login");
      return;
    }
    if (
      authUser.role === "Super Admin" ||
      authUser.role === "Administrator" ||
      authUser.role === "Admin" ||
      authUser.role === "Editor"
    ) {
      router.push("/admin");
    } else {
      router.push("/my-account");
    }
  };

  useEffect(() => {
    setIsShopMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#shop-nav-item")) {
        setIsShopMenuOpen(false);
        isShopBlockedRef.current = false;
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      // Chỉ autofocus modal input trên mobile (desktop dùng inline input)
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    } else {
      // Chỉ clear query trên mobile (desktop giữ nguyên)
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setSearchQuery("");
        setSearchResults([]);
      }
    }
  }, [searchOpen]);

  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem("xon_recent_searches", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("xon_recent_searches");
    } catch {
      // ignore
    }
  };

  // Keyboard shortcut Cmd/Ctrl + K and Escape to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  // Focus input when search modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [searchOpen]);

  // Live search debounced API fetch
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setTotalSearchMatches(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(trimmed)}&limit=6`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setSearchResults(json.data.products || []);
            setTotalSearchMatches(json.data.total || 0);
          }
        }
      } catch (err) {
        console.error("Live search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery ?? searchQuery).trim();
    if (!q) return;
    saveRecentSearch(q);
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  };

  const handleProductClick = (slug: string) => {
    saveRecentSearch(searchQuery);
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/product/${slug}`);
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleShopMouseEnter = () => {
    if (isShopBlockedRef.current) return;
    setIsShopMenuOpen(true);
  };

  const handleShopMouseLeave = () => {
    isShopBlockedRef.current = false;
    setIsShopMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsShopMenuOpen(false);
    isShopBlockedRef.current = true;
    if (shopBlockTimeoutRef.current) {
      clearTimeout(shopBlockTimeoutRef.current);
    }
    shopBlockTimeoutRef.current = setTimeout(() => {
      isShopBlockedRef.current = false;
    }, 400);
    scrollToTop();
  };

  const handleDrawerLinkClick = () => {
    setIsShopMenuOpen(false);
    setMobileOpen(false);
    scrollToTop();
  };

  // Scroll progress from 0 (top of page) to 1 (scrolled >= 280px for slower, smoother shrinking)
  const progress = Math.min(1, Math.max(0, scrollY / 280));

  // const renderActions = (showSubtotal = true) => (
  //   <div className="flex items-center space-x-2 sm:space-x-4 text-gray-800">
  //     <Link
  //       href="/shop"
  //       onClick={handleLinkClick}
  //       className="p-1.5 hover:text-rose-700 transition-colors hidden sm:block"
  //       title="Wishlist"
  //     >
  //       <Heart className="w-5 h-5 stroke-[1.5]" />
  //     </Link>

  //     <button
  //       onClick={() => setSearchOpen(!searchOpen)}
  //       className="p-1.5 hover:text-rose-700 transition-colors cursor-pointer"
  //       aria-label="Search"
  //     >
  //       <Search className="w-5 h-5 stroke-[1.5]" />
  //     </button>

  //     <button
  //       onClick={openCart}
  //       className="p-1.5 hover:text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
  //       aria-label="Cart"
  //     >
  //       <div className="relative">
  //         <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
  //         {totalCount > 0 && (
  //           <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
  //             {totalCount}
  //           </span>
  //         )}
  //       </div>
  //       {showSubtotal && (
  //         <span className="hidden md:inline-block text-xs font-semibold text-gray-800">
  //           ${subtotal.toFixed(2)}
  //         </span>
  //       )}
  //     </button>
  //   </div>
  // );
  const renderActions = (showSubtotal = true, hideSearch = false) => (
    <div className="flex items-center space-x-2 sm:space-x-3.5 text-gray-800">
      <Link
        href="/shop"
        onClick={handleLinkClick}
        className="p-1.5 hover:text-rose-700 transition-colors hidden sm:block"
        title="Wishlist"
      >
        <Heart className="w-5 h-5 stroke-[1.5]" />
      </Link>

      {/* Chỉ hiện nút search icon khi KHÔNG hideSearch (mobile) */}
      {!hideSearch && (
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="p-1.5 hover:text-rose-700 transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-5 h-5 stroke-[1.5]" />
        </button>
      )}

      {/* 1 Single Account Icon with Smart Popover Menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (authUser) {
              setAccountOpen(!accountOpen);
            } else {
              handleLinkClick();
              router.push("/login");
            }
          }}
          className="p-1.5 hover:text-rose-700 transition-colors cursor-pointer relative"
          title={authUser ? `Account (${authUser.name})` : "Log In / Register"}
          aria-label="My Account"
        >
          {authUser ? (
            <div className="w-6 h-6 rounded-full bg-[#c9776c] text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">
              {authUser.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <User className="w-5 h-5 stroke-[1.5]" />
          )}
        </button>

        {/* Account Popover Dropdown when Logged In */}
        {authUser && accountOpen && (
          <>
            <div
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setAccountOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-gray-800">
              <div className="px-4 py-2 border-b border-neutral-100">
                <p className="text-xs font-bold text-neutral-900 truncate">{authUser.name}</p>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">{authUser.role}</p>
              </div>

              <div className="py-1 text-xs font-medium">
                <Link
                  href="/login"
                  onClick={() => {
                    setAccountOpen(false);
                    handleLinkClick();
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  <User className="w-4 h-4 text-neutral-500" />
                  <span>My Account</span>
                </Link>

                {(authUser.role === "Super Admin" ||
                  authUser.role === "Administrator" ||
                  authUser.role === "Admin" ||
                  authUser.role === "Editor") && (
                    <Link
                      href="/admin"
                      onClick={() => {
                        setAccountOpen(false);
                        handleLinkClick();
                      }}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
              </div>

              <div className="border-t border-neutral-100 pt-1">
                <button
                  onClick={() => {
                    setAccountOpen(false);
                    authLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={openCart}
        className="p-1.5 hover:text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
        aria-label="Cart"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </div>
        {showSubtotal && (
          <span className="hidden md:inline-block text-xs font-semibold text-gray-800">
            ${subtotal.toFixed(2)}
          </span>
        )}
      </button>
    </div>
  );
  const isHome = pathname === "/";
  const isShop =
    pathname === "/shop" ||
    pathname.startsWith("/product") ||
    pathname.startsWith("/product-category") ||
    pathname.startsWith("/bundle-and-save") ||
    pathname.startsWith("/gallery-product");
  const isAbout =
    pathname === "/about" ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/our-story");
  const isFitGuide =
    pathname === "/sizing-chart" ||
    pathname.startsWith("/sizing-chart") ||
    pathname.startsWith("/fit-guide");
  const isWholesale =
    pathname === "/wholesale-signup" || pathname.startsWith("/wholesale");
  const isJournal =
    pathname === "/blog" ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/journal");
  const isContact =
    pathname === "/contact-us" || pathname.startsWith("/contact");

  const getLinkClass = (isActive: boolean) =>
    `py-2.5 whitespace-nowrap block transition-colors duration-150 cursor-pointer ${isActive
      ? "text-rose-700 font-bold"
      : "text-neutral-800 hover:text-rose-700 font-bold"
    }`;

  const getShopClass = (isActive: boolean) =>
    `py-2.5 transition-colors duration-150 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${isActive
      ? "text-rose-700 font-bold"
      : "text-neutral-800 hover:text-rose-700 font-bold"
    }`;

  const renderNavLinks = () => (
    <ul className="flex items-center justify-between w-full gap-3.5 xl:gap-6 2xl:gap-8 text-[12px] xl:text-[13px] uppercase tracking-[0.1em] xl:tracking-[0.14em] text-neutral-800 whitespace-nowrap">
      <li className="shrink-0">
        <Link
          href="/"
          onClick={handleLinkClick}
          className={getLinkClass(isHome)}
        >
          HOME
        </Link>
      </li>

      {/* Shop Mega Menu */}
      <li
        id="shop-nav-item"
        className="py-2.5 shrink-0"
        onMouseEnter={handleShopMouseEnter}
        onMouseLeave={handleShopMouseLeave}
      >
        <Link
          href="/shop"
          onClick={handleLinkClick}
          className={getShopClass(isShop)}
        >
          SHOP <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 stroke-[2] ${isShopMenuOpen ? "rotate-180" : ""}`} />
        </Link>

        {/* Mega Menu Dropdown */}
        <div
          className={`absolute top-full left-0 right-0 w-full bg-[#faece9]/90 backdrop-blur-md shadow-2xl border-t border-gray-100 transition-all duration-200 z-50 ${isShopMenuOpen
              ? "opacity-100 visible pointer-events-auto"
              : "opacity-0 invisible pointer-events-none"
            }`}
        >
          {/* Container bên trong để nội dung không bị tràn sát mép */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-12 gap-4">

              {/* ===== CỘT 1: LOGO SHOP (3/12) ===== */}
              <div className="col-span-3">
                <Link
                  href="/shop"
                  onClick={handleLinkClick}
                  className="group/logo relative block h-full min-h-[300px] rounded-xl overflow-hidden bg-gradient-to-br from-rose-50 via-neutral-50 to-rose-100/50 border border-neutral-100"
                >
                  <Image
                    src="/images/logo-xon.webp"
                    alt="X-ON Shop"
                    fill
                    sizes="140px"
                    className="object-contain p-6 group-hover/logo:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm whitespace-nowrap">
                    Shop Now
                  </div>
                </Link>
              </div>

              {/* ===== CỘT 2: UL LIST (3/12) ===== */}
              <div className="col-span-3 rounded-xl border border-neutral-100 bg-neutral-50/40 p-4">
                <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-1.5">
                  Product Type
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-600 font-normal">
                  <li>
                    <Link
                      href="/product-category/product-type/handmade-grip-x-nails"
                      onClick={handleLinkClick}
                      className="hover:text-rose-700 transition-colors block py-0.5"
                    >
                      HANDMADE X-ON NAILS
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product-category/product-type/cold-gel-glue"
                      onClick={handleLinkClick}
                      className="hover:text-rose-700 transition-colors block py-0.5"
                    >
                      Cold Gel Glue
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product-category/product-type/cold-gel-remover"
                      onClick={handleLinkClick}
                      className="hover:text-rose-700 transition-colors block py-0.5"
                    >
                      Cold gel remover
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product-category/product-type/best-seller"
                      onClick={handleLinkClick}
                      className="hover:text-rose-700 transition-colors block py-0.5"
                    >
                      Best seller
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/gallery-product"
                      onClick={handleLinkClick}
                      className="hover:text-rose-700 transition-colors block py-0.5"
                    >
                      Product Gallery
                    </Link>
                  </li>
                </ul>

                <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-1.5 pt-3">
                  Design Theme
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-600 font-normal">
                  <li>
                    <Link
                      href="/product-category/design-theme/3d"
                      onClick={handleLinkClick}
                      className="hover:text-rose-700 block py-0.5"
                    >
                      3D
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product-category/design-theme/flower"
                      onClick={handleLinkClick}
                      className="hover:text-rose-700 block py-0.5"
                    >
                      Flower
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product-category/design-theme/y2k"
                      onClick={handleLinkClick}
                      className="hover:text-rose-700 block py-0.5"
                    >
                      Y2K
                    </Link>
                  </li>
                </ul>

              </div>


              {/* ===== CỘT 3: BENTO (6/12) ===== */}
              <div className="col-span-6 flex flex-col gap-3">

                {/* ẢNH NGANG */}
                <Link
                  href="/bundle-and-save"
                  onClick={handleLinkClick}
                  className="group/card relative block aspect-[16/6] rounded-xl overflow-hidden bg-neutral-100"
                >
                  <Image
                    src="/images/IMG_7098.webp"
                    alt="Bundles & Save"
                    fill
                    sizes="600px"
                    className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex items-center p-5">
                    <div>
                      <span className="text-white/70 text-[10px] uppercase tracking-[0.2em] block mb-0.5">
                        Featured
                      </span>
                      <h3 className="text-white text-lg font-bold uppercase tracking-wider">
                        Bundles &amp; Save
                      </h3>
                    </div>
                  </div>
                </Link>

                {/* 2 ẢNH DỌC */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <Link
                    href="/product-category/design-theme/y2k"
                    onClick={handleLinkClick}
                    className="group/card relative block rounded-xl overflow-hidden bg-neutral-100 min-h-[180px]"
                  >
                    <Image
                      src="/images/IMG_7101.webp"
                      alt="Y2K Collection"
                      fill
                      sizes="300px"
                      className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                      <div>
                        <span className="text-white/70 text-[10px] uppercase tracking-[0.2em] block mb-0.5">
                          Design
                        </span>
                        <h3 className="text-white text-sm font-bold uppercase tracking-wider">
                          Y2K Collection
                        </h3>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/product-category/product-type/best-seller"
                    onClick={handleLinkClick}
                    className="group/card relative block rounded-xl overflow-hidden bg-neutral-100 min-h-[180px]"
                  >
                    <Image
                      src="/images/IMG_7105.webp"
                      alt="Best Sellers"
                      fill
                      sizes="300px"
                      className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                      <div>
                        <span className="text-white/70 text-[10px] uppercase tracking-[0.2em] block mb-0.5">
                          Popular
                        </span>
                        <h3 className="text-white text-sm font-bold uppercase tracking-wider">
                          Best Sellers
                        </h3>
                      </div>
                    </div>
                  </Link>
                </div>

              </div>

            </div>
          </div>
        </div>
      </li>

      <li className="shrink-0">
        <Link
          href="/about"
          onClick={handleLinkClick}
          className={getLinkClass(isAbout)}
        >
          OUR STORY
        </Link>
      </li>

      <li className="shrink-0">
        <Link
          href="/sizing-chart"
          onClick={handleLinkClick}
          className={getLinkClass(isFitGuide)}
        >
          FIT GUIDE
        </Link>
      </li>

      <li className="shrink-0">
        <Link
          href="/wholesale-signup"
          onClick={handleLinkClick}
          className={getLinkClass(isWholesale)}
        >
          WHOLESALE
        </Link>
      </li>

      <li className="shrink-0">
        <Link
          href="/blog"
          onClick={handleLinkClick}
          className={getLinkClass(isJournal)}
        >
          JOURNAL
        </Link>
      </li>

      <li className="shrink-0">
        <Link
          href="/contact-us"
          onClick={handleLinkClick}
          className={getLinkClass(isContact)}
        >
          CONTACT
        </Link>
      </li>
    </ul>
  );

  return (
    <>
      {/* Sticky Header with Smooth Shrinking Logo and Centered Navigation */}
      <header
        className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-xs"
        style={
          {
            "--p": progress,
          } as React.CSSProperties
        }
      >
        {/* Top Header Row: Centered Logo with Dynamic Height */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-[calc(68px-(16px*var(--p)))] sm:h-[calc(110px-(46px*var(--p)))] md:h-[calc(140px-(70px*var(--p)))] lg:h-[calc(180px-(116px*var(--p)))] transition-[height] duration-75">
            {/* Left: Mobile hamburger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 text-gray-800 hover:text-black focus:outline-hidden cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 stroke-[1.5]" />
              </button>
            </div>

            {/* Center: Main Logo that shrinks smoothly until reaching min size */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
              <Link
                href="/"
                onClick={handleLinkClick}
                className="relative block pointer-events-auto transition-transform duration-200 hover:scale-105 h-[calc(44px-(10px*var(--p)))] sm:h-[calc(76px-(32px*var(--p)))] md:h-[calc(110px-(60px*var(--p)))] lg:h-[calc(146px-(96px*var(--p)))] w-[calc(120px-(28px*var(--p)))] sm:w-[calc(220px-(90px*var(--p)))] md:w-[calc(340px-(180px*var(--p)))] lg:w-[calc(460px-(300px*var(--p)))]"
              >
                <Image
                  src="/images/logo-xon.webp"
                  alt="X-ON Nails"
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 768px) 320px, 600px"
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Right: Action Icons (visible on mobile/tablet) */}
            <div className="flex items-center justify-end lg:hidden">
              {renderActions(false)}
            </div>
          </div>
        </div>

        {/* Desktop Balanced Navigation Bar */}
        <nav className="hidden lg:block bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end h-11 xl:h-12 gap-4">

              {/* Nav Links */}
              <div className="flex items-center shrink-0">
                {renderNavLinks()}
              </div>

              {/* Search + Actions */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Search Input Pill */}
                <div className="relative w-44 xl:w-56">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!searchOpen) setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search for nails..."
                    className="w-full pl-10 pr-4 py-2 bg-neutral-100 hover:bg-neutral-200/70 focus:bg-white border border-transparent focus:border-neutral-300 rounded-full text-xs text-gray-900 placeholder:text-neutral-400 focus:outline-none transition-colors"
                  />
                </div>

                {renderActions(true, true)}
              </div>

            </div>
          </div>
        </nav>

        {/* Dropdown Full-Width Search Bar Attached Under Header */}
        {searchOpen && (
          <>
            <div className="fixed inset-0 z-30 cursor-default" onClick={() => setSearchOpen(false)} />

            <div className="absolute top-full left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-md transition-all animate-in slide-in-from-top-2 duration-150">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
                {/* Search Form Row */}
                <form onSubmit={(e) => handleSearchSubmit(e)} className="relative flex items-center gap-2">

                  {/* INPUT — ẩn trên desktop (lg:hidden), vì input đã ở nav bar */}
                  <div className="relative flex-1 flex items-center bg-white border border-neutral-300 focus-within:border-black rounded-none px-3 py-1.5 sm:py-2 transition-colors lg:hidden">
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 text-rose-600 animate-spin shrink-0" />
                    ) : (
                      <Search className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products, shapes (Almond, Coffin), themes (3D, Y2K)..."
                      className="w-full pl-2.5 pr-6 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden bg-transparent"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery("")} className="...">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Search submit button — vẫn hiện nhưng chỉ để submit form khi Enter */}
                  <button type="submit" className="... lg:hidden">
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Close button */}
                  <button type="button" onClick={() => setSearchOpen(false)} className="...">
                    <X className="w-4 h-4" />
                  </button>
                </form>

                {/* Popular Searches & Quick Suggestions (When query is empty) */}
                {!searchQuery.trim() && (
                  <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 text-[10px] mr-1">
                      <TrendingUp className="w-3 h-3 text-rose-600" /> Popular:
                    </span>
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setSearchQuery(term);
                          handleSearchSubmit(undefined, term);
                        }}
                        className="px-2.5 py-0.5 bg-neutral-100 hover:bg-black hover:text-white text-gray-700 font-medium rounded-none border border-neutral-200 transition-colors cursor-pointer text-[11px]"
                      >
                        {term}
                      </button>
                    ))}

                    {recentSearches.length > 0 && (
                      <div className="w-full flex items-center gap-2 pt-1.5 text-[11px] text-gray-500">
                        <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="font-semibold text-[10px] uppercase">Recent:</span>
                        <div className="flex flex-wrap gap-1.5 flex-1">
                          {recentSearches.slice(0, 4).map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                setSearchQuery(r);
                                handleSearchSubmit(undefined, r);
                              }}
                              className="hover:text-rose-700 hover:underline cursor-pointer text-[11px]"
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-gray-400 hover:text-rose-600 cursor-pointer ml-auto text-[10px]"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Live Search Results Dropdown List (When query is entered) */}
                {searchQuery.trim() && (
                  <div className="mt-2.5 pt-2 border-t border-gray-100 max-h-[55vh] overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 font-medium pb-0.5">
                          <span>
                            Found {totalSearchMatches || searchResults.length} product
                            {(totalSearchMatches || searchResults.length) > 1 ? "s" : ""}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSearchSubmit()}
                            className="text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer flex items-center gap-1 text-xs"
                          >
                            <span>View all in shop</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {searchResults.map((item) => {
                            const title = item.name || item.title || "X-ON Nails";
                            const img =
                              item.thumbnail ||
                              (Array.isArray(item.images) && item.images[0]) ||
                              item.image ||
                              "/images/IMG_7098.webp";
                            const priceVal =
                              typeof item.price === "number"
                                ? `$${item.price.toFixed(2)}`
                                : String(item.price).startsWith("$")
                                  ? item.price
                                  : `$${item.price}`;

                            return (
                              <div
                                key={item.id}
                                onClick={() => handleProductClick(item.slug)}
                                className="group flex items-center gap-2.5 p-2 border border-gray-200 hover:border-black transition-colors cursor-pointer bg-white rounded-none"
                              >
                                <div className="relative w-10 h-10 overflow-hidden bg-gray-100 shrink-0 border border-gray-100 rounded-none">
                                  <Image
                                    src={img}
                                    alt={title}
                                    fill
                                    sizes="40px"
                                    className="object-cover group-hover:scale-105 transition-transform"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-rose-700 transition-colors truncate">
                                    {title}
                                  </h4>
                                  <div className="flex items-center justify-between mt-0.5">
                                    <span className="text-xs font-bold text-gray-900">
                                      {priceVal}
                                    </span>
                                    {item.category && (
                                      <span className="bg-gray-100 text-[9px] uppercase font-semibold text-gray-600 px-1 py-0.5 rounded-none truncate max-w-[85px]">
                                        {item.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : !isSearching ? (
                      <div className="py-4 text-center space-y-2">
                        <p className="text-xs text-gray-600">
                          No products found for{" "}
                          <span className="font-bold text-black">&quot;{searchQuery}&quot;</span>
                        </p>
                        <div className="pt-0.5 flex flex-wrap justify-center gap-1">
                          {POPULAR_SEARCHES.slice(0, 5).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setSearchQuery(t);
                                handleSearchSubmit(undefined, t);
                              }}
                              className="px-2 py-0.5 bg-neutral-100 hover:bg-black hover:text-white text-gray-700 text-[11px] rounded-none border border-neutral-200 transition-colors cursor-pointer"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Off-Canvas Sidebar / Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          {/* Subtle backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 flex flex-col transform transition-transform animate-in slide-in-from-left duration-300 overflow-y-auto no-scrollbar">
            {/* Top Bar with faint hamburger icon and search */}
            <div className="pt-5 pb-3 px-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Navigation
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Mobile Drawer Search Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = (e.currentTarget.elements.namedItem("drawerSearch") as HTMLInputElement)?.value;
                  if (q && q.trim()) {
                    handleSearchSubmit(undefined, q.trim());
                  }
                }}
                className="relative"
              >
                <input
                  name="drawerSearch"
                  type="text"
                  placeholder="Search nails..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-neutral-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-black transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </form>
            </div>

            {/* Menu Links List */}
            <nav className="flex-1 divide-y divide-neutral-100">
              {/* HOME */}
              <Link
                href="/"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] uppercase tracking-wider transition-colors ${isHome
                  ? "bg-rose-50 text-rose-700 font-extrabold border-l-4 border-rose-700"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-50 font-bold"
                  }`}
              >
                HOME
              </Link>

              {/* SHOP */}
              <div>
                <div
                  className={`flex items-center justify-between py-3.5 px-6 text-[13px] uppercase tracking-wider cursor-pointer transition-colors ${isShop
                    ? "bg-rose-50 text-rose-700 font-extrabold border-l-4 border-rose-700"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-50 font-bold"
                    }`}
                  onClick={() => setShopExpanded(!shopExpanded)}
                >
                  <Link
                    href="/shop"
                    onClick={handleDrawerLinkClick}
                    className="flex-1"
                  >
                    SHOP
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShopExpanded(!shopExpanded);
                    }}
                    className="p-1 -mr-1 text-neutral-500 hover:text-black cursor-pointer"
                    aria-label="Toggle shop sub-menu"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 stroke-[2] ${shopExpanded ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                </div>

                {/* Submenu if expanded */}
                {shopExpanded && (
                  <div className="bg-neutral-50/80 border-t border-neutral-100 divide-y divide-neutral-100/60 text-xs font-semibold text-neutral-600">
                    <Link
                      href="/shop"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-rose-700 hover:bg-neutral-100 transition-colors"
                    >
                      All Products
                    </Link>
                    <Link
                      href="/shop?theme=3D"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-rose-700 hover:bg-neutral-100 transition-colors"
                    >
                      3D Design Theme
                    </Link>
                    <Link
                      href="/shop?theme=Flower"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-rose-700 hover:bg-neutral-100 transition-colors"
                    >
                      Flower Design Theme
                    </Link>
                    <Link
                      href="/shop?theme=Y2K"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-rose-700 hover:bg-neutral-100 transition-colors"
                    >
                      Y2K Design Theme
                    </Link>
                    <Link
                      href="/gallery-product"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-rose-700 hover:bg-neutral-100 transition-colors"
                    >
                      Product Gallery
                    </Link>
                    <Link
                      href="/shop?shape=Almond"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-rose-700 hover:bg-neutral-100 transition-colors"
                    >
                      Almond Shape
                    </Link>
                    <Link
                      href="/shop?shape=Coffin"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-rose-700 hover:bg-neutral-100 transition-colors"
                    >
                      Coffin Shape
                    </Link>
                  </div>
                )}
              </div>

              {/* ABOUT / OUR STORY */}
              <Link
                href="/about"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] uppercase tracking-wider transition-colors ${isAbout
                  ? "bg-rose-50 text-rose-700 font-extrabold border-l-4 border-rose-700"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-50 font-bold"
                  }`}
              >
                OUR STORY
              </Link>

              {/* FIT GUIDE */}
              <Link
                href="/sizing-chart"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] uppercase tracking-wider transition-colors ${isFitGuide
                  ? "bg-rose-50 text-rose-700 font-extrabold border-l-4 border-rose-700"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-50 font-bold"
                  }`}
              >
                FIT GUIDE
              </Link>

              {/* WHOLESALE */}
              <Link
                href="/wholesale-signup"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] uppercase tracking-wider transition-colors ${isWholesale
                  ? "bg-rose-50 text-rose-700 font-extrabold border-l-4 border-rose-700"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-50 font-bold"
                  }`}
              >
                WHOLESALE
              </Link>

              {/* BUNDLE AND SAVE */}
              <Link
                href="/bundle-and-save"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] uppercase tracking-wider transition-colors ${pathname === "/bundle-and-save"
                  ? "bg-rose-50 text-rose-700 font-extrabold border-l-4 border-rose-700"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-50 font-bold"
                  }`}
              >
                BUNDLE AND SAVE
              </Link>

              {/* JOURNAL / BLOG */}
              <Link
                href="/blog"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] uppercase tracking-wider transition-colors ${isJournal
                  ? "bg-rose-50 text-rose-700 font-extrabold border-l-4 border-rose-700"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-50 font-bold"
                  }`}
              >
                JOURNAL
              </Link>

              {/* CONTACT */}
              <Link
                href="/contact-us"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] uppercase tracking-wider transition-colors ${isContact
                  ? "bg-rose-50 text-rose-700 font-extrabold border-l-4 border-rose-700"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-50 font-bold"
                  }`}
              >
                CONTACT
              </Link>

              {/* SINGLE MY ACCOUNT BUTTON IN MOBILE DRAWER */}
              <div className="p-4 bg-neutral-50/80 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleAccountClick();
                  }}
                  className="w-full flex items-center justify-between py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-gray-900 bg-white border border-neutral-200 rounded-xl hover:border-black transition-colors cursor-pointer shadow-2xs"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#c9776c]" />
                    <span>{authUser ? `Account (${authUser.name.split(" ")[0]})` : "Log In / Register"}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
