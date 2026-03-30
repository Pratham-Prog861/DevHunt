"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Bookmark, Compass, Flame, Plus } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/leaderboard", label: "Rankings", icon: Flame },
  { href: "/collections", label: "Saved", icon: Bookmark },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const unreadCount = useQuery(api.social.unreadNotificationsCount, {});

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-[1.35rem] border border-border/80 bg-foreground text-sm font-bold tracking-[0.24em] text-background shadow-[0_18px_35px_-20px_rgba(20,20,30,0.75)]">
                DH
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-xl font-semibold tracking-[-0.04em]">
                  DevHunt
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Editorial launches for builders
                </span>
              </div>
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-background/70 p-1.5 backdrop-blur-sm md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium tracking-[-0.02em]",
                      isActive
                        ? "bg-foreground text-background shadow-[0_10px_25px_-18px_rgba(0,0,0,0.9)]"
                        : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <>
                <Link
                  href="/submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold tracking-[-0.01em] text-primary-foreground shadow-[0_10px_25px_-20px_rgba(10,20,50,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_-20px_rgba(54,76,191,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 sm:px-5"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  <span className="hidden sm:inline">Launch Product</span>
                  <span className="sm:hidden">Launch</span>
                </Link>
                <Link
                  href="/notifications"
                  aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                  className="relative inline-flex size-11 items-center justify-center rounded-full border border-border/80 bg-background/80 text-foreground backdrop-blur-sm hover:-translate-y-0.5 hover:bg-accent/80"
                >
                  <Bell aria-hidden="true" className="size-4" />
                  {Boolean(unreadCount) && (
                    <Badge className="absolute -right-1 -top-1 min-w-5 justify-center border-none bg-primary px-1.5 py-0.5 text-[0.56rem] text-primary-foreground">
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
                <div className="rounded-full border border-border/80 bg-background/80 p-1 backdrop-blur-sm">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign in</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Get featured</Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/80 bg-background/70 text-muted-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
