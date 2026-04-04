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
      const plan = existingUser.plan ?? "free";
      const patch: Record<string, unknown> = {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      };

      // Backfill defaults for older free accounts
      if (plan === "free" && existingUser.proposalsLimit == null) {
        patch.proposalsLimit = FREE_PROPOSALS_LIMIT;
      }
      if (plan === "free" && existingUser.proposalsUsed == null) {
        patch.proposalsUsed = 0;
      }
      if (plan === "free" && existingUser.usageResetDate == null) {
        patch.usageResetDate =
          Date.now() + RESET_PERIOD_DAYS * 24 * 60 * 60 * 1000;
      }

      await ctx.db.patch(existingUser._id, patch);
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
        plan: "free",
        proposalsUsed: 0,
        proposalsLimit: FREE_PROPOSALS_LIMIT,
        usageResetDate: Date.now() + RESET_PERIOD_DAYS * 24 * 60 * 60 * 1000,
      });
      return userId;
    }
  },
});

// Update user profile (from onboarding or settings)
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    profession: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    experience: v.optional(v.string()),
    style: v.optional(v.string()),
    platforms: v.optional(v.array(v.string())),
    portfolio: v.optional(v.string()),
    pastWorkSummary: v.optional(v.string()),
    mainSkill: v.optional(v.string()),
    yearsOfExperience: v.optional(v.string()),
    mainPlatform: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
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

/** One-time profile setup after sign-up (required fields + optional extras). */
export const completeOnboarding = mutation({
  args: {
    profession: v.string(),
    skills: v.array(v.string()),
    pastWorkSummary: v.string(),
    portfolioLink: v.optional(v.string()),
    yearsExperience: v.optional(v.string()),
    primaryPlatforms: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const mainSkill = args.skills[0] ?? args.profession;
    const mainPlatform =
      args.primaryPlatforms && args.primaryPlatforms.length > 0
        ? args.primaryPlatforms[0]
        : undefined;

    await ctx.db.patch(user._id, {
      profession: args.profession,
      skills: args.skills,
      pastWorkSummary: args.pastWorkSummary,
      portfolio: args.portfolioLink,
      yearsOfExperience: args.yearsExperience,
      platforms: args.primaryPlatforms,
      mainSkill,
      mainPlatform,
      onboardingComplete: true,
    });

    return { success: true };
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// USAGE LIMITS
// ═══════════════════════════════════════════════════════════════════════════

const FREE_PROPOSALS_LIMIT = 10;
const RESET_PERIOD_DAYS = 30;

export const getUsageStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    const plan = user.plan ?? "free";
    const isPro = plan === "pro";
    const now = Date.now();

    const resetDate = user.usageResetDate ?? (now + RESET_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    const needsReset = now >= resetDate;
    const proposalsUsed = needsReset ? 0 : (user.proposalsUsed ?? 0);
    const proposalsLimit = isPro ? null : (user.proposalsLimit ?? FREE_PROPOSALS_LIMIT);

    const daysUntilReset = needsReset
      ? RESET_PERIOD_DAYS
      : Math.ceil((resetDate - now) / (24 * 60 * 60 * 1000));

    return {
      plan,
      isPro,
      proposalsUsed,
      proposalsLimit,
      proposalsRemaining: isPro ? null : Math.max(0, (proposalsLimit ?? FREE_PROPOSALS_LIMIT) - proposalsUsed),
      resetDate: needsReset ? (now + RESET_PERIOD_DAYS * 24 * 60 * 60 * 1000) : resetDate,
      daysUntilReset,
      needsReset,
    };
  },
});

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

    const plan = user.plan ?? "free";
    if (plan === "pro") {
      const proposalsUsed = user.proposalsUsed ?? 0;
      return { canGenerate: true, remaining: null, proposalsUsed };
    }

    const now = Date.now();
    const proposalsLimit = user.proposalsLimit ?? FREE_PROPOSALS_LIMIT;
    const resetDate = user.usageResetDate ?? 0;
    const needsReset = now >= resetDate && resetDate > 0;

    const proposalsUsed = needsReset ? 0 : (user.proposalsUsed ?? 0);
    const remaining = proposalsLimit - proposalsUsed;

    if (remaining <= 0) {
      return {
        canGenerate: false,
        reason: `You've used all ${proposalsLimit} proposals this month. Resets in ${Math.ceil((resetDate - now) / (24 * 60 * 60 * 1000))} days.`,
        remaining: 0,
        proposalsUsed,
      };
    }

    return { canGenerate: true, remaining, proposalsUsed };
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


