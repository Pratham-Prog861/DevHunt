import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_GALLERY_IMAGES,
  MAX_TAGLINE_LENGTH,
  PRODUCT_CATEGORIES,
  DAY_IN_MS,
} from "./constants";
import {
  assertValidCategory,
  computeEngagementScore,
  computeTrendingScore,
  computeWeeklyScore,
  enrichProduct,
  getDateKey,
  getProductLaunchTime,
  getProductBySlug,
  getWeekKey,
  maybeViewer,
  requireViewer,
  slugifyProductName,
} from "./helpers";

const sortOptions = ["trending", "newest", "hiddenGems"] as const;

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireViewer(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    tagline: v.string(),
    description: v.string(),
    websiteUrl: v.string(),
    category: v.string(),
    demoUrl: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    galleryStorageIds: v.array(v.id("_storage")),
    isBeginnerFriendly: v.boolean(),
    isOpenSource: v.boolean(),
    isFree: v.boolean(),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);

    if (args.tagline.length > MAX_TAGLINE_LENGTH) {
      throw new ConvexError("Tagline is too long.");
    }
    if (args.description.length > MAX_DESCRIPTION_LENGTH) {
      throw new ConvexError("Description is too long.");
    }
    if (args.galleryStorageIds.length > MAX_GALLERY_IMAGES) {
      throw new ConvexError("Too many gallery images.");
    }

    assertValidCategory(args.category);

    const baseSlug = slugifyProductName(args.name);
    if (!baseSlug) {
      throw new ConvexError("Please choose a valid product name.");
    }

    const existing = await getProductBySlug(ctx, baseSlug);
    if (existing) {
      throw new ConvexError("A product with this name already exists.");
    }

    const now = Date.now();
    const productId = await ctx.db.insert("products", {
      slug: baseSlug,
      name: args.name.trim(),
      tagline: args.tagline.trim(),
      description: args.description.trim(),
      websiteUrl: args.websiteUrl.trim(),
      category: args.category,
      status: "published",
      submitterId: viewer._id,
      galleryStorageIds: args.galleryStorageIds,
      isBeginnerFriendly: args.isBeginnerFriendly,
      isOpenSource: args.isOpenSource,
      isFree: args.isFree,
      votesCount: 0,
      commentsCount: 0,
      bookmarksCount: 0,
      dayVotes: 0,
      dayComments: 0,
      weeklyScore: 0,
      trendingScore: computeTrendingScore({
        votesCount: 0,
        commentsCount: 0,
        bookmarksCount: 0,
        _creationTime: now,
        launchedAt: now,
      }),
      engagementScore: 0,
      launchedAt: now,
      launchDateKey: getDateKey(now),
      weeklyDateKey: getWeekKey(now),
      ...(args.logoStorageId ? { logoStorageId: args.logoStorageId } : {}),
      ...(args.demoUrl?.trim() ? { demoUrl: args.demoUrl.trim() } : {}),
    });

    await ctx.db.patch(viewer._id, {
      submittedCount: viewer.submittedCount + 1,
    });

    return { productId, slug: baseSlug };
  },
});

export const listProducts = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    sort: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await maybeViewer(ctx);
    const allProducts = await ctx.db.query("products").collect();
    const search = args.search?.trim().toLowerCase();
    const category = args.category?.trim();
    const sort = (
      args.sort && sortOptions.includes(args.sort as never)
        ? args.sort
        : "trending"
    ) as (typeof sortOptions)[number];

    let filtered = allProducts.filter(
      (product) => product.status === "published",
    );

    if (category && PRODUCT_CATEGORIES.includes(category as never)) {
      filtered = filtered.filter((product) => product.category === category);
    }

    if (search) {
      filtered = filtered.filter((product) => {
        const haystack =
          `${product.name} ${product.tagline} ${product.category}`.toLowerCase();
        return haystack.includes(search);
      });
    }

    if (sort === "newest") {
      filtered.sort(
        (a, b) => getProductLaunchTime(b) - getProductLaunchTime(a),
      );
    } else if (sort === "hiddenGems") {
      const now = Date.now();
      filtered = filtered.filter(
        (product) =>
          now - getProductLaunchTime(product) > 24 * 60 * 60 * 1000 &&
          product.votesCount < 15,
      );
      filtered.sort((a, b) => b.engagementScore - a.engagementScore);
    } else {
      filtered.sort((a, b) => b.trendingScore - a.trendingScore);
    }

    return Promise.all(
      filtered
        .slice(0, 36)
        .map((product) => enrichProduct(ctx, product, viewer?._id)),
    );
  },
});

