import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
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
    plan: v.optional(v.string()),
    colorTheme: v.optional(v.string()),
    textSize: v.optional(v.string()),
    proposalsUsed: v.optional(v.number()),
    // Free tier default is handled in `convex/users.ts` (currently 10/month).
    proposalsLimit: v.optional(v.number()),
    profilesUsed: v.optional(v.number()),
    profilesLimit: v.optional(v.number()),
    usageResetDate: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  proposals: defineTable({
    userId: v.id("users"),
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
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "createdAt"]),
});
