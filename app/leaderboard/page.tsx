"use client";

import { useQuery } from "convex/react";
import { Trophy, Flame, TrendingUp } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/devhunt/product-card";
import { Badge } from "@/components/ui/badge";
import { type LeaderboardData, type ProductListItem } from "@/lib/devhunt";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const timeFilters = [
  { key: "today", label: "Today", href: "/leaderboard" },
  { key: "yesterday", label: "Yesterday", href: "/leaderboard?time=yesterday" },
  { key: "thisWeek", label: "This week", href: "/leaderboard?time=thisWeek" },
  {
    key: "thisMonth",
    label: "This month",
    href: "/leaderboard?time=thisMonth",
  },
  { key: "thisYear", label: "This year", href: "/leaderboard?time=thisYear" },
];

export default function LeaderboardPage() {
  const searchParams = useSearchParams();
  const timeFilter = searchParams.get("time") || "today";

  const leaderboard = useQuery(api.products.leaderboard, {
    timeFilter: timeFilter as
      | "today"
      | "yesterday"
      | "thisWeek"
      | "thisMonth"
      | "thisYear",
  }) as LeaderboardData | undefined;

  const activeFilter =
    timeFilters.find((f) => f.key === timeFilter) || timeFilters[0];

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="hero-title">Launches</h1>
          <p className="text-gray-600">Daily and weekly product rankings.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {timeFilters.map((filter) => (
            <Link
              key={filter.key}
              href={filter.href}
              className={`ph-btn-${filter.key === timeFilter ? "secondary" : "ghost"}`}
            >
              <Flame className="size-4" />
              {filter.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Top Products {activeFilter.label}</h2>
            <Badge>{leaderboard?.daily?.length ?? 0} products</Badge>
          </div>

          <div className="flex flex-col gap-2">
            {leaderboard?.daily?.length ? (
              leaderboard.daily.map((product: ProductListItem, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  showRank={index + 1}
                />
              ))
            ) : (
              <div className="ph-card p-8 text-center">
                <p className="text-gray-500">
                  No products launched in this period yet.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Check back later for updates.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="ph-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="size-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">
                {activeFilter.label}&apos;s Competition
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-2xl font-semibold text-gray-900">
                  {leaderboard?.daily?.length ?? 0}
                </p>
                <p className="text-xs text-gray-500">
                  products {activeFilter.label.toLowerCase()}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-2xl font-semibold text-gray-900">
                  {leaderboard?.weekly?.length ?? 0}
                </p>
                <p className="text-xs text-gray-500">this week</p>
              </div>
            </div>
          </div>

          <div className="ph-card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              How rankings work
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <TrendingUp className="size-4 text-primary mt-0.5 shrink-0" />
                Products are ranked by votes
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="size-4 text-primary mt-0.5 shrink-0" />
                Top products reset daily
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="size-4 text-primary mt-0.5 shrink-0" />
                Weekly winners show sustained engagement
              </li>
            </ul>
          </div>

          <div className="ph-card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              This Week&apos;s Top
            </h3>
            <div className="flex flex-col gap-2">
              {leaderboard?.weekly
                ?.slice(0, 3)
                .map((product: ProductListItem, index) => (
                  <Link
                    key={product._id}
                    href={`/products/${product.slug}`}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                  >
                    <span className="text-lg font-semibold text-gray-400">
                      #{index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.votesCount} votes
                      </p>
                    </div>
                  </Link>
                ))}
              {(!leaderboard?.weekly || leaderboard.weekly.length === 0) && (
                <p className="text-sm text-gray-500">No weekly data yet.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
