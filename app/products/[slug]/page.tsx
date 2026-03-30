"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import {
  ArrowUpRight,
  Bookmark,
  ExternalLink,
  Play,
  TrendingUp,
} from "lucide-react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CommentThread } from "@/components/devhunt/comment-thread";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/devhunt";
import { type ProductDetail } from "@/lib/devhunt";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { isSignedIn } = useAuth();
  const product = useQuery(api.products.getProduct, { slug }) as
    | ProductDetail
    | null
    | undefined;
  const voteProduct = useMutation(api.social.voteProduct);
  const toggleBookmark = useMutation(api.social.toggleBookmark);

  if (product === null) {
    return (
      <div className="text-sm text-muted-foreground">Product not found.</div>
    );
  }

  if (!product) {
    return (
      <div className="text-sm text-muted-foreground">Loading product…</div>
    );
  }

  const actionCluster = (
    <div className="flex flex-wrap gap-3">
      <Button
        variant={product.viewerHasVoted ? "secondary" : "default"}
        className="gap-2"
        onClick={() => void voteProduct({ productId: product._id })}
      >
        <TrendingUp aria-hidden="true" className="size-4" />
        Upvote ({product.votesCount})
      </Button>
      <Button
        variant={product.viewerHasBookmarked ? "secondary" : "outline"}
        className="gap-2"
        onClick={() => void toggleBookmark({ productId: product._id })}
      >
        <Bookmark aria-hidden="true" className="size-4" />
        Save
      </Button>
      <a
        href={product.websiteUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border/80 bg-background/80 px-5 text-sm font-semibold tracking-[-0.01em] text-foreground backdrop-blur-sm hover:-translate-y-0.5 hover:bg-accent"
      >
        <ExternalLink aria-hidden="true" className="size-4" />
        Visit website
      </a>
    </div>
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
      <div className="flex flex-col gap-8">
        <Card className="overflow-hidden border-none bg-[linear-gradient(135deg,rgba(18,27,57,0.98),rgba(41,52,116,0.95)_55%,rgba(187,152,66,0.72)_170%)] text-white">
          <CardContent className="flex flex-col gap-8 p-7 md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex min-w-0 items-start gap-5">
                <div className="flex size-[5.5rem] shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 text-2xl font-semibold uppercase tracking-[0.14em] text-white">
                  {product.logoUrl ? (
                    <Image
                      src={product.logoUrl}
                      alt={product.name}
                      width={88}
                      height={88}
                      priority
                      className="size-[5.5rem] rounded-[2rem] object-cover"
                    />
                  ) : (
                    product.name.slice(0, 2)
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="border-white/15 bg-white/10 text-white">
                      {product.category}
                    </Badge>
                    {product.isBeginnerFriendly && (
                      <Badge className="border-white/15 bg-white/10 text-white">
                        Beginner-friendly
                      </Badge>
                    )}
                    {product.isOpenSource && (
                      <Badge className="border-white/15 bg-white/10 text-white">
                        Open source
                      </Badge>
                    )}
                    {product.isFree && (
                      <Badge className="border-white/15 bg-white/10 text-white">
                        Free
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h1 className="hero-title max-w-4xl text-white">
                      {product.name}
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-white/76">
                      {product.tagline}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="max-w-4xl text-sm leading-8 text-white/75 md:text-base">
              {product.description}
            </p>

            {isSignedIn ? (
              actionCluster
            ) : (
              <SignInButton mode="modal">{actionCluster}</SignInButton>
            )}
          </CardContent>
        </Card>

        {product.galleryUrls?.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2">
            {product.galleryUrls.filter(Boolean).map((url, index) => (
              <Card
                key={url as string}
                className={index === 0 ? "md:col-span-2" : ""}
              >
                <CardContent className="p-2.5">
                  <Image
                    src={url as string}
                    alt={`${product.name} screenshot ${index + 1}`}
                    width={1600}
                    height={index === 0 ? 960 : 768}
                    className={`w-full rounded-[1.5rem] border border-border/60 object-cover ${
                      index === 0 ? "h-[24rem]" : "h-64"
                    }`}
                  />
                </CardContent>
              </Card>
            ))}
          </section>
        ) : null}

        <CommentThread productId={product._id} />
      </div>

      <div className="flex flex-col gap-6">
        <Card className="editorial-panel">
          <CardContent className="flex flex-col gap-5 p-7">
            <div>
              <p className="eyebrow">Launch overview</p>
              <h2 className="mt-3 font-heading text-3xl tracking-[-0.04em]">
                Product snapshot
              </h2>
            </div>
            <div className="grid gap-4">
              {[
                ["Maker", product.submitter?.name ?? "Unknown"],
                [
                  "Maker role",
                  product.submitter?.headline ?? "Independent builder",
                ],
                [
                  "Launched",
                  formatRelativeDate(
                    product.launchTime ?? product._creationTime,
                  ),
                ],
                ["Votes", product.votesCount],
                ["Comments", product.commentsCount],
                ["Bookmarks", product.bookmarksCount],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-border/70 bg-background/70 px-4 py-3"
                >
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="font-semibold tracking-[-0.02em] text-foreground">
                    {label === "Maker" ? (
                      <Link
                        href={`/u/${product.submitter?.username ?? product.submitter?._id}`}
                        className="hover:text-primary"
                      >
                        {value}
                      </Link>
                    ) : (
                      value
                    )}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href={`/u/${product.submitter?.username ?? product.submitter?._id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              View maker profile
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </CardContent>
        </Card>

        {product.demoUrl ? (
          <Card className="editorial-panel">
            <CardContent className="flex flex-col gap-4 p-7">
              <p className="eyebrow">Live demo</p>
              <h2 className="font-heading text-3xl tracking-[-0.04em]">
                Try the experience directly.
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                Open the demo to get a first-hand sense of the workflow before
                diving deeper into the product.
              </p>
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background hover:-translate-y-0.5"
              >
                <Play aria-hidden="true" className="size-4" />
                Open live demo
              </a>
            </CardContent>
          </Card>
        ) : null}

        {product.submitter?.headline ? (
          <Card className="editorial-panel">
            <CardContent className="flex flex-col gap-4 p-7">
              <p className="eyebrow">Builder context</p>
              <h2 className="font-heading text-3xl tracking-[-0.04em]">
                Built by {product.submitter.name}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {product.submitter.headline}. DevHunt surfaces maker context
                alongside launch metrics so products read like real companies,
                not anonymous cards.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
