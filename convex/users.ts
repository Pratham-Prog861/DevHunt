import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { enrichProduct, getProductLaunchTime, maybeViewer } from "./helpers";

export const currentViewer = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await maybeViewer(ctx);
    if (!viewer) {
      return null;
    }

    return viewer;
  },
});

export const getProfile = query({
  args: {
    handle: v.string(),
  },
  handler: async (ctx, args) => {
    const viewer = await maybeViewer(ctx);
    const byUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.handle))
      .unique();
    const byId = byUsername
      ? null
      : (await ctx.db.query("users").collect()).find(
          (candidate) => String(candidate._id) === args.handle,
        ) ?? null;
    const user = byUsername ?? byId;

    if (!user || !user.isActive) {
      return null;
    }

    const submittedProducts = await ctx.db
      .query("products")
      .collect()
      .then((products) =>
        products
          .filter((product) => product.submitterId === user._id)
          .sort((a, b) => getProductLaunchTime(b) - getProductLaunchTime(a))
          .slice(0, 12),
      );

    const totalVotes = submittedProducts.reduce(
      (sum, product) => sum + product.votesCount,
      0,
    );
    const totalComments = submittedProducts.reduce(
      (sum, product) => sum + product.commentsCount,
      0,
    );
    const categories = new Set(submittedProducts.map((product) => product.category));

    return {
      user,
      stats: {
        totalVotes,
        totalComments,
        categoryCount: categories.size,
        totalSignal: totalVotes + totalComments + submittedProducts.length,
      },
      submittedProducts: await Promise.all(
        submittedProducts.map((product) => enrichProduct(ctx, product, viewer?._id)),
      ),
    };
  },
});

export const upsertUserFromWebhook = mutation({
  args: {
    webhookSecret: v.string(),
    clerkId: v.string(),
    username: v.string(),
    name: v.string(),
    imageUrl: v.string(),
    deleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!process.env.CLERK_WEBHOOK_SECRET) {
      throw new ConvexError("CLERK_WEBHOOK_SECRET is not configured in Convex.");
    }

    if (args.webhookSecret !== process.env.CLERK_WEBHOOK_SECRET) {
      throw new ConvexError("Unauthorized webhook sync.");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        username: args.username || existing.username,
        name: args.name || existing.name,
        imageUrl: args.imageUrl || existing.imageUrl,
        isActive: !args.deleted,
      });
      return existing._id;
    }

    if (args.deleted) {
      return null;
    }

    return ctx.db.insert("users", {
      clerkId: args.clerkId,
      username: args.username,
      name: args.name,
      imageUrl: args.imageUrl,
      bio: "",
      headline: "",
      isOnboarded: false,
      isActive: true,
      submittedCount: 0,
      upvotesGivenCount: 0,
      bookmarksCount: 0,
    });
  },
});

export const syncCurrentUser = mutation({
  args: {
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Authentication required.");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const username =
      args.username?.trim() ||
      identity.nickname ||
      identity.email?.split("@")[0] ||
      identity.subject;
    const name =
      args.name?.trim() ||
      identity.name ||
      identity.email ||
      "Developer";
    const imageUrl = args.imageUrl?.trim() || identity.pictureUrl || "";

    if (existing) {
      await ctx.db.patch(existing._id, {
        username,
        name,
        imageUrl,
        isActive: true,
      });
      return existing._id;
    }

    return ctx.db.insert("users", {
      clerkId: identity.subject,
      username,
      name,
      imageUrl,
      bio: "",
      headline: "",
      isOnboarded: false,
      isActive: true,
      submittedCount: 0,
      upvotesGivenCount: 0,
      bookmarksCount: 0,
    });
  },
});
