import { ConvexError } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, type MutationCtx } from "./_generated/server";
import {
  computeEngagementScore,
  computeTrendingScore,
  computeWeeklyScore,
  getDateKey,
  getWeekKey,
  slugifyProductName,
} from "./helpers";

const SEED_NAMESPACE = "demo";

type SeedUser = {
  seedId: string;
  clerkId: string;
  username: string;
  name: string;
  imageUrl: string;
  bio: string;
  headline: string;
};

type SeedProduct = {
  seedId: string;
  submitterSeedId: string;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  demoUrl?: string;
  category: string;
  isBeginnerFriendly: boolean;
  isOpenSource: boolean;
  isFree: boolean;
  launchOffsetHours: number;
};

type SeedVote = {
  seedId: string;
  productSeedId: string;
  userSeedId: string;
};

type SeedBookmark = {
  seedId: string;
  productSeedId: string;
  userSeedId: string;
};

type SeedComment = {
  seedId: string;
  productSeedId: string;
  authorSeedId: string;
  body: string;
  parentSeedId?: string;
};

type SeedNotification = {
  seedId: string;
  userSeedId: string;
  actorSeedId: string;
  type: Doc<"notifications">["type"];
  productSeedId?: string;
  commentSeedId?: string;
  isRead: boolean;
};

const seedUsers: SeedUser[] = [
  {
    seedId: `${SEED_NAMESPACE}:user:anika`,
    clerkId: `${SEED_NAMESPACE}:clerk:anika`,
    username: "anikabuilds",
    name: "Anika Rao",
    imageUrl: "https://api.dicebear.com/9.x/glass/svg?seed=Anika%20Rao",
    bio: "Indie maker building AI study systems and small tools for ambitious learners.",
    headline: "AI learning systems founder",
  },
  {
    seedId: `${SEED_NAMESPACE}:user:mateo`,
    clerkId: `${SEED_NAMESPACE}:clerk:mateo`,
    username: "mateosystems",
    name: "Mateo Silva",
    imageUrl: "https://api.dicebear.com/9.x/glass/svg?seed=Mateo%20Silva",
    bio: "Design engineer focused on interfaces that make technical products feel calm and premium.",
    headline: "Design engineer for developer tools",
  },
  {
    seedId: `${SEED_NAMESPACE}:user:priya`,
    clerkId: `${SEED_NAMESPACE}:clerk:priya`,
    username: "priyaships",
    name: "Priya Nair",
    imageUrl: "https://api.dicebear.com/9.x/glass/svg?seed=Priya%20Nair",
    bio: "Open source maintainer shipping automation software for solo founders.",
    headline: "Open source automation maintainer",
  },
  {
    seedId: `${SEED_NAMESPACE}:user:jonah`,
    clerkId: `${SEED_NAMESPACE}:clerk:jonah`,
    username: "jonahloop",
    name: "Jonah Brooks",
    imageUrl: "https://api.dicebear.com/9.x/glass/svg?seed=Jonah%20Brooks",
    bio: "Mobile product builder who loves fast onboarding and student-first products.",
    headline: "Mobile app founder",
  },
  {
    seedId: `${SEED_NAMESPACE}:user:leila`,
    clerkId: `${SEED_NAMESPACE}:clerk:leila`,
    username: "leilaops",
    name: "Leila Haddad",
    imageUrl: "https://api.dicebear.com/9.x/glass/svg?seed=Leila%20Haddad",
    bio: "Developer experience operator turning messy internal workflows into products.",
    headline: "DevEx operator and systems thinker",
  },
  {
    seedId: `${SEED_NAMESPACE}:user:owen`,
    clerkId: `${SEED_NAMESPACE}:clerk:owen`,
    username: "owenlaunches",
    name: "Owen Park",
    imageUrl: "https://api.dicebear.com/9.x/glass/svg?seed=Owen%20Park",
    bio: "Bootstrapped SaaS builder obsessed with positioning, pricing, and distribution.",
    headline: "Bootstrapped SaaS founder",
  },
  {
    seedId: `${SEED_NAMESPACE}:user:sana`,
    clerkId: `${SEED_NAMESPACE}:clerk:sana`,
    username: "sanasprint",
    name: "Sana Qureshi",
    imageUrl: "https://api.dicebear.com/9.x/glass/svg?seed=Sana%20Qureshi",
    bio: "Student builder creating lightweight tools that help teams learn and prototype faster.",
    headline: "Student maker shipping weekly",
  },
];

