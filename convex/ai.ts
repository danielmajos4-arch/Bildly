"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const generateProposal = action({
  args: {
    jobTitle: v.string(),
    jobDescription: v.string(),
    clientName: v.optional(v.string()),
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const clientGreeting = args.clientName 
      ? `Address the client as "${args.clientName}".` 
      : "Use a professional greeting without a specific name.";

    const prompt = `You are an expert freelance proposal writer. Write a compelling, personalized proposal for the following job posting.

Platform: ${args.platform}
Job Title: ${args.jobTitle}
Job Description: ${args.jobDescription}

Instructions:
- ${clientGreeting}
- Write 250-350 words
- Be confident but not arrogant
- Show understanding of the client's needs
- Highlight relevant experience (be general but convincing)
- Include a clear call-to-action
- Match the tone to ${args.platform} (more casual for Fiverr, more professional for Upwork)
- DO NOT use placeholder text like [Your Name] - write as if you're the freelancer
- DO NOT include a subject line or email format

Write the proposal now:`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    const generatedProposal = data.content[0].text;
    const characterCount = generatedProposal.length;

    // Save to database
    await ctx.runMutation(api.proposals.saveProposal, {
      jobTitle: args.jobTitle,
      jobDescription: args.jobDescription,
      clientName: args.clientName,
      platform: args.platform,
      generatedProposal,
      characterCount,
    });

    return {
      proposal: generatedProposal,
      characterCount,
    };
  },
});

