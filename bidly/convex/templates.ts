import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Pre-built templates data
const BUILT_IN_TEMPLATES = [
  {
    name: "Web Development Pro",
    category: "Web Dev",
    description: "Perfect for frontend, backend, and full-stack development projects. Emphasizes technical expertise and problem-solving.",
    preview: `Hey [Client]! Your [specific tech stack] project caught my attention...

I noticed you need [specific requirement from job]. Here's my approach:

1. **Discovery Phase**: I'll start by understanding your exact requirements and any existing codebase
2. **Development**: Build with clean, maintainable code using [relevant technologies]
3. **Testing & QA**: Thorough testing to ensure everything works flawlessly
4. **Deployment**: Smooth launch with documentation

I recently completed a similar project where [brief relevant example]. Check out my portfolio: [link]

Quick question: Are you looking for ongoing maintenance after launch, or is this a one-time build?

Let's make this happen!`,
    successRate: 89,
    tags: ["react", "node", "typescript", "fullstack", "api", "database"],
    tone: "professional",
  },
  {
    name: "Creative Designer",
    category: "Design",
    description: "Ideal for UI/UX, graphic design, and branding projects. Highlights creativity and visual thinking.",
    preview: `Not gonna lie - your project got me excited! The way you described [specific design need] tells me you have great taste.

Here's what I'm thinking:

First, I'd love to understand your brand's vibe better. Then I'll create 2-3 initial concepts for you to choose from. We iterate until it's perfect.

My design philosophy: Less is more, but every element should have purpose.

I've worked with [similar industry/type] clients before, and I know exactly how to make [specific outcome] happen. Here's my recent work: [portfolio]

One question - do you have existing brand guidelines, or are we starting fresh?

Can't wait to bring your vision to life!`,
    successRate: 87,
    tags: ["ui/ux", "figma", "branding", "logo", "graphics", "visual"],
    tone: "creative",
  },
  {
    name: "Content Writer",
    category: "Writing",
    description: "Great for blog posts, copywriting, and content creation. Showcases writing style and research skills.",
    preview: `Hey! Your content project is right up my alley.

I noticed you're looking for [specific content type] about [topic]. I've written extensively in this space and understand what resonates with [target audience].

My process:
- Research your competitors and audience
- Create an outline for your approval
- Write engaging, SEO-friendly content
- Revise until you're thrilled

Here's a sample of my work in a similar niche: [link]

Quick Q: Do you have specific keywords you're targeting, or should I do keyword research as part of this?

Let's create content that converts!`,
    successRate: 85,
    tags: ["copywriting", "blog", "seo", "content", "articles", "editing"],
    tone: "friendly",
  },
  {
    name: "Digital Marketer",
    category: "Marketing",
    description: "Perfect for social media, ads, and growth marketing projects. Emphasizes ROI and data-driven results.",
    preview: `Real talk: I've seen a lot of marketing proposals, and I know you're probably getting generic responses. Let me be specific.

For your [specific campaign/goal], here's my strategy:

📊 **Week 1-2**: Audit current performance, competitor analysis
🎯 **Week 3-4**: Launch optimized campaigns with A/B testing
📈 **Ongoing**: Data-driven optimization for maximum ROI

I recently helped a [similar business] achieve [specific metric improvement]. Happy to share the case study.

My question: What's your current monthly ad spend, and what CPA are you targeting?

Let's grow your [business metric] together.`,
    successRate: 84,
    tags: ["social media", "ads", "seo", "growth", "analytics", "ppc"],
    tone: "confident",
  },
  {
    name: "Virtual Assistant",
    category: "VA",
    description: "Ideal for admin support, data entry, and executive assistance. Highlights reliability and organization.",
    preview: `Hi there! I'd love to take those [specific tasks] off your plate.

I understand running a business means wearing too many hats. Here's how I can help:

✅ [Specific task 1 from job post]
✅ [Specific task 2 from job post]
✅ Proactive communication - you'll always know what's happening

I'm available [your hours] and use tools like [relevant tools]. My response time is typically under [timeframe].

I've supported [similar role/industry] before and know exactly how to keep things running smoothly.

Would you prefer daily updates or weekly summaries?

Ready to make your life easier!`,
    successRate: 91,
    tags: ["admin", "data entry", "scheduling", "email", "research", "support"],
    tone: "friendly",
  },
];

// Get all templates
export const getAllTemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("templates").collect();
  },
});

// Get templates by category
export const getTemplatesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("templates")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Get single template
export const getTemplate = query({
  args: { id: v.id("templates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Seed templates - run once to populate the database
export const seedTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if templates already exist
    const existing = await ctx.db.query("templates").first();
    if (existing) {
      return { message: "Templates already seeded", count: 0 };
    }

    // Insert all built-in templates
    for (const template of BUILT_IN_TEMPLATES) {
      await ctx.db.insert("templates", {
        ...template,
        isBuiltIn: true,
        createdAt: Date.now(),
      });
    }

    return { message: "Templates seeded successfully", count: BUILT_IN_TEMPLATES.length };
  },
});