const seedProductRows: Array<
  [
    string,
    string,
    string,
    string,
    string,
    string,
    string | undefined,
    string,
    boolean,
    boolean,
    boolean,
    number,
  ]
> = [
  ["promptlane", "anika", "PromptLane", "Turn messy prompt experiments into reusable AI workflows.", "PromptLane gives indie developers a versioned workspace for prompts, evaluations, notes, and shipping-ready playbooks.", "https://example.com/promptlane", "https://example.com/promptlane/demo", "AI", true, false, false, 6],
  ["stacksignal", "leila", "StackSignal", "Operational alerts rewritten for humans, not dashboards.", "StackSignal transforms noisy deployment events into concise, team-friendly summaries with ownership hints and rollout context.", "https://example.com/stacksignal", undefined, "Dev Tools", false, false, false, 9],
  ["campuskick", "jonah", "CampusKick", "A mobile launchpad for student clubs, events, and project teams.", "CampusKick helps students organize projects with deadlines, event briefs, and quick team spaces built for campus societies.", "https://example.com/campuskick", "https://example.com/campuskick/app", "Mobile Apps", true, false, true, 15],
  ["foundrycrm", "owen", "Foundry CRM", "A lightweight sales workspace for small B2B founder teams.", "Foundry CRM focuses on clear deal notes, practical follow-up reminders, and customer timelines that make sense for small teams.", "https://example.com/foundry-crm", undefined, "SaaS", true, false, false, 32],
  ["opensourcepulse", "priya", "Open Source Pulse", "Track contributor momentum across the repos you depend on.", "Open Source Pulse highlights maintainer response time, release tempo, contributor churn, and dependency risk.", "https://example.com/open-source-pulse", undefined, "Open Source", false, true, true, 46],
  ["studyforge", "sana", "StudyForge", "Build repeatable study sprints with templates, timers, and peer accountability.", "StudyForge is a productivity workspace for students who want structure without the friction of heavy project-management software.", "https://example.com/studyforge", undefined, "Education", true, false, true, 18],
  ["frameshift", "mateo", "FrameShift", "Generate product launch visuals without the usual design bottleneck.", "FrameShift gives solo founders a polished system for turning screenshots, quotes, and release notes into launch-ready visuals.", "https://example.com/frameshift", "https://example.com/frameshift/studio", "Design", true, false, false, 60],
  ["taskharbor", "leila", "TaskHarbor", "Shared operating checklists for teams running dozens of launches.", "TaskHarbor is a collaborative checklist system for launch teams that need reliable handoffs and approvals.", "https://example.com/taskharbor", undefined, "Productivity", false, false, false, 84],
  ["apprenticeai", "anika", "Apprentice AI", "A guided AI copilot for students learning technical writing.", "Apprentice AI coaches learners through drafts, citations, and edits with structured prompts that explain why a suggestion matters.", "https://example.com/apprentice-ai", undefined, "AI", true, false, true, 120],
  ["mergegarden", "priya", "MergeGarden", "An open source review queue for maintainers drowning in pull requests.", "MergeGarden makes contributor triage easier with rules, queues, and contributor-friendly explanations.", "https://example.com/mergegarden", undefined, "Dev Tools", false, true, true, 54],
  ["quietledger", "owen", "QuietLedger", "Subscription analytics that explain what changed in plain English.", "QuietLedger pairs core revenue dashboards with narrative summaries so founders can understand churn and expansion without spreadsheet fatigue.", "https://example.com/quietledger", undefined, "SaaS", false, false, false, 12],
  ["briefkit", "sana", "BriefKit", "A template-driven brief builder for student teams and hackathons.", "BriefKit turns rough collaboration into a repeatable system with one-page briefs, decision logs, and review templates.", "https://example.com/briefkit", undefined, "Education", true, false, true, 40],
  ["canvasnorth", "mateo", "Canvas North", "Moodboards and UI direction for product teams that want sharper taste.", "Canvas North helps product teams gather references, annotate design language, and align on visual direction before production.", "https://example.com/canvasnorth", undefined, "Design", true, false, true, 96],
  ["pocketstudio", "jonah", "PocketStudio", "Shoot product walkthroughs from your phone with clean overlays and scripts.", "PocketStudio helps makers record concise mobile demos using shot lists, CTA overlays, and quick editing tools.", "https://example.com/pocketstudio", undefined, "Mobile Apps", true, false, false, 72],
];

