"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SubmitProductForm } from "@/components/devhunt/submit-product-form";
import { type ProductDetail } from "@/lib/devhunt";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const product = useQuery(api.products.getProduct, { slug }) as
    | ProductDetail
    | null
    | undefined;

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
        <p className="text-gray-500">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <SubmitProductForm product={product} />
    </div>
  );
}
