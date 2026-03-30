import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextRequest } from "next/server";

function buildName(data: Record<string, unknown>) {
  const firstName = typeof data.first_name === "string" ? data.first_name : "";
  const lastName = typeof data.last_name === "string" ? data.last_name : "";
  const fullName = `${firstName} ${lastName}`.trim();
  return (
    fullName ||
    (typeof data.username === "string" ? data.username : "Developer")
  );
}

export async function POST(request: NextRequest) {
  const event = await verifyWebhook(request);
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!convexUrl || !webhookSecret) {
    return Response.json(
      {
        ok: false,
        error: "Missing NEXT_PUBLIC_CONVEX_URL or CLERK_WEBHOOK_SECRET",
      },
      { status: 500 },
    );
  }

  const client = new ConvexHttpClient(convexUrl);
  const data = event.data as unknown as Record<string, unknown>;
  const emailAddresses = Array.isArray(data.email_addresses)
    ? (data.email_addresses as Array<Record<string, unknown>>)
    : [];
  const primaryEmail =
    emailAddresses.find((item) => item.id === data.primary_email_address_id) ??
    emailAddresses[0];
  const imageUrl = typeof data.image_url === "string" ? data.image_url : "";
  const username =
    (typeof data.username === "string" && data.username) ||
    (typeof primaryEmail?.email_address === "string"
      ? primaryEmail.email_address.split("@")[0]
      : typeof data.id === "string"
        ? data.id
        : "developer");

  if (
    event.type === "user.created" ||
    event.type === "user.updated" ||
    event.type === "user.deleted"
  ) {
    await client.mutation(api.users.upsertUserFromWebhook, {
      webhookSecret,
      clerkId: String(data.id),
      username,
      name: buildName(data),
      imageUrl,
      deleted: event.type === "user.deleted",
    });
  }

  return Response.json({ ok: true });
}