const seedProducts: SeedProduct[] = seedProductRows.map(
  ([
    id,
    user,
    name,
    tagline,
    description,
    websiteUrl,
    demoUrl,
    category,
    isBeginnerFriendly,
    isOpenSource,
    isFree,
    launchOffsetHours,
  ]) => ({
    seedId: `${SEED_NAMESPACE}:product:${id}`,
    submitterSeedId: `${SEED_NAMESPACE}:user:${user}`,
    name,
    tagline,
    description,
    websiteUrl,
    category,
    isBeginnerFriendly,
    isOpenSource,
    isFree,
    launchOffsetHours,
    ...(demoUrl ? { demoUrl } : {}),
  }),
);

const seedVotes: SeedVote[] = [
  ...buildVotes(`${SEED_NAMESPACE}:product:promptlane`, ["mateo", "priya", "jonah", "leila", "owen", "sana"]),
  ...buildVotes(`${SEED_NAMESPACE}:product:stacksignal`, ["anika", "priya", "jonah", "owen", "sana"]),
  ...buildVotes(`${SEED_NAMESPACE}:product:campuskick`, ["anika", "mateo", "priya", "leila"]),
  ...buildVotes(`${SEED_NAMESPACE}:product:foundrycrm`, ["anika", "mateo", "leila", "sana"]),
  ...buildVotes(`${SEED_NAMESPACE}:product:opensourcepulse`, ["anika", "mateo", "leila", "owen"]),
  ...buildVotes(`${SEED_NAMESPACE}:product:studyforge`, ["anika", "mateo", "jonah", "leila", "owen", "priya"]),
  ...buildVotes(`${SEED_NAMESPACE}:product:frameshift`, ["anika", "priya", "jonah", "owen"]),
  ...buildVotes(`${SEED_NAMESPACE}:product:taskharbor`, ["priya", "owen", "jonah"]),
  ...buildVotes(`${SEED_NAMESPACE}:product:apprenticeai`, ["mateo", "leila", "sana"]),
  ...buildVotes(`${SEED_NAMESPACE}:product:mergegarden`, ["anika", "mateo", "leila", "owen", "jonah"]),
  ...buildVotes(`${SEED_NAMESPACE}:product:quietledger`, ["anika", "mateo", "priya", "jonah", "leila", "sana"]),
  ...buildVotes(`${SEED_NAMESPACE}:product:briefkit`, ["anika", "mateo", "priya", "owen"]),
  ...buildVotes(`${SEED_NAMESPACE}:product:canvasnorth`, ["anika", "jonah"]),
  ...buildVotes(`${SEED_NAMESPACE}:product:pocketstudio`, ["anika", "mateo", "sana"]),
];

const seedBookmarks: SeedBookmark[] = [
  ...buildBookmarks(`${SEED_NAMESPACE}:product:promptlane`, ["mateo", "leila", "owen"]),
  ...buildBookmarks(`${SEED_NAMESPACE}:product:stacksignal`, ["anika", "priya", "owen"]),
  ...buildBookmarks(`${SEED_NAMESPACE}:product:studyforge`, ["anika", "jonah", "mateo"]),
  ...buildBookmarks(`${SEED_NAMESPACE}:product:mergegarden`, ["priya", "leila", "owen"]),
  ...buildBookmarks(`${SEED_NAMESPACE}:product:quietledger`, ["anika", "leila"]),
  ...buildBookmarks(`${SEED_NAMESPACE}:product:canvasnorth`, ["sana", "anika"]),
  ...buildBookmarks(`${SEED_NAMESPACE}:product:frameshift`, ["owen", "jonah"]),
  ...buildBookmarks(`${SEED_NAMESPACE}:product:briefkit`, ["sana", "priya"]),
];

