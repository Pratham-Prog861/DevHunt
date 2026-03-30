import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export const PRODUCT_CATEGORIES = [
  "AI",
  "Dev Tools",
  "SaaS",
  "Mobile Apps",
  "Open Source",
  "Productivity",
  "Education",
  "Design",
] as const;

export const PRODUCT_SORTS = [
  { label: "Trending", value: "trending" },
  { label: "Newest", value: "newest" },
  { label: "Hidden Gems", value: "hiddenGems" },
] as const;

const absoluteDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export type ProductSort = (typeof PRODUCT_SORTS)[number]["value"];
export type HomeFilterState = {
  search?: string;
  category?: string;
  sort?: ProductSort;
};
export type ProductListItem = FunctionReturnType<typeof api.products.listProducts>[number];
export type HomeData = FunctionReturnType<typeof api.products.home>;
export type LeaderboardData = FunctionReturnType<typeof api.products.leaderboard>;
export type ProductDetail = NonNullable<FunctionReturnType<typeof api.products.getProduct>>;
export type CommentItem = FunctionReturnType<typeof api.social.listComments>[number];
export type NotificationItem = FunctionReturnType<typeof api.social.notifications>[number];
export type ProfileData = NonNullable<FunctionReturnType<typeof api.users.getProfile>>;
export type CollectionItem = FunctionReturnType<typeof api.social.collections>[number];

export function isProductSort(value: string): value is ProductSort {
  return PRODUCT_SORTS.some((item) => item.value === value);
}

export async function uploadFile(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Upload failed.");
  }

  const payload = await response.json();
  return payload.storageId as string;
}

export function formatRelativeDate(timestamp: number) {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return absoluteDateFormatter.format(new Date(timestamp));
}
