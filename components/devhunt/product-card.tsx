"use client";

import { memo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { type ProductListItem } from "@/lib/devhunt";

function ProductCardInner({
  product,
  showRank,
}: {
  product: ProductListItem;
  showRank?: number;
}) {
  const { isSignedIn } = useAuth();
  const voteProduct = useMutation(api.social.voteProduct);

  const [isVoted, setIsVoted] = useState(product.viewerHasVoted);
  const [votesCount, setVotesCount] = useState(product.votesCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleVote = async () => {
    setIsAnimating(true);
    const wasVoted = isVoted;
    setIsVoted(!wasVoted);
    setVotesCount((prev) => (wasVoted ? prev - 1 : prev + 1));

    try {
      await voteProduct({ productId: product._id });
    } catch {
      setIsVoted(wasVoted);
      setVotesCount((prev) => (wasVoted ? prev + 1 : prev - 1));
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="group flex items-start gap-4 rounded-lg border border-gray-100 p-3 transition-colors hover:border-gray-200 hover:bg-gray-50">
      {showRank && (
        <div className="product-rank w-6 shrink-0 text-center">{showRank}</div>
      )}

      <Link href={`/products/${product.slug}`} className="shrink-0">
        <div className="ph-product-thumb flex items-center justify-center overflow-hidden">
          {product.logoUrl ? (
            <Image
              src={product.logoUrl}
              alt={product.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-lg font-semibold uppercase text-gray-400">
              {product.name.slice(0, 2)}
            </span>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="product-name truncate">{product.name}</h3>
        </Link>
        <p className="product-tagline mt-0.5 truncate">{product.tagline}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
          <span className="topic-tag">{product.category}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <span className="font-semibold text-primary">{votesCount}</span>{" "}
            votes
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            {product.commentsCount}
          </span>
        </div>
      </div>

      {isSignedIn && (
        <div className="flex shrink-0 gap-1">
          <Button
            variant={isVoted ? "default" : "outline"}
            className={`h-8 w-8 rounded-full p-0 transition-all duration-150 ${
              isVoted
                ? "bg-primary hover:bg-primary/90"
                : "hover:border-primary hover:text-primary"
            } ${isAnimating ? "scale-125" : ""}`}
            onClick={handleVote}
          >
            <div className="flex items-center justify-center w-full h-full">
              <Plus
                className={`size-4 transition-transform duration-150 ${
                  isVoted ? "text-white" : "text-gray-500"
                } ${isAnimating ? "scale-125" : ""}`}
              />
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}

export const ProductCard = memo(ProductCardInner);

export function ProductCardList({ products }: { products: ProductListItem[] }) {
  return (
    <div className="flex flex-col">
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} showRank={index + 1} />
      ))}
    </div>
  );
}
