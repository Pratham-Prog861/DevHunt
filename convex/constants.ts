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

export const NOTIFICATION_TYPES = [
  "product_upvoted",
  "product_commented",
  "comment_replied",
] as const;

export const MAX_TAGLINE_LENGTH = 80;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_COMMENT_LENGTH = 500;
export const MAX_GALLERY_IMAGES = 5;
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const DAY_IN_MS = 24 * 60 * 60 * 1000;
