"use client";

import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import siteContent from "@/data/site-content.json";
import { ArrowLeft, ArrowRight, Sparkles, Clock, BookOpen } from "lucide-react";
import ArticleBody from "@/components/blog/ArticleBody";

interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  date?: string;
  createdAt?: string;
  thumbnail?: string;
  image?: string;
  paragraphs?: string[];
  content?: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
}

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c]";

export default function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      setIsLoading(true);
      try {
        // 1. Try fetching from dynamic API
        const res = await fetch(`/api/blog/${slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setPost({
              ...json.data,
              image: json.data.thumbnail || json.data.image,
              date: json.data.createdAt
                ? new Date(json.data.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent",
            });
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Fetch blog error", err);
      }

      // 2. Fallback to siteContent.json
      const staticPost = siteContent.blogPosts?.find(
        (p: BlogPost) => p.slug === slug
      );
      if (staticPost) {
        setPost(staticPost);
      }
      setIsLoading(false);
    }

    loadPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-[#faece9] via-[#fdf4f1] to-white min-h-screen py-28 text-center">
        <span className="w-8 h-8 border-2 border-[#eedad7] border-t-gray-900 rounded-full animate-spin inline-block" />
        <p className="text-xs text-gray-500 mt-3 font-serif italic">Loading editorial feature...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-gradient-to-b from-[#faece9] via-[#fdf4f1] to-white min-h-screen py-24 text-center space-y-4">
        <h1 className="text-2xl font-serif font-bold text-gray-900">Article Not Found</h1>
        <p className="text-xs text-gray-500">
          The requested editorial story could not be found or may have moved.
        </p>
        <Link
          href="/blog"
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-black transition-colors ${focusRing}`}
        >
          <ArrowLeft className="w-4 h-4" /> Return to The Journal
        </Link>
      </div>
    );
  }

  const otherPosts = siteContent.blogPosts
    ?.filter((p: BlogPost) => p.slug !== slug)
    .slice(0, 2);

  return (
    <div
      className="relative min-h-screen py-8 sm:py-14 overflow-hidden text-gray-900"
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
      {/* Diffused ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-[#f6c9c1]/40 blur-[100px]" />
        <div className="absolute top-20 -right-32 w-[550px] h-[550px] rounded-full bg-[#faece9]/80 blur-[110px]" />
        <div className="absolute top-[35%] -left-36 w-[520px] h-[520px] rounded-full bg-[#fbe3de]/55 blur-[120px]" />
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[650px] h-[550px] rounded-full bg-[#fdf4f1]/70 blur-[130px]" />
        <div className="absolute top-[75%] -right-28 w-[520px] h-[520px] rounded-full bg-[#f8dfd8]/50 blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Navigation back & breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-black transition-colors ${focusRing}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Journal
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c9776c]">
            The Atelier Journal
          </span>
        </div>

        {/* Article Header (Editorial Magazine Style) */}
        <header className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#c9776c]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Editorial Feature &bull; Vol. IV</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-500 pt-2 border-t border-[#eedad7]/60">
            <span className="font-semibold text-gray-900">By {post.author || "X-ON Atelier"}</span>
            <span>&bull;</span>
            <span>{post.date || "Recent Issue"}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-[#c9776c] font-medium">
              <Clock className="w-3 h-3" /> 4 min read
            </span>
          </div>
        </header>

        {/* Feature Cover Image */}
        {(post.thumbnail || post.image) && (
          <div className="space-y-2">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-sm border border-[#eedad7] bg-[#f6e6e2]">
              <Image
                src={post.thumbnail || post.image || "/images/IMG_7098.webp"}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover object-center"
              />
            </div>
            <p className="text-[11px] text-gray-500 italic text-center font-serif">
              Handcrafted bespoke sets photographed at the X-ON Atelier.
            </p>
          </div>
        )}

        {/* Article Content Card */}
        <article className="rounded-3xl border border-[#eedad7] bg-white/95 backdrop-blur-xs p-6 sm:p-12 shadow-xs">
          {post.content ? (
            <ArticleBody content={post.content} tags={post.tags} />
          ) : (
            <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed font-light">
              {post.paragraphs?.map((para: string, idx: number) => {
                // Drop cap on first paragraph for authentic high-end magazine aesthetic
                if (idx === 0) {
                  return (
                    <p
                      key={idx}
                      className="first-letter:font-serif first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-gray-900 first-letter:leading-none leading-relaxed"
                    >
                      {para}
                    </p>
                  );
                }

                // Callout/Comparison styling if paragraph mentions salon comparison
                if (para.includes("AT THE SALON:") || para.includes("WITH X-ON:")) {
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl bg-[#faece9]/50 border border-[#eedad7] p-4.5 my-4 font-medium text-gray-900 text-sm flex items-start gap-2.5"
                    >
                      <Sparkles className="w-4 h-4 text-[#c9776c] shrink-0 mt-0.5" />
                      <span>{para}</span>
                    </div>
                  );
                }

                return <p key={idx}>{para}</p>;
              })}
            </div>
          )}
        </article>

        {/* Editorial Pull Quote / Recommendation Box */}
        <div className="rounded-3xl border border-[#eedad7] bg-gradient-to-r from-[#faece9]/60 via-white to-[#fbf0ec]/60 p-8 sm:p-10 text-center space-y-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c9776c] block">
            The Atelier Standard
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-semibold text-gray-900">
            Wear The Art. Skip The Salon Chair.
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto font-light leading-relaxed">
            Every set in our story is handcrafted by artists with professional-grade gel and acrylic powder, ready to apply in 15 minutes at home.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className={`inline-flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-black transition-all ${focusRing}`}
            >
              Shop Featured Sets <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* More from The Journal */}
        {otherPosts && otherPosts.length > 0 && (
          <section className="pt-8 border-t border-[#eedad7] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-gray-900">
                More from The Journal
              </h3>
              <Link href="/blog" className="text-xs font-bold uppercase tracking-wider text-[#c9776c] hover:underline">
                View All Editions &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {otherPosts.map((op: BlogPost) => (
                <Link
                  key={op.slug}
                  href={`/blog/${op.slug}`}
                  className="group block rounded-2xl border border-[#eedad7] bg-white p-5 hover:shadow-md transition-all"
                >
                  <p className="text-[11px] text-gray-400 mb-1">{op.date}</p>
                  <h4 className="font-serif text-base font-semibold text-gray-900 group-hover:text-[#c9776c] transition-colors line-clamp-2">
                    {op.title}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-700 mt-3 group-hover:translate-x-1 transition-transform">
                    Read Story <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
