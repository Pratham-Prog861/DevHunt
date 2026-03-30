import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { DAY_IN_MS, PRODUCT_CATEGORIES } from "./constants";

type Ctx = QueryCtx | MutationCtx;

export function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function getDateKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function getWeekKey(timestamp: number) {
  const date = new Date(timestamp);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / DAY_IN_MS + 1) / 7,
  );
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function getProductLaunchTime(product: {
  _creationTime: number;
  launchedAt?: number;
}) {
  return product.launchedAt ?? product._creationTime;
}

export function computeTrendingScore(product: {
  votesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  _creationTime: number;
  launchedAt?: number;
}) {
  const ageInHours = (Date.now() - getProductLaunchTime(product)) / (1000 * 60 * 60);
  const recentBoost = Math.max(0, 48 - ageInHours);
  return (
    product.votesCount * 10 +
    product.commentsCount * 4 +
    product.bookmarksCount * 2 +
    recentBoost
  );
}

export function computeEngagementScore(product: {
  commentsCount: number;
  bookmarksCount: number;
  votesCount: number;
}) {
  return (
    (product.commentsCount + product.bookmarksCount * 1.5) /
    Math.max(product.votesCount, 1)
  );
}

export function computeWeeklyScore(product: {
  votesCount: number;
  commentsCount: number;
  bookmarksCount: number;
}) {
  return (
    product.votesCount * 8 +
    product.commentsCount * 3 +
    product.bookmarksCount * 2
  );
}

export async function maybeViewer(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return user;
}

export async function requireViewer(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Authentication required.");
  }

  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (existing) {
    if (!existing.isActive) {
      throw new ConvexError("This account is no longer active.");
    }
    return existing;
  }

  const derivedName =
    identity.name ??
    [identity.givenName, identity.familyName].filter(Boolean).join(" ") ??
    identity.email ??
    "Developer";

  const userId = await ctx.db.insert("users", {
    clerkId: identity.subject,
    username: identity.nickname ?? identity.email?.split("@")[0] ?? identity.subject,
    name: derivedName.trim() || "Developer",
    imageUrl: identity.pictureUrl ?? "",
    bio: "",
    headline: "",
    isOnboarded: false,
    isActive: true,
    submittedCount: 0,
    upvotesGivenCount: 0,
    bookmarksCount: 0,
  });

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new ConvexError("Failed to create viewer.");
  }

  return user;
}

export async function getProductBySlug(ctx: Ctx, slug: string) {
  return ctx.db
    .query("products")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

export function assertValidCategory(category: string) {
  if (!PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number])) {
    throw new ConvexError("Unsupported category.");
  }
}

export async function enrichProduct(
  ctx: Ctx,
  product: Doc<"products">,
  viewerId?: Id<"users"> | null,
) {
  const submitter = await ctx.db.get(product.submitterId);
  const viewerVote = viewerId
    ? await ctx.db
        .query("votes")
        .withIndex("by_user_product", (q) =>
          q.eq("userId", viewerId).eq("productId", product._id),
        )
        .unique()
    : null;
  const viewerBookmark = viewerId
    ? await ctx.db
        .query("bookmarks")
        .withIndex("by_user_product", (q) =>
          q.eq("userId", viewerId).eq("productId", product._id),
        )
        .unique()
    : null;

  const logoUrl = product.logoStorageId
    ? await ctx.storage.getUrl(product.logoStorageId)
    : null;

  return {
    ...product,
    launchTime: getProductLaunchTime(product),
    logoUrl,
    submitter: submitter
      ? {
          _id: submitter._id,
          username: submitter.username,
          name: submitter.name,
          imageUrl: submitter.imageUrl,
          headline: submitter.headline,
        }
      : null,
    viewerHasVoted: Boolean(viewerVote),
    viewerHasBookmarked: Boolean(viewerBookmark),
  };
}
