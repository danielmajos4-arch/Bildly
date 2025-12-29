"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Tone definitions with metadata
const TONES = [
  {
    id: "professional",
    name: "Professional",
    icon: "💼",
    description: "Formal, polished, business-focused",
    bestFor: "Corporate clients, enterprise projects",
    example: "Your requirement for scalable architecture aligns with my expertise in...",
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  {
    id: "friendly",
    name: "Friendly",
    icon: "👋",
    description: "Warm, conversational, approachable",
    bestFor: "Startups, small businesses, creative projects",
    example: "Hey! Your project sounds exciting - I just wrapped up something similar...",
    color: "bg-green-100 text-green-700 border-green-300",
  },
  {
    id: "bold",
    name: "Bold",
    icon: "⚡",
    description: "Confident, direct, results-focused",
    bestFor: "Competitive bids, clients who value confidence",
    example: "I'll be direct: I've delivered exactly what you need 8 times this year...",
    color: "bg-purple-100 text-purple-700 border-purple-300",
  },
  {
    id: "technical",
    name: "Technical",
    icon: "🔧",
    description: "Expert, detailed, methodology-driven",
    bestFor: "Engineering teams, technical projects",
    example: "I noticed you're using React 18 - the concurrent rendering issues...",
    color: "bg-indigo-100 text-indigo-700 border-indigo-300",
  },
  {
    id: "empathetic",
    name: "Empathetic",
    icon: "💙",
    description: "Understanding, problem-focused, supportive",
    bestFor: "Clients with challenges, complex situations",
    example: "Dealing with missed deadlines is frustrating - I've helped recover...",
    color: "bg-cyan-100 text-cyan-700 border-cyan-300",
  },
  {
    id: "results_driven",
    name: "Results-Driven",
    icon: "📈",
    description: "ROI-focused, metric-heavy, outcome-oriented",
    bestFor: "Business clients, competitive situations",
    example: "Last month: 34% conversion increase in 2 weeks. Here's how...",
    color: "bg-orange-100 text-orange-700 border-orange-300",
  },
];

export default function GeneratePage() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [platform, setPlatform] = useState("");
  const [selectedTone, setSelectedTone] = useState("friendly");
  const [generationMode, setGenerationMode] = useState<"quick" | "compare">("quick");
  const [generatedProposal, setGeneratedProposal] = useState("");
  const [variants, setVariants] = useState<Record<string, { content: string; bestFor: string }> | null>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptimizationTips, setShowOptimizationTips] = useState(false);

  const generateProposal = useAction(api.ai.generateProposal);
  const generateVariants = useAction(api.ai.generateProposalVariants);
  
  // Simple optimization score calculation
  const calculateOptimizationScore = (proposal: string) => {
    let score = 0;
    const length = proposal.length;
    
    // Length optimization (250-400 words is optimal)
    const wordCount = proposal.split(/\s+/).length;
    if (wordCount >= 250 && wordCount <= 400) score += 25;
    else if (wordCount >= 200 && wordCount <= 500) score += 15;
    else score += 5;
    
    // Has specific numbers/metrics
    if (/\d+%|\d+ (days?|weeks?|months?|years?|clients?|projects?)/.test(proposal)) score += 20;
    
    // Has question in CTA
    if (/\?[^?]*$/.test(proposal.trim())) score += 15;
    
    // Avoids banned phrases
    const bannedPhrases = ["I am interested in your project", "I came across", "perfect fit", "high-quality work"];
    const hasBanned = bannedPhrases.some(phrase => proposal.toLowerCase().includes(phrase.toLowerCase()));
    if (!hasBanned) score += 20;
    
    // Has personalization indicators
    if (proposal.includes("noticed") || proposal.includes("saw") || proposal.includes("mentioned")) score += 20;
    
    return Math.min(score, 100);
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }
    if (!platform) {
      toast.error("Please select a platform");
      return;
    }

    setIsGenerating(true);
    setGeneratedProposal("");
    setVariants(null);

    try {
      if (generationMode === "quick") {
        // Quick mode - generate single proposal with selected tone
        const result = await generateProposal({
          jobTitle: jobTitle.trim() || "Freelance Project",
          jobDescription: jobDescription.trim(),
          clientName: clientName.trim() || undefined,
          platform,
          customContext: {
            tonePreference: selectedTone,
          },
        });

        setGeneratedProposal(result.proposal);
        setCharacterCount(result.characterCount);
        toast.success("Proposal generated successfully!");
      } else {
        // Compare mode - generate all 6 tone variants
        const result = await generateVariants({
          jobTitle: jobTitle.trim() || "Freelance Project",
          jobDescription: jobDescription.trim(),
          clientName: clientName.trim() || undefined,
          platform,
        });

        setVariants(result);
        toast.success("All tone variants generated!");
      }
    } catch (error) {
      console.error("Error generating proposal:", error);
      toast.error("Failed to generate proposal. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedProposal);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleProposalChange = (value: string) => {
    setGeneratedProposal(value);
    setCharacterCount(value.length);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/25">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Bidly
            </span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Generate Your Proposal
            </h1>
            <p className="text-lg text-slate-600">
              Paste the job details and let AI craft the perfect proposal
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Form */}
            <Card className="border-0 bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                    <svg
                      className="h-4 w-4 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Job Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Paste the full job description here... Include requirements, skills needed, and any specific details mentioned by the client."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[180px] resize-none border-slate-200 bg-white/50 transition-colors focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Job Title{" "}
                    <span className="text-slate-400">(optional)</span>
                  </label>
                  <Input
                    placeholder="e.g., React Developer, Content Writer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="border-slate-200 bg-white/50 transition-colors focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>

                {/* Client Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Client Name{" "}
                    <span className="text-slate-400">(optional)</span>
                  </label>
                  <Input
                    placeholder="e.g., John, Sarah, TechCorp"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="border-slate-200 bg-white/50 transition-colors focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>

                {/* Platform */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Platform <span className="text-red-500">*</span>
                  </label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="border-slate-200 bg-white/50 transition-colors focus:border-indigo-300 focus:ring-indigo-200">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Upwork">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Upwork
                        </div>
                      </SelectItem>
                      <SelectItem value="Fiverr">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-400" />
                          Fiverr
                        </div>
                      </SelectItem>
                      <SelectItem value="Freelancer">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          Freelancer
                        </div>
                      </SelectItem>
                      <SelectItem value="Other">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-slate-400" />
                          Other
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Generation Mode Toggle */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Generation Mode
                  </label>
                  <Tabs value={generationMode} onValueChange={(v) => setGenerationMode(v as "quick" | "compare")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="quick">Quick Generate</TabsTrigger>
                      <TabsTrigger value="compare">Compare Tones</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Tone Selector (only show in Quick mode) */}
                {generationMode === "quick" && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">
                      Proposal Tone <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TONES.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => setSelectedTone(tone.id)}
                          className={`group relative rounded-lg border-2 p-3 text-left transition-all ${
                            selectedTone === tone.id
                              ? tone.color + " border-current shadow-md"
                              : "border-slate-200 bg-white/50 hover:border-slate-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xl">{tone.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm">{tone.name}</div>
                              <div className="text-xs text-slate-600 mt-0.5">{tone.description}</div>
                            </div>
                          </div>
                          {/* Tooltip on hover */}
                          <div className="absolute left-0 right-0 top-full mt-2 hidden group-hover:block z-10">
                            <div className="bg-slate-900 text-white text-xs rounded-lg p-2 shadow-lg">
                              <div className="font-medium mb-1">Best for:</div>
                              <div className="text-slate-300">{tone.bestFor}</div>
                              <div className="mt-2 italic text-slate-400">&ldquo;{tone.example}&rdquo;</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 italic">
                      💡 Tip: Match tone to client&apos;s posting style for best results
                    </p>
                  </div>
                )}

                {/* Compare Mode Info */}
                {generationMode === "compare" && (
                  <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3">
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 text-indigo-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-indigo-900">
                        <div className="font-medium mb-1">Compare All 6 Tones</div>
                        <div className="text-indigo-700">
                          Generate proposals in all tones at once and pick the one that fits best
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !jobDescription.trim() || !platform}
                  className="h-12 w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-base font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Generate Proposal
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="border-0 bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                      <svg
                        className="h-4 w-4 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    {generationMode === "compare" ? "Tone Variants" : "Your Proposal"}
                  </CardTitle>
                  {generatedProposal && generationMode === "quick" && (
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {characterCount} characters
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="border-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <svg
                          className="mr-1.5 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Quick Mode Output */}
                {generationMode === "quick" && (
                  <>
                    {generatedProposal ? (
                      <div className="space-y-3">
                        {/* Optimization Score */}
                        <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">📊</span>
                              <span className="font-semibold text-slate-900">Optimization Score</span>
                            </div>
                            <div className="text-2xl font-bold text-indigo-600">
                              {calculateOptimizationScore(generatedProposal)}/100
                            </div>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <Badge variant="secondary" className="bg-white/50">
                              {generatedProposal.split(/\s+/).length} words
                            </Badge>
                            <Badge variant="secondary" className="bg-white/50">
                              {/\d+%/.test(generatedProposal) ? "✓ Has metrics" : "Add metrics"}
                            </Badge>
                            <Badge variant="secondary" className="bg-white/50">
                              {/\?[^?]*$/.test(generatedProposal.trim()) ? "✓ Question CTA" : "Add question"}
                            </Badge>
                          </div>
                          <button
                            onClick={() => setShowOptimizationTips(!showOptimizationTips)}
                            className="text-xs text-indigo-600 hover:text-indigo-700 mt-2 font-medium"
                          >
                            {showOptimizationTips ? "Hide" : "Show"} optimization tips →
                          </button>
                          {showOptimizationTips && (
                            <div className="mt-3 space-y-2 text-xs text-slate-700 bg-white/70 rounded p-2">
                              <div>💡 <strong>Optimal length:</strong> 250-400 words (currently {generatedProposal.split(/\s+/).length})</div>
                              <div>💡 <strong>Add specifics:</strong> Include numbers, percentages, or timeframes</div>
                              <div>💡 <strong>End with question:</strong> Ask about their timeline, requirements, or preferences</div>
                              <div>💡 <strong>Personalize:</strong> Reference specific details from their job post</div>
                            </div>
                          )}
                        </div>
                        
                        <Textarea
                          value={generatedProposal}
                          onChange={(e) => handleProposalChange(e.target.value)}
                          className="min-h-[400px] resize-none border-slate-200 bg-white/50 text-sm leading-relaxed transition-colors focus:border-indigo-300 focus:ring-indigo-200"
                        />
                      </div>
                    ) : (
                      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                          <svg
                            className="h-8 w-8 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                            />
                          </svg>
                        </div>
                        <p className="mb-1 font-medium text-slate-600">
                          Your proposal will appear here
                        </p>
                        <p className="text-sm text-slate-400">
                          Fill in the job details and click Generate
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Compare Mode Output */}
                {generationMode === "compare" && (
                  <>
                    {variants ? (
                      <Tabs defaultValue={Object.keys(variants)[0]} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                          {TONES.slice(0, 3).map((tone) => (
                            <TabsTrigger key={tone.id} value={tone.id} className="text-xs">
                              <span className="mr-1">{tone.icon}</span>
                              {tone.name}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                          {TONES.slice(3).map((tone) => (
                            <TabsTrigger key={tone.id} value={tone.id} className="text-xs">
                              <span className="mr-1">{tone.icon}</span>
                              {tone.name}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {TONES.map((tone) => {
                          const variant = variants[tone.id];
                          if (!variant) return null;
                          
                          return (
                            <TabsContent key={tone.id} value={tone.id} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge className={tone.color}>
                                  {tone.icon} {tone.name} - Best for: {variant.bestFor}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(variant.content);
                                    toast.success(`${tone.name} variant copied!`);
                                  }}
                                  className="border-slate-200 hover:bg-indigo-50"
                                >
                                  <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Copy
                                </Button>
                              </div>
                              <Textarea
                                value={variant.content}
                                readOnly
                                className="min-h-[350px] resize-none border-slate-200 bg-white/50 text-sm leading-relaxed"
                              />
                              <div className="text-xs text-slate-500">
                                {variant.content.length} characters
                              </div>
                            </TabsContent>
                          );
                        })}
                      </Tabs>
                    ) : (
                      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <p className="mb-1 font-medium text-slate-600">
                          All tone variants will appear here
                        </p>
                        <p className="text-sm text-slate-400">
                          Fill in the job details and click Generate
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tips Section */}
          <div className="mt-12">
            <h2 className="mb-6 text-center text-xl font-bold text-slate-900">
              Tips for Winning Proposals
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/60 p-5 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <svg
                    className="h-5 w-5 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 font-semibold text-slate-900">
                  Personalize It
                </h3>
                <p className="text-sm text-slate-600">
                  Edit the generated proposal to add your specific experience
                  and portfolio links.
                </p>
              </div>
              <div className="rounded-xl bg-white/60 p-5 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                  <svg
                    className="h-5 w-5 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 font-semibold text-slate-900">Be Quick</h3>
                <p className="text-sm text-slate-600">
                  Apply within the first hour of a job posting for 4x higher
                  chance of being hired.
                </p>
              </div>
              <div className="rounded-xl bg-white/60 p-5 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <svg
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 font-semibold text-slate-900">
                  Follow Up
                </h3>
                <p className="text-sm text-slate-600">
                  Ask a relevant question at the end to start a conversation
                  with the client.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

