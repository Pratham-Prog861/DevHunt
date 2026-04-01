"use client";

import Link from "next/link";
import { Bell, Check, ArrowRight } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type NotificationItem } from "@/lib/devhunt";

function getLabel(type: string) {
  if (type === "product_upvoted") return "upvoted your product";
  if (type === "comment_replied") return "replied to your comment";
  return "commented on your product";
}

export default function NotificationsPage() {
  const notifications = useQuery(api.social.notifications, {}) as
    | NotificationItem[]
    | undefined;
  const markRead = useMutation(api.social.markNotificationRead);
  const markAll = useMutation(api.social.markAllNotificationsRead);

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="hero-title">Notifications</h1>
          <p className="text-gray-600">
            Stay updated on your product activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => void markAll({})}
          >
            <Check className="size-4" />
            Mark all as read
          </Button>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Recent Activity</h2>
          <Badge>{notifications?.length ?? 0} notifications</Badge>
        </div>

        {notifications && notifications.length > 0 ? (
          <div className="flex flex-col gap-2">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`ph-card p-4 flex items-start gap-4 ${
                  notification.isRead ? "" : "border-l-4 border-l-primary"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <Bell className="size-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">
                      {notification.actor?.name ?? "Someone"}
                    </span>{" "}
                    {getLabel(notification.type)}
                  </p>
                  {notification.product && (
                    <Link
                      href={`/products/${notification.product.slug}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {notification.product.name}
                    </Link>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {notification._creationTime
                      ? new Date(
                          notification._creationTime,
                        ).toLocaleDateString()
                      : "recently"}
                  </p>
                </div>
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-900 h-8 px-2"
                    onClick={() =>
                      void markRead({ notificationId: notification._id })
                    }
                  >
                    <Check className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="ph-card p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Bell className="size-6 text-gray-400" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900">
                All caught up!
              </h3>
              <p className="mt-2 max-w-md text-gray-600">
                No notifications yet. Launch a product or engage with the
                community to get started.
              </p>
              <Link href="/" className="mt-4 ph-btn-primary">
                <ArrowRight className="size-4" />
                Discover products
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
