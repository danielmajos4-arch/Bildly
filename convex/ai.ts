"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

interface AiScores {
  hook: number;
  specificity: number;
  credibility: number;
  clarity: number;
  cta: number;
  overall: number;
}

const ANSWER_MARKER = "---APPLICATION_ANSWERS---";

function parseProposalAndScores(raw: string): {
  proposal: string;
  aiScores: AiScores;
  applicationAnswers?: string;
} {
  const scorePattern = /Hook:\s*(\d+)\s*\/\s*10[\s\S]*?Specificity:\s*(\d+)\s*\/\s*10[\s\S]*?Credibility:\s*(\d+)\s*\/\s*10[\s\S]*?Clarity:\s*(\d+)\s*\/\s*10[\s\S]*?CTA:\s*(\d+)\s*\/\s*10[\s\S]*?Overall:\s*(\d+)\s*\/\s*10/;

  const match = raw.match(scorePattern);

  if (match) {
    const scoreBlockStart = raw.indexOf(match[0]);
    const scoreBlockEnd = scoreBlockStart + match[0].length;
    let proposalText = raw.slice(0, scoreBlockStart).trim();
    const afterScores = raw.slice(scoreBlockEnd).trim();

    let applicationAnswers: string | undefined;
    const answerIdxBefore = proposalText.indexOf(ANSWER_MARKER);
    if (answerIdxBefore !== -1) {
      applicationAnswers = proposalText.slice(answerIdxBefore + ANSWER_MARKER.length).trim();
      proposalText = proposalText.slice(0, answerIdxBefore).trim();
    } else if (afterScores.includes(ANSWER_MARKER)) {
      const answerIdxAfter = afterScores.indexOf(ANSWER_MARKER);
      applicationAnswers = afterScores.slice(answerIdxAfter + ANSWER_MARKER.length).trim();
    }

    const clamp = (n: number) => Math.min(10, Math.max(1, n));
    const hook = clamp(parseInt(match[1]));
    const specificity = clamp(parseInt(match[2]));
    const credibility = clamp(parseInt(match[3]));
    const clarity = clamp(parseInt(match[4]));
    const cta = clamp(parseInt(match[5]));
    const overall = Math.round((hook + specificity + credibility + clarity + cta) / 5);
    return {
      proposal: proposalText,
      aiScores: { hook, specificity, credibility, clarity, cta, overall: clamp(overall) },
      applicationAnswers,
    };
  }

  let text = raw.trim();
  let applicationAnswers: string | undefined;
  const answerIdx = text.indexOf(ANSWER_MARKER);
  if (answerIdx !== -1) {
    applicationAnswers = text.slice(answerIdx + ANSWER_MARKER.length).trim();
    text = text.slice(0, answerIdx).trim();
  }

  return {
    proposal: text,
    aiScores: { hook: 6, specificity: 6, credibility: 6, clarity: 6, cta: 6, overall: 6 },
    applicationAnswers,
  };
}

