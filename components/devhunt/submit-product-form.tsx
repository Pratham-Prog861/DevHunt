"use client";

import {
  FormEvent,
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  AccessibleField,
  fieldSelectClassName,
} from "@/components/ui/accessible-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_CATEGORIES, uploadFile } from "@/lib/devhunt";
import { Id } from "@/convex/_generated/dataModel";

type SubmitFormState = {
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  category: string;
  demoUrl: string;
  isBeginnerFriendly: boolean;
  isOpenSource: boolean;
  isFree: boolean;
};

type SubmitFormErrors = Partial<
  Record<keyof SubmitFormState | "galleryFiles", string>
>;

const initialForm: SubmitFormState = {
  name: "",
  tagline: "",
  description: "",
  websiteUrl: "",
  category: PRODUCT_CATEGORIES[0],
  demoUrl: "",
  isBeginnerFriendly: false,
  isOpenSource: false,
  isFree: false,
};

const fieldOrder: Array<keyof SubmitFormErrors> = [
  "name",
  "tagline",
  "description",
  "websiteUrl",
  "demoUrl",
  "category",
  "galleryFiles",
];

const toggleOptions: Array<{
  label: string;
  key: "isBeginnerFriendly" | "isOpenSource" | "isFree";
}> = [
  { label: "Beginner-friendly", key: "isBeginnerFriendly" },
  { label: "Open source", key: "isOpenSource" },
  { label: "Free", key: "isFree" },
];

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateForm(form: SubmitFormState, galleryFiles: File[]) {
  const errors: SubmitFormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Product name is required.";
  }
  if (!form.tagline.trim()) {
    errors.tagline = "Tagline is required.";
  } else if (form.tagline.length > 80) {
    errors.tagline = "Tagline must be 80 characters or fewer.";
  }
  if (!form.description.trim()) {
    errors.description = "Description is required.";
  }
  if (!form.websiteUrl.trim()) {
    errors.websiteUrl = "Website URL is required.";
  } else if (!isValidUrl(form.websiteUrl)) {
    errors.websiteUrl = "Enter a valid website URL.";
  }
  if (form.demoUrl.trim() && !isValidUrl(form.demoUrl)) {
    errors.demoUrl = "Enter a valid demo URL.";
  }
  if (!form.category.trim()) {
    errors.category = "Category is required.";
  }
  if (galleryFiles.length > 5) {
    errors.galleryFiles = "Gallery screenshots are limited to 5 images.";
  }

  return errors;
}