export const home = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await maybeViewer(ctx);
    const products = await ctx.db.query("products").collect();
    const published = products.filter(
      (product) => product.status === "published",
    );
    const makerCount = new Set(
      published.map((product) => String(product.submitterId)),
    ).size;
    const categoryCount = new Set(published.map((product) => product.category))
      .size;
    const discussionCount = published.reduce(
      (total, product) => total + product.commentsCount,
      0,
    );

    const trending = [...published]
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 6);
    const newest = [...published]
      .sort((a, b) => getProductLaunchTime(b) - getProductLaunchTime(a))
      .slice(0, 6);
    const hiddenGems = [...published]
      .filter(
        (product) =>
          Date.now() - getProductLaunchTime(product) > 24 * 60 * 60 * 1000 &&
          product.votesCount < 15,
      )
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 6);

    return {
      stats: {
        productCount: published.length,
        makerCount,
        categoryCount,
        discussionCount,
      },
      spotlight: trending[0]
        ? await enrichProduct(ctx, trending[0], viewer?._id)
        : null,
      trending: await Promise.all(
        trending.map((product) => enrichProduct(ctx, product, viewer?._id)),
      ),
      newest: await Promise.all(
        newest.map((product) => enrichProduct(ctx, product, viewer?._id)),
      ),
      hiddenGems: await Promise.all(
        hiddenGems.map((product) => enrichProduct(ctx, product, viewer?._id)),
      ),
    };
  },
});

export const getProduct = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const viewer = await maybeViewer(ctx);
    const product = await getProductBySlug(ctx, args.slug);
    if (!product) {
      return null;
    }

    const enriched = await enrichProduct(ctx, product, viewer?._id);
    const logoUrl = product.logoStorageId
      ? await ctx.storage.getUrl(product.logoStorageId)
      : null;
    const galleryUrls = await Promise.all(
      product.galleryStorageIds.map((imageId) => ctx.storage.getUrl(imageId)),
    );

    return {
      ...enriched,
      logoUrl,
      galleryUrls: galleryUrls.filter(Boolean),
    };
  },
});

export type TimeFilter =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "thisMonth"
  | "thisYear";

function getTimeFilterKeys(filter: TimeFilter) {
  const now = Date.now();
  const today = getDateKey(now);
  const yesterday = getDateKey(now - DAY_IN_MS);
  const week = getWeekKey(now);

  const date = new Date(now);
  const year = date.getFullYear();
  const monthStart = new Date(year, date.getMonth(), 1);
  const yearStart = new Date(year, 0, 1);

  return {
    today,
    yesterday,
    week,
    monthStart: monthStart.getTime(),
    yearStart: yearStart.getTime(),
  };
}

export const leaderboard = query({
  args: {
    timeFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await maybeViewer(ctx);
    const products = await ctx.db.query("products").collect();
    const now = Date.now();
    const { today, yesterday, week, monthStart, yearStart } = getTimeFilterKeys(
      (args.timeFilter as TimeFilter) || "today",
    );

    const filteredByTime = products.filter((product) => {
      const launchTime = getProductLaunchTime(product);
      const launchDate = new Date(launchTime);

      switch (args.timeFilter) {
        case "today":
          return product.launchDateKey === today;
        case "yesterday":
          return product.launchDateKey === yesterday;
        case "thisWeek":
          return product.weeklyDateKey === week;
        case "thisMonth":
          return launchTime >= monthStart;
        case "thisYear":
          return launchTime >= yearStart;
        default:
          return product.launchDateKey === today;
      }
    });

    const daily = filteredByTime
      .filter((product) => product.launchDateKey === today)
      .sort((a, b) => {
        if (b.dayVotes !== a.dayVotes) return b.dayVotes - a.dayVotes;
        if (b.dayComments !== a.dayComments)
          return b.dayComments - a.dayComments;
        return getProductLaunchTime(a) - getProductLaunchTime(b);
      })
      .slice(0, 10);

    const weekly = filteredByTime
      .filter((product) => product.weeklyDateKey === week)
      .sort((a, b) => b.weeklyScore - a.weeklyScore)
      .slice(0, 10);

    const dailyProducts =
      daily.length > 0 ? daily : filteredByTime.slice(0, 10);
    const weeklyProducts =
      weekly.length > 0 ? weekly : filteredByTime.slice(0, 10);

    return {
      daily: await Promise.all(
        dailyProducts.map((product) =>
          enrichProduct(ctx, product, viewer?._id),
        ),
      ),
      weekly: await Promise.all(
        weeklyProducts.map((product) =>
          enrichProduct(ctx, product, viewer?._id),
        ),
      ),
    };
  },
});

export const syncProductScores = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new ConvexError("Product not found.");
    }

    await ctx.db.patch(product._id, {
      trendingScore: computeTrendingScore(product),
      engagementScore: computeEngagementScore(product),
      weeklyScore: computeWeeklyScore(product),
    });
  },
});
