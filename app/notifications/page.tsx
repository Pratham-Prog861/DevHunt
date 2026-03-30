"use client";

import Link from "next/link";
import { BellRing } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type NotificationItem } from "@/lib/devhunt";

function getLabel(type: string) {
  if (type === "product_upvoted") return "upvoted your product";
  if (type === "comment_replied") return "replied to your comment";
  return "commented on your product";
}

export default function NotificationsPage() {
  const notifications = useQuery(api.social.notifications, {}) as NotificationItem[] | undefined;
  const markRead = useMutation(api.social.markNotificationRead);
  const markAll = useMutation(api.social.markAllNotificationsRead);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 lg:gap-10">
      <section className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <Card className="editorial-panel">
          <CardContent className="flex flex-col gap-5 p-7 md:p-8">
            <Badge className="w-fit">Inbox</Badge>
            <div className="flex flex-col gap-4">
              <h1 className="hero-title max-w-4xl text-[clamp(2.8rem,7vw,4.6rem)]">
                Track the reactions that matter to your launches.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                Comments, replies, and upvotes should feel like signal, not noise. This
                feed gives them enough structure to scan quickly and act on what matters.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-end">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => void markAll({})}>
            Mark all as read
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Recent activity</p>
            <h2 className="section-title mt-3">Notifications</h2>
          </div>
          <Badge>{notifications?.length ?? 0} items</Badge>
        </div>

        {notifications && notifications.length > 0 ? (
          <div className="flex flex-col gap-4">
            {notifications.map((notification) => (
              <Card
                key={notification._id}
                className={
                  notification.isRead
                    ? "editorial-panel"
                    : "border-primary/35 bg-[linear-gradient(180deg,rgba(77,92,179,0.08),rgba(255,255,255,0.72))]"
                }
              >
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <BellRing aria-hidden="true" className="size-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-semibold tracking-[-0.02em]">
                        {notification.actor?.name ?? "Someone"} {getLabel(notification.type)}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        {notification.product ? (
                          <Link
                            href={`/products/${notification.product.slug}`}
                            className="font-medium text-foreground underline decoration-border underline-offset-4"
                          >
                            {notification.product.name}
                          </Link>
                        ) : (
                          "A product in your collection"
                        )}
                      </div>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      className="justify-start md:justify-center"
                      onClick={() => void markRead({ notificationId: notification._id })}
                    >
                      Mark read
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="editorial-panel">
            <CardContent className="flex flex-col items-start gap-3 p-8">
              <p className="eyebrow">Quiet for now</p>
              <h3 className="font-heading text-3xl tracking-[-0.04em]">
                No notifications yet.
              </h3>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Launch a product, join a discussion, or bookmark a few entries and your
                activity feed will start to fill in.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
