"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogPostItem } from "@/types/admin";
import { ArrowRight, BookOpen, Clock, Sparkles } from "lucide-react";

interface Post {
  title: string;
  slug: string;
  date: string;
  image: string;
  category: string;
  readTime: string;
  excerpt: string;
}

const defaultBlogPosts: Post[] = [
  {
    title: "Extra-Long Handmade Nail Luxury: The New Era of Wearable Art",
    slug: "extra-long-handmade-nail-luxury",
    date: "July 22, 2026",
    image: "/images/IMG_7098.webp",
    category: "Haute Manicure",
    readTime: "4 min read",
    excerpt:
      "Why modern women are trading hours at the salon chair for reusable, handcrafted high-fashion manicures built with professional-grade gel and acrylic powder.",
  },
  {
    title: "Salon-Quality Handmade Nails, Reimagined for Modern Life",
    slug: "salon-quality-handmade-nails-reimagined-for-home",
    date: "July 22, 2026",
    image: "/images/IMG_7099.webp",
    category: "Artisanal Craft",
    readTime: "3 min read",
    excerpt:
      "The delicate difference between mass-molded plastic and hand-sculpted gel architecture that naturally hugs your nail bed.",
  },
  {
    title: "The 10-Minute At-Home Salon Ritual: Fast, Gentle & Flawless",
    slug: "apply-gripx-nails",
    date: "December 10, 2025",
    image: "/images/IMG_7100.webp",
    category: "Beauty Rituals",
    readTime: "3 min read",
    excerpt:
      "A step-by-step masterclass on room-temperature Cold Gel application for weeks of damage-free, zero-UV salon hold.",
  },
  {
    title: "Effortless Elegance: Why Less Damage Means More Beautiful Nails",
    slug: "post-1",
    date: "December 10, 2025",
    image: "/images/IMG_7101.webp",
    category: "Nail Health & Trends",
    readTime: "2 min read",
    excerpt:
      "Discover why modern beauty enthusiasts are preserving their natural nail strength without compromising on runway-ready glam.",
  },
];

