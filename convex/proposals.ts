import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveProposal = mutation({
  args: {
    jobTitle: v.string(),
    jobDescription: v.string(),
    clientName: v.optional(v.string()),
    platform: v.string(),
    generatedProposal: v.string(),
    characterCount: v.number(),
  },
  handler: async (ctx, args) => {
    const proposalId = await ctx.db.insert("proposals", {
      ...args,
      createdAt: Date.now(),
    });
    return proposalId;
  },
});

export const getRecentProposals = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("proposals")
      .withIndex("by_created_at")
      .order("desc")
      .take(10);
  },
});

