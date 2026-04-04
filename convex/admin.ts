import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAdminStats = query({
  args: { refreshToken: v.optional(v.number()) },
  handler: async (ctx, args) => {
    void args.refreshToken;
    const identity = await ctx.auth.getUserIdentity();

    // Only allow specific admin emails
    const ADMIN_EMAILS = [
      "danielmajos4@gmail.com",
    ];

    if (!identity || !ADMIN_EMAILS.includes(identity.email || "")) {
      throw new Error("Unauthorized - Admin access only");
    }

    // Get all users
    const allUsers = await ctx.db.query("users").collect();

    // Get all proposals
    const allProposals = await ctx.db.query("proposals").collect();

    // Calculate stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newUsersToday = allUsers.filter((u) =>
      new Date(u._creationTime) >= today,
    ).length;

    const newUsersThisWeek = allUsers.filter((u) =>
      new Date(u._creationTime) >= thisWeek,
    ).length;

    const proposalsToday = allProposals.filter((p) =>
      new Date(p.createdAt) >= today,
    ).length;

    const proposalsThisWeek = allProposals.filter((p) =>
      new Date(p.createdAt) >= thisWeek,
    ).length;

    // Get top users by proposal count
    const userProposalCounts = allUsers
      .map((user) => {
        const proposalCount = allProposals.filter((p) => p.userId === user._id)
          .length;
        return {
          email: user.email,
          name: user.name,
          proposalCount,
          plan: user.plan,
          createdAt: user._creationTime,
        };
      })
      .sort((a, b) => b.proposalCount - a.proposalCount)
      .slice(0, 10);

    // Count proposals by niche
    const nicheBreakdown: Record<string, number> = {};
    allProposals.forEach((p) => {
      const niche = p.profession || "Unknown";
      nicheBreakdown[niche] = (nicheBreakdown[niche] || 0) + 1;
    });

    return {
      totalUsers: allUsers.length,
      totalProposals: allProposals.length,
      newUsersToday,
      newUsersThisWeek,
      proposalsToday,
      proposalsThisWeek,
      avgProposalsPerUser:
        allUsers.length > 0
          ? (allProposals.length / allUsers.length).toFixed(2)
          : "0",
      topUsers: userProposalCounts,
      nicheBreakdown,
      lastUpdated: new Date().toISOString(),
    };
  },
});
