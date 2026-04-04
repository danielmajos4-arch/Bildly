/**
 * Admin / support helpers — not callable from the public client.
 *
 * Finding which account saved a proposal (dashboard, no code):
 * 1. Convex Dashboard → Data → `proposals`
 * 2. Find a row whose `generatedProposal` contains a rare substring (e.g. `retainly.dev`)
 * 3. Copy `userId` → open `users` → match `_id` → read `email`, `name`, `clerkId`
 *
 * CLI (same deployment as your dev/prod):
 *   npx convex run internal/admin:findProposalBySnippet '{"searchSnippet":"retainly.dev"}'
 *
 * Remove or restrict this module if you no longer need server-side substring search.
 */
import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const findProposalBySnippet = internalQuery({
  args: { searchSnippet: v.string() },
  handler: async (ctx, args) => {
    const needle = args.searchSnippet.trim();
    if (!needle) return [];

    const proposals = await ctx.db.query("proposals").collect();
    const matches = proposals.filter((p) =>
      p.generatedProposal.includes(needle),
    );

    const results = [];
    for (const p of matches) {
      const user = await ctx.db.get(p.userId);
      results.push({
        proposalId: p._id,
        userId: p.userId,
        createdAt: p.createdAt,
        jobTitle: p.jobTitle,
        platform: p.platform,
        userEmail: user?.email ?? null,
        userName: user?.name ?? null,
        clerkId: user?.clerkId ?? null,
      });
    }

    return results;
  },
});
