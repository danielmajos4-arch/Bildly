"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

function getConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return null;
  try {
    return new ConvexReactClient(convexUrl);
  } catch {
    return null;
  }
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const convex = useMemo(() => getConvexClient(), []);
  
  // ClerkProvider requires a valid key that starts with "pk_test_" or "pk_live_"
  // For production builds, env vars MUST be set in the build environment
  // This component assumes NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is always available
  // If it's not, the build will fail - which is correct behavior for production
  
  if (!clerkKey || (!clerkKey.startsWith('pk_test_') && !clerkKey.startsWith('pk_live_'))) {
    // In production, this should never happen if env vars are properly configured
    // For local development, ensure .env.local has NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    console.warn('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing or invalid. Clerk features will not work.');
    
    // Still provide a provider structure to prevent "useClerk" errors during build
    // This will fail at runtime if Clerk hooks are used, which is expected
    return (
      <ClerkProvider
        publishableKey={clerkKey || "pk_test_missing_key"}
        afterSignOutUrl="/"
      >
        {children}
      </ClerkProvider>
    );
  }

  // If we have Convex URL, provide full integration
  if (convex) {
  return (
    <ClerkProvider
      publishableKey={clerkKey}
      afterSignOutUrl="/"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
      </ClerkProvider>
    );
  }

  // Fallback: ClerkProvider without Convex
  return (
    <ClerkProvider
      publishableKey={clerkKey}
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
