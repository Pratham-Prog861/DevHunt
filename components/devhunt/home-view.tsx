"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useAuth, SignUpButton } from "@clerk/nextjs";
import {
  Search,
  Sparkles,
  Users,
  Zap,
  Target,
  Flame,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/devhunt/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isProductSort,
  PRODUCT_CATEGORIES,
  PRODUCT_SORTS,
  type HomeData,
  type HomeFilterState,
  type ProductListItem,
  type ProductSort,
} from "@/lib/devhunt";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_SORT: ProductSort = "trending";

export function HomeView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();

  const getInitialFilters = () => {
    const sortParam = searchParams.get("sort");
    return {
      search: searchParams.get("search") ?? "",
      category: searchParams.get("category") ?? "",
      sort: sortParam && isProductSort(sortParam) ? sortParam : DEFAULT_SORT,
    };
  };

  const [filters, setFilters] =
    useState<Required<HomeFilterState>>(getInitialFilters);
  const home = useQuery(api.products.home, {}) as HomeData | undefined;
  const products = useQuery(api.products.listProducts, {
    search: filters.search || undefined,
    category: filters.category || undefined,
    sort: filters.sort,
  }) as ProductListItem[] | undefined;

  const updateFilters = (next: Partial<Required<HomeFilterState>>) => {
    const nextFilters = { ...filters, ...next };
    setFilters(nextFilters);
    const params = new URLSearchParams();
    if (nextFilters.search) params.set("search", nextFilters.search);
    if (nextFilters.category) params.set("category", nextFilters.category);
    if (nextFilters.sort !== DEFAULT_SORT) params.set("sort", nextFilters.sort);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  if (!isSignedIn) {
    return <PremiumLandingPage />;
  }

  const sortedProducts = (products ?? []).sort(
    (a, b) => b.votesCount - a.votesCount,
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="hero-title">Top Products Launching Today</h1>
          <p className="text-gray-600">
            Discover the best new products in tech, ranked by votes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          <select
            className="ph-select"
            value={filters.category}
            onChange={(e) => updateFilters({ category: e.target.value })}
          >
            <option value="">All categories</option>
            {PRODUCT_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className="ph-select"
            value={filters.sort}
            onChange={(e) =>
              updateFilters({
                sort: isProductSort(e.target.value)
                  ? e.target.value
                  : DEFAULT_SORT,
              })
            }
          >
            {PRODUCT_SORTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <section className="flex flex-col gap-3">
          {sortedProducts.length > 0 ? (
            sortedProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                showRank={index + 1}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-gray-500">No products found.</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your filters or check back later.
              </p>
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <div className="ph-card p-4">
            <p className="eyebrow mb-3">Quick stats</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-2xl font-semibold text-gray-900">
                  {home?.stats.productCount ?? 0}
                </p>
                <p className="text-xs text-gray-500">Total products</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-2xl font-semibold text-gray-900">
                  {home?.stats.makerCount ?? 0}
                </p>
                <p className="text-xs text-gray-500">Makers</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-2xl font-semibold text-gray-900">
                  {home?.stats.categoryCount ?? 0}
                </p>
                <p className="text-xs text-gray-500">Categories</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-2xl font-semibold text-gray-900">
                  {home?.stats.discussionCount ?? 0}
                </p>
                <p className="text-xs text-gray-500">Discussions</p>
              </div>
            </div>
          </div>

          {home?.spotlight && (
            <div className="ph-card p-4">
              <p className="eyebrow mb-3">Featured</p>
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-gray-900">
                  {home.spotlight.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {home.spotlight.tagline}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="ph-badge">{home.spotlight.category}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs font-semibold text-primary">
                    {home.spotlight.votesCount} votes
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="ph-card p-4">
            <p className="eyebrow mb-3">Categories</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.slice(0, 8).map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateFilters({ category: cat, search: "" })}
                  className={`ph-badge hover:bg-gray-100 ${filters.category === cat ? "bg-gray-200 font-medium" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const testimonials = [
  {
    quote:
      "DevHunt helped us find tools we'd never discover on our own. It's become our weekly ritual for staying ahead.",
    author: "Sarah Chen",
    role: "CTO at Reflect",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Sarah%20Chen",
  },
  {
    quote:
      "The quality of launches here is unmatched. Every tool feels carefully curated rather than algorithmically dumped.",
    author: "Marcus Johnson",
    role: "Indie Hacker",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Marcus%20Johnson",
  },
  {
    quote:
      "Finally, a place where makers actually ship and get discovered. The community here gets what building is about.",
    author: "Elena Rodriguez",
    role: "Founder at LaunchPad",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Elena%20Rodriguez",
  },
];

function PremiumLandingPage() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-content > *",
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.3,
        },
      );

      gsap.fromTo(
        ".hero-visual",
        { opacity: 0, x: 80, rotate: 5 },
        {
          opacity: 1,
          x: 0,
          rotate: 0,
          duration: 1.2,
          ease: "power3.out",
          delay: 0.8,
        },
      );

      gsap.fromTo(
        ".stat-item",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
          },
        },
      );

      gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 60, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 75%",
          },
        },
      );

      gsap.fromTo(
        ".how-it-works-step",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: howItWorksRef.current,
            start: "top 70%",
          },
        },
      );

      gsap.fromTo(
        ".cta-content > *",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 75%",
          },
        },
      );

      gsap.to(".floating-badge", {
        y: -15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.3,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="-mx-4 -my-6 flex flex-col bg-white overflow-x-hidden">
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-gray-100 px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 h-[800px] w-[800px] rounded-full bg-gradient-to-bl from-orange-100 via-amber-50 to-transparent opacity-60" />
          <div className="absolute -bottom-1/2 -left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-orange-100 via-amber-50 to-transparent opacity-50" />
        </div>

        <div className="ph-container relative">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="hero-content flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm text-orange-700 floating-badge">
                <Sparkles className="size-4 text-orange-500" />
                <span>Discover new products daily</span>
              </div>

              <h1 className="mt-6 font-heading text-5xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                The best new
                <br />
                <span className="text-orange-600">products in tech</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
                DevHunt is where makers launch and users discover the next
                generation of developer tools.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <SignUpButton mode="modal">
                  <Button className="bg-gray-900 text-white hover:bg-gray-800 group-hover:scale-105 transition-transform">
                    Get started free
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </SignUpButton>
                <Link href="/leaderboard">
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    View rankings
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <span>Active makers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="size-4" />
                  <span>Products launched</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="size-4" />
                  <span>Categories</span>
                </div>
              </div>
            </div>

            <div className="hero-visual relative hidden lg:block">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-orange-200 via-amber-100 to-orange-200 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="size-12 shrink-0 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 rounded bg-gray-300" />
                        <div className="h-2 w-32 rounded bg-gray-200" />
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <TrendingUp className="size-3.5 text-orange-500" />
                        <span className="text-sm font-semibold">
                          {10 + i * 5}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Trending today
                    </span>
                    <ArrowRight className="size-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={featuresRef}
        className="bg-white px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="ph-container">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Why makers choose DevHunt
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              A platform built for builders, by builders
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Editorial Curation",
                description:
                  "Every launch gets meaningful context to help users understand what matters.",
              },
              {
                icon: Target,
                title: "Builder-First Focus",
                description:
                  "Filter by skill level, tech stack, and use case to find exactly what you need.",
              },
              {
                icon: Zap,
                title: "Real Engagement",
                description:
                  "Connect with developers who genuinely care about what you're building.",
              },
              {
                icon: Users,
                title: "Community Driven",
                description:
                  "Join discussions with makers who get it. Share feedback and iterate together.",
              },
              {
                icon: Flame,
                title: "Launch Momentum",
                description:
                  "Daily rankings give every new product a fair shot at visibility.",
              },
              {
                icon: TrendingUp,
                title: "Meaningful Stories",
                description:
                  "Learn the backstory, the problem solved, and the vision behind each launch.",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="feature-card group ph-card ph-card-hover p-6 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 mb-4">
                    <Icon className="size-5 text-orange-600" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        ref={statsRef}
        className="relative overflow-hidden bg-gray-900 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        </div>
        <div className="ph-container relative">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "12K+", label: "Active Makers" },
              { value: "5,000+", label: "Products Launched" },
              { value: "50+", label: "Categories" },
              { value: "100K+", label: "Developers" },
            ].map((stat) => (
              <div key={stat.label} className="stat-item text-center">
                <div className="font-heading text-4xl sm:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={howItWorksRef}
        className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="ph-container">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              How DevHunt works
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Discover, vote, and launch developer products
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Discover",
                description:
                  "Browse curated launches across categories. Filter by tech stack, pricing, and more.",
              },
              {
                step: "02",
                title: "Vote & Discuss",
                description:
                  "Support products you love with votes. Join discussions with makers and users.",
              },
              {
                step: "03",
                title: "Launch Your Own",
                description:
                  "Submit your product and get discovered by thousands of active developers.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="how-it-works-step relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-3 text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="ph-container max-w-3xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-gray-200 p-4">
              <Sparkles className="size-8 text-gray-400" />
            </div>
          </div>

          <blockquote className="font-heading text-2xl font-medium leading-relaxed text-gray-900 sm:text-3xl">
            &ldquo;{testimonials[testimonialIndex].quote}&rdquo;
          </blockquote>

          <div className="mt-8 flex items-center justify-center gap-4">
            <img
              src={testimonials[testimonialIndex].avatar}
              alt={testimonials[testimonialIndex].author}
              className="size-12 rounded-full border border-gray-200"
            />
            <div className="text-left">
              <div className="font-medium text-gray-900">
                {testimonials[testimonialIndex].author}
              </div>
              <div className="text-sm text-gray-500">
                {testimonials[testimonialIndex].role}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setTestimonialIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === testimonialIndex
                    ? "w-8 bg-gray-900"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        ref={ctaRef}
        className="cta-content relative overflow-hidden bg-gradient-to-b from-white to-gray-50 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />
        </div>
        <div className="ph-container max-w-2xl text-center relative">
          <h2 className="font-heading text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Ready to discover
            <br />
            <span className="text-orange-600">what&apos;s next?</span>
          </h2>

          <p className="mt-6 text-lg text-gray-500">
            Join thousands of developers and makers who trust DevHunt for
            finding the best tools.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <SignUpButton mode="modal">
              <Button className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 text-base">
                Get started free
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </SignUpButton>
            <Link href="/leaderboard">
              <Button
                variant="outline"
                className="px-8 py-3 text-base border-gray-300 hover:border-orange-500 hover:text-orange-600"
              >
                Explore products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="ph-container">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white text-sm font-bold">
                DH
              </div>
              <span className="font-heading text-lg font-semibold text-gray-900">
                DevHunt
              </span>
            </div>

            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900">
                About
              </a>
              <a href="#" className="hover:text-gray-900">
                Terms
              </a>
              <a href="#" className="hover:text-gray-900">
                Privacy
              </a>
            </div>

            <p className="text-sm text-gray-400">
              © 2026 DevHunt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
