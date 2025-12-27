"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider, useSidebar } from "@/components/dashboard/SidebarContext";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardGuard>{children}</DashboardGuard>
    </SidebarProvider>
  );
}

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoaded: isClerkLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const syncUser = useMutation(api.users.syncUser);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  // Sync user to Convex when they access dashboard
  useEffect(() => {
    const syncUserToConvex = async () => {
      if (isClerkLoaded && user && !hasSynced) {
        setIsSyncing(true);
        try {
          await syncUser({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            name: user.fullName || user.firstName || undefined,
            imageUrl: user.imageUrl || undefined,
          });
          setHasSynced(true);
        } catch (error) {
          console.error("Failed to sync user:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    syncUserToConvex();
  }, [isClerkLoaded, user, syncUser, hasSynced]);

  // Redirect to onboarding if user hasn't completed it
  useEffect(() => {
    if (currentUser && !currentUser.onboardingComplete) {
      router.push("/onboarding");
    }
  }, [currentUser, router]);

  // Show loading while syncing or checking user status
  if (!isClerkLoaded || isSyncing || (currentUser === undefined && isClerkLoaded && user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <DashboardContent>{children}</DashboardContent>;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useSidebar();

  return (
    <div className="min-h-screen bg-background min-w-0 max-w-full overflow-x-hidden">
      <Sidebar isOpen={isOpen} onClose={close} />
      <div className="lg:pl-56 xl:pl-64 min-w-0 max-w-full">
        {children}
      </div>
    </div>
  );
}
