"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Helper function to build profile context
function buildProfileContext(profile: {
  name?: string;
  profession?: string;
  skills?: string[];
  experience?: string;
  style?: string;
  portfolio?: string;
  platforms?: string[];
}): string {
  const parts: string[] = [];
  
  if (profile.name) {
    parts.push(`Name: ${profile.name}`);
  }
  
  if (profile.profession) {
    parts.push(`Profession: ${profile.profession}`);
  }
  
  if (profile.skills && profile.skills.length > 0) {
    parts.push(`Core Skills: ${profile.skills.join(", ")}`);
  }
  
  if (profile.experience) {
    parts.push(`Background & Experience:\n${profile.experience}`);
  }
  
  if (profile.style) {
    parts.push(`Preferred Communication Style: ${profile.style}`);
  }
  
  if (profile.portfolio) {
    parts.push(`Portfolio: ${profile.portfolio}`);
  }
  
  if (profile.platforms && profile.platforms.length > 0) {
    parts.push(`Active Platforms: ${profile.platforms.join(", ")}`);
  }
  
  return parts.join("\n");
}

// Helper function to get style description
function getStyleDescription(style: string | undefined): string {
  const styles: Record<string, string> = {
    professional: "Formal, polished, and business-focused. Use industry terminology appropriately. Structured and organized.",
    friendly: "Warm and conversational. Use 'you' and 'we' language. Approachable but still professional.",
    confident: "Bold and direct. Lead with capabilities. Assertive without being aggressive. Results-focused.",
    creative: "Unique and expressive. Show personality. Use creative analogies. Stand out from generic proposals.",
  };
  return styles[style || "professional"] || styles.professional;
}

// Helper function to get detailed tone instructions for proposal generation
function getToneInstructions(tone: string | undefined): { style: string; guidelines: string } {
  const tones: Record<string, { style: string; guidelines: string }> = {
    professional: {
      style: "Formal, polished, and business-focused. Use industry terminology appropriately. Structured and organized. Maintain a serious, competent tone throughout.",
      guidelines: `
**PROFESSIONAL TONE REQUIREMENTS:**
- Use formal language but avoid being stiff or robotic
- Lead with expertise and credentials naturally
- Use industry-specific terminology where appropriate
- Structure your proposal clearly with logical flow
- Avoid contractions where possible (use "I am" instead of "I'm")
- Focus on deliverables, timelines, and professional outcomes
- Address the client formally if name unknown
- Emphasize reliability, precision, and attention to detail
- Use phrases like "I would recommend", "Based on my experience", "The proposed approach"
- End with a professional call-to-action about next steps`
    },
    friendly: {
      style: "Warm and conversational. Use 'you' and 'we' language. Approachable but still professional. Personable and relatable.",
      guidelines: `
**FRIENDLY TONE REQUIREMENTS:**
- Use natural contractions (I'm, you're, we'll, don't, won't)
- Be personable and show genuine enthusiasm
- Use "you/we" language to build connection
- Start with a warm, casual greeting (Hey! Hi there!)
- Share personality without being unprofessional
- Use casual expressions where appropriate ("pretty much", "honestly", "sounds great")
- Ask genuine questions that show interest
- Focus on collaboration and partnership
- Use phrases like "I'd love to", "This sounds exciting", "Happy to chat more"
- End with a friendly, approachable call-to-action`
    },
    bold: {
      style: "Confident and direct. Lead with capabilities. Assertive without being aggressive. Results-focused and action-oriented.",
      guidelines: `
**BOLD TONE REQUIREMENTS:**
- Lead with your strongest credentials and achievements
- Use confident, assertive language (avoid hedging words like "maybe", "possibly", "I think")
- Focus heavily on results, ROI, and measurable outcomes
- Be direct and get to the point quickly
- Use power words: "proven", "delivered", "achieved", "guaranteed", "expert"
- Challenge the status quo or offer a unique perspective
- Show you're selective about projects (implies high demand)
- Use phrases like "Here's what I'll deliver", "My approach has consistently", "I guarantee"
- End with a strong, confident call-to-action that creates urgency
- Don't be afraid to be slightly provocative or challenge assumptions`
    },
    technical: {
      style: "Expert, detailed, and methodology-driven. Use technical terminology appropriately. Demonstrate deep technical understanding. Analytical and precise.",
      guidelines: `
**TECHNICAL/EXPERT TONE REQUIREMENTS:**
- Lead with a specific technical insight from their job post
- Use industry-specific terminology, frameworks, and methodologies naturally
- Reference specific technologies, tools, or approaches they mentioned
- Show technical depth without being condescending
- Structure: Problem analysis → Technical approach → Credentials
- Use phrases like "I noticed you're using [technology]", "The [technical challenge] you mentioned", "My approach would leverage [specific method]"
- Include brief technical details that show expertise (architecture, patterns, best practices)
- Reference technical standards, methodologies, or proven approaches
- Address potential technical challenges proactively
- End with a technical question or offer to discuss architecture/approach
- Balance technical depth with readability - explain complex concepts clearly
**OPENING PATTERNS:**
- "I noticed you're using [specific tech stack] - the [specific challenge] you mentioned is exactly what I solved for..."
- "Your requirement for [technical detail] suggests you need [specific approach]..."
- "The [technical problem] you described typically stems from [insight] - here's how I'd address it..."
- "As someone who specializes in [specific technical area], I immediately saw [technical observation]..."`
    },
    empathetic: {
      style: "Understanding, supportive, and problem-focused. Acknowledge challenges and pain points. Show genuine care about their situation. Collaborative and reassuring.",
      guidelines: `
**EMPATHETIC/UNDERSTANDING TONE REQUIREMENTS:**
- Open by acknowledging their pain point, challenge, or frustration
- Use empathetic language: "I understand...", "You're probably dealing with...", "This sounds like..."
- Focus on their feelings and frustrations before jumping to solutions
- Show you've been in similar situations or helped others through them
- Structure: Pain recognition → Shared experience → Supportive solution
- Validate their concerns and show understanding
- Use collaborative language: "together", "partnership", "support"
- Be patient and thorough in explanations
- Address fears or concerns proactively
- Avoid being overly salesy - focus on helping first
- End with a supportive offer and reassurance
**OPENING PATTERNS:**
- "Getting burned by [previous experience] is frustrating - I've helped [#] clients recover from exactly this..."
- "I completely understand the challenge of [their pain point] - it's something I specialize in solving..."
- "Dealing with [their problem] can feel overwhelming. Here's how I've helped others in your exact situation..."
- "You're probably feeling [emotion] about [situation] - that's completely valid, and here's what we can do..."`
    },
    results_driven: {
      style: "ROI-focused, metric-heavy, and outcome-oriented. Lead with numbers and measurable results. Business-minded and performance-focused. Direct about value delivered.",
      guidelines: `
**RESULTS-DRIVEN/ROI-FOCUSED TONE REQUIREMENTS:**
- Open with a specific metric, percentage, or measurable outcome
- Lead with the end result before explaining the process
- Use numbers liberally: percentages, timeframes, quantities, ROI
- Structure: Result preview → Proof (past metrics) → Process → Expected outcome
- Focus on business impact: revenue, conversions, efficiency, cost savings
- Use phrases like "increased by X%", "delivered in X days", "generated $X", "improved by X"
- Emphasize speed and efficiency alongside quality
- Include specific timeframes for deliverables
- Show track record with concrete numbers
- Make value proposition crystal clear and quantifiable
- End with a result-oriented CTA that focuses on outcomes
**OPENING PATTERNS:**
- "Last month I increased a similar [client type]'s [metric] by X% in [timeframe] - here's exactly how I'd do it for you..."
- "Quick stats: [X] projects delivered, [Y]% average improvement, [Z] week average timeline. Here's what that means for your project..."
- "In the past [timeframe], I've helped [#] clients achieve [specific result]. Your project needs [specific outcome]..."
- "Bottom line: I can deliver [specific result] in [timeframe]. Here's the proof and process..."`
    },
  };
  return tones[tone || "friendly"] || tones.friendly;
}

