"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Bell, Plus, Menu, X } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Discover", icon: null },
  { href: "/leaderboard", label: "Launches", icon: Flame },
  { href: "/collections", label: "Saved", icon: null },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const unreadCount = useQuery(api.social.unreadNotificationsCount, {});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="ph-container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white text-sm font-bold">
              DH
            </div>
            <span className="font-heading text-lg font-semibold tracking-tight text-gray-900 hidden sm:block">
              DevHunt
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  {Icon && <Icon aria-hidden="true" className="size-4" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link href="/submit" className="ph-btn-primary">
                <Plus aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">Launch Product</span>
                <span className="sm:hidden">Launch</span>
              </Link>
              <Link
                href="/notifications"
                className="relative flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              >
                <Bell aria-hidden="true" className="size-4" />
                {Boolean(unreadCount) && (
                  <Badge className="absolute -right-1 -top-1 min-w-5 justify-center border-none bg-primary px-1.5 py-0.5 text-[0.56rem] text-white">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
              <div className="rounded-full border border-gray-200 bg-white p-0.5">
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-gray-900 text-white hover:bg-gray-800">
                  Get featured
                </Button>
              </SignUpButton>
            </div>
          )}

          <button
            className="flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="border-t border-gray-200 bg-white md:hidden">
          <div className="ph-container py-4">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {Icon && <Icon aria-hidden="true" className="size-4" />}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
