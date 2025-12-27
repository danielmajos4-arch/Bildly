"use client";
export const dynamic = 'force-dynamic';

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PenSquare, 
  Clock, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  FileText,
  Loader2,
  Zap,
  User,
  Calendar
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const proposals = useQuery(api.proposals.getUserProposals) || [];
  const usageStats = useQuery(api.users.getUsageStats);

  // Redirect to onboarding if not complete
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
  const timeSaved = proposals.length * 25; // 25 minutes per proposal

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header 
        title={`Welcome back${userName ? `, ${userName}` : ""}!`}
        subtitle="Generate winning proposals and land more clients"
      />
      
      <main className="p-3 sm:p-4 md:p-6 lg:p-8 min-w-0 max-w-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <Card className="border-0 shadow-lg min-w-0 max-w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 min-w-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate min-w-0">
                Total Proposals
              </CardTitle>
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{proposals.length}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 break-words overflow-wrap-anywhere">
                All time generated
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg min-w-0 max-w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 min-w-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate min-w-0">
                This Week
              </CardTitle>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{thisWeekCount}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 break-words overflow-wrap-anywhere">
                Proposals generated
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg sm:col-span-2 lg:col-span-1 min-w-0 max-w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 min-w-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate min-w-0">
                Time Saved
              </CardTitle>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
                {timeSaved >= 60 ? `${Math.floor(timeSaved / 60)}h ${timeSaved % 60}m` : `${timeSaved}m`}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 break-words overflow-wrap-anywhere">
                ~25 min per proposal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Stats Banner */}
        {usageStats && (
          <Card className="border-0 shadow-lg mb-4 sm:mb-6 md:mb-8 overflow-hidden min-w-0 max-w-full">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] rounded-xl">
              <CardContent className="p-3 sm:p-4 md:p-6 bg-card rounded-[11px] min-w-0 max-w-full">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 min-w-0">
                  <div className="flex-1 w-full min-w-0 max-w-full">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap min-w-0">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                      <h3 className="font-semibold text-sm sm:text-base truncate min-w-0">Monthly Usage</h3>
                      <Badge variant="secondary" className="gap-0.5 sm:gap-1 text-[10px] sm:text-xs min-w-0">
                        <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        <span className="truncate">Resets in {usageStats.daysUntilReset} days</span>
                      </Badge>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                      {/* Proposals Usage */}
                      <div className="space-y-1.5 sm:space-y-2 min-w-0">
                        <div className="flex items-center justify-between text-xs sm:text-sm min-w-0">
                          <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                            <span className="truncate">Proposals</span>
                          </span>
                          <span className="font-medium shrink-0 ml-2">
                            {usageStats.proposalsUsed}/{usageStats.proposalsLimit}
                          </span>
                        </div>
                        <Progress 
                          value={(usageStats.proposalsUsed / usageStats.proposalsLimit) * 100} 
                          className="h-1.5 sm:h-2"
                        />
                        <p className="text-[10px] sm:text-xs text-muted-foreground break-words overflow-wrap-anywhere">
                          {usageStats.proposalsRemaining} remaining this month
                        </p>
                      </div>
                      
                      {/* Profiles Usage */}
                      <div className="space-y-1.5 sm:space-y-2 min-w-0">
                        <div className="flex items-center justify-between text-xs sm:text-sm min-w-0">
                          <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 shrink-0" />
                            <span className="truncate">Profile Generations</span>
                          </span>
                          <span className="font-medium shrink-0 ml-2">
                            {usageStats.profilesUsed}/{usageStats.profilesLimit}
                          </span>
                        </div>
                        <Progress 
                          value={(usageStats.profilesUsed / usageStats.profilesLimit) * 100} 
                          className="h-1.5 sm:h-2"
                        />
                        <p className="text-[10px] sm:text-xs text-muted-foreground break-words overflow-wrap-anywhere">
                          {usageStats.profilesRemaining} remaining this month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-primary/5 to-primary/10 min-w-0 max-w-full">
          <CardContent className="p-3 sm:p-4 md:p-6 min-w-0 max-w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 min-w-0">
              <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold break-words overflow-wrap-anywhere">Ready to win more work?</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words overflow-wrap-anywhere">
                    Generate a new proposal in seconds
                  </p>
                </div>
              </div>
              <Button asChild size="lg" className="gap-1.5 sm:gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto min-w-0 max-w-full text-xs sm:text-sm">
                <Link href="/dashboard/new" className="flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 w-full">
                  <PenSquare className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="truncate">New Proposal</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Proposals */}
        <Card className="border-0 shadow-lg min-w-0 max-w-full">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
            <CardTitle className="text-sm sm:text-base">Recent Proposals</CardTitle>
            {proposals.length > 0 && (
              <Button variant="ghost" asChild className="gap-1.5 sm:gap-2 w-full sm:w-auto justify-center sm:justify-start text-xs sm:text-sm min-w-0 max-w-full">
                <Link href="/dashboard/history" className="flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 w-full">
                  <span className="truncate">View All</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="min-w-0 max-w-full">
            {recentProposals.length === 0 ? (
              <div className="text-center py-6 sm:py-8 md:py-12 px-2 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-medium mb-1 sm:mb-2 break-words overflow-wrap-anywhere">No proposals yet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 break-words overflow-wrap-anywhere px-2">
                  Generate your first proposal to get started
                </p>
                <Button asChild className="w-full sm:w-auto text-xs sm:text-sm min-w-0 max-w-full">
                  <Link href="/dashboard/new" className="truncate">Create Your First Proposal</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 md:space-y-4 min-w-0">
                {recentProposals.map((proposal: NonNullable<typeof recentProposals>[number]) => (
                  <div
                    key={proposal._id}
                    className="flex items-center justify-between p-2.5 sm:p-3 md:p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors gap-2 sm:gap-3 min-w-0 max-w-full"
                  >
                    <div className="flex-1 min-w-0 max-w-full">
                      <h4 className="font-medium truncate text-xs sm:text-sm md:text-base break-words overflow-wrap-anywhere">{proposal.jobTitle}</h4>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap min-w-0">
                        <Badge variant="secondary" className="text-[10px] sm:text-xs min-w-0">
                          <span className="truncate">{proposal.platform}</span>
                        </Badge>
                        <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {formatTimeAgo(proposal.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="shrink-0 text-xs sm:text-sm">
                      <Link href={`/dashboard/history?id=${proposal._id}`} className="truncate">
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