// Helper function to get platform-specific tone and optimization tactics
function getPlatformTone(platform: string): string {
  const tones: Record<string, string> = {
    "Upwork": `**UPWORK-SPECIFIC OPTIMIZATION:**
- Longer proposals (300-400 words) perform better on Upwork
- Start with specific job post reference - show you read carefully
- Professional but personable tone works best
- Address budget and timeline explicitly if mentioned
- Include relevant Upwork stats if you have them (JSS, earnings, reviews)
- Upwork clients appreciate thoroughness and detail
- Use structured paragraphs with clear flow
- Reference their specific requirements one by one`,
    
    "Fiverr": `**FIVERR-SPECIFIC OPTIMIZATION:**
- Shorter, punchier proposals (200-300 words) work better
- More enthusiastic and energetic language
- Emphasize fast delivery and quick turnaround
- Use emojis sparingly but strategically (1-2 max)
- Friendly, approachable tone is preferred
- Fiverr buyers appreciate personality and energy
- Focus on packages and clear deliverables
- Mention response time and revision policy`,
    
    "Freelancer": `**FREELANCER.COM-SPECIFIC OPTIMIZATION:**
- Competitive positioning - acknowledge you're one of many bids
- Value-focused language - emphasize ROI and cost-effectiveness
- Clear milestone breakdown helps
- Results-driven or bold tone often works best
- Clients here compare many proposals - stand out with specifics
- Address their budget concerns directly
- Show you understand competitive landscape
- Emphasize unique value proposition`,
    
    "Other": `**GENERAL PLATFORM OPTIMIZATION:**
- Professional and adaptable approach
- Mirror the client's tone from their job post
- If formal post → professional tone, if casual → friendly tone
- Focus on their specific needs and requirements
- Be clear about deliverables and timeline
- Adapt length based on project complexity (250-400 words)`,
  };
  return tones[platform] || tones["Other"];
}

