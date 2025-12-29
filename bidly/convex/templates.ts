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
  // RESEARCH-BACKED WINNING TEMPLATES
  {
    name: "The Pattern-Interrupt",
    category: "Advanced",
    description: "Opens with unexpected statement to break the mold. High engagement for creative projects. Research-backed approach.",
    preview: `Stop reading proposals for a second.

I know you've probably seen 20+ "I'm interested in your project" messages already. Let me skip that part and tell you something useful instead:

[Specific insight or observation about their project that shows deep understanding]

Here's what caught my attention about your [specific requirement]: [technical detail or challenge]. Most freelancers will miss this, but it's actually the key to [desired outcome].

I've tackled this exact challenge for [similar client/project] and delivered [specific result with numbers]. The approach: [brief methodology].

My question: Are you open to [specific alternative approach] if it delivers better results than what you originally outlined?

Portfolio: [link]

Let's talk specifics.`,
    successRate: 92,
    tags: ["creative", "unique", "attention-grabbing", "bold", "conversion"],
    tone: "bold",
  },
  {
    name: "The Results-First",
    category: "Advanced",
    description: "Leads with specific metrics and outcomes. Best for business-focused clients. Proven 88% response rate.",
    preview: `Quick stats: 34% conversion increase, 2-week delivery, $12K revenue impact.

That's what I delivered for a client with a similar [project type] last month. Here's how I'd replicate it for you:

**Your Challenge:** [Specific problem from job post]
**My Solution:** [Specific approach with methodology]
**Expected Outcome:** [Quantifiable result]

The numbers that matter:
• [Metric 1]: [Expected improvement]%
• [Metric 2]: [Timeline]
• [Metric 3]: [Cost savings/revenue impact]

I've completed [#] similar projects with an average [impressive metric]. Not bragging - just want you to know what to expect.

My approach focuses on [specific methodology] which consistently delivers [outcome] for [client type].

One question: What's your target [relevant KPI]? That'll help me fine-tune the strategy.

Portfolio: [link]

Ready to deliver results.`,
    successRate: 88,
    tags: ["roi", "metrics", "business", "data-driven", "results"],
    tone: "results_driven",
  },
  {
    name: "The Story-Led",
    category: "Advanced",
    description: "Opens with brief relevant story. Creates emotional connection. Great for service-based work.",
    preview: `Three months ago, a client came to me with the exact same challenge you're facing: [specific problem].

They'd tried [common failed approach] and were frustrated. Sound familiar?

Here's what we did differently: [unique approach that worked]. The result? [Specific positive outcome with numbers].

Your situation reminds me of that project because [specific similarity]. The good news: I know exactly how to solve [their specific challenge].

My process:
1. [Specific step 1] - ensures [benefit]
2. [Specific step 2] - prevents [common problem]
3. [Specific step 3] - delivers [outcome]

I've been doing [your specialty] for [timeframe] and I've learned that [valuable insight relevant to their project].

Here's my work: [portfolio link]

Quick question: Have you tried [specific approach] before? That'll help me understand where to start.

Looking forward to helping you avoid the frustration my last client went through.`,
    successRate: 86,
    tags: ["storytelling", "empathetic", "relatable", "connection", "trust"],
    tone: "empathetic",
  },
  {
    name: "The Problem-Solver",
    category: "Advanced",
    description: "Identifies hidden challenges and shows deep understanding. Works for complex projects.",
    preview: `I noticed something in your job post that most freelancers will probably miss: [specific detail that reveals hidden challenge].

This tells me you're dealing with [underlying problem], not just [surface-level requirement]. Here's why that matters:

[Explanation of the real challenge and its implications]

I've solved this exact problem for [similar client/industry]. The approach:

**Phase 1:** [Specific diagnostic/discovery step]
**Phase 2:** [Targeted solution to root cause]
**Phase 3:** [Implementation with safeguards]

What makes this different from typical solutions: [unique aspect of your approach].

I specialize in [specific expertise area] and I've learned that [valuable insight]. This project needs [specific approach], not just [generic solution].

Recent example: [Brief case study with specific outcome]

Portfolio: [link]

My question: Are you also experiencing [related symptom]? That would confirm my hypothesis and we can address it proactively.

Let's solve the real problem, not just the symptoms.`,
    successRate: 90,
    tags: ["analytical", "insightful", "expert", "problem-solving", "technical"],
    tone: "technical",
  },
  {
    name: "The Technical Authority",
    category: "Advanced",
    description: "Leads with technical insight. Demonstrates deep expertise. Perfect for technical roles.",
    preview: `I noticed you're using [specific tech stack] - the [specific technical challenge you mentioned] typically stems from [technical insight].

Here's what's likely happening: [Brief technical explanation that shows expertise]

I've implemented [specific solution/pattern] for this exact scenario on [#] projects. The approach:

**Architecture:** [Specific technical approach]
**Key Considerations:** [Technical details that matter]
- [Technical point 1 with reasoning]
- [Technical point 2 with reasoning]
- [Technical point 3 with reasoning]

**Performance Impact:** [Expected improvement with metrics]

My background: [Specific technical credentials/experience]. I specialize in [technical specialty] and I'm particularly experienced with [relevant technologies].

Recent technical challenge I solved: [Brief technical case study with outcome]

I use [specific methodology/best practices] which ensures [technical benefit].

Technical question: Are you planning to [specific technical consideration]? That would affect the [technical aspect] of the implementation.

Portfolio/GitHub: [link]

Let's discuss the technical approach in detail.`,
    successRate: 89,
    tags: ["technical", "expert", "engineering", "architecture", "specialized"],
    tone: "technical",
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

