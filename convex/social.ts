import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { MAX_COMMENT_LENGTH } from "./constants";
import {
  computeEngagementScore,
  computeTrendingScore,
  computeWeeklyScore,
  enrichProduct,
  getDateKey,
  maybeViewer,
  requireViewer,
} from "./helpers";

export const voteProduct = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new ConvexError("Product not found.");
    }

    const existing = await ctx.db
      .query("votes")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", viewer._id).eq("productId", product._id),
      )
      .unique();

    if (existing) {
      throw new ConvexError("You have already upvoted this product.");
    }

    await ctx.db.insert("votes", {
      productId: product._id,
      userId: viewer._id,
      dateKey: getDateKey(Date.now()),
    });

    await ctx.db.patch(viewer._id, {
      upvotesGivenCount: viewer.upvotesGivenCount + 1,
    });

    const updatedVotes = product.votesCount + 1;
    const today = getDateKey(Date.now());
    const updatedProduct = {
      ...product,
      votesCount: updatedVotes,
      dayVotes: product.launchDateKey === today ? product.dayVotes + 1 : product.dayVotes,
    };

    await ctx.db.patch(product._id, {
      votesCount: updatedVotes,
      dayVotes: updatedProduct.dayVotes,
      trendingScore: computeTrendingScore(updatedProduct),
      engagementScore: computeEngagementScore(updatedProduct),
      weeklyScore: computeWeeklyScore(updatedProduct),
    });

    if (product.submitterId !== viewer._id) {
      await ctx.db.insert("notifications", {
        userId: product.submitterId,
        type: "product_upvoted",
        actorId: viewer._id,
        productId: product._id,
        commentId: undefined,
        isRead: false,
      });
    }
  },
});

export const toggleBookmark = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new ConvexError("Product not found.");
    }

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", viewer._id).eq("productId", product._id),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(viewer._id, {
        bookmarksCount: Math.max(0, viewer.bookmarksCount - 1),
      });
      const updatedProduct = {
        ...product,
        bookmarksCount: Math.max(0, product.bookmarksCount - 1),
      };
      await ctx.db.patch(product._id, {
        bookmarksCount: updatedProduct.bookmarksCount,
        trendingScore: computeTrendingScore(updatedProduct),
        engagementScore: computeEngagementScore(updatedProduct),
        weeklyScore: computeWeeklyScore(updatedProduct),
      });
      return { saved: false };
    }

    await ctx.db.insert("bookmarks", {
      productId: product._id,
      userId: viewer._id,
    });
    await ctx.db.patch(viewer._id, {
      bookmarksCount: viewer.bookmarksCount + 1,
    });
    const updatedProduct = {
      ...product,
      bookmarksCount: product.bookmarksCount + 1,
    };
    await ctx.db.patch(product._id, {
      bookmarksCount: updatedProduct.bookmarksCount,
      trendingScore: computeTrendingScore(updatedProduct),
      engagementScore: computeEngagementScore(updatedProduct),
      weeklyScore: computeWeeklyScore(updatedProduct),
    });
    return { saved: true };
  },
});

export const listComments = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const authors = await Promise.all(
      comments.map((comment) => ctx.db.get(comment.authorId)),
    );

    return comments
      .map((comment, index) => ({
        ...comment,
        author: authors[index],
      }))
      .sort((a, b) => a._creationTime - b._creationTime);
  },
});

export const createComment = mutation({
  args: {
    productId: v.id("products"),
    body: v.string(),
    parentCommentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new ConvexError("Product not found.");
    }

    const body = args.body.trim();
    if (!body) {
      throw new ConvexError("Comment cannot be empty.");
    }
    if (body.length > MAX_COMMENT_LENGTH) {
      throw new ConvexError("Comment is too long.");
    }

    const parent = args.parentCommentId
      ? await ctx.db.get(args.parentCommentId)
      : null;
    const depth = parent ? parent.depth + 1 : 0;

    const commentId = await ctx.db.insert("comments", {
      productId: product._id,
      authorId: viewer._id,
      parentCommentId: parent?._id,
      body,
      depth,
      repliesCount: 0,
    });

    if (parent) {
      await ctx.db.patch(parent._id, {
        repliesCount: parent.repliesCount + 1,
      });
    }

    const updatedProduct = {
      ...product,
      commentsCount: product.commentsCount + 1,
      bookmarksCount: product.bookmarksCount,
      dayComments:
        product.launchDateKey === getDateKey(Date.now())
          ? product.dayComments + 1
          : product.dayComments,
    };

    await ctx.db.patch(product._id, {
      commentsCount: updatedProduct.commentsCount,
      dayComments: updatedProduct.dayComments,
      trendingScore: computeTrendingScore(updatedProduct),
      engagementScore: computeEngagementScore(updatedProduct),
      weeklyScore: computeWeeklyScore(updatedProduct),
    });

    const notificationTarget = parent ? parent.authorId : product.submitterId;
    const notificationType = parent ? "comment_replied" : "product_commented";

    if (notificationTarget !== viewer._id) {
      await ctx.db.insert("notifications", {
        userId: notificationTarget,
        type: notificationType,
        actorId: viewer._id,
        productId: product._id,
        commentId,
        isRead: false,
      });
    }

    return commentId;
  },
});

export const notifications = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await maybeViewer(ctx);
    if (!viewer) {
      return [];
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", viewer._id))
      .collect();

    const hydrated = await Promise.all(
      notifications
        .sort((a, b) => b._creationTime - a._creationTime)
        .map(async (notification) => {
          const actor = await ctx.db.get(notification.actorId);
          const product = notification.productId
            ? await ctx.db.get(notification.productId)
            : null;
          const comment = notification.commentId
            ? await ctx.db.get(notification.commentId)
            : null;
          return {
            ...notification,
            actor,
            product,
            comment,
          };
        }),
    );

    return hydrated;
  },
});

export const unreadNotificationsCount = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await maybeViewer(ctx);
    if (!viewer) {
      return 0;
    }

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", viewer._id).eq("isRead", false),
      )
      .collect();

    return unread.length;
  },
});

export const markNotificationRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== viewer._id) {
      throw new ConvexError("Notification not found.");
    }

    await ctx.db.patch(notification._id, {
      isRead: true,
    });
  },
});

export const markAllNotificationsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const viewer = await requireViewer(ctx);
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", viewer._id).eq("isRead", false),
      )
      .collect();

    await Promise.all(
      notifications.map((notification) =>
        ctx.db.patch(notification._id, { isRead: true }),
      ),
    );
  },
});

export const collections = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await maybeViewer(ctx);
    if (!viewer) {
      return [];
    }

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", viewer._id))
      .collect();

    const products = await Promise.all(
      bookmarks.map((bookmark) => ctx.db.get(bookmark.productId)),
    );

    const existingProducts = products
      .filter((product): product is NonNullable<typeof product> => Boolean(product))
      .sort((a, b) => b._creationTime - a._creationTime);

    return Promise.all(
      existingProducts.map((product) => enrichProduct(ctx, product, viewer._id)),
    );
  },
});
