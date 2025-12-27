import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get the current user from Convex (by Clerk ID)
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});

// Create or update user when they sign in with Clerk
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        createdAt: Date.now(),
        onboardingComplete: false,
      });
      return userId;
    }
  },
});

// Update user profile (from onboarding or settings)
export const updateProfile = mutation({
  args: {
    profession: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    experience: v.optional(v.string()),
    style: v.optional(v.string()),
    platforms: v.optional(v.array(v.string())),
    portfolio: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
    // Appearance settings
    colorTheme: v.optional(v.string()),
    textSize: v.optional(v.string()),
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

    await ctx.db.patch(user._id, args);
    return user._id;
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// USAGE LIMITS
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_PROPOSALS_LIMIT = 10;
const DEFAULT_PROFILES_LIMIT = 2;
const RESET_PERIOD_DAYS = 30;

// Get usage stats for current user
export const getUsageStats = query({
  args: {},
  handler: async (ctx) => {
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

    const now = Date.now();
    const proposalsLimit = user.proposalsLimit ?? DEFAULT_PROPOSALS_LIMIT;
    const profilesLimit = user.profilesLimit ?? DEFAULT_PROFILES_LIMIT;
    
    // Check if we need to reset usage (past reset date)
    const resetDate = user.usageResetDate ?? (now + RESET_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    const needsReset = now >= resetDate;
    
    const proposalsUsed = needsReset ? 0 : (user.proposalsUsed ?? 0);
    const profilesUsed = needsReset ? 0 : (user.profilesUsed ?? 0);
    
    // Calculate days until reset
    const daysUntilReset = needsReset 
      ? RESET_PERIOD_DAYS 
      : Math.ceil((resetDate - now) / (24 * 60 * 60 * 1000));

    return {
      proposalsUsed,
      proposalsLimit,
      proposalsRemaining: Math.max(0, proposalsLimit - proposalsUsed),
      profilesUsed,
      profilesLimit,
      profilesRemaining: Math.max(0, profilesLimit - profilesUsed),
      resetDate: needsReset ? (now + RESET_PERIOD_DAYS * 24 * 60 * 60 * 1000) : resetDate,
      daysUntilReset,
      needsReset,
    };
  },
});

// Check if user can generate a proposal
export const canGenerateProposal = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { canGenerate: false, reason: "Not authenticated" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { canGenerate: false, reason: "User not found" };
    }

    const now = Date.now();
    const proposalsLimit = user.proposalsLimit ?? DEFAULT_PROPOSALS_LIMIT;
    const resetDate = user.usageResetDate ?? 0;
    const needsReset = now >= resetDate && resetDate > 0;
    
    const proposalsUsed = needsReset ? 0 : (user.proposalsUsed ?? 0);
    const remaining = proposalsLimit - proposalsUsed;

    if (remaining <= 0) {
      return { 
        canGenerate: false, 
        reason: `You've used all ${proposalsLimit} proposals this month. Resets in ${Math.ceil((resetDate - now) / (24 * 60 * 60 * 1000))} days.`,
        remaining: 0,
      };
    }

    return { canGenerate: true, remaining };
  },
});

// Check if user can generate a profile
export const canGenerateProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { canGenerate: false, reason: "Not authenticated" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { canGenerate: false, reason: "User not found" };
    }

    const now = Date.now();
    const profilesLimit = user.profilesLimit ?? DEFAULT_PROFILES_LIMIT;
    const resetDate = user.usageResetDate ?? 0;
    const needsReset = now >= resetDate && resetDate > 0;
    
    const profilesUsed = needsReset ? 0 : (user.profilesUsed ?? 0);
    const remaining = profilesLimit - profilesUsed;

    if (remaining <= 0) {
      return { 
        canGenerate: false, 
        reason: `You've used all ${profilesLimit} profile generations this month. Resets in ${Math.ceil((resetDate - now) / (24 * 60 * 60 * 1000))} days.`,
        remaining: 0,
      };
    }

    return { canGenerate: true, remaining };
  },
});

// Increment proposal usage
export const incrementProposalUsage = mutation({
  args: {},
  handler: async (ctx) => {
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

    const now = Date.now();
    const resetDate = user.usageResetDate ?? 0;
    const needsReset = now >= resetDate && resetDate > 0;
    
    // If reset needed, reset usage and set new reset date
    if (needsReset || resetDate === 0) {
      await ctx.db.patch(user._id, {
        proposalsUsed: 1,
        usageResetDate: now + RESET_PERIOD_DAYS * 24 * 60 * 60 * 1000,
      });
    } else {
      await ctx.db.patch(user._id, {
        proposalsUsed: (user.proposalsUsed ?? 0) + 1,
      });
    }

    return true;
  },
});

// Increment profile usage
export const incrementProfileUsage = mutation({
  args: {},
  handler: async (ctx) => {
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

    const now = Date.now();
    const resetDate = user.usageResetDate ?? 0;
    const needsReset = now >= resetDate && resetDate > 0;
    
    // If reset needed, reset usage and set new reset date
    if (needsReset || resetDate === 0) {
      await ctx.db.patch(user._id, {
        profilesUsed: 1,
        usageResetDate: now + RESET_PERIOD_DAYS * 24 * 60 * 60 * 1000,
      });
    } else {
      await ctx.db.patch(user._id, {
        profilesUsed: (user.profilesUsed ?? 0) + 1,
      });
    }

    return true;
  },
});

