# DevHunt

DevHunt is a modern product discovery platform for developers, indie makers, and students. It is inspired by Product Hunt, but built around developer clarity: what a product does, who it is for, and why it matters.

This project uses Next.js for the frontend, Convex for backend data and realtime functions, Clerk for authentication, Tailwind CSS for styling, and a lightweight shadcn-style component layer inside the app.

## Current Features

- Product discovery homepage with:
  - trending products
  - newest launches
  - hidden gems
- Product submission flow with:
  - name
  - tagline
  - description
  - website URL
  - optional live demo URL
  - logo upload
  - screenshot gallery upload
  - beginner-friendly / open source / free tags
- Product detail pages with:
  - overview
  - screenshots
  - live demo link
  - comments and replies
- Upvote system with duplicate vote prevention
- Bookmark / save products
- Daily and weekly leaderboard
- Public user profiles
- In-app notifications
- Clerk login with direct user sync into Convex after sign-in

## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Convex](https://convex.dev/)
- [Clerk](https://clerk.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui config](https://ui.shadcn.com/) with local reusable UI components

## Project Structure

```bash
app/                      Next.js routes
app/api/webhooks/clerk/   Optional Clerk webhook endpoint
components/devhunt/       Product, feed, header, comments, and submit UI
components/ui/            Reusable UI primitives
convex/                   Schema, queries, mutations, auth, and backend logic
lib/                      Shared frontend helpers
```

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_SITE_URL
```

Notes:

- The app already supports direct Clerk-to-Convex user sync on login, so webhook setup is optional for basic auth syncing.

### 3. Set Convex environment variables

Set at least:

```bash
pnpm convex env set CLERK_JWT_ISSUER_DOMAIN https://your-clerk-issuer
```

### 4. Start Convex

```bash
pnpm convex dev
```

This will generate the latest files in `convex/_generated`.

### 5. Start the app

```bash
pnpm dev
```

## Clerk Setup

In Clerk:

1. Create your application
2. Add your local and production domains
3. Enable the sign-in methods you want, such as Google and email
4. Create a JWT template named `convex`
5. Use the issuer URL as `CLERK_JWT_ISSUER_DOMAIN`

For the current project, the user is stored in Convex directly after login through the in-app sync path in:

- [ConvexClientProvider.tsx](C:/Users/Pratham/Desktop/Development/DevHunt/components/ConvexClientProvider.tsx)
- [users.ts](C:/Users/Pratham/Desktop/Development/DevHunt/convex/users.ts)

## Available Routes

- `/` discovery feed
- `/submit` submit a product
- `/products/[slug]` product details
- `/leaderboard` daily and weekly rankings
- `/collections` saved products
- `/notifications` in-app notifications
- `/u/[handle]` public profile

## Scripts

```bash
pnpm dev          # Next.js + Convex development
pnpm convex dev   # Convex dev/codegen
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm seed         # Run demo seed mutation
```

## Status

DevHunt is currently in active development. The core product discovery flows are implemented, and the current focus is on polishing UX, improving data quality, and extending the platform with richer discovery features.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