const seedComments: SeedComment[] = [
  { seedId: `${SEED_NAMESPACE}:comment:promptlane:1`, productSeedId: `${SEED_NAMESPACE}:product:promptlane`, authorSeedId: `${SEED_NAMESPACE}:user:mateo`, body: "The workflow framing is strong. I like that the prompt experiments feel versionable instead of buried in docs." },
  { seedId: `${SEED_NAMESPACE}:comment:promptlane:2`, productSeedId: `${SEED_NAMESPACE}:product:promptlane`, authorSeedId: `${SEED_NAMESPACE}:user:anika`, body: "That was the goal. Most prompt work dies because teams cannot trace what changed or why.", parentSeedId: `${SEED_NAMESPACE}:comment:promptlane:1` },
  { seedId: `${SEED_NAMESPACE}:comment:stacksignal:1`, productSeedId: `${SEED_NAMESPACE}:product:stacksignal`, authorSeedId: `${SEED_NAMESPACE}:user:priya`, body: "Human-readable incident summaries are underrated. This could save small teams from a lot of context switching." },
  { seedId: `${SEED_NAMESPACE}:comment:campuskick:1`, productSeedId: `${SEED_NAMESPACE}:product:campuskick`, authorSeedId: `${SEED_NAMESPACE}:user:sana`, body: "This feels built by someone who actually understands campus team chaos. The brief-to-event flow is really clean." },
  { seedId: `${SEED_NAMESPACE}:comment:campuskick:2`, productSeedId: `${SEED_NAMESPACE}:product:campuskick`, authorSeedId: `${SEED_NAMESPACE}:user:jonah`, body: "Exactly. We tested it with student clubs that needed lightweight coordination more than enterprise features.", parentSeedId: `${SEED_NAMESPACE}:comment:campuskick:1` },
  { seedId: `${SEED_NAMESPACE}:comment:opensourcepulse:1`, productSeedId: `${SEED_NAMESPACE}:product:opensourcepulse`, authorSeedId: `${SEED_NAMESPACE}:user:leila`, body: "The maintainer health angle is great. I could see this being useful during tool selection and quarterly dependency reviews." },
  { seedId: `${SEED_NAMESPACE}:comment:studyforge:1`, productSeedId: `${SEED_NAMESPACE}:product:studyforge`, authorSeedId: `${SEED_NAMESPACE}:user:anika`, body: "This feels operational instead of motivational. Strong positioning." },
  { seedId: `${SEED_NAMESPACE}:comment:studyforge:2`, productSeedId: `${SEED_NAMESPACE}:product:studyforge`, authorSeedId: `${SEED_NAMESPACE}:user:sana`, body: "Thank you. We wanted sprint rituals and peer accountability, not another task list with study stickers.", parentSeedId: `${SEED_NAMESPACE}:comment:studyforge:1` },
  { seedId: `${SEED_NAMESPACE}:comment:frameshift:1`, productSeedId: `${SEED_NAMESPACE}:product:frameshift`, authorSeedId: `${SEED_NAMESPACE}:user:owen`, body: "The teaser-card output is genuinely useful. Most solo founders just need a sharp launch system." },
  { seedId: `${SEED_NAMESPACE}:comment:mergegarden:1`, productSeedId: `${SEED_NAMESPACE}:product:mergegarden`, authorSeedId: `${SEED_NAMESPACE}:user:priya`, body: "We built this after too many contributor queues turned into silent backlogs. The explanation layer matters a lot." },
  { seedId: `${SEED_NAMESPACE}:comment:mergegarden:2`, productSeedId: `${SEED_NAMESPACE}:product:mergegarden`, authorSeedId: `${SEED_NAMESPACE}:user:anika`, body: "Maintainers need this. The contributor-friendly explanations are what make it feel humane.", parentSeedId: `${SEED_NAMESPACE}:comment:mergegarden:1` },
  { seedId: `${SEED_NAMESPACE}:comment:quietledger:1`, productSeedId: `${SEED_NAMESPACE}:product:quietledger`, authorSeedId: `${SEED_NAMESPACE}:user:mateo`, body: "The plain-English summaries are a great touch. Revenue tools usually over-index on charts and under-index on clarity." },
  { seedId: `${SEED_NAMESPACE}:comment:briefkit:1`, productSeedId: `${SEED_NAMESPACE}:product:briefkit`, authorSeedId: `${SEED_NAMESPACE}:user:jonah`, body: "Hackathon teams would eat this up. The decision-log angle is smarter than just another template gallery." },
  { seedId: `${SEED_NAMESPACE}:comment:canvasnorth:1`, productSeedId: `${SEED_NAMESPACE}:product:canvasnorth`, authorSeedId: `${SEED_NAMESPACE}:user:sana`, body: "The taste-building positioning is refreshing. This feels like a missing pre-design layer for newer product teams." },
];