const CATEGORIES = ["All Editions", "Haute Manicure", "Artisanal Craft", "Beauty Rituals", "Nail Health & Trends"];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c]";

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<Post[]>(defaultBlogPosts);
  const [activeCategory, setActiveCategory] = useState("All Editions");

  useEffect(() => {
    async function fetchDynamicPosts() {
      try {
        const res = await fetch("/api/blog?status=Published");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mappedDynamic: Post[] = json.data.map((b: BlogPostItem, idx: number) => ({
              title: b.title,
              slug: b.slug,
              date: b.publishedAt || b.createdAt
                ? new Date(b.publishedAt || b.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent",
              image: b.thumbnail || defaultBlogPosts[idx % defaultBlogPosts.length].image,
              category: b.tags && b.tags[0] ? b.tags[0] : "Editorial",
              readTime: "3 min read",
              excerpt:
                b.excerpt ||
                (b.content && typeof b.content === "string" ? b.content.slice(0, 140) + "..." : "Explore this feature story from our beauty editors."),
            }));

            const existingSlugs = new Set(mappedDynamic.map((d) => d.slug));
            const filteredDefaults = defaultBlogPosts.filter(
              (p) => !existingSlugs.has(p.slug)
            );
            setPosts([...mappedDynamic, ...filteredDefaults]);
          }
        }
      } catch (e) {
        console.error("Error loading blog posts:", e);
      }
    }

    fetchDynamicPosts();
  }, []);

  const filteredPosts =
    activeCategory === "All Editions"
      ? posts
      : posts.filter((p) => p.category.toLowerCase().includes(activeCategory.toLowerCase()));

  const coverStory = posts[0];
  const gridStories = filteredPosts.length > 1 ? filteredPosts.slice(1) : filteredPosts;

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
      {/* Organic mottled diffused ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-[#f6c9c1]/40 blur-[100px]" />
        <div className="absolute top-20 -right-32 w-[550px] h-[550px] rounded-full bg-[#faece9]/80 blur-[110px]" />
        <div className="absolute top-[35%] -left-36 w-[520px] h-[520px] rounded-full bg-[#fbe3de]/55 blur-[120px]" />
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[650px] h-[550px] rounded-full bg-[#fdf4f1]/70 blur-[130px]" />
        <div className="absolute top-[75%] -right-28 w-[520px] h-[520px] rounded-full bg-[#f8dfd8]/50 blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* 1. EDITORIAL MAGAZINE MASTHEAD */}
        <header className="text-center pt-2 pb-4 space-y-4 max-w-3xl mx-auto">

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 leading-tight">
            The Beauty &amp; Artistry Edit
          </h1>

          <div className="mx-auto h-px w-16 bg-rose-300" />

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl mx-auto font-light">
            Curated narratives on bespoke nail craftsmanship, seasonal silhouettes, and modern beauty rituals designed for women who appreciate timeless detail.
          </p>

          {/* Category Filter Pills (Responsive Flex-Wrap Layout without Horizontal Scrollbar) */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 max-w-2xl mx-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${focusRing} ${
                  activeCategory === cat
                    ? "bg-gray-900 text-white shadow-xs scale-102"
                    : "bg-white/80 text-gray-600 border border-[#eedad7] hover:border-gray-900 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* 2. COVER STORY FEATURE (Magazine Lead Story) */}
        {coverStory && activeCategory === "All Editions" && (
          <section className="overflow-hidden rounded-3xl border border-[#eedad7] bg-white/90 backdrop-blur-xs shadow-sm transition-all hover:shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Image Col */}
              <div className="relative min-h-[320px] sm:min-h-[420px] lg:col-span-7 lg:min-h-full overflow-hidden bg-[#f6e6e2]">
                <Link href={`/blog/${coverStory.slug}`} className="block relative w-full h-full group">
                  <Image
                    src={coverStory.image}
                    alt={coverStory.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur-md px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                      <Sparkles className="w-3 h-3 text-rose-300" /> Cover Story
                    </span>
                  </div>
                </Link>
              </div>

              {/* Text Editorial Col */}
              <div className="flex flex-col justify-between p-7 sm:p-10 lg:col-span-5 lg:p-12 space-y-6">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#c9776c]">
                    <span>{coverStory.category}</span>
                    <span className="text-gray-300">&bull;</span>
                    <span className="flex items-center gap-1 text-gray-500 font-normal">
                      <Clock className="w-3 h-3" /> {coverStory.readTime}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 leading-tight hover:text-[#c9776c] transition-colors">
                    <Link href={`/blog/${coverStory.slug}`}>
                      {coverStory.title}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                    {coverStory.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#eedad7]/60 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-serif italic">
                    Published {coverStory.date}
                  </span>

                  <Link
                    href={`/blog/${coverStory.slug}`}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-[#c9776c] transition-colors ${focusRing}`}
                  >
                    Read Feature <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. EDITORIAL ARTICLES GRID */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#eedad7] pb-3">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#c9776c]">
              Curated Articles
            </span>
            <span className="text-xs text-gray-500 font-serif italic">
              Showing {filteredPosts.length} Editions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {gridStories.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col rounded-2xl border border-[#eedad7] bg-white overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                {/* 4:3 Aspect Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f6e6e2]/40">
                  <Link href={`/blog/${post.slug}`} className="block relative w-full h-full">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <span className="rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#c9776c] shadow-2xs border border-[#eedad7]">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span>{post.date}</span>
                      <span>&bull;</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#c9776c] transition-colors">
                      <Link href={`/blog/${post.slug}`} className={focusRing}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-light">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#eedad7]/50 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-gray-900 hover:text-[#c9776c] transition-colors"
                    >
                      Read Article <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 4 & 5. COMBINED EDITORIAL QUOTE & COMMERCE INVITATION BANNER */}
        <section className="relative overflow-hidden rounded-3xl bg-neutral-950 text-white p-8 sm:p-14 shadow-lg border border-neutral-800">
          {/* Subtle Ambient Glow */}
          <div aria-hidden className="pointer-events-none absolute -top-32 -right-20 w-80 h-80 rounded-full bg-[#c9776c]/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-[#faece9]/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
            {/* Quote Block */}
            <div className="space-y-3">
              <span className="font-serif text-5xl sm:text-6xl text-[#c9776c]/50 select-none block leading-none">
                &ldquo;
              </span>
              <p className="font-serif text-lg sm:text-2xl text-rose-100 italic font-normal leading-relaxed -mt-4">
                Nails are not merely an accessory — they are personal architecture, hand-sculpted to empower every gesture and elevate everyday presence.
              </p>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c9776c] block pt-1">
                — X-ON Atelier Artisans
              </span>
            </div>

            <div className="w-16 h-px bg-neutral-800 mx-auto" />

            {/* Commerce Invitation */}
            <div className="space-y-3">
              <div className="pt-2">
                <Link
                  href="/shop"
                  className={`inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-950 hover:bg-neutral-100 transition-all hover:scale-[1.02] active:scale-[0.98] ${focusRing}`}
                >
                  Shop Handcrafted Nails <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
