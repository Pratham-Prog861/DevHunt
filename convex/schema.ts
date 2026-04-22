import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const notificationType = v.union(
  v.literal("product_upvoted"),
  v.literal("product_commented"),
  v.literal("comment_replied"),
);

export default defineSchema({
  users: defineTable({
    seedId: v.optional(v.string()),
    clerkId: v.string(),
    username: v.string(),
    name: v.string(),
    imageUrl: v.string(),
    bio: v.string(),
    headline: v.string(),
    isOnboarded: v.boolean(),
    isActive: v.boolean(),
    submittedCount: v.number(),
    upvotesGivenCount: v.number(),
    bookmarksCount: v.number(),
  })
    .index("by_seed_id", ["seedId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"]),

  products: defineTable({
    seedId: v.optional(v.string()),
    slug: v.string(),
    name: v.string(),
    tagline: v.string(),
    description: v.string(),
    websiteUrl: v.string(),
    category: v.string(),
    status: v.string(),
    submitterId: v.id("users"),
    logoStorageId: v.optional(v.id("_storage")),
    galleryStorageIds: v.array(v.id("_storage")),
    demoUrl: v.optional(v.string()),
    isBeginnerFriendly: v.boolean(),
    isOpenSource: v.boolean(),
    isFree: v.boolean(),
    votesCount: v.number(),
    commentsCount: v.number(),
    bookmarksCount: v.number(),
    dayVotes: v.number(),
    dayComments: v.number(),
    weeklyScore: v.number(),
    trendingScore: v.number(),
    engagementScore: v.number(),
    launchedAt: v.optional(v.number()),
    launchDateKey: v.string(),
    weeklyDateKey: v.string(),
  })
    .index("by_seed_id", ["seedId"])
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_launch_date", ["launchDateKey"])
    .index("by_week_key", ["weeklyDateKey"]),

  votes: defineTable({
    seedId: v.optional(v.string()),
    productId: v.id("products"),
    userId: v.id("users"),
    dateKey: v.string(),
  })
    .index("by_seed_id", ["seedId"])
    .index("by_product", ["productId"])
    .index("by_user_product", ["userId", "productId"]),

  comments: defineTable({
    seedId: v.optional(v.string()),
    productId: v.id("products"),
    authorId: v.id("users"),
    parentCommentId: v.optional(v.id("comments")),
    body: v.string(),
    depth: v.number(),
    repliesCount: v.number(),
  })
    .index("by_seed_id", ["seedId"])
    .index("by_product", ["productId"])
    .index("by_parent", ["parentCommentId"]),

  bookmarks: defineTable({
    seedId: v.optional(v.string()),
    productId: v.id("products"),
    userId: v.id("users"),
  })
    .index("by_seed_id", ["seedId"])
    .index("by_user", ["userId"])
    .index("by_product", ["productId"])
    .index("by_user_product", ["userId", "productId"]),

  notifications: defineTable({
    seedId: v.optional(v.string()),
    userId: v.id("users"),
    type: notificationType,
    actorId: v.id("users"),
    productId: v.optional(v.id("products")),
    commentId: v.optional(v.id("comments")),
    isRead: v.boolean(),
  })
    .index("by_seed_id", ["seedId"])
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"]),
});
