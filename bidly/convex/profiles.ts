import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Save a generated profile
export const saveGeneratedProfile = mutation({
  args: {
    platform: v.string(),
    title: v.string(),
    overview: v.string(),
    skillsSection: v.string(),
    optimizationScore: v.number(),
    suggestions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const profileId = await ctx.db.insert("generatedProfiles", {
      userId: user._id,
      platform: args.platform,
      title: args.title,
      overview: args.overview,
      skillsSection: args.skillsSection,
      optimizationScore: args.optimizationScore,
      suggestions: args.suggestions,
      createdAt: Date.now(),
    });

    return profileId;
  },
});

// Get user's generated profiles
export const getUserProfiles = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("generatedProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get latest profile for a platform
export const getLatestProfileByPlatform = query({
  args: { platform: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    const profiles = await ctx.db
      .query("generatedProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return profiles.find((p) => p.platform === args.platform) || null;
  },
});