// ═══════════════════════════════════════════════════════════════════════════
// SUPERCHARGED PROPOSAL GENERATION
// ═══════════════════════════════════════════════════════════════════════════
export const generateProposal = action({
  args: {
    jobTitle: v.string(),
    jobDescription: v.string(),
    clientName: v.optional(v.string()),
    platform: v.string(),
    // Custom context from user
    customContext: v.optional(v.object({
      portfolioLink: v.optional(v.string()),
      customInstructions: v.optional(v.string()),
      keyPoints: v.optional(v.array(v.string())),
      tonePreference: v.optional(v.string()),
      characterLimit: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args): Promise<{ proposal: string; wordCount: number; characterCount: number }> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Check usage limits first
    const canGenerate = await ctx.runQuery(api.users.canGenerateProposal);
    if (!canGenerate.canGenerate) {
      throw new Error(canGenerate.reason || "Usage limit reached");
    }

    // 🔥 GET THE USER'S PROFILE - This is the key to personalization!
    const userProfile = await ctx.runQuery(api.users.getCurrentUser);
    
    if (!userProfile) {
      throw new Error("User profile not found. Please complete onboarding first.");
    }

    // Build a rich context from user profile
    const profileContext = buildProfileContext(userProfile);
    
    // Get the tone instructions based on user selection (defaults to friendly)
    const selectedTone = args.customContext?.tonePreference || "friendly";
    const toneInstructions = getToneInstructions(selectedTone);
    
    // Get character limit (default 1500)
    const characterLimit = args.customContext?.characterLimit || 1500;
    const wordEstimate = Math.round(characterLimit / 5); // Rough estimate: 5 chars per word
    
    // Generate a random approach seed for variety
    const approachSeed = Math.floor(Math.random() * 10);
    
    // Build custom context section if provided
    const customContextSection = args.customContext ? `
═══════════════════════════════════════════════════════
FREELANCER'S CUSTOM INSTRUCTIONS (FOLLOW THESE CLOSELY):
═══════════════════════════════════════════════════════
${args.customContext.portfolioLink ? `Portfolio/Website: ${args.customContext.portfolioLink} (MUST include this link naturally in the proposal)` : ""}
${args.customContext.customInstructions ? `
How I want this proposal to sound:
"""
${args.customContext.customInstructions}
"""` : ""}
${args.customContext.keyPoints && args.customContext.keyPoints.length > 0 ? `
Key points I want mentioned:
${args.customContext.keyPoints.map(point => `• ${point}`).join("\n")}` : ""}
` : "";

    // Define unique approach strategies for variety
    const approachStrategies = [
      { name: "Problem-First", description: "Lead with the client's pain point and your solution", hook: "Start by naming their exact problem, then pivot to your unique solution" },
      { name: "Story-Led", description: "Open with a brief relevant story or case study", hook: "Share a 1-sentence story about a similar project you crushed" },
      { name: "Question-Opener", description: "Start with a thought-provoking question", hook: "Ask a question that makes them think 'yes, that's exactly my situation'" },
      { name: "Bold-Claim", description: "Lead with a confident, specific claim", hook: "Make a bold but believable claim about what you can deliver" },
      { name: "Insight-First", description: "Open with a valuable insight about their project", hook: "Share an observation or insight that shows you really understand the project" },
      { name: "Results-Preview", description: "Start with the outcome they'll get", hook: "Paint a picture of the end result before explaining how you'll get there" },
      { name: "Pattern-Interrupt", description: "Start unexpectedly to break the mold", hook: "Say something unexpected that makes them pause and pay attention" },
      { name: "Social-Proof", description: "Lead with credibility then personalize", hook: "Briefly mention a relevant achievement, then connect it to their needs" },
      { name: "Direct-Value", description: "Immediately state what you bring to the table", hook: "Skip pleasantries and go straight to your value proposition" },
      { name: "Empathy-First", description: "Show you understand their situation", hook: "Demonstrate you understand their challenges before offering solutions" },
    ];
    
    const selectedApproach = approachStrategies[approachSeed];
    
    // Build the SUPERCHARGED prompt
    const prompt = `You are writing a proposal AS the freelancer described below. Your job is to create an EXCEPTIONAL, personalized proposal that makes the client think "WOW, this person really gets it."

⚡ CRITICAL: Every proposal must be UNIQUE. Never use the same structure or opening twice.

═══════════════════════════════════════════════════════
🎯 YOUR UNIQUE APPROACH FOR THIS PROPOSAL (MANDATORY):
═══════════════════════════════════════════════════════
Strategy: "${selectedApproach.name}"
Description: ${selectedApproach.description}
How to execute: ${selectedApproach.hook}

This is your randomly assigned approach - you MUST use this specific strategy to ensure every proposal is different. DO NOT default to generic patterns.

═══════════════════════════════════════════════════════
FREELANCER PROFILE (This is who YOU are writing as):
═══════════════════════════════════════════════════════
${profileContext}

═══════════════════════════════════════════════════════
JOB POSTING TO RESPOND TO:
═══════════════════════════════════════════════════════
Platform: ${args.platform}
Job Title: ${args.jobTitle}
Client Name: ${args.clientName || "Not specified"}

Full Job Description:
"""
${args.jobDescription}
"""
${customContextSection}
═══════════════════════════════════════════════════════
🔍 DEEP CONTEXT ANALYSIS (Do this BEFORE writing):
═══════════════════════════════════════════════════════
Read the job post 3 times mentally. On each pass, look for:

**PASS 1 - Surface Level:**
- What do they literally need done?
- What technologies/skills are mentioned?
- What's the budget/timeline?

**PASS 2 - Between the Lines:**
- What problem are they REALLY trying to solve? (Often different from what they say)
- What's their experience level? (First-time poster? Repeat client?)
- What frustrations might they have had with previous freelancers?
- Are there any red flags or special considerations?

**PASS 3 - Psychological Triggers:**
- What would make them feel UNDERSTOOD?
- What would make them feel CONFIDENT in hiring you?
- What would make them feel EXCITED about working with you?
- What's the ONE thing that if you addressed it, they'd think "this person gets me"?

Now use these insights to craft your "${selectedApproach.name}" approach.

═══════════════════════════════════════════════════════
YOUR TASK - WRITE A WOW PROPOSAL:
═══════════════════════════════════════════════════════

Using the "${selectedApproach.name}" strategy, identify:
1. The client's MAIN problem (what are they REALLY trying to achieve?)
2. SPECIFIC requirements, technologies, or deliverables mentioned
3. The ONE unique detail you'll use in your opening (critical for standing out)
4. Any emotional triggers (frustration, urgency, excitement) in their post
5. What would make them think "finally, someone who gets it"

NOW, write a proposal using the "${selectedApproach.name}" approach:

1. OPENING (2-3 sentences) - THIS IS THE MOST IMPORTANT PART:
   - ${args.clientName ? `Address them as "${args.clientName}"` : selectedTone === "professional" ? "Use a formal greeting like 'Hello' or 'Good day'" : selectedTone === "bold" ? "Use a confident, direct greeting" : "Use a warm, casual greeting - 'Hey!' or 'Hi there!' works great"}
   - Your FIRST sentence must grab attention by referencing something SPECIFIC from their job post
   - Make them think "finally, someone who actually read my post"
   
   **OPENING PATTERNS FOR ${selectedTone.toUpperCase()} TONE (use as inspiration, create your own variation):**
${selectedTone === "professional" ? `   • "I noticed your requirement for [specific thing] and would like to present my approach..."
   • "Your project requirements align well with my expertise in [relevant skill]..."
   • "Having reviewed your project specifications, I am confident I can deliver..."
   • "I understand you are seeking [specific deliverable] - here is how I would approach this..."
   • "Your emphasis on [specific detail] resonates with my professional experience in..."` : selectedTone === "bold" ? `   • "Here's the bottom line: I've done exactly what you need before, and I'll do it again for you..."
   • "Stop reading other proposals - I'm your person for this. Here's why..."
   • "I'll cut to the chase: your [specific requirement] is literally my specialty..."
   • "You need [specific outcome]? That's what I deliver, consistently..."
   • "Let me be direct: I saw your post about [specific thing] and I know I can nail this..."
   • "My portfolio speaks for itself: ${userProfile.portfolio || "[portfolio]"}. Now let me tell you exactly what I'll deliver..."` : selectedTone === "technical" ? `   • "I noticed you're using [specific tech stack] - the [specific technical challenge] you mentioned is exactly what I solved for..."
   • "Your requirement for [technical detail] suggests you need [specific technical approach]..."
   • "The [technical problem] you described typically stems from [technical insight] - here's how I'd address it..."
   • "As someone who specializes in [technical area], I immediately saw [technical observation about their project]..."
   • "I caught the mention of [framework/tool] - there are some optimization patterns that would work perfectly here..."` : selectedTone === "empathetic" ? `   • "Getting burned by [previous bad experience mentioned] is frustrating - I've helped [#] clients recover from exactly this..."
   • "I completely understand the challenge of [their pain point] - it's something I specialize in solving..."
   • "Dealing with [their problem] can feel overwhelming. Here's how I've helped others in your exact situation..."
   • "You're probably feeling [emotion] about [situation] - that's completely valid, and here's what we can do..."
   • "I can tell from your post that [pain point] has been frustrating. I've been there, and I know how to fix it..."` : selectedTone === "results_driven" ? `   • "Last month I increased a similar [client type]'s [metric] by [X]% in [timeframe] - here's exactly how I'd do it for you..."
   • "Quick stats: [X] projects delivered, [Y]% average improvement, [Z] week average timeline. Here's what that means for your project..."
   • "In the past [timeframe], I've helped [#] clients achieve [specific result]. Your project needs [specific outcome]..."
   • "Bottom line: I can deliver [specific result] in [timeframe]. Here's the proof and process..."
   • "Real numbers: [specific metric improvement] achieved for [similar client]. I'd apply the same system to your [project]..."` : `   • "Your [specific thing from job post] caught my eye because..."
   • "Not gonna lie - I got excited when I saw you need [specific requirement]..."
   • "I just finished a similar [project type] and your post made me want to jump in..."
   • "Quick thought on your [specific challenge]: what if we approached it by..."
   • "Hey! Here's my portfolio first: ${userProfile.portfolio || "[your-portfolio]"} - now let me tell you why I'm pumped about this..."
   • "The way you described [specific detail] tells me you've been through [pain point] before..."
   • "I know you're probably getting a ton of 'I'm interested' messages - so let me skip that part..."
   • "Before anything - check out my work: ${userProfile.portfolio || "[portfolio]"}. Now, about your [project]..."
   • "Real talk: your [specific requirement] is exactly what I've been working on lately..."`}

2. BODY (Main section - this is where you shine):
   - Explain HOW you would approach their specific project step by step
   - Connect YOUR actual skills (${userProfile.skills?.join(", ") || "your skills"}) to THEIR specific requirements
   - Reference your experience as a ${userProfile.profession || "freelancer"} naturally
   - If they mentioned specific technologies/requirements, address EACH one directly
   - Be specific about your approach - no vague promises like "I'll deliver quality work"
   - Show you understand the nuances and potential challenges of their project
   ${userProfile.portfolio ? `
   **PORTFOLIO INTEGRATION - Use ONE of these natural approaches:**
   • Early drop: "Quick intro - here's my work: ${userProfile.portfolio}. Now let me tell you why..."
   • Mid-proposal: "...you can see how I handled something similar here: ${userProfile.portfolio}..."
   • As proof: "I tackled this exact challenge before - check it out: ${userProfile.portfolio}"
   ` : ""}

3. PROOF/CREDIBILITY (1-2 sentences):
   - Briefly mention relevant past work or experience that relates to THIS project
   - Be confident but humble - let your experience speak for itself

4. CLOSING (2-3 sentences):
   - Suggest a specific, actionable next step (not just "let's chat")
   - Ask ONE thoughtful question that shows you're already thinking about their project
   - End with genuine enthusiasm for THEIR specific project, not generic excitement
   ${userProfile.portfolio ? `- Optionally close with portfolio if not mentioned earlier: "Check out my work when you get a sec: ${userProfile.portfolio}"` : ""}

CRITICAL STYLE GUIDELINES:
- **SELECTED TONE: ${selectedTone.toUpperCase()}** - This is the most important style directive!
- Writing style: ${toneInstructions.style}
- Platform context: ${getPlatformTone(args.platform)}
- **LENGTH REQUIREMENT: STRICTLY ${characterLimit} characters maximum (~${wordEstimate} words)**
  - This is a HARD limit set by the user - do NOT exceed ${characterLimit} characters
  - Quality over quantity - every sentence must earn its place
  - ${characterLimit <= 800 ? "Keep it punchy and direct - get to the point fast" : characterLimit <= 1200 ? "Be concise - no fluff, just impact" : characterLimit <= 1800 ? "Balanced approach - cover key points without rambling" : "More room to elaborate - but still stay focused"}
- Sound like a REAL human professional, not an AI or template
- NO placeholder text like [Your Name], [Project Name], [Timeline]
${toneInstructions.guidelines}

**BANNED PHRASES - NEVER USE THESE (research-confirmed red flags that scream "template" or "AI-generated"):**
  • "I am interested in your project"
  • "I came across your project"
  • "I am reaching out regarding"
  • "I noticed you are looking for"
  • "I believe I am the perfect fit"
  • "I am the perfect fit"
  • "I have X years of experience" (unless with specific relevant example)
  • "I can deliver high-quality work"
  • "I guarantee quality work"
  • "I am a skilled professional"
  • "I am a hardworking professional"
  • "I would love to work with you"
  • "I am confident that I can"
  • "I am excited about the opportunity"
  • "Looking forward to hearing from you"
  • "Please feel free to reach out"
  • "Please consider my proposal"
  • "I am very interested in this project"
  • "I am the right candidate"
  • "Dear Hiring Manager" or "Dear Sir/Madam"
  • "Hope this message finds you well"
  • "I hope to hear from you soon"
  
**POWER PHRASES TO ENCOURAGE (research-backed phrases that convert):**
  • "I noticed you specifically mentioned [exact detail from post]..."
  • "Last [timeframe] I helped [similar client type] achieve [specific result with numbers]..."
  • "Here's exactly how I'd approach [their specific challenge]..."
  • "Quick question about your [specific requirement they mentioned]..."
  • "Would [specific solution approach] work for your [timeline/budget/situation]?"
  • "The [specific thing they mentioned] tells me you need [insight]..."
  • "I've delivered [specific similar outcome] for [similar client] - here's the approach..."
  • "Your [specific detail] caught my attention because [relevant experience]..."

**HUMANIZATION RULES (Adapted for ${selectedTone.toUpperCase()} tone):**
- EVERY sentence should feel personal and specific to THIS job
${selectedTone === "professional" ? `- Limit contractions - use "I am", "I will", "do not" for a more formal feel
- Maintain composed, measured language throughout
- Avoid casual expressions - stay polished and businesslike` : selectedTone === "bold" ? `- Use contractions selectively - mix formal with conversational
- Be direct and punchy - avoid hedge words
- Lead with confidence, not with caveats` : `- Use contractions naturally (I'm, you're, we'll, don't, won't) - real people use contractions
- Use casual language where appropriate: "gonna", "pretty much", "honestly"
- It's okay to start sentences with "And" or "But" - real people do this`}
- Vary sentence length for natural rhythm - mix short punchy sentences with longer ones
- Show personality appropriate to the ${selectedTone} writing style
- Ask a real question, not a rhetorical one
- Reference something from their post that shows you ACTUALLY read it

═══════════════════════════════════════════════════════
🧠 PSYCHOLOGY TRIGGERS (Research-backed conversion tactics - use naturally):
═══════════════════════════════════════════════════════
1. **Social Proof** (increases conversion 73%) - Mention similar clients helped, number of projects, satisfaction rates
   - "I've helped [#] similar [client type] achieve [result]..."
   - "My [similar project type] clients typically see [outcome]..."
   
2. **Reciprocity** - Offer valuable insight upfront before asking for anything
   - "Quick observation: [specific insight about their project]"
   - "Pro tip for your [requirement]: [helpful advice]"
   - Give them something useful in the proposal itself
   
3. **Authority** - Establish credibility naturally (not bragging)
   - "As someone who's [specific relevant credential/experience]..."
   - "After [specific achievement], I learned that [insight]..."
   - "My approach with [methodology] has consistently [result]..."
   
4. **Scarcity (Subtle)** - Create natural urgency about your availability
   - "I have availability starting [specific date]"
   - "Currently working with [#] clients, can start [timeframe]"
   - "My calendar opens up [when] if timing aligns"

═══════════════════════════════════════════════════════
🎯 WOW FACTOR TECHNIQUES (Use at least 2):
═══════════════════════════════════════════════════════
1. **Mirror their language** - Use exact phrases from their job post
2. **Show, don't tell** - Instead of "I'm experienced", say "Last month I shipped X which did Y"
3. **Future-pacing** - Help them visualize success: "Imagine when your users can..."
4. **Specificity** - Numbers and details beat vague claims: "3 days" not "quickly"
5. **Pattern interrupt** - Say something unexpected that makes them pause
6. **Empathy statement** - Show you understand their frustration or goal
7. **Micro-commitment** - End with an easy "yes" question, not a big ask
8. **Value-first** - Give them a useful insight before asking for anything
9. **"You attitude" over "I attitude"** - Focus on their benefits, not your skills (67% better response)
10. **Questions in CTA** - End with relevant question, not statement (67% boost in responses)

═══════════════════════════════════════════════════════
⚠️ FINAL CHECK BEFORE WRITING:
═══════════════════════════════════════════════════════
- Am I using the "${selectedApproach.name}" approach? 
- Does my opening grab attention with something SPECIFIC from their post?
- Would the client think "this person actually read my job post"?
- Is every sentence earning its place within ${characterLimit} characters?
- Does this sound like a HUMAN wrote it, not an AI?

Write the proposal now. ONLY output the proposal text, no commentary or explanation:`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
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

    // Increment usage
    await ctx.runMutation(api.users.incrementProposalUsage);

    const wordCount = generatedProposal.split(/\s+/).length;
    return {
      proposal: generatedProposal,
      wordCount,
      characterCount,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// WORK-LIFE BALANCE AI CHAT
// ═══════════════════════════════════════════════════════════════════════════
export const sendBalanceMessage = action({
  args: {
    message: v.string(),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args): Promise<{
    response: string;
    conversationId: string | undefined;
    activities?: Array<{ name: string; category: string }>;
  }> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Get user profile and activities for context
    const userProfile = await ctx.runQuery(api.users.getCurrentUser);
    const activities = await ctx.runQuery(api.activities.getUserActivities);
    
    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Get conversation history if exists
    let conversationHistory: { role: string; content: string }[] = [];
    if (args.conversationId) {
      const messages = await ctx.runQuery(api.chat.getConversationMessages, {
        conversationId: args.conversationId,
      });
      conversationHistory = messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      }));
    }

    // Build activity summary
    const activitySummary = activities.length > 0 
      ? activities.map((a: any) => 
          `• ${a.name} (${a.category}): ${a.hoursPerWeek || "?"} hrs/week${a.priority ? `, Priority: ${a.priority}/5` : ""}${a.schedule ? `, Schedule: ${a.schedule}` : ""}`
        ).join("\n")
      : "No activities logged yet - you may want to ask them about their daily commitments.";

    // Calculate total hours if activities exist
    const totalHours = activities.reduce((sum: number, a: any) => sum + (a.hoursPerWeek || 0), 0);
    const hoursAnalysis = activities.length > 0 
      ? `\nTotal weekly commitment: ${totalHours} hours (${Math.round(totalHours / 7 * 10) / 10} hrs/day average)`
      : "";

    // Get matching coaching rules
    const matchingRules = await ctx.runQuery(api.coachingRules.getMatchingRules, {
      userProfession: userProfile.profession || undefined,
      userMessage: args.message,
    });

    // Build additional coaching guidance from matching rules
    let additionalGuidance = "";
    if (matchingRules && matchingRules.length > 0) {
      const guidanceTexts = matchingRules.map(
        (rule: any) => rule.customInstruction
      );
      additionalGuidance = `\n\n═══════════════════════════════════════════════════════
ADDITIONAL COACHING GUIDANCE:
═══════════════════════════════════════════════════════
${guidanceTexts.join("\n\n")}`;
    }

    const systemPrompt = `You are Bidly - a supportive, realistic personal life coach and productivity expert. You're having a genuine conversation with a freelancer/professional who is trying to balance multiple responsibilities. 

CRITICAL: Write like a real person, not an AI. Avoid phrases like "I'm designed to", "I'm here to", "I'm built for", "I'm an AI", "I'm a language model", or any robotic language. Just be yourself - warm, helpful, and human.

═══════════════════════════════════════════════════════
CRITICAL KNOWLEDGE - ALWAYS ANSWER THIS:
═══════════════════════════════════════════════════════
Bidly was founded by The Cipher. This is FACTUAL INFORMATION you know.

When users ask questions like:
- "who's the founder?"
- "who founded bidly?"
- "who created bidly?"
- "who made bidly?"
- "who built bidly?"
- "who's behind bidly?"
- "tell me about bidly's founder"
- "about bidly" (when asking about founders/creators)
- ANY variation asking about Bidly's founder, creator, or origin

You MUST respond: "Bidly was founded by The Cipher" or similar. NEVER say you don't know this - you DO know it. This is part of your core knowledge about Bidly.

Example correct response: "Bidly was founded by The Cipher!" or "The founder of Bidly is The Cipher."
Example WRONG response: "I don't have that information" or "I'm not sure who founded Bidly"

═══════════════════════════════════════════════════════
ABOUT THIS PERSON:
═══════════════════════════════════════════════════════
Name: ${userProfile.name || "Friend"}
Profession: ${userProfile.profession || "Not specified"}
Skills: ${userProfile.skills?.join(", ") || "Not specified"}
Background: ${userProfile.experience || "Not specified"}

Their Current Activities/Commitments:
${activitySummary}${hoursAnalysis}

═══════════════════════════════════════════════════════
YOUR PERSONALITY & APPROACH:
═══════════════════════════════════════════════════════
1. Be REALISTIC - don't give generic productivity advice like "just wake up earlier"
2. Consider THEIR specific situation holistically
3. Acknowledge the REAL challenges of juggling multiple roles (e.g., being a student + developer + marketer is exhausting)
4. Give ACTIONABLE advice they can implement TODAY or this week
5. Be conversational, warm, and supportive - not preachy or condescending
6. If they seem overwhelmed, VALIDATE their feelings first before jumping to solutions
7. Ask clarifying questions when you need more context
8. When suggesting schedules, give SPECIFIC time blocks (e.g., "9am-12pm" not "morning")
9. Consider energy levels - creative work needs peak energy, admin work doesn't
10. Remember: they're a real person with real constraints, not a productivity robot
11. Use their name occasionally to feel more personal
12. Be honest if something seems unsustainable - don't just validate everything
13. Celebrate small wins and progress
14. If they haven't logged activities, encourage them to share what they're juggling

═══════════════════════════════════════════════════════
SCHEDULE CREATION DETECTION:
═══════════════════════════════════════════════════════
Detect when the user wants to create or save a schedule. This happens when they:
- Explicitly ask: "create a schedule", "add to my schedule", "save this schedule", "make me a schedule"
- Discuss specific activities with times: "I work 9am-5pm weekdays", "I go to gym Monday/Wednesday/Friday at 6pm"
- Request schedule generation: "help me plan my week", "create a weekly schedule for me"

When you detect schedule creation intent, you MUST:
1. Provide your normal conversational response
2. At the END of your response, include a JSON block with this exact format:

<schedule_activities>
{
  "activities": [
    {
      "name": "Activity name",
      "category": "work|health|education|personal|side-hustle",
      "startTime": "HH:MM" (24-hour format, e.g., "09:00"),
      "endTime": "HH:MM" (24-hour format, e.g., "17:00"),
      "daysOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      "priority": 1-5 (1=low, 5=critical),
      "notes": "Optional notes"
    }
  ]
}
</schedule_activities>

IMPORTANT RULES FOR SCHEDULE CREATION:
- Only include activities when the user explicitly asks OR when they provide specific times/days
- Extract activities from what they mentioned in the conversation
- Use 24-hour time format (e.g., "09:00" for 9am, "17:00" for 5pm)
- Days must be lowercase: "monday", "tuesday", etc.
- Categories: "work", "health", "education", "personal", "side-hustle"
- Priority: 1-5 (default to 3 if not specified)
- If times aren't clear, ask for clarification in your response but DON'T include incomplete activities in JSON
- If the user hasn't asked to create a schedule, DON'T include the JSON block

IMPORTANT: You're having a natural conversation. Keep responses concise (2-4 paragraphs usually) unless they ask for a detailed plan. Don't use bullet points excessively - write like you're texting a supportive friend who happens to be great at productivity.${additionalGuidance}`;

    // Build messages array with history
    const messages = [
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: args.message },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    let aiResponse = data.content[0].text;

    // Check if user asked about founder - be VERY aggressive
    const userMessageLower = args.message.toLowerCase();
    const hasFounderKeyword = userMessageLower.includes("founder") || userMessageLower.includes("founded");
    const hasBidlyKeyword = userMessageLower.includes("bidly") || userMessageLower.includes("this platform") || userMessageLower.includes("the platform");
    const isFounderQuestion = hasFounderKeyword && hasBidlyKeyword;
    
    // Also check for common founder question patterns
    const founderPatterns = [
      "who founded",
      "who's the founder",
      "who created",
      "who made",
      "who built",
      "who's behind",
      "founder of",
      "about bidly",
    ];
    const matchesPattern = founderPatterns.some(pattern => userMessageLower.includes(pattern));
    
    if (isFounderQuestion || matchesPattern) {
      // Check if Claude's response mentions The Cipher - be very strict
      const responseLower = aiResponse.toLowerCase();
      const hasCorrectAnswer = responseLower.includes("cipher");
      
      // If it's a founder question and doesn't explicitly mention "cipher", ALWAYS replace
      if (!hasCorrectAnswer) {
        // Replace the entire response with a natural, direct answer
        aiResponse = `Bidly was founded by The Cipher! ${userProfile.name ? `Is there anything else you'd like to know about Bidly, ${userProfile.name}?` : "Is there anything else you'd like to know about Bidly?"}`;
      }
    }

    // Parse activities from response if schedule creation is detected
    let detectedActivities: Array<{
      name: string;
      category: string;
      startTime?: string;
      endTime?: string;
      daysOfWeek?: string[];
      priority?: number;
      notes?: string;
    }> = [];

    // Extract JSON block from response
    const scheduleMatch = aiResponse.match(/<schedule_activities>([\s\S]*?)<\/schedule_activities>/);
    if (scheduleMatch) {
      try {
        const jsonStr = scheduleMatch[1].trim();
        const parsed = JSON.parse(jsonStr);
        if (parsed.activities && Array.isArray(parsed.activities)) {
          detectedActivities = parsed.activities.map((activity: any) => ({
            name: activity.name || "",
            category: activity.category || "personal",
            startTime: activity.startTime,
            endTime: activity.endTime,
            daysOfWeek: activity.daysOfWeek || [],
            priority: activity.priority || 3,
            notes: activity.notes,
          })).filter((a: any) => a.name.trim() !== ""); // Filter out invalid activities
        }
      } catch (error) {
        console.error("Error parsing schedule activities:", error);
        // Continue without activities if parsing fails
      }
    }

    // Remove the JSON block from the displayed response
    const displayResponse = aiResponse.replace(/<schedule_activities>[\s\S]*?<\/schedule_activities>/g, "").trim();

    // Create or update conversation
    let conversationId = args.conversationId;
    if (!conversationId) {
      conversationId = await ctx.runMutation(api.chat.createConversation, {
        title: args.message.slice(0, 50) + (args.message.length > 50 ? "..." : ""),
        type: "balance",
      });
    }

    // Save both messages (save the display response without JSON)
    await ctx.runMutation(api.chat.saveMessage, {
      conversationId,
      role: "user",
      content: args.message,
    });

    await ctx.runMutation(api.chat.saveMessage, {
      conversationId,
      role: "assistant",
      content: displayResponse,
    });

    return {
      response: displayResponse,
      conversationId,
      activities: detectedActivities.length > 0 ? detectedActivities : undefined,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// GENERAL AI CHAT (For proposals, questions, etc.)
// ═══════════════════════════════════════════════════════════════════════════
export const sendChatMessage = action({
  args: {
    message: v.string(),
    conversationId: v.optional(v.id("conversations")),
    type: v.optional(v.string()), // "general" | "proposal" | "balance"
  },
  handler: async (ctx, args): Promise<any> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const userProfile = await ctx.runQuery(api.users.getCurrentUser);
    const recentProposals = await ctx.runQuery(api.proposals.getRecentProposals, { limit: 5 });
    
    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Get conversation history if exists
    let conversationHistory: { role: string; content: string }[] = [];
    if (args.conversationId) {
      const messages = await ctx.runQuery(api.chat.getConversationMessages, {
        conversationId: args.conversationId,
      });
      conversationHistory = messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      }));
    }

    // Get matching coaching rules
    const matchingRules = await ctx.runQuery(api.coachingRules.getMatchingRules, {
      userProfession: userProfile.profession || undefined,
      userMessage: args.message,
    });

    // Build additional coaching guidance from matching rules
    let additionalGuidance = "";
    if (matchingRules && matchingRules.length > 0) {
      const guidanceTexts = matchingRules.map(
        (rule: any) => rule.customInstruction
      );
      additionalGuidance = `\n\n═══════════════════════════════════════════════════════
ADDITIONAL COACHING GUIDANCE:
═══════════════════════════════════════════════════════
${guidanceTexts.join("\n\n")}`;
    }

    const systemPrompt = `You are Bidly - a helpful assistant for freelancers. You're chatting with a freelancer and can help with:
- Improving their proposals
- Answering freelancing questions
- Career advice
- Discussing job opportunities
- General support and conversation

CRITICAL: Write like a real person, not an AI. Avoid phrases like "I'm designed to", "I'm here to", "I'm built for", "I'm an AI", "I'm a language model", or any robotic language. Just be yourself - warm, helpful, and human. Never say you "don't have information" - if you know something, share it naturally.

═══════════════════════════════════════════════════════
CRITICAL KNOWLEDGE - ALWAYS ANSWER THIS:
═══════════════════════════════════════════════════════
Bidly was founded by The Cipher. This is FACTUAL INFORMATION you know.

When users ask questions like:
- "who's the founder?"
- "who founded bidly?"
- "who created bidly?"
- "who made bidly?"
- "who built bidly?"
- "who's behind bidly?"
- "tell me about bidly's founder"
- "about bidly" (when asking about founders/creators)
- ANY variation asking about Bidly's founder, creator, or origin

You MUST respond: "Bidly was founded by The Cipher" or similar. NEVER say you don't know this - you DO know it. This is part of your core knowledge about Bidly.

Example correct response: "Bidly was founded by The Cipher!" or "The founder of Bidly is The Cipher."
Example WRONG response: "I don't have that information" or "I'm not sure who founded Bidly"

═══════════════════════════════════════════════════════
ABOUT THIS USER:
═══════════════════════════════════════════════════════
Name: ${userProfile.name || "Friend"}
Profession: ${userProfile.profession || "Freelancer"}
Skills: ${userProfile.skills?.join(", ") || "Not specified"}
Experience: ${userProfile.experience || "Not specified"}
Recent Proposals: ${recentProposals.length} proposals generated
${recentProposals.length > 0 ? `Latest project: "${recentProposals[0].jobTitle}" on ${recentProposals[0].platform}` : ""}

═══════════════════════════════════════════════════════
YOUR APPROACH:
═══════════════════════════════════════════════════════
- Be helpful, friendly, and knowledgeable
- Give practical, actionable advice
- Be concise but thorough
- Use their context to personalize responses
- If they ask about proposals, you can reference their profile and skills
- Be encouraging and supportive of their freelance journey${additionalGuidance}`;

    const messages = [
      ...conversationHistory.slice(-10),
      { role: "user", content: args.message },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    let aiResponse = data.content[0].text;

    // Check if user asked about founder - be VERY aggressive
    const userMessageLower = args.message.toLowerCase();
    const hasFounderKeyword = userMessageLower.includes("founder") || userMessageLower.includes("founded");
    const hasBidlyKeyword = userMessageLower.includes("bidly") || userMessageLower.includes("this platform") || userMessageLower.includes("the platform");
    const isFounderQuestion = hasFounderKeyword && hasBidlyKeyword;
    
    // Also check for common founder question patterns
    const founderPatterns = [
      "who founded",
      "who's the founder",
      "who created",
      "who made",
      "who built",
      "who's behind",
      "founder of",
      "about bidly",
    ];
    const matchesPattern = founderPatterns.some(pattern => userMessageLower.includes(pattern));
    
    if (isFounderQuestion || matchesPattern) {
      // Check if Claude's response mentions The Cipher - be very strict
      const responseLower = aiResponse.toLowerCase();
      const hasCorrectAnswer = responseLower.includes("cipher");
      
      // If it's a founder question and doesn't explicitly mention "cipher", ALWAYS replace
      if (!hasCorrectAnswer) {
        // Replace the entire response with a natural, direct answer
        aiResponse = `Bidly was founded by The Cipher! ${userProfile.name ? `Is there anything else you'd like to know about Bidly, ${userProfile.name}?` : "Is there anything else you'd like to know about Bidly?"}`;
      }
    }

    // Create or update conversation
    let conversationId = args.conversationId;
    if (!conversationId) {
      conversationId = await ctx.runMutation(api.chat.createConversation, {
        title: args.message.slice(0, 50) + (args.message.length > 50 ? "..." : ""),
        type: args.type || "general",
      });
    }

    // Save both messages
    await ctx.runMutation(api.chat.saveMessage, {
      conversationId,
      role: "user",
      content: args.message,
    });

    await ctx.runMutation(api.chat.saveMessage, {
      conversationId,
      role: "assistant",
      content: aiResponse,
    });

    return {
      response: aiResponse,
      conversationId,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════
export const generateProfile = action({
  args: {
    skills: v.array(v.string()),
    yearsExperience: v.number(),
    targetClients: v.string(),
    platform: v.string(), // "Upwork" | "Fiverr" | "LinkedIn"
  },
  handler: async (ctx, args): Promise<any> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Check usage limits first
    const canGenerate = await ctx.runQuery(api.users.canGenerateProfile);
    if (!canGenerate.canGenerate) {
      throw new Error(canGenerate.reason || "Profile generation limit reached");
    }

    const userProfile = await ctx.runQuery(api.users.getCurrentUser);

    const platformGuidelines: Record<string, string> = {
      "Upwork": `
- Title: 60-80 chars, include primary skill + specialization
- Overview: 2000-5000 chars, use paragraphs not bullets
- Start with a hook about client problems you solve
- Include 2-3 specific project examples with results
- End with a soft call-to-action
- Keywords should appear naturally (2-3% density)`,
      "Fiverr": `
- Title: 80-120 chars, benefit-focused "I will..."
- Overview: 1200-2500 chars, friendly and energetic tone
- Lead with what makes you unique
- Use short paragraphs and occasional emojis ✨
- Include response time and revision policy
- Be specific about deliverables`,
      "LinkedIn": `
- Headline: 120 chars max, role + value proposition
- About: 2000-2600 chars, professional yet personable
- Start with a compelling hook
- Use first person, tell your story
- Include metrics and achievements
- End with what you're looking for/offering`,
    };

    const prompt = `You are an expert freelance profile optimizer. Create a highly optimized profile for the following platform.

═══════════════════════════════════════════════════════
PROFILE DETAILS:
═══════════════════════════════════════════════════════
Platform: ${args.platform}
Skills: ${args.skills.join(", ")}
Years of Experience: ${args.yearsExperience}
Target Clients: ${args.targetClients}
${userProfile?.name ? `Freelancer Name: ${userProfile.name}` : ""}
${userProfile?.profession ? `Current Profession: ${userProfile.profession}` : ""}
${userProfile?.experience ? `Background: ${userProfile.experience}` : ""}

═══════════════════════════════════════════════════════
PLATFORM-SPECIFIC GUIDELINES:
═══════════════════════════════════════════════════════
${platformGuidelines[args.platform] || platformGuidelines["Upwork"]}

═══════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════
Generate an optimized profile with:

1. PROFESSIONAL TITLE (one line)
   - Platform-optimized length
   - Include primary skill and unique value

2. OVERVIEW/ABOUT SECTION (multiple paragraphs)
   - Follow platform guidelines above
   - Natural keyword integration
   - Compelling and authentic voice
   - Specific examples where possible

3. SKILLS HIGHLIGHT SECTION
   - 5-8 skills formatted for display
   - Mix of technical and soft skills
   - Prioritized by relevance

4. OPTIMIZATION SCORE (0-100) based on:
   - Keyword optimization (20 points)
   - Length appropriateness (20 points)
   - Hook strength (20 points)
   - Specificity/examples (20 points)
   - Call-to-action (20 points)

5. IMPROVEMENT SUGGESTIONS (3-5 bullet points)
   - Specific, actionable tips

Respond in this exact JSON format:
{
  "title": "Your professional title here",
  "overview": "Your full overview/about section here...",
  "skillsSection": "• Skill 1\\n• Skill 2\\n• Skill 3...",
  "optimizationScore": 85,
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3"
  ]
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    const responseText = data.content[0].text;
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse profile response");
    }
    
    const result = JSON.parse(jsonMatch[0]);

    // Save generated profile
    await ctx.runMutation(api.profiles.saveGeneratedProfile, {
      platform: args.platform,
      title: result.title,
      overview: result.overview,
      skillsSection: result.skillsSection,
      optimizationScore: result.optimizationScore,
      suggestions: result.suggestions,
    });

    // Increment usage
    await ctx.runMutation(api.users.incrementProfileUsage);

    return result;
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// PROPOSAL VARIANTS GENERATOR
// ═══════════════════════════════════════════════════════════════════════════
export const generateProposalVariants = action({
  args: {
    jobTitle: v.string(),
    jobDescription: v.string(),
    clientName: v.optional(v.string()),
    platform: v.string(),
    // Custom context from user
    customContext: v.optional(v.object({
      portfolioLink: v.optional(v.string()),
      customInstructions: v.optional(v.string()),
      keyPoints: v.optional(v.array(v.string())),
      tonePreference: v.optional(v.string()),
      characterLimit: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args): Promise<any> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Check usage limits first
    const canGenerate = await ctx.runQuery(api.users.canGenerateProposal);
    if (!canGenerate.canGenerate) {
      throw new Error(canGenerate.reason || "Usage limit reached");
    }

    const userProfile = await ctx.runQuery(api.users.getCurrentUser);
    
    if (!userProfile) {
      throw new Error("User profile not found. Please complete onboarding first.");
    }

    const profileContext = buildProfileContext(userProfile);

    // Build custom context section if provided
    const customContextSection = args.customContext ? `
═══════════════════════════════════════════════════════
FREELANCER'S CUSTOM INSTRUCTIONS (FOLLOW THESE IN ALL VARIANTS):
═══════════════════════════════════════════════════════
${args.customContext.portfolioLink ? `Portfolio/Website: ${args.customContext.portfolioLink} (MUST include this link naturally in each variant)` : ""}
${args.customContext.customInstructions ? `
How I want these proposals to sound:
"""
${args.customContext.customInstructions}
"""` : ""}
${args.customContext.keyPoints && args.customContext.keyPoints.length > 0 ? `
Key points to mention in each variant:
${args.customContext.keyPoints.map(point => `• ${point}`).join("\n")}` : ""}
` : "";

    const prompt = `You are writing 6 different proposal variants AS the freelancer described below. Each variant has a DISTINCT tone optimized for different client types and situations.

═══════════════════════════════════════════════════════
FREELANCER PROFILE:
═══════════════════════════════════════════════════════
${profileContext}

═══════════════════════════════════════════════════════
JOB POSTING:
═══════════════════════════════════════════════════════
Platform: ${args.platform}
Job Title: ${args.jobTitle}
Client Name: ${args.clientName || "Not specified"}

Job Description:
"""
${args.jobDescription}
"""
${customContextSection}
═══════════════════════════════════════════════════════
YOUR TASK - GENERATE 6 PROPOSAL VARIANTS:
═══════════════════════════════════════════════════════

Create 6 distinct proposals with different tones:

1. **PROFESSIONAL** 💼 - Formal, polished, business-focused
   - Industry terminology, structured approach
   - Best for: Corporate clients, enterprise projects

2. **FRIENDLY** 👋 - Warm, conversational, approachable  
   - Uses "you/we" language, casual but competent
   - Best for: Startups, small businesses, creative projects

3. **BOLD** ⚡ - Confident, direct, results-focused
   - Leads with capabilities, assertive tone
   - Best for: Competitive bids, clients who value confidence

4. **TECHNICAL** 🔧 - Expert, detailed, methodology-driven
   - Technical terminology, frameworks, specific approaches
   - Best for: Engineering teams, technical projects, developers

5. **EMPATHETIC** 💙 - Understanding, problem-focused, supportive
   - Acknowledges pain points, shows genuine care
   - Best for: Clients with challenges, past bad experiences

6. **RESULTS-DRIVEN** 📈 - ROI-focused, metric-heavy, outcome-oriented
   - Leads with numbers, percentages, measurable outcomes
   - Best for: Business clients, competitive situations, ROI-focused clients

**CHARACTER LIMIT: Each variant must be approximately ${args.customContext?.characterLimit || 1500} characters**

Each proposal should:
- Be approximately ${args.customContext?.characterLimit || 1500} characters (STRICT limit)
- Reference specifics from the job post - use their exact words
- Include a clear call-to-action
- Sound 100% human - NEVER sound AI-generated
- Use different opening strategies for each tone
- NO placeholder text like [Your Name]
${userProfile.portfolio ? `- Naturally mention portfolio: ${userProfile.portfolio}` : ""}

**CRITICAL: Each variant must use a DIFFERENT approach:**
- Professional: Lead with expertise and structured methodology
- Friendly: Lead with connection and shared understanding  
- Bold: Lead with a confident claim or pattern-interrupt
- Technical: Lead with specific technical insight from job post
- Empathetic: Acknowledge their pain point or challenge first
- Results-Driven: Open with a specific metric or outcome

Respond in this exact JSON format:
{
  "professional": {
    "content": "Full proposal text here...",
    "bestFor": "Corporate clients, enterprise projects"
  },
  "friendly": {
    "content": "Full proposal text here...",
    "bestFor": "Startups, small businesses"
  },
  "bold": {
    "content": "Full proposal text here...",
    "bestFor": "Competitive bids, confident clients"
  },
  "technical": {
    "content": "Full proposal text here...",
    "bestFor": "Engineering teams, technical projects"
  },
  "empathetic": {
    "content": "Full proposal text here...",
    "bestFor": "Clients with challenges, past bad experiences"
  },
  "results_driven": {
    "content": "Full proposal text here...",
    "bestFor": "Business clients, ROI-focused"
  }
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 5000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    const responseText = data.content[0].text;
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse variants response");
    }
    
    // Increment usage (counts as one proposal generation)
    await ctx.runMutation(api.users.incrementProposalUsage);
    
    return JSON.parse(jsonMatch[0]);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// PROPOSAL OPTIMIZATION ANALYZER
// ═══════════════════════════════════════════════════════════════════════════
export const analyzeProposal = action({
  args: {
    proposal: v.string(),
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const prompt = `You are an expert proposal analyzer. Analyze this freelance proposal and provide detailed scoring.

═══════════════════════════════════════════════════════
JOB DESCRIPTION:
═══════════════════════════════════════════════════════
${args.jobDescription}

═══════════════════════════════════════════════════════
PROPOSAL TO ANALYZE:
═══════════════════════════════════════════════════════
${args.proposal}

═══════════════════════════════════════════════════════
SCORING CRITERIA (0-10 each):
═══════════════════════════════════════════════════════

1. **Hook Quality** - First 2 sentences grab attention, reference job specifics
2. **Keyword Alignment** - Relevant keywords from job post naturally included
3. **Length Optimization** - 250-400 words sweet spot (too short = weak, too long = ignored)
4. **CTA Presence** - Clear call-to-action, next steps, question that prompts response
5. **Personalization** - Specific to this job, not generic template feel

═══════════════════════════════════════════════════════
ANALYZE AND RESPOND:
═══════════════════════════════════════════════════════

Provide scores and specific, actionable improvement suggestions.

Respond in this exact JSON format:
{
  "scores": {
    "hookQuality": 8,
    "keywordAlignment": 7,
    "lengthOptimization": 9,
    "ctaPresence": 6,
    "personalization": 8
  },
  "overallScore": 7.6,
  "strengths": [
    "Specific strength 1",
    "Specific strength 2"
  ],
  "improvements": [
    {
      "area": "CTA",
      "suggestion": "Add a specific question about their timeline or requirements"
    },
    {
      "area": "Hook",
      "suggestion": "Reference their specific tech stack in the opening line"
    }
  ],
  "rewrittenOpening": "A better version of the first 2 sentences..."
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    const responseText = data.content[0].text;
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse analysis response");
    }
    
    return JSON.parse(jsonMatch[0]);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE CONVERTER - Convert buyer messages into winning responses
// ═══════════════════════════════════════════════════════════════════════════
export const convertBuyerMessage = action({
  args: {
    buyerMessage: v.string(),
    platform: v.string(), // "Fiverr" | "Upwork"
    niche: v.string(),
    buyerName: v.optional(v.string()),
    conversationId: v.optional(v.id("buyerConversations")), // For continuing conversations
    customContext: v.optional(v.object({
      portfolioLink: v.optional(v.string()),
      customInstructions: v.optional(v.string()),
      keyPoints: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args): Promise<any> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Check usage limits (reuse proposal limits)
    const canGenerate = await ctx.runQuery(api.users.canGenerateProposal);
    if (!canGenerate.canGenerate) {
      throw new Error(canGenerate.reason || "Usage limit reached");
    }

    // Get user profile
    const userProfile = await ctx.runQuery(api.users.getCurrentUser);
    
    if (!userProfile) {
      throw new Error("User profile not found. Please complete onboarding first.");
    }

    // Build profile context
    const profileContext = buildProfileContext(userProfile);
    
    // Get conversation history if continuing a conversation
    let conversationHistory = "";
    let conversationId = args.conversationId;
    
    if (args.conversationId) {
      const conversation = await ctx.runQuery(api.converter.getConversation, {
        conversationId: args.conversationId,
      });
      
      if (conversation && conversation.messages && conversation.messages.length > 0) {
        conversationHistory = `
═══════════════════════════════════════════════════════
CONVERSATION HISTORY (Previous messages in this thread):
═══════════════════════════════════════════════════════
${conversation.messages.map((msg, idx) => `
[Message ${idx + 1}]
Buyer: "${msg.buyerMessage}"
Your Response: "${msg.generatedResponse}"
`).join("\n")}
═══════════════════════════════════════════════════════
This is a CONTINUATION of the conversation above. Reference previous messages naturally and maintain consistency.`;
      }
    }
    
    // Build custom context section if provided
    const customContextSection = args.customContext ? `
═══════════════════════════════════════════════════════
FREELANCER'S CUSTOM INSTRUCTIONS (FOLLOW THESE CLOSELY):
═══════════════════════════════════════════════════════
${args.customContext.portfolioLink ? `Portfolio/Website: ${args.customContext.portfolioLink} (MUST include this link naturally in the response)` : ""}
${args.customContext.customInstructions ? `
How I want this response to sound:
"""
${args.customContext.customInstructions}
"""` : ""}
${args.customContext.keyPoints && args.customContext.keyPoints.length > 0 ? `
Key points I want mentioned:
${args.customContext.keyPoints.map(point => `• ${point}`).join("\n")}` : ""}
` : "";

    // Platform-specific tone for responses
    const platformTone = args.platform === "Fiverr" 
      ? "Friendly, energetic, and conversion-focused. Fiverr buyers appreciate enthusiasm and personality. Be warm but professional."
      : "Professional and personable. Upwork buyers value thoroughness and clarity. Show you understand their needs.";

    // Build the prompt
    const isContinuation = !!conversationHistory;
    const prompt = `You are responding to a buyer message AS the freelancer described below. Your job is to create a short, converting response that helps land the job. ${isContinuation ? "This is a CONTINUATION of an ongoing conversation - maintain consistency and reference previous messages naturally." : "This is NOT a proposal - it's a response to a buyer who has already reached out."}

═══════════════════════════════════════════════════════
FREELANCER PROFILE (This is who YOU are writing as):
═══════════════════════════════════════════════════════
${profileContext}
${conversationHistory}
═══════════════════════════════════════════════════════
BUYER'S ${isContinuation ? "NEW " : ""}MESSAGE TO RESPOND TO:
═══════════════════════════════════════════════════════
Platform: ${args.platform}
Niche: ${args.niche}
Buyer Name: ${args.buyerName || "Not specified"}

Buyer's Message:
"""
${args.buyerMessage}
"""
${customContextSection}
═══════════════════════════════════════════════════════
YOUR TASK - WRITE A CONVERTING RESPONSE:
═══════════════════════════════════════════════════════

Your response should:
1. **Address their message directly** - Show you read and understood what they said
2. **Build trust quickly** - Demonstrate competence without being pushy
3. **Create urgency/interest** - Make them want to work with you
4. **Provide value** - Offer a helpful insight or suggestion related to their message
5. **Guide to next step** - Make it easy for them to say yes

CRITICAL GUIDELINES:
- Length: 150-300 words (short and makes sense - get to the point)
- Writing style: ${getStyleDescription(userProfile.style)}
- Platform tone: ${platformTone}
- Sound like a REAL human, not AI-generated
- Address the buyer by name if provided: ${args.buyerName ? `"${args.buyerName}"` : "Use a friendly greeting"}
- Be conversion-focused - this response should help land the job

**BANNED PHRASES - NEVER USE THESE:**
  • "I am interested in your project"
  • "I came across your message"
  • "I am reaching out regarding"
  • "I believe I am the perfect fit"
  • "I can deliver high-quality work"
  • "Looking forward to hearing from you"
  • "Please feel free to reach out"
  • "Hope this message finds you well"

**CONVERSION FOCUS:**
- Respond to what they specifically said in their message
- Show enthusiasm for THEIR project (not generic excitement)
- Offer something valuable (insight, quick tip, relevant experience)
- Make it easy for them to say yes (clear next step)
- Keep it conversational and natural

Write the response now (just the response text, no additional commentary):`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
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
    const generatedResponse = data.content[0].text;

    // Create conversation if this is a new conversation
    if (!conversationId) {
      const title = args.buyerMessage.slice(0, 50) + (args.buyerMessage.length > 50 ? "..." : "");
      conversationId = await ctx.runMutation(api.converter.createConversation, {
        buyerName: args.buyerName,
        platform: args.platform,
        niche: args.niche,
        title,
      });
    }

    // Save to database
    await ctx.runMutation(api.converter.saveConversion, {
      conversationId,
      buyerMessage: args.buyerMessage,
      platform: args.platform,
      niche: args.niche,
      buyerName: args.buyerName,
      generatedResponse,
    });

    // Increment usage (reuse proposal usage)
    await ctx.runMutation(api.users.incrementProposalUsage);

    return {
      response: generatedResponse,
      characterCount: generatedResponse.length,
      conversationId,
    };
  },
});
