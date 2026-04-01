"use client";

import Image from "next/image";
import { use } from "react";
import { useQuery } from "convex/react";
import { MapPin, Link as LinkIcon, Calendar } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/devhunt/product-card";
import { Badge } from "@/components/ui/badge";
import { type ProductListItem, type ProfileData } from "@/lib/devhunt";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  const profile = useQuery(api.users.getProfile, { handle }) as
    | ProfileData
    | null
    | undefined;

  if (profile === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500">Profile not found.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="ph-card p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full overflow-hidden bg-gray-100">
            {profile.user.imageUrl ? (
              <Image
                src={profile.user.imageUrl}
                alt={profile.user.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-semibold uppercase text-gray-400">
                {profile.user.name.slice(0, 2)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge>{profile.user.submittedCount} products</Badge>
            </div>

            <h1 className="hero-title text-2xl sm:text-3xl">
              {profile.user.name}
            </h1>
            <p className="text-gray-500 mt-1">@{profile.user.username}</p>

            {profile.user.headline && (
              <p className="mt-3 text-gray-700">{profile.user.headline}</p>
            )}

            {profile.user.bio && (
              <p className="mt-3 text-gray-600">{profile.user.bio}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                <span>
                  Joined{" "}
                  {profile.user._creationTime
                    ? new Date(profile.user._creationTime).toLocaleDateString(
                        "en-US",
                        { month: "short", year: "numeric" },
                      )
                    : "recently"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-4">
        <div className="ph-card p-4 text-center">
          <p className="text-2xl font-semibold text-gray-900">
            {profile.user.submittedCount}
          </p>
          <p className="text-xs text-gray-500">Products</p>
        </div>
        <div className="ph-card p-4 text-center">
          <p className="text-2xl font-semibold text-gray-900">
            {profile.stats.totalSignal}
          </p>
          <p className="text-xs text-gray-500">Total signal</p>
        </div>
        <div className="ph-card p-4 text-center">
          <p className="text-2xl font-semibold text-gray-900">
            {profile.stats.totalVotes}
          </p>
          <p className="text-xs text-gray-500">Votes earned</p>
        </div>
        <div className="ph-card p-4 text-center">
          <p className="text-2xl font-semibold text-gray-900">
            {profile.stats.categoryCount}
          </p>
          <p className="text-xs text-gray-500">Categories</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Products by {profile.user.name}</h2>
          <Badge>{profile.submittedProducts.length} launches</Badge>
        </div>

        {profile.submittedProducts.length > 0 ? (
          <div className="flex flex-col gap-2">
            {profile.submittedProducts.map((product: ProductListItem) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="ph-card p-8 text-center">
            <p className="text-gray-500">No products launched yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