export function SubmitProductForm() {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const createProduct = useMutation(api.products.createProduct);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<SubmitFormState>(initialForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<SubmitFormErrors>({});
  const fieldRefs = useRef<
    Partial<Record<keyof SubmitFormErrors, HTMLElement | null>>
  >({});

  const taglineCount = form.tagline.length;
  const isDirty = useMemo(
    () =>
      JSON.stringify(form) !== JSON.stringify(initialForm) ||
      logoFile !== null ||
      galleryFiles.length > 0,
    [form, galleryFiles.length, logoFile],
  );

  useEffect(() => {
    if (!isDirty || isSubmitting) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isSubmitting]);

  const setFieldValue = <K extends keyof SubmitFormState>(
    key: K,
    value: SubmitFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const focusFirstInvalidField = (validationErrors: SubmitFormErrors) => {
    const firstInvalidField = fieldOrder.find(
      (field) => validationErrors[field],
    );
    fieldRefs.current[firstInvalidField ?? "name"]?.focus();
  };

  const handleGalleryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []).slice(0, 5);
    setGalleryFiles(nextFiles);
    setErrors((current) => ({
      ...current,
      galleryFiles:
        event.target.files && event.target.files.length > 5
          ? "Gallery screenshots are limited to 5 images."
          : undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(form, galleryFiles);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      focusFirstInvalidField(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const logoStorageId = logoFile
        ? ((await uploadFile(
            await generateUploadUrl({}),
            logoFile,
          )) as Id<"_storage">)
        : undefined;

      const galleryStorageIds = (await Promise.all(
        galleryFiles.map(async (file) => {
          const uploadUrl = await generateUploadUrl({});
          return uploadFile(uploadUrl, file);
        }),
      )) as Id<"_storage">[];

      const result = await createProduct({
        ...form,
        demoUrl: form.demoUrl || undefined,
        logoStorageId,
        galleryStorageIds,
      });

      startTransition(() => {
        router.push(`/products/${result.slug}`);
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Ship your product in front of developers</CardTitle>
        <CardDescription>
          Focus on what it solves, who it helps, and what makes it worth
          exploring.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <AccessibleField
            id="product-name"
            label="Product name"
            error={errors.name}
          >
            <Input
              ref={(node) => {
                fieldRefs.current.name = node;
              }}
              id="product-name"
              name="name"
              type="text"
              autoComplete="off"
              value={form.name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "product-name-error" : undefined}
              onChange={(event) => setFieldValue("name", event.target.value)}
            />
          </AccessibleField>

          <AccessibleField
            id="product-tagline"
            label="Tagline"
            error={errors.tagline}
            hint={`${taglineCount}/80 characters`}
          >
            <Input
              ref={(node) => {
                fieldRefs.current.tagline = node;
              }}
              id="product-tagline"
              name="tagline"
              type="text"
              autoComplete="off"
              maxLength={80}
              value={form.tagline}
              aria-invalid={Boolean(errors.tagline)}
              aria-describedby={
                errors.tagline
                  ? "product-tagline-hint product-tagline-error"
                  : "product-tagline-hint"
              }
              onChange={(event) => setFieldValue("tagline", event.target.value)}
            />
          </AccessibleField>

          <AccessibleField
            id="product-description"
            label="Description"
            error={errors.description}
          >
            <Textarea
              ref={(node) => {
                fieldRefs.current.description = node;
              }}
              id="product-description"
              name="description"
              value={form.description}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "product-description-error" : undefined
              }
              onChange={(event) =>
                setFieldValue("description", event.target.value)
              }
            />
          </AccessibleField>

          <AccessibleField
            id="product-website"
            label="Website URL"
            error={errors.websiteUrl}
          >
            <Input
              ref={(node) => {
                fieldRefs.current.websiteUrl = node;
              }}
              id="product-website"
              name="websiteUrl"
              type="url"
              inputMode="url"
              autoComplete="url"
              value={form.websiteUrl}
              aria-invalid={Boolean(errors.websiteUrl)}
              aria-describedby={
                errors.websiteUrl ? "product-website-error" : undefined
              }
              onChange={(event) =>
                setFieldValue("websiteUrl", event.target.value)
              }
            />
          </AccessibleField>

          <AccessibleField
            id="product-demo-url"
            label="Live demo URL"
            error={errors.demoUrl}
          >
            <Input
              ref={(node) => {
                fieldRefs.current.demoUrl = node;
              }}
              id="product-demo-url"
              name="demoUrl"
              type="url"
              inputMode="url"
              autoComplete="url"
              value={form.demoUrl}
              aria-invalid={Boolean(errors.demoUrl)}
              aria-describedby={
                errors.demoUrl ? "product-demo-url-error" : undefined
              }
              onChange={(event) => setFieldValue("demoUrl", event.target.value)}
            />
          </AccessibleField>

          <AccessibleField
            id="product-category"
            label="Category"
            error={errors.category}
          >
            <select
              ref={(node) => {
                fieldRefs.current.category = node;
              }}
              id="product-category"
              name="category"
              className={fieldSelectClassName}
              value={form.category}
              aria-invalid={Boolean(errors.category)}
              aria-describedby={
                errors.category ? "product-category-error" : undefined
              }
              onChange={(event) =>
                setFieldValue("category", event.target.value)
              }
            >
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </AccessibleField>

          <fieldset className="grid gap-3 sm:grid-cols-3">
            <legend className="text-sm font-medium tracking-[-0.01em] text-foreground">
              Product attributes
            </legend>
            {toggleOptions.map(({ label, key }) => (
              <label
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-border p-4 text-sm"
              >
                <input
                  name={key}
                  type="checkbox"
                  checked={form[key]}
                  onChange={(event) => setFieldValue(key, event.target.checked)}
                />
                {label}
              </label>
            ))}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <AccessibleField id="product-logo" label="Logo image">
              <Input
                id="product-logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setLogoFile(event.target.files?.[0] ?? null)
                }
              />
            </AccessibleField>

            <AccessibleField
              id="product-gallery"
              label="Gallery screenshots"
              error={errors.galleryFiles}
              hint="Upload up to 5 screenshots."
            >
              <Input
                ref={(node) => {
                  fieldRefs.current.galleryFiles = node;
                }}
                id="product-gallery"
                name="gallery"
                type="file"
                multiple
                accept="image/*"
                aria-invalid={Boolean(errors.galleryFiles)}
                aria-describedby={
                  errors.galleryFiles
                    ? "product-gallery-hint product-gallery-error"
                    : "product-gallery-hint"
                }
                onChange={handleGalleryChange}
              />
            </AccessibleField>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Launch on DevHunt"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
