import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - synced from Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    // Profile fields from onboarding
    profession: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    experience: v.optional(v.string()),
    style: v.optional(v.string()),
    platforms: v.optional(v.array(v.string())),
    portfolio: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
    // Appearance settings
    colorTheme: v.optional(v.string()), // "indigo" | "emerald" | "rose" | "amber" | "violet" | "cyan"
    textSize: v.optional(v.string()), // "sm" | "base" | "lg" | "xl"
    // Usage limits - Free tier
    proposalsUsed: v.optional(v.number()), // Count of proposals generated this period
    profilesUsed: v.optional(v.number()), // Count of profiles generated this period
    proposalsLimit: v.optional(v.number()), // Default: 10
    profilesLimit: v.optional(v.number()), // Default: 2
    usageResetDate: v.optional(v.number()), // Timestamp for next reset
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Proposals table - linked to users
  proposals: defineTable({
    userId: v.id("users"),
    jobTitle: v.string(),
    jobDescription: v.string(),
    clientName: v.optional(v.string()),
    platform: v.string(),
    generatedProposal: v.string(),
    characterCount: v.number(),
    createdAt: v.number(),
    // Conversion tracking fields
    status: v.optional(v.string()), // "sent" | "responded" | "interviewed" | "won" | "lost"
    budgetAmount: v.optional(v.number()),
    wonAmount: v.optional(v.number()),
    feedback: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // WORK-LIFE BALANCE FEATURE
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Activities table - user's daily commitments for work-life balance
  activities: defineTable({
    userId: v.id("users"),
    name: v.string(), // "Web Development", "Gym", "School", "Network Marketing"
    category: v.string(), // "work" | "health" | "education" | "personal" | "side-hustle"
    // Time-based scheduling (user enters times, we calculate hours)
    startTime: v.optional(v.string()), // "08:00" (24-hour format)
    endTime: v.optional(v.string()), // "14:00" (24-hour format)
    daysOfWeek: v.optional(v.array(v.string())), // ["monday", "tuesday", "wednesday", "thursday", "friday"]
    // Calculated fields
    hoursPerDay: v.optional(v.number()), // Auto-calculated from start/end time
    hoursPerWeek: v.optional(v.number()), // Auto-calculated from hours per day * days
    // Other fields
    priority: v.optional(v.number()), // 1-5 scale
    schedule: v.optional(v.string()), // Legacy or text description
    notes: v.optional(v.string()),
    color: v.optional(v.string()), // For UI visualization
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // AI CHAT FEATURE
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Conversations table - groups of chat messages
  conversations: defineTable({
    userId: v.id("users"),
    title: v.string(), // First message or summary
    type: v.string(), // "balance" | "proposal" | "general"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_updated", ["updatedAt"]),

  // Messages table - individual chat messages
  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.string(), // "user" | "assistant"
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE LIBRARY FEATURE
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Templates table - pre-built proposal templates
  templates: defineTable({
    name: v.string(),
    category: v.string(), // "Web Dev" | "Design" | "Writing" | "Marketing" | "VA"
    description: v.string(),
    preview: v.string(), // Sample proposal structure/text
    successRate: v.number(), // Success rate percentage (e.g., 85)
    tags: v.array(v.string()), // Related keywords
    tone: v.string(), // "professional" | "friendly" | "bold"
    isBuiltIn: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERATED PROFILES FEATURE
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Generated profiles - saved profile generations
  generatedProfiles: defineTable({
    userId: v.id("users"),
    platform: v.string(), // "Upwork" | "Fiverr" | "LinkedIn"
    title: v.string(),
    overview: v.string(),
    skillsSection: v.string(),
    optimizationScore: v.number(),
    suggestions: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN COACHING RULES FEATURE
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Coaching rules - admin-created rules to customize AI responses
  coachingRules: defineTable({
    triggerKeywords: v.array(v.string()), // ["time blocking", "schedule", "calendar"]
    userProfession: v.optional(v.string()), // "developer", "designer", null for all users
    customInstruction: v.string(), // Instruction to append to system prompt
    priority: v.number(), // Higher = applied first, default: 1
    active: v.boolean(), // Whether rule is active
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"), // Admin who created the rule
  })
    .index("by_active", ["active"])
    .index("by_priority", ["priority"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE CONVERTER FEATURE
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Buyer conversations - threads of back-and-forth with buyers
  buyerConversations: defineTable({
    userId: v.id("users"),
    buyerName: v.optional(v.string()),
    platform: v.string(), // "Fiverr" | "Upwork"
    niche: v.string(),
    title: v.string(), // First buyer message preview or custom title
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_updated", ["updatedAt"]),

  // Message conversions - buyer message to converting response (part of conversation)
  messageConversions: defineTable({
    userId: v.id("users"),
    conversationId: v.optional(v.id("buyerConversations")), // Link to conversation thread
    buyerMessage: v.string(),
    platform: v.string(), // "Fiverr" | "Upwork"
    niche: v.string(),
    buyerName: v.optional(v.string()),
    generatedResponse: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_conversation", ["conversationId"])
    .index("by_created_at", ["createdAt"]),
});