export const generateProposal = action({
  args: {
    jobTitle: v.string(),
    jobDescription: v.string(),
    clientName: v.optional(v.string()),
    platform: v.string(),
    budget: v.optional(v.string()),
    profession: v.string(),
    skills: v.array(v.string()),
    pastWork: v.optional(v.string()),
    portfolioLink: v.optional(v.string()),
    freelancerName: v.optional(v.string()),
    mainSkill: v.optional(v.string()),
    yearsOfExperience: v.optional(v.string()),
    mainPlatform: v.optional(v.string()),
    attachmentContent: v.optional(v.string()),
    applicationQuestions: v.optional(v.array(v.string())),
    customInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const canGenerate = await ctx.runQuery(api.users.canGenerateProposal);
    if (!canGenerate.canGenerate) {
      throw new Error(canGenerate.reason || "Usage limit reached");
    }

    const {
      jobTitle,
      jobDescription,
      clientName,
      platform,
      budget,
      profession,
      skills,
      pastWork,
      portfolioLink,
      attachmentContent,
      applicationQuestions,
      customInstructions,
    } = args;

    const trimmedInstructions = customInstructions?.trim();
    const customInstructionsBlock =
      trimmedInstructions && trimmedInstructions.length > 0
        ? `

<custom_instructions>
CRITICAL: The user has provided specific instructions for how they want this proposal written.
You MUST follow these instructions EXACTLY. They override any conflicting guidance above.

USER INSTRUCTIONS:
${trimmedInstructions.replace(/</g, "&lt;")}

FOLLOW THESE INSTRUCTIONS PRECISELY. This is what the user wants.
</custom_instructions>
`
        : "";

    let prompt = `<role>
You are an expert freelance proposal writer who has helped freelancers across ALL niches win $2M+ in contracts on Upwork, Fiverr, and Freelancer.com.

You write proposals that achieve 40%+ response rates across:
- Development & Tech (web dev, mobile dev, software engineering)
- Design & Creative (graphic design, UI/UX, video editing, animation)
- Writing & Content (copywriting, content writing, SEO writing, ghostwriting)
- Marketing (email marketing, social media, SEO, paid ads, growth)
- Admin & Support (virtual assistants, data entry, customer service)
- And ALL other freelance niches

Your proposals work because you:
- ADAPT to each niche's unique proof style (metrics for marketers, portfolios for designers, speed for developers)
- Match the CLIENT'S energy and urgency
- Use SPECIFIC proof with numbers, timelines, exact scenarios
- Show immediate availability when needed
- End with LOW-FRICTION next steps tailored to the niche

You write like a human, not an AI - conversational but confident.
</role>

<niche_detection>
FIRST, analyze the freelancer's profession and skills to detect their niche:

DEVELOPMENT & TECH niches:
- Keywords: developer, programmer, engineer, coding, software, web, mobile, app, API, database, full-stack, frontend, backend
- Stack mentions: React, Next.js, Python, Node.js, Ruby, PHP, Swift, Kotlin, etc.
- Focus: Speed to production, architecture, scalability, tech stack

DESIGN & CREATIVE niches:
- Keywords: designer, design, graphics, logo, branding, UI, UX, illustration, video, animation, editing, motion
- Tools: Figma, Adobe, Photoshop, Illustrator, Premiere, After Effects, Canva
- Focus: Visual style, brand fit, portfolio, revisions

WRITING & CONTENT niches:
- Keywords: writer, writing, content, copywriter, copy, blog, article, SEO, editor, ghostwriter
- Skills: SEO writing, content strategy, editing, proofreading
- Focus: Traffic, engagement, conversions, samples

EMAIL MARKETING niche:
- Keywords: email marketing, email campaigns, newsletters, Klaviyo, Mailchimp, ActiveCampaign, drip campaigns
- Focus: Open rates, CTR, conversion rates, funnel optimization

SOCIAL MEDIA niches:
- Keywords: social media, Instagram, Facebook, TikTok, LinkedIn, Twitter, content creation, community management
- Tools: Hootsuite, Buffer, Later, Canva
- Focus: Growth, engagement rates, follower counts, content strategy

SEO & DIGITAL MARKETING niches:
- Keywords: SEO, digital marketing, Google Ads, PPC, SEM, analytics, growth hacking
- Tools: SEMrush, Ahrefs, Google Analytics
- Focus: Rankings, traffic, ROI, conversions

VIRTUAL ASSISTANT niches:
- Keywords: virtual assistant, VA, admin, administrative, support, scheduling, calendar, data entry
- Tools: Asana, Trello, Notion, Google Workspace, Slack
- Focus: Reliability, organization, communication, tools expertise

VIDEO & ANIMATION niches:
- Keywords: video editor, video editing, animator, motion graphics, After Effects, Premiere
- Focus: Style matching, turnaround time, watch time, engagement

Based on the detected niche, you will adapt:
1. What metrics/proof to emphasize
2. How to structure the approach section
3. What type of question to ask at the end
</niche_detection>

<job_analysis>
After detecting niche, analyze the job post for these signals:

URGENCY SIGNALS (adjust approach if found):
- Words: "ASAP", "urgent", "immediately", "today", "critical", "blocking", "production", "live", "broken"
- Emojis: 🚨, ⚠️, 🔥
- Timeline: "within 24 hours", "need this now", "start today"

BUDGET SIGNALS:
- Low budget ($50-300) = efficiency-focused
- Medium budget ($300-1500) = results-focused
- High budget ($1500+) = strategic partnership-focused

COMPLEXITY SIGNALS:
- Simple fix = show speed
- Complex project = show process
- Strategic work = show thinking

Based on these signals AND the niche, adjust your tone and structure.
</job_analysis>

<job_details>
<title>${jobTitle}</title>
<description>${jobDescription}</description>
<client_name>${clientName || "the client"}</client_name>
<platform>${platform}</platform>
<budget>${budget || "not specified"}</budget>
</job_details>

<freelancer_context>
<profession>${profession}</profession>
<skills>${skills.join(", ")}</skills>
<past_work>${pastWork || "No specific past work provided - use general expertise statements based on profession and skills"}</past_work>
<portfolio_link>${portfolioLink || "Not provided"}</portfolio_link>
</freelancer_context>

${attachmentContent ? `<attachment_context>\n${attachmentContent.slice(0, 3000)}\n</attachment_context>` : ""}
${customInstructionsBlock}

<instructions>
Generate a WINNING proposal using the 4-part structure below, but ADAPT based on niche detection and job analysis:

═══════════════════════════════════════════════════════
PART 1: PROBLEM-FIRST HOOK (1-2 sentences)
═══════════════════════════════════════════════════════

UNIVERSAL RULES:
- NEVER start with "Hi, I'm..." or "I have X years..."
- Address their SPECIFIC pain point using their exact words or terms
- Show you deeply understand the problem

NICHE-SPECIFIC HOOKS:

FOR DEVELOPMENT & TECH:
- Urgent: "I can fix this [specific bug/issue] in the next [X] hours—I'm available right now and have debugged this exact [technology] issue [X] times this month."
- Normal: "Building [type of app] that actually works in production requires more than just coding—it's architecture decisions that prevent bottlenecks at scale."
- Complex: "The challenge with [technical project] isn't the code—it's [specific technical insight about their problem]."

FOR DESIGN & CREATIVE:
- Lead with visual/brand insight: "Your current [design element] doesn't match the [premium/modern/playful] feel of your [product/brand]."
- Reference their existing work: "After looking at your [website/social media/brand], I can see you're going for [style] but the [specific element] isn't quite there yet."
- Portfolio-first: "I've created [similar design type] for [X] brands in [their industry]—here's one that achieved [specific result]."

FOR WRITING & CONTENT:
- SEO focus: "Blog posts that don't rank on Google are just expensive PDFs sitting in your CMS."
- Copywriting: "Landing page copy that converts at 1% means you're losing 99 out of 100 visitors who could become customers."
- Content strategy: "Publishing content without a distribution strategy is like opening a store in the desert and wondering why no one shops there."

FOR EMAIL MARKETING:
- Metrics-first: "Email open rates at [their current %] mean you're losing [X]% of your list before they even read your message."
- Funnel insight: "A welcome sequence that doesn't guide subscribers through a clear value ladder leaves money on the table with every signup."
- Platform-specific: "Klaviyo flows that don't segment based on behavior are basically batch-and-blast with extra steps."

FOR SOCIAL MEDIA:
- Growth focus: "Growing [platform] organically in 2026 requires strategy and consistency, not just posting whenever you have time."
- Engagement: "Posts with [low] engagement mean your content isn't reaching your followers' feeds, no matter how good it is."
- Content insight: "Your [Instagram/TikTok/LinkedIn] content has potential, but the [hook/CTA/format] isn't optimized for [their platform's] algorithm."

FOR VIRTUAL ASSISTANT:
- Organization: "Managing [calendars/emails/projects] across time zones without a system leads to missed deadlines and communication gaps."
- Reliability: "The difference between a good VA and a great one is proactive deadline tracking, not just reactive task completion."
- Tools: "Keeping everything organized in [their tools] instead of switching between platforms saves hours every week."

FOR VIDEO EDITING:
- Style: "Video editing that matches your brand's [energy/aesthetic] keeps viewers watching past the first 3 seconds."
- Pacing: "The pacing and transitions in [their current videos] could be tightened to maintain [higher] watch time and engagement."
- Platform-specific: "[YouTube/TikTok/Instagram] videos need different editing styles—what works on one platform fails on another."

FOR SEO & DIGITAL MARKETING:
- Results: "[Their website] has solid content but isn't ranking because [specific SEO issue like technical SEO, backlinks, keyword targeting]."
- ROI: "Paid ad campaigns with [low] ROAS mean you're spending more to acquire customers than they're worth long-term."
- Strategy: "Scaling [their marketing channel] from [X] to [Y] requires [specific strategic insight], not just more budget."

═══════════════════════════════════════════════════════
PART 2: SPECIFIC PROOF (2-3 sentences)
═══════════════════════════════════════════════════════

UNIVERSAL RULES:
- ONE concrete example with REAL NUMBERS
- Must be similar to their project
- Include timeline/outcome
- Use niche-appropriate metrics

NICHE-SPECIFIC PROOF PATTERNS:

DEVELOPMENT & TECH - emphasize SPEED and PRODUCTION:
✓ "Built 20+ [type of apps] using [their stack], most launching in 4-8 weeks with paying customers from day one."
✓ "Fixed this exact [bug/issue] for 3 production apps last month. One client was down for 6 hours—I got them back online in 90 minutes."
✓ "Integrated [API/service] for a [similar company] that now processes [X] transactions daily with 99.9% uptime."

DESIGN & CREATIVE - emphasize PORTFOLIO and BRAND FIT:
✓ "Refreshed visual content for 10+ brands including [link] and [link] in the [industry] sector."
✓ "Designed [deliverable type] for [similar client] that increased [engagement/conversions/brand recognition] by [X]%."
✓ "Created [design asset] for [X] clients—average [metric like CTR, engagement] increased [Y]% after implementation."

WRITING & CONTENT - emphasize TRAFFIC and ENGAGEMENT:
✓ "Wrote 12-post series for a [niche] company that went from 0 to 4,200 monthly organic visitors in 4 months."
✓ "Content I created for [similar client] ranks on page 1 for [X] competitive keywords and drives [Y] monthly leads."
✓ "Blog posts I write average [X] shares and [Y]% engagement rate because I focus on [specific strategy]."

EMAIL MARKETING - emphasize METRICS:
✓ "Rewrote email sequences for 3 e-commerce brands—average 40% CTR increase in 30 days."
✓ "Built Klaviyo flows for a DTC brand that went from 0.8% to 4.2% click-through in one month after rewriting the welcome sequence."
✓ "Email campaigns I manage average [X]% open rates and [Y]% CTR vs industry standard of [Z]%."

SOCIAL MEDIA - emphasize GROWTH:
✓ "Grew 3 e-commerce Instagram accounts from 2K to 15K+ followers in 6 months with 8% average engagement rate."
✓ "Managed social media for [similar brand] and increased engagement [X]% while growing followers [Y]% organically."
✓ "Content strategy I built generated [X] viral posts with [Y]M+ total views across [platforms]."

VIRTUAL ASSISTANT - emphasize RELIABILITY:
✓ "Supported 5 executives remotely for 3+ years with zero missed deadlines and proactive communication."
✓ "Managed [number] of projects simultaneously using [tools] with [X]% on-time completion rate."
✓ "Organized [specific tasks] for [X] clients across [Y] time zones while maintaining [metric like response time]."

VIDEO EDITING - emphasize STYLE and RESULTS:
✓ "Edited 100+ videos for YouTube creators—average watch time increased 35% after optimizing pacing and hooks."
✓ "Created [type of video content] for [X] brands that generated [Y] views and [Z]% engagement."
✓ "Video editing style matches [genre/aesthetic]—recent client's [platform] channel grew from [X] to [Y] subscribers."

SEO & DIGITAL MARKETING - emphasize ROI:
✓ "Increased organic traffic for [similar site] from [X] to [Y] monthly visitors in [Z] months through [strategy]."
✓ "Managed $[X]K in ad spend with [Y] ROAS for [similar business] in [industry]."
✓ "SEO strategy I built ranked [X] pages on page 1 for competitive keywords, generating [Y] monthly leads."

If pastWork is empty, synthesize proof from profession + skills:
"I specialize in [profession] with focus on [skill] and have [approach] that typically [outcome based on niche]."

═══════════════════════════════════════════════════════
PART 3: CLEAR APPROACH (3-5 bullets)
═══════════════════════════════════════════════════════

UNIVERSAL RULES:
- MUST use bullet format (• or -)
- Specific steps for THIS project
- Include rough timelines when urgent
- Adapt bullet content to niche

NICHE-SPECIFIC APPROACH STRUCTURES:

FOR URGENT JOBS (any niche, include time estimates):
- First [15 mins/1 hour]: [Diagnostic/review step]
- Next [30 mins/2 hours]: [Core fix/implementation]
- Final [30 mins/1 hour]: [Testing/delivery]

FOR DEVELOPMENT & TECH (emphasize process):
- Week 1: [Planning/architecture step]
- Week 2-3: [Development/implementation]
- Week 4: [Testing/deployment]
- Throughout: [Communication cadence]

Example:
- Week 1: Architecture planning and database design
- Week 2-3: Build core features with Next.js + Supabase
- Week 4: Testing, bug fixes, and deployment to production
- Throughout: Daily progress updates via Slack

FOR DESIGN & CREATIVE (emphasize iterations):
- [Review/research step]
- [Initial concepts/options step]
- [Refinement with revisions]
- [Final delivery in required formats]

Example:
- Review your brand guidelines and existing visual identity
- Create 3 initial design concepts for your feedback
- Refine chosen direction with up to 5 revision rounds
- Deliver final files in all required formats (PNG, SVG, PSD)

FOR WRITING & CONTENT (emphasize research + quality):
- [Research/keyword step if SEO]
- [Outline/strategy step]
- [Writing/creation step]
- [Editing/revision step]

Example:
- Keyword research targeting long-tail opportunities in your niche
- Outline [X] posts optimized for search and reader engagement
- Write SEO-optimized content in your brand voice
- Two rounds of revisions to ensure it's perfect

FOR EMAIL MARKETING (emphasize funnel):
- [Audit current setup]
- [Strategy/planning step]
- [Build/write sequences]
- [Testing/optimization]

Example:
- Audit your current email flows and identify gaps
- Map out welcome sequence with clear value ladder
- Write and set up emails in Klaviyo with proper segmentation
- A/B test subject lines and optimize based on data

FOR SOCIAL MEDIA (emphasize content + engagement):
- [Strategy/planning]
- [Content creation]
- [Posting/scheduling]
- [Engagement/community management]

Example:
- Develop content calendar with mix of educational and entertaining posts
- Create graphics and write captions optimized for [platform] algorithm
- Schedule posts at optimal times using [tool]
- Daily engagement and community management to build relationships

FOR VIRTUAL ASSISTANT (emphasize systems):
- [Setup/organization step]
- [Process implementation]
- [Communication rhythm]
- [Ongoing management]

Example:
- Set up organized workflow in Asana with all your tasks and deadlines
- Daily check-ins via Slack for updates and priority shifts
- Manage [specific tasks] proactively with advance notifications
- Weekly summary reports of completed tasks and upcoming priorities

FOR VIDEO EDITING (emphasize workflow):
- [Review existing content]
- [Editing approach]
- [Revision process]
- [Delivery format]

Example:
- Review your existing videos to match style and pacing
- Edit with smooth transitions, on-brand graphics, and optimized pacing
- Up to 3 revision rounds to dial in exactly what you want
- Deliver in 4K, 1080p, or your preferred format

FOR SEO & DIGITAL MARKETING (emphasize data):
- [Audit/analysis step]
- [Strategy development]
- [Implementation]
- [Tracking/reporting]

Example:
- Technical SEO audit to identify quick wins and major issues
- Develop keyword strategy targeting high-intent, low-competition terms
- Implement on-page optimization and content recommendations
- Monthly reporting with rankings, traffic, and conversion data

═══════════════════════════════════════════════════════
PART 4: SMART QUESTION (1 sentence)
═══════════════════════════════════════════════════════

UNIVERSAL RULES:
- LOW-FRICTION next step
- Match the job's energy
- Must end with "?"
- Should be QUALIFYING or move things forward

NICHE-SPECIFIC QUESTION PATTERNS:

FOR URGENT JOBS (any niche):
✓ "I'm available right now for the next [X] hours—want to jump on a quick call to diagnose this?"
✓ "I can start immediately—should I send you my calendar link for a call in the next hour?"
✓ "Available now to fix this—what's the best way to share screen access securely?"

FOR DEVELOPMENT & TECH:
✓ "What's your target launch date, and what's the most critical feature to get working first?"
✓ "Are you using [tech stack item] for [specific part], or should I recommend an approach?"
✓ "Timeline looks tight at [X weeks]—would starting with [core feature] and layering [secondary feature] help you hit your deadline?"

FOR DESIGN & CREATIVE:
✓ "I can complete this in [X] business days with [Y] rounds of edits—does that work for your timeline?"
✓ "Do you have brand guidelines I should follow, or would you like me to propose a direction?"
✓ "What's the primary goal—more conversions, better brand recognition, or matching a specific aesthetic?"

FOR WRITING & CONTENT:
✓ "Can I write a sample intro paragraph for one of your topics to show my approach?"
✓ "What's more important for this project—SEO rankings or immediate reader engagement?"
✓ "Do you have a style guide I should follow, or would you like me to match your existing content's tone?"

FOR EMAIL MARKETING:
✓ "What platform are you on, and which flow has the biggest gap between opens and clicks?"
✓ "What's your current open rate, and what would success look like in [30/60/90] days?"
✓ "Would you like me to audit your current sequences first, or start fresh with a new strategy?"

FOR SOCIAL MEDIA:
✓ "What's your current engagement rate, and what's your growth goal for the next [3/6] months?"
✓ "Which platform is your priority—Instagram, TikTok, or LinkedIn?"
✓ "Do you need content creation, community management, or both?"

FOR VIRTUAL ASSISTANT:
✓ "What's your biggest time drain right now that I could take off your plate?"
✓ "What tools are you currently using, or would you like me to suggest a setup?"
✓ "How do you prefer to communicate—daily Slack updates, weekly calls, or email summaries?"

FOR VIDEO EDITING:
✓ "What's your typical turnaround need—24 hours or 3-5 days per video?"
✓ "Do you have examples of the style you're going for, or should I match your existing videos?"
✓ "Which platform are these for—YouTube long-form or TikTok/Instagram short-form?"

FOR SEO & DIGITAL MARKETING:
✓ "What's your main goal—more organic traffic, higher rankings, or better conversion rates?"
✓ "Are you currently tracking rankings and traffic, or would you like me to set that up?"
✓ "What's your biggest SEO concern—technical issues, content, or backlinks?"

NEVER USE (any niche):
✗ "Let me know if you'd like to discuss further"
✗ "Looking forward to hearing from you"
✗ "Let's schedule a call to chat"
</instructions>

<tone_guidelines>
NICHE-SPECIFIC TONE ADJUSTMENTS:

DEVELOPMENT & TECH:
- Technical but accessible
- Confident about architecture/tech decisions
- Focus on production-ready, not just "working code"

DESIGN & CREATIVE:
- Visual, descriptive language
- Emphasize collaboration and iterations
- Show you understand aesthetic nuances

WRITING & CONTENT:
- Write like a writer (show, don't tell)
- Conversational but professional
- Demonstrate voice flexibility

EMAIL MARKETING:
- Data-driven, metric-focused
- Strategic about funnels and sequences
- Show you understand psychology of email

SOCIAL MEDIA:
- Energetic, trend-aware
- Community-focused
- Platform-specific knowledge

VIRTUAL ASSISTANT:
- Organized, detail-oriented
- Proactive, not reactive
- Emphasize reliability

VIDEO EDITING:
- Visual storytelling focus
- Talk about pacing and engagement
- Platform-specific expertise

SEO & DIGITAL MARKETING:
- Data and ROI focused
- Strategic, not just tactical
- Show you understand the big picture
</tone_guidelines>

<constraints>
UNIVERSAL CRITICAL RULES (apply to ALL niches):
- Total length: 150-250 words (aim for 180-220)
- MUST use bullets for approach section
- NO generic phrases: "excited about opportunity", "perfect fit", "look forward"
- NO service listings: "I offer web development, design..."
- Include 2-3 niche-relevant keywords from job description naturally
- Focus: What THEY get (results), not what YOU do (services)
- Must end with question mark
- If portfolio link provided, mention it naturally ONCE in proof section
- First 2 sentences are CRITICAL—they determine if client reads further
</constraints>

<output_format>
First, return the proposal text following ALL rules above: no preamble like "Here's your proposal:", no meta-commentary, no markdown formatting. Just the raw proposal text, ready to copy-paste. Start directly with the hook.

Then, after the proposal, add a blank line and score the proposal from 1-10 on each dimension in this EXACT format:

Hook: X/10
Specificity: X/10
Credibility: X/10
Clarity: X/10
CTA: X/10
Overall: X/10
</output_format>

<scoring_rules>
- Score each dimension independently and honestly.
- Scores MUST vary based on actual quality — do not default to the same score for all categories.
- A proposal can have a strong CTA (9/10) but weak credibility (5/10). Evaluate each dimension separately and critically.
- Be harsh where warranted. Not every proposal deserves a 7+.
- Hook: Does the opening sentence grab attention and reference the specific job? Does it match the job's urgency? Generic openings = 4 or lower.
- Specificity: Does the proposal address THIS job with concrete details? Could it be sent to another job unchanged? If yes, score 5 or lower.
- Credibility: Does the proof include specific numbers/timelines/outcomes? Vague experience claims = 4 or lower.
- Clarity: Is it concise, scannable, and easy to read? Does the approach use bullets? Filler or jargon = 5 or lower.
- CTA: Does the closing question move things forward and match the job's energy? Generic questions = 5 or lower.
- Overall: Calculate as the genuine arithmetic average of the 5 scores above, rounded to the nearest integer.
</scoring_rules>

<self_check>
Before returning, verify ALL of these:

1. ✓ Did I correctly identify the freelancer's niche from their profession/skills?
2. ✓ Does the hook use niche-appropriate language and metrics?
3. ✓ Does it match the job's urgency/energy?
4. ✓ Does the first sentence reference THEIR specific problem?
5. ✓ Is there at least ONE niche-relevant number/metric/timeline in the proof?
6. ✓ Is the approach in bullet format with • or - ?
7. ✓ Do the bullets use niche-appropriate structure (timelines for dev, iterations for design, etc.)?
8. ✓ Does it end with a niche-appropriate qualifying "?"
9. ✓ Is it 150-250 words?
10. ✓ Could this be sent to ANY other niche? (If YES, make it MORE niche-specific)
11. ✓ Does it sound like a HUMAN in this niche wrote it, not ChatGPT?

If ANY check fails, REVISE completely before returning.
</self_check>

Now generate the proposal following ALL rules above, with FULL niche adaptation.`;

    const filteredQuestions = (applicationQuestions || []).filter((q) => q.trim());
    if (filteredQuestions.length > 0) {
      prompt += `\n\nADDITIONAL TASK — APPLICATION QUESTIONS:
The client's application form includes these specific questions. You must also answer each one.

Questions:
${filteredQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Rules for application answers:
- Each answer: 2-4 sentences maximum
- Be specific, referencing the freelancer's actual skills and experience
- Include concrete examples when possible
- Match the confident, professional tone of the main proposal
- If the freelancer context lacks relevant info, give a professional general response
- If a question asks for a link, use the portfolio link provided or respond honestly

After the scoring section, output a line containing exactly "---APPLICATION_ANSWERS---" followed by each question and answer in this format:

Q: [exact question text]
A: [your answer]

Q: [exact question text]
A: [your answer]`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: filteredQuestions.length > 0 ? 3000 : 1500,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    const rawText: string = data.content[0].text;

    const { proposal: generatedProposal, aiScores, applicationAnswers } = parseProposalAndScores(rawText);

    const words = generatedProposal.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const characterCount = generatedProposal.length;

    await ctx.runMutation(api.proposals.saveProposal, {
      jobTitle,
      jobDescription,
      clientName,
      platform,
      budget,
      profession,
      skills,
      generatedProposal,
      wordCount,
      characterCount,
      winScore: aiScores.overall,
      aiScores,
      applicationQuestions: filteredQuestions.length > 0 ? filteredQuestions : undefined,
      applicationAnswers,
      customInstructions: trimmedInstructions || undefined,
    });

    await ctx.runMutation(api.users.incrementProposalUsage);

    return {
      proposal: generatedProposal,
      wordCount,
      characterCount,
      aiScores,
      applicationAnswers,
      customInstructions: trimmedInstructions || undefined,
    };
  },
});

export const generateProfileOptimization = action({
  args: {
    currentTitle: v.string(),
    currentOverview: v.string(),
    /** 1–2 keywords for primary service (e.g. "Next.js development", "AI integration") */
    primaryService: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const { currentTitle, currentOverview, primaryService } = args;

    const safeTitle = currentTitle.replace(/</g, "&lt;");
    const safeOverview = currentOverview.replace(/</g, "&lt;");
    const safePrimaryService = primaryService.replace(/</g, "&lt;");

    const prompt = `Rewrite this Upwork freelancer profile to rank higher in search and convert more profile views into interviews.

The freelancer may serve ANY type of client (design, writing, devops, marketing, admin, etc.). Ground every claim in their title and overview. Do not invent industries, client types, or tools they never implied. Do not open with fake pain stories or generic case-study hooks about "developers who miss deadlines."

Current title: ${safeTitle}
Current overview: ${safeOverview}

PRIMARY SERVICE (user-chosen; 1-2 keywords / short phrase they want to rank for): ${safePrimaryService}

NICHE POSITIONING (analyze first, then emphasize in the OPENING):
From the user's title, overview, and primary service, infer where evidence exists:
- Industry focus (e.g. SaaS, ecommerce, fintech, healthcare, edtech)
- Client type (e.g. founders, startups, agencies, enterprises, SMBs)
- Service focus (e.g. MVP development, AI integration, automation, migration)

PART 1 must LEAD with this niche when their materials clearly support it—buyers should immediately see who they help and what they build. Prefer specialist positioning over a generic job title.

Contrast (tone only—adapt to their real niche):
- Generic (avoid): "I'm a full-stack developer"
- Niched (target when supported): "I build AI-powered SaaS MVPs for founders"

If NO clear niche is detectable from their text, do not invent one. Keep the opening broad but add ONE concrete qualifier that still states what they deliver, for example:
"I specialize in fast, production-ready web applications" — adapt the deliverable to their profession (e.g. writers: "conversion-focused long-form"; designers: "design systems and product UI").

Reinforce the same niche thread in PART 2 (services) and PART 3 (process) when applicable so the profile feels coherent.

KEYWORD STRATEGY (mandatory—read naturally, NO keyword stuffing):
1) PRIMARY keyword phrase: Use the PRIMARY SERVICE phrase above in the FIRST ~160 CHARACTERS of the new overview (within PART 1). Work it into normal sentences—never a naked keyword list, never the same phrase repeated back-to-back. The title should also reflect this focus when it fits (under 80 characters).

2) SECONDARY keywords: From the original overview ONLY, infer tool names (e.g. React, TypeScript, Supabase, Figma), platforms, and related terms (e.g. full-stack, web app, automation, SaaS). Do not invent tools they never mentioned. Weave these naturally into PART 2 (Services) with the strongest matches there; sprinkle elsewhere (process, case lines) only where it reads human—no comma dumps.

3) CONTEXT: Throughout the overview, keep terminology aligned with how buyers search, but priority is natural prose. If a secondary term would sound forced, omit it.

4) FORBIDDEN: Repeating the primary phrase three times in one paragraph, lists of keywords with no sentence structure, or SEO-style stuffing.

SPECIFIC NUMBERS (mandatory—every optimized overview):
The NEW OVERVIEW must include at least 2–3 DISTINCT numeric proofs spread across the text (PART 1 through PART 4). Categories to draw from (mix and match; use plain digits or ranges):
- Project volume: e.g. "20+ MVPs", "150+ sites shipped"
- Timeline / speed: e.g. "4–8 weeks to launch", "under 72 hours for fixes"
- Results / outcomes: e.g. "60 days to revenue", "40% faster load times"
- Client / business outcomes: e.g. "$50K monthly revenue" (only if stated or clearly implied in their overview—otherwise use anonymized bands like "six-figure launch" only when defensible)
- Scale: e.g. "200+ daily users", "10K+ emails/month"

When their original overview ALREADY contains numbers, prefer those (you may round slightly for readability).

When their original overview has NO usable numbers, INFER conservative, believable figures from:
- Profession and title (typical project counts and timelines for that role)
- Skills and stack (depth → plausible velocity and engagement)
- Past work description (complexity, industry, team size)

Inference rules: Use ranges and "+" forms that sound credible for the niche (e.g. "25+ projects", "6–10 week typical cycles"). Do NOT invent named companies, product names, or precise client revenue unless they appear in the user's materials. Never output an overview with zero numbers or only one vague number—the minimum is 2–3 specific numeric proofs.

Rewrite both. The new title should be specific, keyword-rich, and under 80 characters.

PRIORITY #1 — FIRST ~160 CHARACTERS (≈ first 2 sentences):
Upwork shows the start of the overview first; clients decide whether to keep reading. The opening MUST be optimized for this preview window.

The FIRST TWO SENTENCES must ALL be true:
- Include at least ONE specific NUMBER or measurable RESULT in the opening (additional numbers can appear later to reach the 2–3 total). Use stated figures from their overview when present; otherwise use ONE inferred metric that fits their profession/skills (believable, not exaggerated).
- State the CORE OFFER clearly: what they deliver, for whom, or what outcome—no vague positioning.
- CLIENT LANGUAGE: short, plain, direct words a busy buyer understands. NOT corporate filler or "fancy" adjectives.

FORBIDDEN in the first two sentences:
- Openers like "I'm a passionate...", "I love transforming innovative ideas...", "I thrive on...", "leverage", "synergy", "world-class", "cutting-edge" without concrete proof.
- Pain-first hooks, rhetorical questions, or invented client problems.
- Leading with only a job title ("I'm a full-stack developer") when their overview supports a clearer niche—use the niched pattern instead.

STRONG OPENING EXAMPLE (niche + numbers—adapt):
✓ "I've built 20+ AI-powered MVPs and SaaS products, most launching in 4-8 weeks with paying customers from day one."

WEAK OPENINGS (never write like this):
✗ "I'm a passionate developer who loves transforming innovative ideas into reality..."
✗ "I'm a full-stack developer with X years..." (too generic when niche is obvious from their overview)

After PART 1, continue with PARTS 2–5 below. Do NOT write labels like "PART 1" in the output—use natural paragraphs; for PART 2 you may use bullet lines (• or -) for scannability.

NEW OVERVIEW — follow this 5-part structure (proven to convert on Upwork). Integrate smoothly; no section headers in the final text.

PART 1 — PROMISE / RESULTS (1-2 sentences; pack the FIRST ~160 CHARACTERS for preview)
   - Lead with NICHE (who + what) when detectable, plus numbers + outcomes. Include at least one concrete metric here; core offer in plain language, no fluff openers.
   - Example shape: "I've built 20+ products that launch in 4-8 weeks"
   - If niche is unclear, use broad + qualifier (see NICHE POSITIONING). No invented pains.

PART 2 — SERVICES (2-3 bullets OR short sentences)
   - What they deliver: stack, deliverables, or service lines—concrete and scannable.
   - Example shape: "Full-stack development using Next.js, Supabase, AI integrations"

PART 3 — PROCESS (1-2 sentences)
   - How they work: cadence, collaboration, how they move clients forward—not generic "I'm detail-oriented."
   - Example shape: "I specialize in getting founders from idea to paying customers fast"

PART 4 — CASE STORIES (1-2 sentences)
   - Specific proof: named or described work, product, or client type + outcome or timeline when possible—include at least one number (timeline, scale, or result) when it fits.
   - Use details from their current overview when present. Do not invent named companies or branded products unless they appear in their overview. Believable inferred timelines, scale, or project counts are OK when grounded in their profession/skills (see SPECIFIC NUMBERS above).
   - Example shape (illustrative only): "Recent projects include Bidly (AI proposal generator, 60 days to revenue)" — only if such a project appears in their materials; otherwise anonymized proof with plausible metrics.

PART 5 — CTA (1 sentence)
   - Clear next step for the buyer—low friction.
   - Example shape: "Message me with your project details and I'll outline an approach"

Opener examples (PART 1 tone only—adapt to niche; each includes numbers):
✓ "I've built 50+ AI-powered MVPs and SaaS products, with most going from concept to paying customers in under 90 days."
✓ "In 8+ years I've shipped 40+ Next.js apps—most live in 4–8 weeks with production-ready AI integrations."

SELF-CHECK before returning:
- NICHE: PART 1 leads with specialist positioning when their overview supports it; otherwise uses broad + concrete qualifier—not a naked job title unless their materials are genuinely generic.
- NUMBERS: The full overview contains at least 2–3 distinct numeric proofs (from the categories in SPECIFIC NUMBERS). If the user gave no figures, inferred numbers must still be plausible for their profession/skills.
- PART 1: First ~160 characters must contain at least one digit (or clear numeric result), a clear promise of what they deliver, AND the PRIMARY SERVICE phrase used naturally (not stuffed).
- PART 2: Include several secondary keywords/tools from their original overview where honest—primarily here.
- PARTS 2–5: All must be present in order (services → process → case stories → CTA). If their overview lacks case details, write one honest sentence of proof with at least one number (type of work + outcome/timeline)—without inventing real company names.
- Keywords: Readable to a human first; no stuffing.

Make it sound human, not robotic. Max 2000 characters for the overview.

Return your response in this EXACT format with these exact labels:

NEW TITLE: [your rewritten title here]

NEW OVERVIEW: [your rewritten overview here]

Rules:
- Return ONLY the two sections above, nothing else
- No preamble, no explanation, no meta-commentary
- The title must be under 80 characters
- The overview must be under 2000 characters
- Do not wrap in quotes`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2000,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    const rawText: string = data.content[0].text;

    const titleMatch = rawText.match(/NEW TITLE:\s*(.+?)(?:\n|$)/);
    const overviewMatch = rawText.match(/NEW OVERVIEW:\s*([\s\S]+)/);

    const optimizedTitle = titleMatch?.[1]?.trim() || "Could not parse title";
    const optimizedOverview = overviewMatch?.[1]?.trim() || "Could not parse overview";

    return {
      optimizedTitle,
      optimizedOverview,
      originalTitle: currentTitle,
      originalOverview: currentOverview,
    };
  },
});
