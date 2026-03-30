"use client";

import Image from "next/image";
import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/devhunt/product-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type ProductListItem, type ProfileData } from "@/lib/devhunt";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  const profile = useQuery(api.users.getProfile, { handle }) as ProfileData | null | undefined;

  if (profile === null) {
    return <div className="text-sm text-muted-foreground">Profile not found.</div>;
  }

  if (!profile) {
    return <div className="text-sm text-muted-foreground">Loading profile…</div>;
  }

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-none bg-[linear-gradient(135deg,rgba(244,239,224,0.92),rgba(255,255,255,0.8)_40%,rgba(76,93,186,0.18)_140%)]">
          <CardContent className="flex flex-col gap-6 p-7 md:p-10">
            <div className="flex flex-wrap items-start gap-5">
              <div className="flex size-[6rem] items-center justify-center overflow-hidden rounded-[2rem] border border-border/70 bg-secondary text-2xl font-semibold uppercase tracking-[0.14em] text-secondary-foreground">
                {profile.user.imageUrl ? (
                  <Image
                    src={profile.user.imageUrl}
                    alt={profile.user.name}
                    width={96}
                    height={96}
                    priority
                    className="size-[6rem] rounded-[2rem] object-cover"
                  />
                ) : (
                  profile.user.name.slice(0, 2)
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-3">
                <div>
                  <p className="eyebrow">Maker profile</p>
                  <h1 className="hero-title mt-3 text-[clamp(2.8rem,7vw,4.6rem)]">
                    {profile.user.name}
                  </h1>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                    @{profile.user.username}
                  </p>
                </div>
                {profile.user.headline ? (
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                    {profile.user.headline}
                  </p>
                ) : null}
              </div>
            </div>

            {profile.user.bio ? (
              <p className="max-w-3xl text-sm leading-8 text-muted-foreground md:text-base">
                {profile.user.bio}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="editorial-panel">
          <CardContent className="grid h-full gap-4 p-7">
            {[
              [`${profile.user.submittedCount}`, "products shipped"],
              [`${profile.stats.totalSignal}`, "total signal"],
              [`${profile.stats.categoryCount}`, "categories explored"],
              [`${profile.stats.totalVotes}`, "votes earned"],
              [`${profile.user.bookmarksCount}`, "saved tools"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-[1.6rem] border border-border/70 bg-background/70 p-5"
              >
                <p className="font-heading text-4xl tracking-[-0.04em]">{value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Ship log</p>
            <h2 className="section-title mt-3">Products by {profile.user.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              {profile.user.name} has sparked {profile.stats.totalComments} public comments
              across {profile.stats.categoryCount} categories, which gives the profile a
              stronger sense of range than a simple activity counter.
            </p>
          </div>
          <Badge>{profile.submittedProducts.length} launches</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {profile.submittedProducts.map((product: ProductListItem) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
