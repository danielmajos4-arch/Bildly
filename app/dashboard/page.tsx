"use client";
export const dynamic = 'force-dynamic';

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const proposals = useQuery(api.proposals.getUserProposals) || [];

  useEffect(() => {
    if (currentUser && !currentUser.onboardingComplete) {
      router.push("/onboarding");
    }
  }, [currentUser, router]);

  const userName = user?.firstName || user?.fullName?.split(" ")[0] || "";
  const recentProposals = proposals.slice(0, 5);
  const thisWeekCount = proposals.filter((p: NonNullable<typeof proposals>[number]) => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return p.createdAt > oneWeekAgo;
  }).length;
  const timeSaved = proposals.length * 25;

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <>
      <Header 
        title={`Welcome back${userName ? `, ${userName}` : ""}`}
        subtitle="Your proposal dashboard"
      />
      
      <main className="px-4 py-5 md:px-8 md:py-6">
        <div className="max-w-5xl mx-auto space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm">
              <p className="text-3xl font-bold text-[#1F2937]">{proposals.length}</p>
              <p className="text-sm text-[#6B7280] mt-1">Total Proposals</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm">
              <p className="text-3xl font-bold text-[#1F2937]">{thisWeekCount}</p>
              <p className="text-sm text-[#6B7280] mt-1">This Week</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm">
              <p className="text-3xl font-bold text-[#1F2937]">
                {timeSaved >= 60 ? `${Math.floor(timeSaved / 60)}h ${timeSaved % 60}m` : `${timeSaved}m`}
              </p>
              <p className="text-sm text-[#6B7280] mt-1">Time Saved</p>
            </div>
          </div>

          {/* Recent Proposals */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 md:px-5 pb-3">
              <h2 className="text-base font-semibold text-[#1F2937]">Recent Proposals</h2>
              {proposals.length > 0 && (
                <Link 
                  href="/dashboard/history"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  View All
                </Link>
              )}
            </div>
            <div className="px-4 md:px-5 pb-4 md:pb-5">
              {recentProposals.length === 0 ? (
                <div className="text-center py-10">
                  <h3 className="text-base font-medium text-[#1F2937] mb-1">No proposals yet</h3>
                  <p className="text-sm text-[#6B7280] mb-4">
                    Generate your first proposal to get started
                  </p>
                  <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5">
                    <Link href="/dashboard/new">Create Your First Proposal</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentProposals.map((proposal: NonNullable<typeof recentProposals>[number]) => (
                    <div
                      key={proposal._id}
                      className="flex items-center justify-between p-3 md:p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-[#1F2937] truncate">{proposal.jobTitle}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-[#6B7280] border-0">
                            {proposal.platform}
                          </Badge>
                          <span className="text-xs text-[#6B7280]">
                            {formatTimeAgo(proposal.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Link 
                        href={`/dashboard/history?id=${proposal._id}`}
                        className="text-sm text-brand-600 hover:text-brand-700 font-medium ml-4"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
