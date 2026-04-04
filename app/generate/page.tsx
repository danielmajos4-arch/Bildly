"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Briefcase,
  Hand,
  Zap,
  Wrench,
  Heart,
  TrendingUp,
  BarChart2,
  Lightbulb,
  Loader2,
  Sparkles,
  Copy,
  PenSquare,
  FileText,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ToneDefinition {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  bestFor: string;
  example: string;
  color: string;
}

const TONES: ToneDefinition[] = [
  {
    id: "professional",
    name: "Professional",
    icon: Briefcase,
    description: "Formal, polished, business-focused",
    bestFor: "Corporate clients, enterprise projects",
    example: "Your requirement for scalable architecture aligns with my expertise in...",
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  {
    id: "friendly",
    name: "Friendly",
    icon: Hand,
    description: "Warm, conversational, approachable",
    bestFor: "Startups, small businesses, creative projects",
    example: "Hey! Your project sounds exciting - I just wrapped up something similar...",
    color: "bg-green-100 text-green-700 border-green-300",
  },
  {
    id: "bold",
    name: "Bold",
    icon: Zap,
    description: "Confident, direct, results-focused",
    bestFor: "Competitive bids, clients who value confidence",
    example: "I'll be direct: I've delivered exactly what you need 8 times this year...",
    color: "bg-purple-100 text-purple-700 border-purple-300",
  },
  {
    id: "technical",
    name: "Technical",
    icon: Wrench,
    description: "Expert, detailed, methodology-driven",
    bestFor: "Engineering teams, technical projects",
    example: "I noticed you're using React 18 - the concurrent rendering issues...",
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
  },
  {
    id: "empathetic",
    name: "Empathetic",
    icon: Heart,
    description: "Understanding, problem-focused, supportive",
    bestFor: "Clients with challenges, complex situations",
    example: "Dealing with missed deadlines is frustrating - I've helped recover...",
    color: "bg-cyan-100 text-cyan-700 border-cyan-300",
  },
  {
    id: "results_driven",
    name: "Results-Driven",
    icon: TrendingUp,
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
  const [generatedProposal, setGeneratedProposal] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptimizationTips, setShowOptimizationTips] = useState(false);

  const generateProposal = useAction(api.ai.generateProposal);
  
  const calculateOptimizationScore = (proposal: string) => {
    let score = 0;
    
    const wordCount = proposal.split(/\s+/).length;
    if (wordCount >= 250 && wordCount <= 400) score += 25;
    else if (wordCount >= 200 && wordCount <= 500) score += 15;
    else score += 5;
    
    if (/\d+%|\d+ (days?|weeks?|months?|years?|clients?|projects?)/.test(proposal)) score += 20;
    if (/\?[^?]*$/.test(proposal.trim())) score += 15;
    
    const bannedPhrases = ["I am interested in your project", "I came across", "perfect fit", "high-quality work"];
    const hasBanned = bannedPhrases.some(phrase => proposal.toLowerCase().includes(phrase.toLowerCase()));
    if (!hasBanned) score += 20;
    
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

    try {
      const result = await generateProposal({
        jobTitle: jobTitle.trim() || "Freelance Project",
        jobDescription: jobDescription.trim(),
        clientName: clientName.trim() || undefined,
        platform,
        profession: "Freelancer",
        skills: ["Professional writing", "Client communication", selectedTone],
      });

      setGeneratedProposal(result.proposal);
      setCharacterCount(result.characterCount);
      toast.success("Proposal generated successfully!");
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-emerald-100/30 blur-3xl" />
      </div>

      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/bidly-logo.png"
              alt="Bidly"
              width={320}
              height={96}
              className="h-28 w-auto"
              priority
            />
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Generate Your Proposal
            </h1>
            <p className="text-lg text-slate-600">
              Paste the job details and let AI craft the perfect proposal
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="border-0 bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                    <PenSquare className="h-4 w-4 text-emerald-600" />
                  </div>
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Paste the full job description here... Include requirements, skills needed, and any specific details mentioned by the client."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[180px] resize-none border-slate-200 bg-white/50 transition-colors focus:border-emerald-300 focus:ring-emerald-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Job Title{" "}
                    <span className="text-slate-400">(optional)</span>
                  </label>
                  <Input
                    placeholder="e.g., React Developer, Content Writer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="border-slate-200 bg-white/50 transition-colors focus:border-emerald-300 focus:ring-emerald-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Client Name{" "}
                    <span className="text-slate-400">(optional)</span>
                  </label>
                  <Input
                    placeholder="e.g., John, Sarah, TechCorp"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="border-slate-200 bg-white/50 transition-colors focus:border-emerald-300 focus:ring-emerald-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Platform <span className="text-red-500">*</span>
                  </label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="border-slate-200 bg-white/50 transition-colors focus:border-emerald-300 focus:ring-emerald-200">
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

                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">
                      Proposal Tone <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TONES.map((tone) => {
                        const ToneIcon = tone.icon;
                        return (
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
                              <ToneIcon className="w-5 h-5 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm">{tone.name}</div>
                                <div className="text-xs text-slate-600 mt-0.5">{tone.description}</div>
                              </div>
                            </div>
                            <div className="absolute left-0 right-0 top-full mt-2 hidden group-hover:block z-10">
                              <div className="bg-slate-900 text-white text-xs rounded-lg p-2 shadow-lg">
                                <div className="font-medium mb-1">Best for:</div>
                                <div className="text-slate-300">{tone.bestFor}</div>
                                <div className="mt-2 italic text-slate-400">&ldquo;{tone.example}&rdquo;</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-500 italic flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-slate-400" />
                      Tip: Match tone to client&apos;s posting style for best results
                    </p>
                  </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !jobDescription.trim() || !platform}
                  className="h-12 w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-base font-semibold shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Generate Proposal
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                      <FileText className="h-4 w-4 text-emerald-600" />
                    </div>
                    Your Proposal
                  </CardTitle>
                  {generatedProposal && (
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {characterCount} characters
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="border-slate-200 hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <Copy className="mr-1.5 h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                    {generatedProposal ? (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-purple-50 border border-emerald-200 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <BarChart2 className="w-5 h-5 text-emerald-600" />
                              <span className="font-semibold text-slate-900">Optimization Score</span>
                            </div>
                            <div className="text-2xl font-bold text-emerald-600">
                              {calculateOptimizationScore(generatedProposal)}/100
                            </div>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <Badge variant="secondary" className="bg-white/50">
                              {generatedProposal.split(/\s+/).length} words
                            </Badge>
                            <Badge variant="secondary" className="bg-white/50 flex items-center gap-1">
                              {/\d+%/.test(generatedProposal) ? <><CheckCircle2 className="w-3 h-3" /> Has metrics</> : "Add metrics"}
                            </Badge>
                            <Badge variant="secondary" className="bg-white/50 flex items-center gap-1">
                              {/\?[^?]*$/.test(generatedProposal.trim()) ? <><CheckCircle2 className="w-3 h-3" /> Question CTA</> : "Add question"}
                            </Badge>
                          </div>
                          <button
                            onClick={() => setShowOptimizationTips(!showOptimizationTips)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 mt-2 font-medium flex items-center gap-1"
                          >
                            {showOptimizationTips ? "Hide" : "Show"} optimization tips
                          </button>
                          {showOptimizationTips && (
                            <div className="mt-3 space-y-2 text-xs text-slate-700 bg-white/70 rounded p-2">
                              <div className="flex items-start gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> <span><strong>Optimal length:</strong> 250-400 words (currently {generatedProposal.split(/\s+/).length})</span></div>
                              <div className="flex items-start gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> <span><strong>Add specifics:</strong> Include numbers, percentages, or timeframes</span></div>
                              <div className="flex items-start gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> <span><strong>End with question:</strong> Ask about their timeline, requirements, or preferences</span></div>
                              <div className="flex items-start gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> <span><strong>Personalize:</strong> Reference specific details from their job post</span></div>
                            </div>
                          )}
                        </div>
                        
                        <Textarea
                          value={generatedProposal}
                          onChange={(e) => handleProposalChange(e.target.value)}
                          className="min-h-[400px] resize-none border-slate-200 bg-white/50 text-sm leading-relaxed transition-colors focus:border-emerald-300 focus:ring-emerald-200"
                        />
                      </div>
                    ) : (
                      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                          <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="mb-1 font-medium text-slate-600">
                          Your proposal will appear here
                        </p>
                        <p className="text-sm text-slate-400">
                          Fill in the job details and click Generate
                        </p>
                      </div>
                    )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <h2 className="mb-6 text-center text-xl font-bold text-slate-900">
              Tips for Winning Proposals
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/60 p-5 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <PenSquare className="h-5 w-5 text-amber-600" />
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
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mb-1 font-semibold text-slate-900">Be Quick</h3>
                <p className="text-sm text-slate-600">
                  Apply within the first hour of a job posting for 4x higher
                  chance of being hired.
                </p>
              </div>
              <div className="rounded-xl bg-white/60 p-5 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
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
