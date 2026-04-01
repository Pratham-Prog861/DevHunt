"use client";

import { useQuery } from "convex/react";
import { Bookmark, ArrowRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/devhunt/product-card";
import { Badge } from "@/components/ui/badge";
import { type CollectionItem, type HomeData } from "@/lib/devhunt";
import Link from "next/link";

export default function CollectionsPage() {
  const products = useQuery(api.social.collections, {}) as
    | CollectionItem[]
    | undefined;
  const home = useQuery(api.products.home, {}) as HomeData | undefined;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="hero-title">Saved Products</h1>
          <p className="text-gray-600">
            Your personal collection of products to revisit.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Your Collection</h2>
          <Badge>{products?.length ?? 0} saved</Badge>
        </div>

        {products && products.length > 0 ? (
          <div className="flex flex-col gap-2">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="ph-card p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Bookmark className="size-6 text-gray-400" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900">
                Nothing saved yet
              </h3>
              <p className="mt-2 max-w-md text-gray-600">
                Bookmark products from the homepage or leaderboard to create
                your personal collection.
              </p>
              <Link href="/" className="mt-4 ph-btn-primary">
                <ArrowRight className="size-4" />
                Discover products
              </Link>
            </div>
          </div>
        )}

        {(!products || products.length === 0) &&
          (home?.trending?.length ?? 0) > 0 && (
            <div className="mt-4">
              <h3 className="section-title mb-4">Start with popular picks</h3>
              <div className="flex flex-col gap-2">
                {home?.trending.slice(0, 5).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}
      </section>
    </div>
  );
}
