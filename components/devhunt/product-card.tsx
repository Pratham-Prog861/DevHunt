"use client";

import { memo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Plus,
  Pencil,
  Archive,
  Trash2,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { type ProductListItem } from "@/lib/devhunt";

function ProductCardInner({
  product,
  showRank,
}: {
  product: ProductListItem;
  showRank?: number;
}) {
  const { isSignedIn } = useAuth();
  const viewer = useQuery(api.users.currentViewer);
  const voteProduct = useMutation(api.social.voteProduct);
  const archiveProduct = useMutation(api.products.archiveProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);

  const [isVoted, setIsVoted] = useState(product.viewerHasVoted);
  const [votesCount, setVotesCount] = useState(product.votesCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleVote = async () => {
    setIsAnimating(true);
    const wasVoted = isVoted;
    setIsVoted(!wasVoted);
    setVotesCount((prev) => (wasVoted ? prev - 1 : prev + 1));

    try {
      await voteProduct({ productId: product._id });
    } catch {
      setIsVoted(wasVoted);
      setVotesCount((prev) => (wasVoted ? prev + 1 : prev - 1));
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleArchive = async () => {
    const isArchived = product.status === "archived";
    await archiveProduct({ productId: product._id, archived: !isArchived });
  };

  const handleDelete = async () => {
    await deleteProduct({ productId: product._id });
  };

  const isOwner = viewer?._id === product.submitterId;
  const isArchived = product.status === "archived";

  return (
    <div
      className={`group flex items-start gap-4 rounded-lg border p-3 transition-colors ${
        isArchived
          ? "border-amber-100 bg-amber-50/50 hover:border-amber-200"
          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
      }`}
    >
      {showRank && (
        <div className="product-rank w-6 shrink-0 text-center">{showRank}</div>
      )}

      <Link href={`/products/${product.slug}`} className="shrink-0">
        <div className="ph-product-thumb flex items-center justify-center overflow-hidden">
          {product.logoUrl ? (
            <Image
              src={product.logoUrl}
              alt={product.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-lg font-semibold uppercase text-gray-400">
              {product.name.slice(0, 2)}
            </span>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="product-name truncate flex items-center gap-2">
            {product.name}
            {isArchived && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                <EyeOff className="size-3" />
                Archived
              </span>
            )}
          </h3>
        </Link>
        <p className="product-tagline mt-0.5 truncate">{product.tagline}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
          <span className="topic-tag">{product.category}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <span className="font-semibold text-primary">{votesCount}</span>{" "}
            votes
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            {product.commentsCount}
          </span>
        </div>
      </div>

      {isSignedIn && (
        <div className="flex shrink-0 gap-1">
          <Button
            variant={isVoted ? "default" : "outline"}
            className={`h-8 w-8 rounded-full p-0 transition-all duration-150 ${
              isVoted
                ? "bg-primary hover:bg-primary/90"
                : "hover:border-primary hover:text-primary"
            } ${isAnimating ? "scale-125" : ""}`}
            onClick={handleVote}
          >
            <div className="flex items-center justify-center w-full h-full">
              <Plus
                className={`size-4 transition-transform duration-150 ${
                  isVoted ? "text-white" : "text-gray-500"
                } ${isAnimating ? "scale-125" : ""}`}
              />
            </div>
          </Button>

          {isOwner && (
            <>
              <Link href={`/products/edit/${product.slug}`}>
                <Button
                  variant="outline"
                  className="h-8 w-8 rounded-full p-0 flex items-center justify-center hover:border-blue-500 hover:text-blue-500"
                  title="Edit product"
                >
                  <Pencil className="size-3.5" />
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={`h-8 w-8 rounded-full p-0 flex items-center justify-center ${
                      isArchived
                        ? "border-amber-200 bg-white text-amber-600 hover:bg-amber-50"
                        : "hover:border-amber-500 hover:text-amber-500"
                    }`}
                    title={isArchived ? "Publish product" : "Archive product"}
                  >
                    <Archive className="size-3.5" />
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
                    className="h-8 w-8 rounded-full p-0 flex items-center justify-center hover:border-red-500 hover:text-red-500"
                    title="Delete product"
                  >
                    <Trash2 className="size-3.5" />
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

export const ProductCard = memo(ProductCardInner);

export function ProductCardList({ products }: { products: ProductListItem[] }) {
  return (
    <div className="flex flex-col">
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} showRank={index + 1} />
      ))}
    </div>
  );
}
