"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

const ADMIN_EMAILS = ["danielmajos4@gmail.com"];

/** Convex `useQuery` subscribes to the DB; optional tick refetches aggregated stats on an interval. */
const STATS_REFRESH_MS = 60_000;

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [refreshTick, setRefreshTick] = useState(0);

  const email = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = Boolean(email && ADMIN_EMAILS.includes(email));

  const stats = useQuery(
    api.admin.getAdminStats,
    isLoaded && isAdmin ? { refreshToken: refreshTick } : "skip",
  );

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace("/sign-in");
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (!isAdmin || !isLoaded) return;
    const id = setInterval(
      () => setRefreshTick((t) => t + 1),
      STATS_REFRESH_MS,
    );
    return () => clearInterval(id);
  }, [isAdmin, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting to sign in…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            This page is only accessible to administrators.
          </p>
        </div>
      </div>
    );
  }

  if (stats === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading admin dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bidly Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Auto-refresh every {STATS_REFRESH_MS / 1000}s · live when data changes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-sm text-emerald-600 mt-2">
              +{stats.newUsersToday} today
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Proposals
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalProposals}
            </p>
            <p className="text-sm text-emerald-600 mt-2">
              +{stats.proposalsToday} today
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 mb-1">
              New Users (7d)
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.newUsersThisWeek}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Proposals (7d)
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.proposalsThisWeek}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Avg: {stats.avgProposalsPerUser} per user
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Top 10 Users
            </h2>
            <div className="space-y-3">
              {stats.topUsers.length > 0 ? (
                stats.topUsers.map((row, idx) => (
                  <div
                    key={`${row.email}-${idx}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {row.name || row.email}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {row.email}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-lg font-bold text-emerald-600">
                        {row.proposalCount}
                      </p>
                      <p className="text-xs text-gray-500">proposals</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No users yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Proposals by Niche
            </h2>
            <div className="space-y-3">
              {Object.entries(stats.nicheBreakdown).length > 0 ? (
                Object.entries(stats.nicheBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([niche, count], idx) => (
                    <div
                      key={`${niche}-${idx}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <p className="font-medium text-gray-900 truncate pr-2">
                        {niche}
                      </p>
                      <p className="text-lg font-bold text-gray-600 shrink-0">
                        {count}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No proposals yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
