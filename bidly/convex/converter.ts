import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get the current user's message conversions
export const getUserConversions = query({
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
      .query("messageConversions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get recent conversions for the current user
export const getRecentConversions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
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
      .query("messageConversions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 10);
  },
});

// Get buyer conversations for the current user
export const getBuyerConversations = query({
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
      .query("buyerConversations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get a conversation with all its messages
export const getConversation = query({
  args: {
    conversationId: v.id("buyerConversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return null;
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || conversation.userId !== user._id) {
      return null;
    }

    const messages = await ctx.db
      .query("messageConversions")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    return {
      ...conversation,
      messages,
    };
  },
});

// Create a new buyer conversation
export const createConversation = mutation({
  args: {
    buyerName: v.optional(v.string()),
    platform: v.string(),
    niche: v.string(),
    title: v.string(),
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

    const now = Date.now();
    const conversationId = await ctx.db.insert("buyerConversations", {
      userId: user._id,
      buyerName: args.buyerName,
      platform: args.platform,
      niche: args.niche,
      title: args.title,
      createdAt: now,
      updatedAt: now,
    });

    return conversationId;
  },
});

// Update conversation title
export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id("buyerConversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || conversation.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.conversationId, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

// Save a new message conversion for the current user
export const saveConversion = mutation({
  args: {
    conversationId: v.optional(v.id("buyerConversations")),
    buyerMessage: v.string(),
    platform: v.string(),
    niche: v.string(),
    buyerName: v.optional(v.string()),
    generatedResponse: v.string(),
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

    const conversionId = await ctx.db.insert("messageConversions", {
      userId: user._id,
      conversationId: args.conversationId,
      buyerMessage: args.buyerMessage,
      platform: args.platform,
      niche: args.niche,
      buyerName: args.buyerName,
      generatedResponse: args.generatedResponse,
      createdAt: Date.now(),
    });

    // Update conversation's updatedAt if it exists
    if (args.conversationId) {
      await ctx.db.patch(args.conversationId, {
        updatedAt: Date.now(),
      });
    }

    return conversionId;
  },
});

// Get conversion count for the current user
export const getConversionCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return 0;
    }

    const conversions = await ctx.db
      .query("messageConversions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return conversions.length;
  },
});

