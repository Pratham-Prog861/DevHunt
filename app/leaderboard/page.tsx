"use client";

import { useQuery } from "convex/react";
import { Trophy } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/devhunt/product-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type LeaderboardData, type ProductListItem } from "@/lib/devhunt";

export default function LeaderboardPage() {
  const leaderboard = useQuery(api.products.leaderboard, {}) as LeaderboardData | undefined;

  return (
    <div className="flex flex-col gap-8 lg:gap-12">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-none bg-[linear-gradient(135deg,rgba(24,24,36,0.96),rgba(34,43,86,0.94)_58%,rgba(179,146,63,0.7)_160%)] text-white">
          <CardContent className="flex flex-col gap-6 p-7 md:p-10">
            <Badge className="w-fit border-white/20 bg-white/10 text-white">
              Competitive signal
            </Badge>
            <div className="flex flex-col gap-4">
              <h1 className="hero-title max-w-4xl text-white">
                Daily launches and weekly winners, ranked with a builder-friendly eye.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/75">
                The leaderboard rewards clear positioning, thoughtful maker context,
                and developer response. It is less about raw hype and more about
                whether a launch earns real attention.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="editorial-panel">
          <CardContent className="grid h-full gap-4 p-7">
            <div className="rounded-[1.6rem] border border-border/70 bg-background/75 p-5">
              <p className="eyebrow">Daily board</p>
              <p className="mt-3 font-heading text-4xl tracking-[-0.04em]">
                {leaderboard?.daily?.length ?? 0}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                products competing in today&apos;s cycle.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-border/70 bg-foreground p-5 text-background">
              <p className="eyebrow text-background/55">Weekly board</p>
              <p className="mt-3 font-heading text-4xl tracking-[-0.04em]">
                {leaderboard?.weekly?.length ?? 0}
              </p>
              <p className="mt-2 text-sm text-background/74">
                launches that kept momentum over multiple days.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        {[
          {
            title: "Top Products of the Day",
            items: leaderboard?.daily ?? [],
            description: "Products winning the current launch cycle.",
          },
          {
            title: "Top Products of the Week",
            items: leaderboard?.weekly ?? [],
            description: "The strongest sustained performers of the week.",
          },
        ].map(({ title, items, description }) => (
          <section key={title} className="flex flex-col gap-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Ranked list</p>
                <h2 className="section-title mt-3">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
              <Badge>{items.length} ranked</Badge>
            </div>
            <div className="flex flex-col gap-4">
              {items.map((product: ProductListItem, index) => (
                <div key={product._id} className="grid gap-4 md:grid-cols-[96px_1fr]">
                  <Card className="editorial-panel">
                    <CardContent className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <Trophy aria-hidden="true" className="size-5" />
                      </div>
                      <div>
                        <p className="eyebrow">Rank</p>
                        <p className="mt-2 font-heading text-3xl tracking-[-0.04em]">
                          #{index + 1}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