const seedNotifications: SeedNotification[] = [
  { seedId: `${SEED_NAMESPACE}:notification:promptlane:upvote`, userSeedId: `${SEED_NAMESPACE}:user:anika`, actorSeedId: `${SEED_NAMESPACE}:user:mateo`, type: "product_upvoted", productSeedId: `${SEED_NAMESPACE}:product:promptlane`, isRead: false },
  { seedId: `${SEED_NAMESPACE}:notification:campuskick:reply`, userSeedId: `${SEED_NAMESPACE}:user:sana`, actorSeedId: `${SEED_NAMESPACE}:user:jonah`, type: "comment_replied", productSeedId: `${SEED_NAMESPACE}:product:campuskick`, commentSeedId: `${SEED_NAMESPACE}:comment:campuskick:2`, isRead: false },
  { seedId: `${SEED_NAMESPACE}:notification:studyforge:comment`, userSeedId: `${SEED_NAMESPACE}:user:sana`, actorSeedId: `${SEED_NAMESPACE}:user:anika`, type: "product_commented", productSeedId: `${SEED_NAMESPACE}:product:studyforge`, commentSeedId: `${SEED_NAMESPACE}:comment:studyforge:1`, isRead: true },
  { seedId: `${SEED_NAMESPACE}:notification:mergegarden:reply`, userSeedId: `${SEED_NAMESPACE}:user:priya`, actorSeedId: `${SEED_NAMESPACE}:user:anika`, type: "comment_replied", productSeedId: `${SEED_NAMESPACE}:product:mergegarden`, commentSeedId: `${SEED_NAMESPACE}:comment:mergegarden:2`, isRead: false },
];

function buildVotes(productSeedId: string, users: string[]): SeedVote[] {
  return users.map((userKey) => ({
    seedId: `${productSeedId}:vote:${userKey}`,
    productSeedId,
    userSeedId: `${SEED_NAMESPACE}:user:${userKey}`,
  }));
}

function buildBookmarks(productSeedId: string, users: string[]): SeedBookmark[] {
  return users.map((userKey) => ({
    seedId: `${productSeedId}:bookmark:${userKey}`,
    productSeedId,
    userSeedId: `${SEED_NAMESPACE}:user:${userKey}`,
  }));
}

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const userIds = await upsertSeedUsers(ctx);
    const productIds = await upsertSeedProducts(ctx, userIds);
    await upsertSeedVotes(ctx, userIds, productIds);
    await upsertSeedBookmarks(ctx, userIds, productIds);
    const commentIds = await upsertSeedComments(ctx, userIds, productIds);
    await upsertSeedNotifications(ctx, userIds, productIds, commentIds);
    await recomputeSeededRecords(ctx, userIds, productIds);

    return {
      ok: true,
      seeded: {
        users: seedUsers.length,
        products: seedProducts.length,
        votes: seedVotes.length,
        bookmarks: seedBookmarks.length,
        comments: seedComments.length,
        notifications: seedNotifications.length,
      },
      message: "Deterministic DevHunt demo data is ready.",
    };
  },
});

export const clearSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    await deleteSeedRecords(ctx);
    return { ok: true, message: "All seeded demo data has been removed." };
  },
});

export const resetSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    await deleteSeedRecords(ctx);
    const userIds = await upsertSeedUsers(ctx);
    const productIds = await upsertSeedProducts(ctx, userIds);
    await upsertSeedVotes(ctx, userIds, productIds);
    await upsertSeedBookmarks(ctx, userIds, productIds);
    const commentIds = await upsertSeedComments(ctx, userIds, productIds);
    await upsertSeedNotifications(ctx, userIds, productIds, commentIds);
    await recomputeSeededRecords(ctx, userIds, productIds);
    return { ok: true, message: "Seeded demo data was cleared and rebuilt." };
  },
});

async function deleteSeedRecords(ctx: MutationCtx) {
  for (const notification of [...seedNotifications].reverse()) {
    await deleteBySeedId(ctx, "notifications", notification.seedId);
  }
  for (const bookmark of [...seedBookmarks].reverse()) {
    await deleteBySeedId(ctx, "bookmarks", bookmark.seedId);
  }
  for (const vote of [...seedVotes].reverse()) {
    await deleteBySeedId(ctx, "votes", vote.seedId);
  }
  for (const comment of [...seedComments].reverse()) {
    await deleteBySeedId(ctx, "comments", comment.seedId);
  }
  for (const product of [...seedProducts].reverse()) {
    await deleteBySeedId(ctx, "products", product.seedId);
  }
  for (const user of [...seedUsers].reverse()) {
    await deleteBySeedId(ctx, "users", user.seedId);
  }
}

