import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  proposals: defineTable({
    jobTitle: v.string(),
    jobDescription: v.string(),
    clientName: v.optional(v.string()),
    platform: v.string(),
    generatedProposal: v.string(),
    characterCount: v.number(),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),
});

