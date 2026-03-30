"use client";

import { useQuery } from "convex/react";
import { Bookmark } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/devhunt/product-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type CollectionItem, type HomeData } from "@/lib/devhunt";

export default function CollectionsPage() {
  const products = useQuery(api.social.collections, {}) as CollectionItem[] | undefined;
  const home = useQuery(api.products.home, {}) as HomeData | undefined;

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="editorial-panel">
          <CardContent className="flex flex-col gap-5 p-7 md:p-8">
            <Badge className="w-fit">Private watchlist</Badge>
            <div className="flex flex-col gap-4">
              <h1 className="hero-title max-w-4xl text-[clamp(2.8rem,7vw,4.6rem)]">
                Saved products become your builder reading list.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                Keep launches you want to revisit, compare, or steal inspiration from.
                This space is designed to feel like a curated backlog, not a forgotten
                bookmarks folder.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="editorial-panel">
          <CardContent className="flex h-full flex-col justify-between gap-6 p-7">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-[1.5rem] bg-primary/12 text-primary">
                <Bookmark aria-hidden="true" className="size-6" />
              </div>
              <div>
                <p className="eyebrow">Queue size</p>
                <p className="mt-2 font-heading text-4xl tracking-[-0.04em]">
                  {products?.length ?? 0}
                </p>
              </div>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              Saved products are ideal for building a comparison set before your next
              launch, sprint, or side project weekend.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Your collection</p>
            <h2 className="section-title mt-3">Saved launches</h2>
          </div>
          <Badge>{products?.length ?? 0} saved</Badge>
        </div>

        {products && products.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <Card className="editorial-panel">
              <CardContent className="flex flex-col items-start gap-3 p-8">
                <p className="eyebrow">Nothing saved yet</p>
                <h3 className="font-heading text-3xl tracking-[-0.04em]">
                  Start building your launch shortlist.
                </h3>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Bookmark products from the homepage or leaderboard to create a personal
                  stack of ideas, references, and competitors.
                </p>
              </CardContent>
            </Card>

            {(home?.trending?.length ?? 0) > 0 ? (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="eyebrow">Editorial picks</p>
                  <h3 className="mt-3 font-heading text-3xl tracking-[-0.04em]">
                    Start with the launches people are already discussing.
                  </h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {home?.trending.slice(0, 3).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
