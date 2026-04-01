"use client";

import { ReactNode, useEffect, useRef, useMemo } from "react";
import type { FunctionReference } from "convex/server";
import { ConvexReactClient, useMutation } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const syncCurrentUserRef: FunctionReference<"mutation"> =
  api.users.syncCurrentUser;

function AuthSync() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const syncCurrentUser = useMutation(syncCurrentUserRef);
  const lastSyncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      return;
    }

    if (lastSyncedUserId.current === user.id) {
      return;
    }

    lastSyncedUserId.current = user.id;
    void syncCurrentUser({
      username: user.username ?? undefined,
      name: user.fullName ?? undefined,
      imageUrl: user.imageUrl ?? undefined,
    });
  }, [isLoaded, isSignedIn, syncCurrentUser, user]);

  return null;
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const convexClient = useMemo(() => convex, []);

  return (
    <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
      <AuthSync />
      {children}
    </ConvexProviderWithClerk>
  );
}