async function upsertSeedUsers(ctx: MutationCtx) {
  const userIds = new Map<string, Id<"users">>();

  for (const user of seedUsers) {
    const conflictingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", user.username))
      .unique();

    if (conflictingUser && conflictingUser.seedId !== user.seedId) {
      throw new ConvexError(
        `Cannot seed demo data because username "${user.username}" is already used by non-seeded data.`,
      );
    }

    const existing = await getBySeedId(ctx, "users", user.seedId);
    const payload = {
      seedId: user.seedId,
      clerkId: user.clerkId,
      username: user.username,
      name: user.name,
      imageUrl: user.imageUrl,
      bio: user.bio,
      headline: user.headline,
      isOnboarded: true,
      isActive: true,
      submittedCount: 0,
      upvotesGivenCount: 0,
      bookmarksCount: 0,
    };

    const userId = existing
      ? (await ctx.db.patch(existing._id, payload), existing._id)
      : await ctx.db.insert("users", payload);

    userIds.set(user.seedId, userId);
  }

  return userIds;
}

async function upsertSeedProducts(
  ctx: MutationCtx,
  userIds: Map<string, Id<"users">>,
) {
  const productIds = new Map<string, Id<"products">>();
  const now = Date.now();

  for (const product of seedProducts) {
    const slug = slugifyProductName(product.name);
    const conflictingProduct = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (conflictingProduct && conflictingProduct.seedId !== product.seedId) {
      throw new ConvexError(
        `Cannot seed demo data because product slug "${slug}" is already used by non-seeded data.`,
      );
    }

    const submitterId = userIds.get(product.submitterSeedId);
    if (!submitterId) {
      throw new ConvexError(`Missing seeded submitter for ${product.name}.`);
    }

    const launchedAt = now - product.launchOffsetHours * 60 * 60 * 1000;
    const existing = await getBySeedId(ctx, "products", product.seedId);
    const payload = {
      seedId: product.seedId,
      slug,
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      websiteUrl: product.websiteUrl,
      category: product.category,
      status: "published",
      submitterId,
      galleryStorageIds: [],
      isBeginnerFriendly: product.isBeginnerFriendly,
      isOpenSource: product.isOpenSource,
      isFree: product.isFree,
      votesCount: 0,
      commentsCount: 0,
      bookmarksCount: 0,
      dayVotes: 0,
      dayComments: 0,
      weeklyScore: 0,
      trendingScore: 0,
      engagementScore: 0,
      launchedAt,
      launchDateKey: getDateKey(launchedAt),
      weeklyDateKey: getWeekKey(launchedAt),
      ...(product.demoUrl ? { demoUrl: product.demoUrl } : {}),
    };

    const productId = existing
      ? (await ctx.db.patch(existing._id, payload), existing._id)
      : await ctx.db.insert("products", payload);

    productIds.set(product.seedId, productId);
  }

  return productIds;
}

async function upsertSeedVotes(
  ctx: MutationCtx,
  userIds: Map<string, Id<"users">>,
  productIds: Map<string, Id<"products">>,
) {
  for (const vote of seedVotes) {
    const userId = userIds.get(vote.userSeedId);
    const productId = productIds.get(vote.productSeedId);
    if (!userId || !productId) {
      throw new ConvexError(`Missing seeded relation for vote "${vote.seedId}".`);
    }

    const existing = await getBySeedId(ctx, "votes", vote.seedId);
    const product = await ctx.db.get(productId);
    if (!product) {
      throw new ConvexError(`Seeded product not found for vote "${vote.seedId}".`);
    }

    const payload = {
      seedId: vote.seedId,
      productId,
      userId,
      dateKey: getDateKey(product.launchedAt ?? product._creationTime),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("votes", payload);
    }
  }
}

