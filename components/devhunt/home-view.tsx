"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useAuth, SignUpButton } from "@clerk/nextjs";
import {
  Search,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  Users,
  Quote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/devhunt/product-card";
import {
  AccessibleField,
  fieldSelectClassName,
} from "@/components/ui/accessible-field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  isProductSort,
  PRODUCT_CATEGORIES,
  PRODUCT_SORTS,
  type HomeData,
  type HomeFilterState,
  type ProductListItem,
  type ProductSort,
} from "@/lib/devhunt";

const DEFAULT_SORT: ProductSort = "trending";

function readHomeFilters(
  searchParams: URLSearchParams,
): Required<HomeFilterState> {
  const sortParam = searchParams.get("sort");

  return {
    search: searchParams.get("search") ?? "",
    category: searchParams.get("category") ?? "",
    sort: sortParam && isProductSort(sortParam) ? sortParam : DEFAULT_SORT,
  };
}

function buildHref(pathname: string, filters: Required<HomeFilterState>) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.sort !== DEFAULT_SORT) {
    params.set("sort", filters.sort);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function HomeView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const urlFilters = useMemo(
    () => readHomeFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const [filters, setFilters] = useState(urlFilters);
  const deferredSearch = useDeferredValue(filters.search);
  const home = useQuery(api.products.home, {}) as HomeData | undefined;
  const products = useQuery(api.products.listProducts, {
    search: deferredSearch || undefined,
    category: filters.category || undefined,
    sort: filters.sort,
  }) as ProductListItem[] | undefined;

  useEffect(() => {
    setFilters(urlFilters);
  }, [urlFilters]);

  const updateFilters = (next: Partial<Required<HomeFilterState>>) => {
    const nextFilters = {
      ...filters,
      ...next,
    };

    setFilters(nextFilters);

    startTransition(() => {
      router.replace(buildHref(pathname, nextFilters), { scroll: false });
    });
  };

  if (!isSignedIn) {
    return <PremiumLandingPage />;
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="overflow-hidden border-none bg-[radial-gradient(circle_at_top_left,_rgba(48,120,255,0.18),_transparent_40%),linear-gradient(135deg,_oklch(0.985_0.01_240),_oklch(0.96_0.02_230))]">
          <CardContent className="flex flex-col gap-6 p-8 sm:p-10">
            <Badge className="w-fit border-primary/20 bg-primary/10 text-primary">
              Dev-first discovery
            </Badge>
            <div className="flex flex-col gap-4">
              <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                Discover tools built for developers, indie makers, and students.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                DevHunt helps you understand not just what a product does, but
                how it is built, who it is for, and why developers are excited
                about it.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [`${home?.stats.productCount ?? 0}`, "live launches"],
                [`${home?.stats.makerCount ?? 0}`, "active makers"],
                [`${home?.stats.categoryCount ?? 0}`, "categories covered"],
                [`${home?.stats.discussionCount ?? 0}`, "conversation points"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-[1.35rem] border border-border/60 bg-background/75 px-4 py-3"
                >
                  <p className="font-heading text-3xl tracking-[-0.04em]">
                    {value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 rounded-[28px] border border-border/60 bg-background/85 p-4 md:grid-cols-[1fr_220px_220px]">
              <AccessibleField
                id="home-search"
                label="Search products"
                srOnlyLabel
              >
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="home-search"
                    name="search"
                    type="search"
                    autoComplete="off"
                    className="pl-10"
                    placeholder="Search tools, categories, and taglines"
                    value={filters.search}
                    onChange={(event) => {
                      updateFilters({ search: event.target.value });
                    }}
                  />
                </div>
              </AccessibleField>

              <AccessibleField
                id="home-category"
                label="Filter by category"
                srOnlyLabel
              >
                <select
                  id="home-category"
                  name="category"
                  className={fieldSelectClassName}
                  value={filters.category}
                  onChange={(event) =>
                    updateFilters({ category: event.target.value })
                  }
                >
                  <option value="">All categories</option>
                  {PRODUCT_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </AccessibleField>

              <AccessibleField id="home-sort" label="Sort products" srOnlyLabel>
                <select
                  id="home-sort"
                  name="sort"
                  className={fieldSelectClassName}
                  value={filters.sort}
                  onChange={(event) =>
                    updateFilters({
                      sort: isProductSort(event.target.value)
                        ? event.target.value
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
              </AccessibleField>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-foreground text-background">
          <CardContent className="flex h-full flex-col justify-between gap-6 p-8">
            <div className="flex flex-col gap-3">
              <p className="text-sm uppercase tracking-[0.24em] text-background/70">
                Today on DevHunt
              </p>
              <h2 className="font-heading text-3xl font-semibold">
                Daily competition with a builder-friendly lens.
              </h2>
            </div>
            {home?.spotlight ? (
              <div className="rounded-[2rem] border border-white/12 bg-white/6 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-background/60">
                  Spotlight launch
                </p>
                <h3 className="mt-3 font-heading text-2xl tracking-[-0.03em]">
                  {home.spotlight.name}
                </h3>
                <p className="mt-2 text-sm leading-7 text-background/74">
                  {home.spotlight.tagline}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-background/72">
                  <span className="rounded-full border border-white/12 px-3 py-1">
                    {home.spotlight.category}
                  </span>
                  <span className="rounded-full border border-white/12 px-3 py-1">
                    {home.spotlight.votesCount} votes
                  </span>
                  <span className="rounded-full border border-white/12 px-3 py-1">
                    {home.spotlight.commentsCount} comments
                  </span>
                </div>
              </div>
            ) : null}
            <div className="grid gap-4 text-sm text-background/80">
              <div className="rounded-3xl border border-white/10 p-4">
                Top products reset every 24 hours to spotlight new launches.
              </div>
              <div className="rounded-3xl border border-white/10 p-4">
                Hidden Gems surfaces under-the-radar launches with strong
                engagement.
              </div>
              <div className="rounded-3xl border border-white/10 p-4">
                Builder tags make it easier to scan tools by practical fit, not
                just hype.
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-8 xl:grid-cols-3">
        {[
          ["Trending now", home?.trending ?? []],
          ["Newest launches", home?.newest ?? []],
          ["Hidden gems", home?.hiddenGems ?? []],
        ].map(([title, items]) => {
          const typedItems = items as ProductListItem[];

          return (
            <div key={String(title)} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl font-semibold">
                  {String(title)}
                </h2>
                <Badge>{typedItems.length} picks</Badge>
              </div>
              <div className="flex flex-col gap-4">
                {typedItems.slice(0, 3).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              Browse products
            </h2>
            <p className="text-sm text-muted-foreground">
              Explore the latest tools with filters tuned for developers and
              students.
            </p>
          </div>
          <Badge>{products?.length ?? 0} results</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(products ?? []).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
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
  {
    quote:
      "We got our first 100 users from DevHunt. The audience here actually understands and cares about developer tools.",
    author: "David Kim",
    role: "Solo Founder",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=David%20Kim",
  },
  {
    quote:
      "The editorial approach makes all the difference. You can actually learn about a product, not just see a landing page.",
    author: "Priya Sharma",
    role: "Developer Advocate",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Priya%20Sharma",
  },
  {
    quote:
      "This is where I go to find the next big thing in dev tools. The hidden gems section is worth its weight in gold.",
    author: "Alex Turner",
    role: "Engineering Lead",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Alex%20Turner",
  },
];

function PremiumLandingPage() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="-mx-4 -my-6 flex flex-col bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fafafa] to-[#f5f5f5] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 h-[800px] w-[800px] rounded-full bg-gradient-to-bl from-violet-100 via-purple-50 to-transparent opacity-60" />
          <div className="absolute -bottom-1/2 -left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-rose-100 via-pink-50 to-transparent opacity-50" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-sm text-black/70">
                <Sparkles className="size-4 text-amber-500" />
                <span>Editorial product discovery</span>
              </div>

              <h1 className="mt-6 font-heading text-5xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                Discover tools
                <br />
                <span className="text-violet-600">builders love</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
                DevHunt is where indie makers and developers discover the next
                generation of tools. Not just what ships, but why it matters.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <SignUpButton mode="modal">
                  <Button className="group bg-gray-900 text-white hover:bg-gray-800">
                    Start exploring
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </SignUpButton>
                <Button
                  variant="ghost"
                  className="text-gray-900 hover:bg-gray-100"
                >
                  View rankings
                </Button>
              </div>

              <div className="mt-12 flex items-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <span>14+ active makers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="size-4" />
                  <span>140+ launches</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="size-4" />
                  <span>50+ categories</span>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-violet-200 via-purple-100 to-rose-200 blur-2xl" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,white_100%)] opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full max-w-sm space-y-4 p-6">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="size-12 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-24 rounded bg-gray-200" />
                          <div className="h-2 w-32 rounded bg-gray-100" />
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <div className="h-3 w-3 rounded-full bg-amber-400" />
                          <span className="text-xs">{10 + i * 5}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-gray-100 bg-white/80 p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Trending in AI
                    </span>
                    <ArrowRight className="size-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Why makers choose DevHunt
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              A platform built for builders, by builders
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Editorial Curation",
                description:
                  "Every launch gets meaningful context. We help users understand not just what a tool does, but why it matters.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: Target,
                title: "Builder-First Focus",
                description:
                  "Tags that actually help you find what you need. Filter by skill level, tech stack, and use case.",
                color: "bg-violet-50 text-violet-600",
              },
              {
                icon: Zap,
                title: "Real Engagement",
                description:
                  "No bots, no fake votes. Connect with developers who genuinely care about what you're building.",
                color: "bg-rose-50 text-rose-600",
              },
              {
                icon: Users,
                title: "Community Driven",
                description:
                  "Join discussions with makers who get it. Share feedback, iterate together, and grow your audience.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: ArrowRight,
                title: "Launch Momentum",
                description:
                  "Daily rankings give every new product a fair shot. Your launch day is just the beginning.",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: Quote,
                title: "Meaningful Stories",
                description:
                  "Beyond features and pricing. Learn the backstory, the problem solved, and the vision behind each launch.",
                color: "bg-orange-50 text-orange-600",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-8 transition-all hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100"
                >
                  <div className="relative">
                    <div
                      className={`inline-flex size-12 items-center justify-center rounded-xl ${feature.color}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-6 font-heading text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gray-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-gray-200 p-4">
              <Quote className="size-8 text-gray-400" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-violet-100 via-purple-100 to-rose-100 blur-2xl" />
            <div className="relative">
              <blockquote className="font-heading text-2xl font-medium leading-relaxed text-gray-900 sm:text-3xl">
                &ldquo;{testimonials[testimonialIndex].quote}&rdquo;
              </blockquote>

              <div className="mt-8 flex items-center justify-center gap-4">
                <img
                  src={testimonials[testimonialIndex].avatar}
                  alt={testimonials[testimonialIndex].author}
                  width={48}
                  height={48}
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
                <button
                  onClick={prevTestimonial}
                  className="rounded-full border border-gray-200 bg-white p-2 text-gray-400 transition-all hover:border-gray-300 hover:text-gray-600"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <div className="flex gap-2">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTestimonialIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === testimonialIndex
                          ? "w-8 bg-gray-900"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to testimonial ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTestimonial}
                  className="rounded-full border border-gray-200 bg-white p-2 text-gray-400 transition-all hover:border-gray-300 hover:text-gray-600"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-violet-100 via-purple-50 to-rose-100 opacity-50 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Ready to discover
            <br />
            <span className="text-violet-600">what&apos;s next?</span>
          </h2>

          <p className="mt-6 text-lg text-gray-500">
            Join thousands of developers and makers who trust DevHunt for
            finding the best tools and getting their own discoveries seen.
          </p>

          <div className="mt-10">
            <SignUpButton mode="modal">
              <Button className="group bg-gray-900 text-white hover:bg-gray-800">
                Get started free
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </SignUpButton>
          </div>

          <p className="mt-6 text-sm text-gray-400">
            No credit card required. Free forever plan available.
          </p>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-[1.35rem] border border-gray-200 bg-gray-900 text-sm font-bold tracking-[0.24em] text-white">
                  DH
                </div>
                <div className="flex flex-col">
                  <span className="font-heading text-xl font-semibold tracking-[-0.04em] text-gray-900">
                    DevHunt
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-gray-400">
                    Editorial launches for builders
                  </span>
                </div>
              </div>

              <p className="mt-6 max-w-sm text-sm leading-relaxed text-gray-500">
                The premier destination for discovering and sharing developer
                tools. Built by makers, for makers.
              </p>

              <div className="mt-8 flex gap-4">
                {["Twitter", "GitHub", "Discord"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-900">
                Platform
              </h4>
              <ul className="mt-6 space-y-3">
                {[
                  "Discover",
                  "Rankings",
                  "Submit Product",
                  "Pricing",
                  "API",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-900">
                Resources
              </h4>
              <ul className="mt-6 space-y-3">
                {[
                  "Blog",
                  "Newsletter",
                  "Maker Stories",
                  "Documentation",
                  "Support",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 text-sm text-gray-400 sm:flex-row">
            <p>© 2026 DevHunt. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-900 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
