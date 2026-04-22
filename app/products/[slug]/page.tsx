"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import {
  ArrowUpRight,
  Bookmark,
  ExternalLink,
  Play,
  MessageSquare,
  Calendar,
  User,
  Pencil,
  Archive,
  Trash2,
  EyeOff,
} from "lucide-react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { CommentThread } from "@/components/devhunt/comment-thread";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatRelativeDate, type ProductDetail } from "@/lib/devhunt";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const viewer = useQuery(api.users.currentViewer);
  const product = useQuery(api.products.getProduct, { slug }) as
    | ProductDetail
    | null
    | undefined;
  const voteProduct = useMutation(api.social.voteProduct);
  const toggleBookmark = useMutation(api.social.toggleBookmark);
  const archiveProduct = useMutation(api.products.archiveProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);

  if (product === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500">Product not found.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  const isOwner = viewer?._id === product.submitterId;
  const isArchived = product.status === "archived";

  const handleArchive = async () => {
    await archiveProduct({ productId: product._id, archived: !isArchived });
  };

  const handleDelete = async () => {
    await deleteProduct({ productId: product._id });
    router.push("/");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-6">
        <div className="ph-card overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-4 p-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {product.logoUrl ? (
                <Image
                  src={product.logoUrl}
                  alt={product.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-semibold uppercase text-gray-400">
                  {product.name.slice(0, 2)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="ph-badge">{product.category}</span>
                {product.isBeginnerFriendly && (
                  <span className="ph-badge">Beginner-friendly</span>
                )}
                {product.isOpenSource && (
                  <span className="ph-badge">Open source</span>
                )}
                {product.isFree && <span className="ph-badge">Free</span>}
              </div>

              <h1 className="hero-title text-2xl sm:text-3xl flex items-center gap-3">
                {product.name}
                {isArchived && (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                    <EyeOff className="size-3" />
                    Archived
                  </Badge>
                )}
              </h1>
              <p className="mt-1 text-gray-600">{product.tagline}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 p-4">
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="border-t border-gray-100 p-4 flex flex-wrap gap-3">
            {isSignedIn ? (
              <>
                <Button
                  variant={product.viewerHasVoted ? "default" : "default"}
                  className={
                    product.viewerHasVoted
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-gray-900 hover:bg-gray-800"
                  }
                  onClick={() => void voteProduct({ productId: product._id })}
                >
                  <span className="mr-1 text-lg">+</span>
                  {product.viewerHasVoted ? "Upvoted" : "Upvote"} (
                  {product.votesCount})
                </Button>
                <Button
                  variant={
                    product.viewerHasBookmarked ? "secondary" : "outline"
                  }
                  onClick={() =>
                    void toggleBookmark({ productId: product._id })
                  }
                >
                  <Bookmark className="size-4 mr-1" />
                  {product.viewerHasBookmarked ? "Saved" : "Save"}
                </Button>
              </>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="default"
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  Sign in to vote
                </Button>
              </SignInButton>
            )}

            <a
              href={product.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <ExternalLink className="size-4" />
              Visit website
            </a>
          </div>
        </div>

        {product.galleryUrls && product.galleryUrls.length > 0 && (
          <div className="ph-card p-4">
            <h2 className="section-title mb-4">Screenshots</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {product.galleryUrls.filter(Boolean).map((url, index) => (
                <div
                  key={url as string}
                  className="rounded-lg overflow-hidden bg-gray-100"
                >
                  <Image
                    src={url as string}
                    alt={`${product.name} screenshot ${index + 1}`}
                    width={800}
                    height={500}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <CommentThread productId={product._id} />
      </div>

      <aside className="flex flex-col gap-4">
        {isOwner && (
          <div className="ph-card p-4 border-amber-200 bg-amber-50/30">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              Management
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <Link href={`/products/edit/${product.slug}`} className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-9"
                >
                  <Pencil className="size-4" />
                  Edit details
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start gap-2 h-9 ${isArchived ? "bg-white text-amber-700 border-amber-200" : ""}`}
                  >
                    <Archive className="size-4" />
                    {isArchived ? "Publish product" : "Archive product"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {isArchived
                        ? "This will make your product visible to the public again."
                        : "This will hide your product from public view. You can undo this later."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleArchive}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-9 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                  >
                    <Trash2 className="size-4" />
                    Delete permanently
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your product and remove its data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        <div className="ph-card p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Product info</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <User className="size-4" />
                Maker
              </span>
              <Link
                href={`/u/${product.submitter?.username ?? product.submitter?._id}`}
                className="font-medium text-primary hover:underline"
              >
                {product.submitter?.name ?? "Unknown"}
              </Link>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <Calendar className="size-4" />
                Launched
              </span>
              <span className="font-medium text-gray-900">
                {formatRelativeDate(
                  product.launchTime ?? product._creationTime,
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Votes</span>
              <span className="font-semibold text-primary">
                {product.votesCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <MessageSquare className="size-4" />
                Comments
              </span>
              <span className="font-semibold text-gray-900">
                {product.commentsCount}
              </span>
            </div>
          </div>
        </div>

        {product.demoUrl && (
          <div className="ph-card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Try it</h3>
            <a
              href={product.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="ph-btn-primary w-full justify-center"
            >
              <Play className="size-4" />
              Open live demo
            </a>
          </div>
        )}

        {product.submitter?.headline && (
          <div className="ph-card p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              About the maker
            </h3>
            <p className="text-sm text-gray-600">
              {product.submitter.headline}
            </p>
            <Link
              href={`/u/${product.submitter?.username ?? product.submitter?._id}`}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View maker profile
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