async function upsertSeedBookmarks(
  ctx: MutationCtx,
  userIds: Map<string, Id<"users">>,
  productIds: Map<string, Id<"products">>,
) {
  for (const bookmark of seedBookmarks) {
    const userId = userIds.get(bookmark.userSeedId);
    const productId = productIds.get(bookmark.productSeedId);
    if (!userId || !productId) {
      throw new ConvexError(`Missing seeded relation for bookmark "${bookmark.seedId}".`);
    }

    const existing = await getBySeedId(ctx, "bookmarks", bookmark.seedId);
    const payload = { seedId: bookmark.seedId, productId, userId };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("bookmarks", payload);
    }
  }
}

async function upsertSeedComments(
  ctx: MutationCtx,
  userIds: Map<string, Id<"users">>,
  productIds: Map<string, Id<"products">>,
) {
  const commentIds = new Map<string, Id<"comments">>();

  for (const comment of seedComments.filter((entry) => !entry.parentSeedId)) {
    const commentId = await upsertSingleComment(ctx, comment, userIds, productIds, commentIds);
    commentIds.set(comment.seedId, commentId);
  }

  for (const comment of seedComments.filter((entry) => entry.parentSeedId)) {
    const commentId = await upsertSingleComment(ctx, comment, userIds, productIds, commentIds);
    commentIds.set(comment.seedId, commentId);
  }

  return commentIds;
}

async function upsertSingleComment(
  ctx: MutationCtx,
  comment: SeedComment,
  userIds: Map<string, Id<"users">>,
  productIds: Map<string, Id<"products">>,
  commentIds: Map<string, Id<"comments">>,
) {
  const authorId = userIds.get(comment.authorSeedId);
  const productId = productIds.get(comment.productSeedId);
  const parentCommentId = comment.parentSeedId
    ? commentIds.get(comment.parentSeedId)
    : undefined;

  if (!authorId || !productId) {
    throw new ConvexError(`Missing seeded relation for comment "${comment.seedId}".`);
  }
  if (comment.parentSeedId && !parentCommentId) {
    throw new ConvexError(`Missing parent comment for "${comment.seedId}".`);
  }

  const existing = await getBySeedId(ctx, "comments", comment.seedId);
  const payload = {
    seedId: comment.seedId,
    productId,
    authorId,
    body: comment.body,
    depth: parentCommentId ? 1 : 0,
    repliesCount: 0,
    ...(parentCommentId ? { parentCommentId } : {}),
  };

  if (existing) {
    await ctx.db.patch(existing._id, payload);
    return existing._id;
  }

  return ctx.db.insert("comments", payload);
}

async function upsertSeedNotifications(
  ctx: MutationCtx,
  userIds: Map<string, Id<"users">>,
  productIds: Map<string, Id<"products">>,
  commentIds: Map<string, Id<"comments">>,
) {
  for (const notification of seedNotifications) {
    const userId = userIds.get(notification.userSeedId);
    const actorId = userIds.get(notification.actorSeedId);
    const productId = notification.productSeedId
      ? productIds.get(notification.productSeedId)
      : undefined;
    const commentId = notification.commentSeedId
      ? commentIds.get(notification.commentSeedId)
      : undefined;

    if (!userId || !actorId) {
      throw new ConvexError(`Missing seeded relation for notification "${notification.seedId}".`);
    }

    const existing = await getBySeedId(ctx, "notifications", notification.seedId);
    const payload = {
      seedId: notification.seedId,
      userId,
      actorId,
      type: notification.type,
      isRead: notification.isRead,
      ...(productId ? { productId } : {}),
      ...(commentId ? { commentId } : {}),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("notifications", payload);
    }
  }
}

