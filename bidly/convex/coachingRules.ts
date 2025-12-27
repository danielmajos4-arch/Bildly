import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./admin";

// ═══════════════════════════════════════════════════════════════════════════
// COACHING RULES QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all rules (admin only, or all active rules for public use)
 */
export const getAllRules = query({
  args: {
    includeInactive: v.optional(v.boolean()), // If true, include inactive rules (admin only)
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return only active rules for unauthenticated
      return await ctx.db
        .query("coachingRules")
        .withIndex("by_active", (q) => q.eq("active", true))
        .collect();
    }

    // Check if admin
    const adminEmail = process.env.ADMIN_EMAIL;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    const isAdmin = adminEmail && user && user.email.toLowerCase() === adminEmail.toLowerCase();

    if (isAdmin && args.includeInactive) {
      // Admin can see all rules
      const rules = await ctx.db.query("coachingRules").collect();
      return rules.sort((a, b) => b.priority - a.priority);
    }

    // Return only active rules, ordered by priority
    const rules = await ctx.db
      .query("coachingRules")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    
    return rules.sort((a, b) => b.priority - a.priority);
  },
});

/**
 * Get rules that match a user's profession and message
 * Used by AI functions to find applicable rules
 */
export const getMatchingRules = query({
  args: {
    userProfession: v.optional(v.string()),
    userMessage: v.string(), // User's message to check for keyword matches
  },
  handler: async (ctx, args) => {
    // Get all active rules
    const allRules = await ctx.db
      .query("coachingRules")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    const userMessageLower = args.userMessage.toLowerCase();

    // Filter rules that match:
    // 1. Profession matches (or profession is null for all users)
    // 2. At least one trigger keyword is in the user's message
    const matchingRules = allRules.filter((rule) => {
      // Check profession match
      const professionMatches =
        !rule.userProfession || rule.userProfession === args.userProfession;

      if (!professionMatches) {
        return false;
      }

      // Check keyword match
      const keywordMatches = rule.triggerKeywords.some((keyword) =>
        userMessageLower.includes(keyword.toLowerCase())
      );

      return keywordMatches;
    });

    // Sort by priority (highest first)
    return matchingRules.sort((a, b) => b.priority - a.priority);
  },
});

/**
 * Get a single rule by ID
 */
export const getRuleById = query({
  args: {
    ruleId: v.id("coachingRules"),
  },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.ruleId);
    return rule;
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// COACHING RULES MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a new coaching rule (admin only)
 */
export const createRule = mutation({
  args: {
    triggerKeywords: v.array(v.string()),
    userProfession: v.optional(v.string()),
    customInstruction: v.string(),
    priority: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Require admin access
    const adminUser = await requireAdmin(ctx);

    // Validate required fields
    if (!args.triggerKeywords || args.triggerKeywords.length === 0) {
      throw new Error("At least one trigger keyword is required");
    }

    if (!args.customInstruction || args.customInstruction.trim() === "") {
      throw new Error("Custom instruction is required");
    }

    const now = Date.now();
    const ruleId = await ctx.db.insert("coachingRules", {
      triggerKeywords: args.triggerKeywords,
      userProfession: args.userProfession,
      customInstruction: args.customInstruction.trim(),
      priority: args.priority ?? 1,
      active: args.active ?? true,
      createdAt: now,
      updatedAt: now,
      createdBy: adminUser._id,
    });

    return ruleId;
  },
});

/**
 * Update an existing rule (admin only)
 */
export const updateRule = mutation({
  args: {
    ruleId: v.id("coachingRules"),
    triggerKeywords: v.optional(v.array(v.string())),
    userProfession: v.optional(v.string()),
    customInstruction: v.optional(v.string()),
    priority: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Require admin access
    await requireAdmin(ctx);

    const { ruleId, ...updates } = args;

    // Verify rule exists
    const rule = await ctx.db.get(ruleId);
    if (!rule) {
      throw new Error("Rule not found");
    }

    // Validate if updating triggerKeywords
    if (updates.triggerKeywords && updates.triggerKeywords.length === 0) {
      throw new Error("At least one trigger keyword is required");
    }

    // Validate if updating customInstruction
    if (
      updates.customInstruction !== undefined &&
      updates.customInstruction.trim() === ""
    ) {
      throw new Error("Custom instruction cannot be empty");
    }

    // Build update object
    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (updates.triggerKeywords !== undefined) {
      updateData.triggerKeywords = updates.triggerKeywords;
    }
    if (updates.userProfession !== undefined) {
      updateData.userProfession = updates.userProfession;
    }
    if (updates.customInstruction !== undefined) {
      updateData.customInstruction = updates.customInstruction.trim();
    }
    if (updates.priority !== undefined) {
      updateData.priority = updates.priority;
    }
    if (updates.active !== undefined) {
      updateData.active = updates.active;
    }

    await ctx.db.patch(ruleId, updateData);

    return ruleId;
  },
});

/**
 * Delete a rule (admin only)
 * This is a hard delete - rule is permanently removed
 */
export const deleteRule = mutation({
  args: {
    ruleId: v.id("coachingRules"),
  },
  handler: async (ctx, args) => {
    // Require admin access
    await requireAdmin(ctx);

    // Verify rule exists
    const rule = await ctx.db.get(args.ruleId);
    if (!rule) {
      throw new Error("Rule not found");
    }

    // Hard delete
    await ctx.db.delete(args.ruleId);

    return true;
  },
});

