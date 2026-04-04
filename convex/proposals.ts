import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserProposals = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("proposals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getRecentProposals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("proposals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 10);
  },
});

export const saveProposal = mutation({
  args: {
    jobTitle: v.string(),
    jobDescription: v.string(),
    clientName: v.optional(v.string()),
    platform: v.string(),
    budget: v.optional(v.string()),
    profession: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    generatedProposal: v.string(),
    wordCount: v.optional(v.number()),
    characterCount: v.number(),
    winScore: v.optional(v.number()),
    winScoreBreakdown: v.optional(v.object({
      hasSpecifics: v.boolean(),
      hasNumbers: v.boolean(),
      hasBullets: v.boolean(),
      hasQuestion: v.boolean(),
      correctLength: v.boolean(),
    })),
    aiScores: v.optional(v.object({
      hook: v.number(),
      specificity: v.number(),
      credibility: v.number(),
      clarity: v.number(),
      cta: v.number(),
      overall: v.number(),
    })),
    applicationQuestions: v.optional(v.array(v.string())),
    applicationAnswers: v.optional(v.string()),
    customInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const proposalId = await ctx.db.insert("proposals", {
      userId: user._id,
      ...args,
      createdAt: Date.now(),
    });

    return proposalId;
  },
});

export const getProposalCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return 0;

    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return proposals.length;
  },
});