async function recomputeSeededRecords(
  ctx: MutationCtx,
  userIds: Map<string, Id<"users">>,
  productIds: Map<string, Id<"products">>,
) {
  const today = getDateKey(Date.now());

  for (const comment of seedComments) {
    const storedComment = await getBySeedId(ctx, "comments", comment.seedId);
    if (!storedComment) continue;
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentCommentId", storedComment._id))
      .collect();
    await ctx.db.patch(storedComment._id, { repliesCount: replies.length });
  }

  for (const [, productId] of productIds) {
    const product = await ctx.db.get(productId);
    if (!product) continue;

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    const bookmarks = await ctx.db
      .query("bookmarks")
      .collect()
      .then((records) => records.filter((record) => record.productId === productId));

    const nextProduct = {
      ...product,
      votesCount: votes.length,
      commentsCount: comments.length,
      bookmarksCount: bookmarks.length,
      dayVotes: product.launchDateKey === today ? votes.length : 0,
      dayComments: product.launchDateKey === today ? comments.length : 0,
    };

    await ctx.db.patch(productId, {
      votesCount: nextProduct.votesCount,
      commentsCount: nextProduct.commentsCount,
      bookmarksCount: nextProduct.bookmarksCount,
      dayVotes: nextProduct.dayVotes,
      dayComments: nextProduct.dayComments,
      trendingScore: computeTrendingScore(nextProduct),
      engagementScore: computeEngagementScore(nextProduct),
      weeklyScore: computeWeeklyScore(nextProduct),
      weeklyDateKey: getWeekKey(product.launchedAt ?? product._creationTime),
      launchDateKey: getDateKey(product.launchedAt ?? product._creationTime),
    });
  }

  for (const [, userId] of userIds) {
    const submittedCount = await ctx.db
      .query("products")
      .collect()
      .then((records) => records.filter((record) => record.submitterId === userId).length);
    const upvotesGivenCount = await ctx.db
      .query("votes")
      .collect()
      .then((records) => records.filter((record) => record.userId === userId).length);
    const bookmarksCount = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
      .then((records) => records.length);

    await ctx.db.patch(userId, { submittedCount, upvotesGivenCount, bookmarksCount });
  }
}

type SeededTable =
  | "users"
  | "products"
  | "votes"
  | "comments"
  | "bookmarks"
  | "notifications";

function getBySeedId(
  ctx: MutationCtx,
  tableName: "users",
  seedId: string,
): Promise<Doc<"users"> | null>;
function getBySeedId(
  ctx: MutationCtx,
  tableName: "products",
  seedId: string,
): Promise<Doc<"products"> | null>;
function getBySeedId(
  ctx: MutationCtx,
  tableName: "votes",
  seedId: string,
): Promise<Doc<"votes"> | null>;
function getBySeedId(
  ctx: MutationCtx,
  tableName: "comments",
  seedId: string,
): Promise<Doc<"comments"> | null>;
function getBySeedId(
  ctx: MutationCtx,
  tableName: "bookmarks",
  seedId: string,
): Promise<Doc<"bookmarks"> | null>;
function getBySeedId(
  ctx: MutationCtx,
  tableName: "notifications",
  seedId: string,
): Promise<Doc<"notifications"> | null>;
async function getBySeedId(ctx: MutationCtx, tableName: SeededTable, seedId: string) {
  switch (tableName) {
    case "users":
      return ctx.db
        .query("users")
        .withIndex("by_seed_id", (q) => q.eq("seedId", seedId))
        .unique();
    case "products":
      return ctx.db
        .query("products")
        .withIndex("by_seed_id", (q) => q.eq("seedId", seedId))
        .unique();
    case "votes":
      return ctx.db
        .query("votes")
        .withIndex("by_seed_id", (q) => q.eq("seedId", seedId))
        .unique();
    case "comments":
      return ctx.db
        .query("comments")
        .withIndex("by_seed_id", (q) => q.eq("seedId", seedId))
        .unique();
    case "bookmarks":
      return ctx.db
        .query("bookmarks")
        .withIndex("by_seed_id", (q) => q.eq("seedId", seedId))
        .unique();
    case "notifications":
      return ctx.db
        .query("notifications")
        .withIndex("by_seed_id", (q) => q.eq("seedId", seedId))
        .unique();
  }
}

async function deleteBySeedId(ctx: MutationCtx, tableName: SeededTable, seedId: string) {
  switch (tableName) {
    case "users": {
      const existing = await getBySeedId(ctx, "users", seedId);
      if (existing) await ctx.db.delete(existing._id);
      return;
    }
    case "products": {
      const existing = await getBySeedId(ctx, "products", seedId);
      if (existing) await ctx.db.delete(existing._id);
      return;
    }
    case "votes": {
      const existing = await getBySeedId(ctx, "votes", seedId);
      if (existing) await ctx.db.delete(existing._id);
      return;
    }
    case "comments": {
      const existing = await getBySeedId(ctx, "comments", seedId);
      if (existing) await ctx.db.delete(existing._id);
      return;
    }
    case "bookmarks": {
      const existing = await getBySeedId(ctx, "bookmarks", seedId);
      if (existing) await ctx.db.delete(existing._id);
      return;
    }
    case "notifications": {
      const existing = await getBySeedId(ctx, "notifications", seedId);
      if (existing) await ctx.db.delete(existing._id);
      return;
    }
  }
}
