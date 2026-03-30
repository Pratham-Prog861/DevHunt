"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Bookmark, MessageSquare, Sparkles, TrendingUp } from "lucide-react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate, type ProductListItem } from "@/lib/devhunt";

export function ProductCard({ product }: { product: ProductListItem }) {
  const { isSignedIn } = useAuth();
  const voteProduct = useMutation(api.social.voteProduct);
  const toggleBookmark = useMutation(api.social.toggleBookmark);

  const actionButtons = (
    <div className="flex items-center gap-2">
      <Button
        variant={product.viewerHasVoted ? "secondary" : "outline"}
        className="h-10 gap-2 px-3.5"
        onClick={() => void voteProduct({ productId: product._id })}
      >
        <TrendingUp aria-hidden="true" className="size-4" />
        {product.votesCount}
      </Button>
      <Button
        variant={product.viewerHasBookmarked ? "secondary" : "ghost"}
        className="h-10 w-10 rounded-full px-0"
        aria-label={
          product.viewerHasBookmarked
            ? `Remove ${product.name} from saved products`
            : `Save ${product.name}`
        }
        onClick={() => void toggleBookmark({ productId: product._id })}
      >
        <Bookmark aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );

  return (
    <Card className="hover-rise h-full overflow-hidden border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.55))]">
      <CardHeader className="gap-5 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-[3.75rem] shrink-0 items-center justify-center rounded-[1.6rem] border border-border/70 bg-secondary text-base font-semibold uppercase tracking-[0.14em] text-secondary-foreground">
              {product.logoUrl ? (
                <Image
                  src={product.logoUrl}
                  alt={product.name}
                  width={60}
                  height={60}
                  className="size-[3.75rem] rounded-[1.5rem] object-cover"
                />
              ) : (
                product.name.slice(0, 2)
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{product.category}</Badge>
                {product.isBeginnerFriendly && <Badge>Beginner-friendly</Badge>}
                {product.isOpenSource && <Badge>Open source</Badge>}
                {product.isFree && <Badge>Free</Badge>}
              </div>
              <Link href={`/products/${product.slug}`} className="group">
                <CardTitle className="text-2xl group-hover:text-primary">{product.name}</CardTitle>
              </Link>
              <CardDescription className="max-w-xl text-[0.98rem]">
                {product.tagline}
              </CardDescription>
            </div>
          </div>
          {isSignedIn ? <div className="hidden sm:block">{actionButtons}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-5">
        <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
          {product.description}
        </p>

        <div className="grid gap-3 rounded-[1.6rem] border border-border/70 bg-background/65 p-4 sm:grid-cols-3">
          <div>
            <p className="eyebrow">Maker</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {product.submitter?.name ?? "Unknown maker"}
            </p>
          </div>
          <div>
            <p className="eyebrow">Launched</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {formatRelativeDate(product.launchTime ?? product._creationTime)}
            </p>
          </div>
          <div>
            <p className="eyebrow">Signal</p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm font-medium text-foreground">
              <span className="inline-flex items-center gap-1.5">
                <TrendingUp aria-hidden="true" className="size-4 text-primary" />
                {product.votesCount}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare aria-hidden="true" className="size-4 text-primary" />
                {product.commentsCount}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles aria-hidden="true" className="size-4 text-primary" />
                {product.bookmarksCount}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
          >
            Read launch notes
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
          {isSignedIn ? (
            <div className="sm:hidden">{actionButtons}</div>
          ) : (
            <SignInButton mode="modal">{actionButtons}</SignInButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
