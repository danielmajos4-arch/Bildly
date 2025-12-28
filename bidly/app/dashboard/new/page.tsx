"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Loader2,
  RotateCcw,
  FileText,
  Lightbulb,
  Layers,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Heart,
  Zap,
  Link,
  MessageSquare,
  Plus,
  X,
  User,
  SlidersHorizontal
} from "lucide-react";

const PLATFORMS = [
  { value: "Upwork", label: "Upwork" },
  { value: "Fiverr", label: "Fiverr" },
  { value: "Freelancer", label: "Freelancer.com" },
  { value: "Toptal", label: "Toptal" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Other", label: "Other" },
];

const LOADING_TIPS = [
  "Crafting your personalized intro...",
  "Highlighting your relevant skills...",
  "Adding a compelling hook...",
  "Fine-tuning the tone...",
  "Making it sound human...",
  "Adding your unique touch...",
  "Polishing the call-to-action...",
];

const TONE_OPTIONS = [
  { 
    value: "professional", 
    label: "Professional", 
    description: "Formal, polished, business-focused",
    bestFor: "Email marketing, consulting, enterprise clients",
    icon: Briefcase,
    color: "border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10",
    selectedColor: "border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/20",
  },
  { 
    value: "friendly", 
    label: "Friendly", 
    description: "Warm, conversational, approachable",
    bestFor: "Developers, creative work, startups",
    icon: Heart,
    color: "border-green-500/50 bg-green-500/5 hover:bg-green-500/10",
    selectedColor: "border-green-500 bg-green-500/15 ring-2 ring-green-500/20",
  },
  { 
    value: "bold", 
    label: "Bold", 
    description: "Confident, direct, results-focused",
    bestFor: "Competitive bids, sales-oriented niches",
    icon: Zap,
    color: "border-orange-500/50 bg-orange-500/5 hover:bg-orange-500/10",
    selectedColor: "border-orange-500 bg-orange-500/15 ring-2 ring-orange-500/20",
  },
];

const VARIANT_ICONS = {
  professional: Briefcase,
  friendly: Heart,
  bold: Zap,
};

const VARIANT_COLORS = {
  professional: "border-blue-500/50 bg-blue-500/5",
  friendly: "border-green-500/50 bg-green-500/5",
  bold: "border-orange-500/50 bg-orange-500/5",
};

interface ProposalVariants {
  professional: { content: string; bestFor: string };
  friendly: { content: string; bestFor: string };
  bold: { content: string; bestFor: string };
}

interface OptimizationAnalysis {
  scores: {
    hookQuality: number;
    keywordAlignment: number;
    lengthOptimization: number;
    ctaPresence: number;
    personalization: number;
  };
  overallScore: number;
  strengths: string[];
  improvements: { area: string; suggestion: string }[];
  rewrittenOpening: string;
}

function NewProposalContent() {
  const searchParams = useSearchParams();
  const generateProposal = useAction(api.ai.generateProposal);
  const generateVariants = useAction(api.ai.generateProposalVariants);
  const analyzeProposal = useAction(api.ai.analyzeProposal);
  const currentUser = useQuery(api.users.getCurrentUser);
  const usageCheck = useQuery(api.users.canGenerateProposal);
  
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [platform, setPlatform] = useState("Upwork");
  const [generatedProposal, setGeneratedProposal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingTip, setLoadingTip] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  
  // Tone selection state
  const [selectedTone, setSelectedTone] = useState<"professional" | "friendly" | "bold">("friendly");
  
  // Character limit state (volume control) - default 1500 characters
  const [characterLimit, setCharacterLimit] = useState(1500);
  
  // Custom context state
  const [showCustomContext, setShowCustomContext] = useState(false);
  const [portfolioLink, setPortfolioLink] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [newKeyPoint, setNewKeyPoint] = useState("");
  
  // Variants state
  const [variants, setVariants] = useState<ProposalVariants | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<keyof ProposalVariants | null>(null);
  
  // Analysis state
  const [analysis, setAnalysis] = useState<OptimizationAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Handle template from URL
  useEffect(() => {
    const template = searchParams.get("template");
    const tone = searchParams.get("tone");
    if (template) {
      toast.info(`Using "${template}" template style`, { duration: 3000 });
    }
  }, [searchParams]);

  // Rotate loading tips while generating
  useEffect(() => {
    if (isGenerating || isGeneratingVariants) {
      setLoadingTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
      const interval = setInterval(() => {
        setLoadingTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isGenerating, isGeneratingVariants]);

  const handleGenerate = async () => {
    if (!jobTitle.trim()) {
      toast.error("Please enter a job title");
      return;
    }
    if (jobDescription.length < 50) {
      toast.error("Please provide more details about the job (at least 50 characters)");
      return;
    }

    setIsGenerating(true);
    setGeneratedProposal("");
    setVariants(null);
    setSelectedVariant(null);
    setAnalysis(null);

    try {
      // Build custom context object with tone preference and character limit
      const customContext = {
        portfolioLink: portfolioLink || undefined,
        customInstructions: customInstructions || undefined,
        keyPoints: keyPoints.length > 0 ? keyPoints : undefined,
        tonePreference: selectedTone,
        characterLimit: characterLimit,
      };

      const result = await generateProposal({
        jobTitle,
        jobDescription,
        clientName: clientName || undefined,
        platform,
        customContext,
      });
      
      setGeneratedProposal(result.proposal);
      toast.success("Proposal generated successfully!");
      
      // Auto-analyze after generation
      handleAnalyze(result.proposal);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate proposal. Please check your API key configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVariants = async () => {
    if (!jobTitle.trim()) {
      toast.error("Please enter a job title");
      return;
    }
    if (jobDescription.length < 50) {
      toast.error("Please provide more details about the job (at least 50 characters)");
      return;
    }

    setIsGeneratingVariants(true);
    setGeneratedProposal("");
    setVariants(null);
    setSelectedVariant(null);
    setAnalysis(null);

    try {
      // Build custom context object with tone preference and character limit
      const customContext = {
        portfolioLink: portfolioLink || undefined,
        customInstructions: customInstructions || undefined,
        keyPoints: keyPoints.length > 0 ? keyPoints : undefined,
        tonePreference: selectedTone,
        characterLimit: characterLimit,
      };

      const result = await generateVariants({
        jobTitle,
        jobDescription,
        clientName: clientName || undefined,
        platform,
        customContext,
      });
      
      setVariants(result);
      toast.success("3 variants generated! Pick your favorite.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate variants. Please try again.");
    } finally {
      setIsGeneratingVariants(false);
    }
  };

  const handleSelectVariant = (variant: keyof ProposalVariants) => {
    if (variants) {
      setSelectedVariant(variant);
      setGeneratedProposal(variants[variant].content);
      handleAnalyze(variants[variant].content);
      toast.success(`${variant.charAt(0).toUpperCase() + variant.slice(1)} variant selected`);
    }
  };

  const handleAnalyze = async (proposalText: string) => {
    if (!proposalText || !jobDescription) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeProposal({
        proposal: proposalText,
        jobDescription,
      });
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedProposal);
    setIsCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setJobDescription("");
    setJobTitle("");
    setClientName("");
    setPlatform("Upwork");
    setGeneratedProposal("");
    setVariants(null);
    setSelectedVariant(null);
    setAnalysis(null);
    // Reset custom context
    setPortfolioLink("");
    setCustomInstructions("");
    setKeyPoints([]);
    setNewKeyPoint("");
    setShowCustomContext(false);
    // Reset tone and character limit to default
    setSelectedTone("friendly");
    setCharacterLimit(1500);
  };

  const handleAddKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setKeyPoints([...keyPoints, newKeyPoint.trim()]);
      setNewKeyPoint("");
    }
  };

  const handleRemoveKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  const characterCount = generatedProposal.length;
  const wordCount = generatedProposal.split(/\s+/).filter(Boolean).length;

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-red-500";
  };

  const isInputValid = jobTitle.trim() && jobDescription.length >= 50;

  return (
    <>
      <Header 
        title="New Proposal"
        subtitle="Generate a winning proposal in seconds"
      />
      
      <main className="p-3 sm:p-4 md:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 min-w-0">
          {/* Input Form */}
          <Card className="border-0 shadow-lg min-w-0 max-w-full">
            <CardHeader className="min-w-0">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg min-w-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span className="truncate">Job Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5 md:space-y-6 min-w-0 max-w-full">
              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="jobTitle">
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior React Developer Needed"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  disabled={isGenerating || isGeneratingVariants}
                  className="h-11 sm:h-12"
                />
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="jobDescription">
                  Job Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the full job description here... The more detail you provide, the better your proposal will be."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[140px] sm:min-h-[180px] resize-none"
                  disabled={isGenerating || isGeneratingVariants}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {jobDescription.length} characters (min: 50)
                </p>
              </div>

              {/* Client Name */}
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name (Optional)</Label>
                <Input
                  id="clientName"
                  placeholder="e.g., John, TechStartup Inc."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  disabled={isGenerating || isGeneratingVariants}
                />
                <p className="text-xs text-muted-foreground">
                  Adding the client&apos;s name makes your proposal more personal
                </p>
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={platform} onValueChange={setPlatform} disabled={isGenerating || isGeneratingVariants}>
                  <SelectTrigger className="h-11 sm:h-12">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Your Context - Collapsible Section */}
              <div className="border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowCustomContext(!showCustomContext)}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                  disabled={isGenerating || isGeneratingVariants}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Your Context</p>
                      <p className="text-xs text-muted-foreground">
                        Add portfolio, custom instructions & key points
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(portfolioLink || customInstructions || keyPoints.length > 0) && (
                      <Badge variant="secondary" className="text-xs">
                        {[
                          portfolioLink && "Portfolio",
                          customInstructions && "Instructions",
                          keyPoints.length > 0 && `${keyPoints.length} points`
                        ].filter(Boolean).join(" • ")}
                      </Badge>
                    )}
                    {showCustomContext ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {showCustomContext && (
                  <div className="p-4 space-y-4 border-t bg-background">
                    {/* Portfolio Link */}
                    <div className="space-y-2">
                      <Label htmlFor="portfolioLink" className="flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        Portfolio / Website Link
                      </Label>
                      <Input
                        id="portfolioLink"
                        placeholder="https://yourportfolio.com or drive.google.com/..."
                        value={portfolioLink}
                        onChange={(e) => setPortfolioLink(e.target.value)}
                        disabled={isGenerating || isGeneratingVariants}
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">
                        This will be naturally included in your proposal
                      </p>
                    </div>

                    {/* Custom Instructions */}
                    <div className="space-y-2">
                      <Label htmlFor="customInstructions" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Custom Instructions
                      </Label>
                      <Textarea
                        id="customInstructions"
                        placeholder="Tell the AI how you want your proposal to sound...&#10;&#10;Examples:&#10;• Start by mentioning my 5 years in e-commerce&#10;• Emphasize my experience with React and TypeScript&#10;• Keep it short and punchy, under 200 words&#10;• Mention that I can start immediately"
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        className="min-h-[100px] resize-none text-sm"
                        disabled={isGenerating || isGeneratingVariants}
                      />
                    </div>

                    {/* Key Points to Include */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Key Points to Include
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., I built a similar app last month"
                          value={newKeyPoint}
                          onChange={(e) => setNewKeyPoint(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddKeyPoint();
                            }
                          }}
                          disabled={isGenerating || isGeneratingVariants}
                          className="h-10 flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleAddKeyPoint}
                          disabled={!newKeyPoint.trim() || isGenerating || isGeneratingVariants}
                          className="h-10 w-10"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {keyPoints.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {keyPoints.map((point, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="py-1.5 px-3 text-sm flex items-center gap-2"
                            >
                              <span className="max-w-[200px] truncate">{point}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveKeyPoint(index)}
                                className="hover:text-destructive transition-colors"
                                disabled={isGenerating || isGeneratingVariants}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Press Enter or click + to add each point
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile hint */}
              {currentUser?.profession && (
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary">Using your profile</p>
                    <p className="text-muted-foreground">
                      Your {currentUser.style || "professional"} writing style and {currentUser.skills?.length || 0} skills will be incorporated into your proposal.
                    </p>
                  </div>
                </div>
              )}

              {/* Usage limit warning */}
              {usageCheck && !usageCheck.canGenerate && (
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive">Usage Limit Reached</p>
                    <p className="text-muted-foreground">
                      {usageCheck.reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Remaining usage info */}
              {usageCheck?.canGenerate && usageCheck.remaining !== undefined && (
                <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
                  <span>Proposals remaining this month</span>
                  <Badge variant="secondary">{usageCheck.remaining} left</Badge>
                </div>
              )}

              {/* Tone Selector */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Select Proposal Tone
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {TONE_OPTIONS.map((tone) => {
                    const Icon = tone.icon;
                    const isSelected = selectedTone === tone.value;
                    return (
                      <button
                        key={tone.value}
                        type="button"
                        onClick={() => setSelectedTone(tone.value as "professional" | "friendly" | "bold")}
                        disabled={isGenerating || isGeneratingVariants}
                        className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected ? tone.selectedColor : tone.color
                        } ${isGenerating || isGeneratingVariants ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected 
                              ? tone.value === "professional" 
                                ? "bg-blue-500 text-white" 
                                : tone.value === "friendly" 
                                  ? "bg-green-500 text-white" 
                                  : "bg-orange-500 text-white"
                              : "bg-muted"
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-sm">{tone.label}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-primary" />
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">
                          {tone.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedTone === "professional" && "Best for: Email marketing, consulting, enterprise clients"}
                  {selectedTone === "friendly" && "Best for: Developers, creative work, startups"}
                  {selectedTone === "bold" && "Best for: Competitive bids, sales-oriented niches"}
                </p>
              </div>

              {/* Character Limit Slider (Volume Control) */}
              <div className="space-y-3 p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    Proposal Length
                  </Label>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {characterLimit} chars
                  </Badge>
                </div>
                <Slider
                  value={[characterLimit]}
                  onValueChange={(value) => setCharacterLimit(value[0])}
                  min={500}
                  max={3000}
                  step={100}
                  disabled={isGenerating || isGeneratingVariants}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                  <span>Short (500)</span>
                  <span className="text-primary font-medium">
                    {characterLimit <= 800 ? "Punchy & Direct" : 
                     characterLimit <= 1200 ? "Concise" : 
                     characterLimit <= 1800 ? "Balanced" : 
                     characterLimit <= 2400 ? "Detailed" : "Comprehensive"}
                  </span>
                  <span>Long (3000)</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Upwork allows up to 5,000 characters. Keep it concise for better engagement.
                </p>
              </div>

              {/* Generate Buttons */}
              <div className="space-y-2 sm:space-y-3 min-w-0 max-w-full">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || isGeneratingVariants || !isInputValid || !usageCheck?.canGenerate}
                  className="w-full h-11 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg gap-1.5 sm:gap-2 shadow-lg shadow-primary/25 min-w-0 max-w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" />
                      <span className="truncate">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      <span className="truncate">Generate Proposal</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleGenerateVariants}
                  disabled={isGenerating || isGeneratingVariants || !isInputValid || !usageCheck?.canGenerate}
                  variant="outline"
                  className="w-full h-10 sm:h-11 md:h-12 gap-1.5 sm:gap-2 text-sm sm:text-base min-w-0 max-w-full"
                >
                  {isGeneratingVariants ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" />
                      <span className="truncate">Creating 3 Variants...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      <span className="truncate">Generate 3 Variants</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Loading tip */}
              {(isGenerating || isGeneratingVariants) && (
                <p className="text-center text-sm text-muted-foreground animate-pulse">
                  {loadingTip}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Results Column */}
          <div className="space-y-6">
            {/* Variants Selection */}
            {variants && (
              <Card className="border-0 shadow-lg min-w-0 max-w-full">
                <CardHeader className="pb-2 sm:pb-3 min-w-0">
                  <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg min-w-0">
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    <span className="truncate">Choose Your Variant</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm break-words overflow-wrap-anywhere">
                    Each variant has a different tone - pick the one that fits best
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-w-0 max-w-full">
                  <div className="grid gap-3">
                    {(Object.keys(variants) as Array<keyof ProposalVariants>).map((variant) => {
                      const Icon = VARIANT_ICONS[variant];
                      const isSelected = selectedVariant === variant;
                      return (
                        <button
                          key={variant}
                          onClick={() => handleSelectVariant(variant)}
                          className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all min-w-0 max-w-full ${
                            isSelected 
                              ? `${VARIANT_COLORS[variant]} border-primary` 
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}>
                              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="flex-1 min-w-0 max-w-full">
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap min-w-0">
                                <p className="font-medium capitalize text-xs sm:text-sm truncate">{variant}</p>
                                {isSelected && (
                                  <Badge variant="default" className="text-[10px] sm:text-xs shrink-0">Selected</Badge>
                                )}
                              </div>
                              <p className="text-[10px] sm:text-xs text-muted-foreground break-words overflow-wrap-anywhere">
                                {variants[variant].bestFor}
                              </p>
                              <p className="text-xs sm:text-sm mt-1 sm:mt-2 line-clamp-2 text-muted-foreground break-words overflow-wrap-anywhere">
                                {variants[variant].content.slice(0, 100)}...
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated Proposal */}
            <Card className="border-0 shadow-lg min-w-0 max-w-full">
              <CardHeader className="min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 min-w-0">
                  <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg min-w-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    <span className="truncate">{variants ? "Selected Proposal" : "Generated Proposal"}</span>
                  </CardTitle>
                  {generatedProposal && (
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 max-w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="gap-1.5 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm min-w-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        <span className="truncate">Reset</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="gap-1.5 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm min-w-0"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                            <span className="truncate">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            <span className="truncate">Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="min-w-0 max-w-full">
                {generatedProposal ? (
                  <>
                    <Textarea
                      value={generatedProposal}
                      onChange={(e) => setGeneratedProposal(e.target.value)}
                      className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px] resize-none text-xs sm:text-sm md:text-base leading-relaxed min-w-0 max-w-full break-words overflow-wrap-anywhere"
                      placeholder="Your generated proposal will appear here..."
                    />
                    <div className="flex items-center justify-between mt-2 sm:mt-3 md:mt-4 text-[10px] sm:text-xs md:text-sm text-muted-foreground min-w-0">
                      <span className="truncate">{wordCount} words</span>
                      <span className="truncate ml-2">{characterCount} characters</span>
                    </div>
                  </>
                ) : (
                  <div className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px] flex items-center justify-center text-center px-3 sm:px-4 min-w-0">
                    <div className="min-w-0 max-w-full">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-sm sm:text-base md:text-lg font-medium mb-1 sm:mb-2 break-words overflow-wrap-anywhere px-2">
                        Your proposal will appear here
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto break-words overflow-wrap-anywhere px-2">
                        Fill in the job details and click &quot;Generate Proposal&quot; or &quot;Generate 3 Variants&quot;
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Optimization Score */}
            {(analysis || isAnalyzing) && generatedProposal && (
              <Card className="border-0 shadow-lg min-w-0 max-w-full">
                <CardHeader className="pb-2 sm:pb-3 min-w-0">
                  <button
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className="w-full flex items-center justify-between gap-2 min-w-0"
                  >
                    <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg min-w-0 flex-1">
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                      <span className="truncate">Optimization Score</span>
                      {analysis && (
                        <Badge 
                          variant={analysis.overallScore >= 7 ? "default" : "secondary"}
                          className="ml-1 sm:ml-2 shrink-0 text-[10px] sm:text-xs"
                        >
                          {analysis.overallScore.toFixed(1)}/10
                        </Badge>
                      )}
                    </CardTitle>
                    {showAnalysis ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                    )}
                  </button>
                </CardHeader>
                {showAnalysis && (
                  <CardContent className="min-w-0 max-w-full">
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center py-6 sm:py-8 min-w-0">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary mr-1.5 sm:mr-2 shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">Analyzing proposal...</span>
                      </div>
                    ) : analysis ? (
                      <div className="space-y-4 sm:space-y-5 md:space-y-6 min-w-0">
                        {/* Score Breakdown */}
                        <div className="space-y-2 sm:space-y-3 min-w-0">
                          {[
                            { key: "hookQuality", label: "Hook Quality", desc: "First impression" },
                            { key: "keywordAlignment", label: "Keyword Alignment", desc: "Job relevance" },
                            { key: "lengthOptimization", label: "Length", desc: "250-400 words ideal" },
                            { key: "ctaPresence", label: "Call-to-Action", desc: "Next steps" },
                            { key: "personalization", label: "Personalization", desc: "Specific to job" },
                          ].map(({ key, label, desc }) => {
                            const score = analysis.scores[key as keyof typeof analysis.scores];
                            return (
                              <div key={key} className="space-y-1 min-w-0">
                                <div className="flex items-center justify-between text-xs sm:text-sm min-w-0 gap-2">
                                  <span className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                                    <span className="truncate">{label}</span>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">({desc})</span>
                                  </span>
                                  <span className={`font-medium ${getScoreColor(score)} shrink-0 ml-2`}>
                                    {score}/10
                                  </span>
                                </div>
                                <Progress value={score * 10} className="h-1.5 sm:h-2" />
                              </div>
                            );
                          })}
                        </div>

                        {/* Strengths */}
                        {analysis.strengths.length > 0 && (
                          <div className="space-y-1.5 sm:space-y-2 min-w-0">
                            <p className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 min-w-0">
                              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                              <span className="truncate">Strengths</span>
                            </p>
                            <ul className="space-y-1 min-w-0">
                              {analysis.strengths.map((strength, i) => (
                                <li key={i} className="text-xs sm:text-sm text-muted-foreground pl-4 sm:pl-6 break-words overflow-wrap-anywhere">
                                  • {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Improvements */}
                        {analysis.improvements.length > 0 && (
                          <div className="space-y-1.5 sm:space-y-2 min-w-0">
                            <p className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 min-w-0">
                              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 shrink-0" />
                              <span className="truncate">Suggested Improvements</span>
                            </p>
                            <ul className="space-y-1.5 sm:space-y-2 min-w-0">
                              {analysis.improvements.map((imp, i) => (
                                <li key={i} className="text-xs sm:text-sm pl-4 sm:pl-6 break-words overflow-wrap-anywhere">
                                  <span className="font-medium text-foreground">{imp.area}:</span>{" "}
                                  <span className="text-muted-foreground">{imp.suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Rewritten Opening */}
                        {analysis.rewrittenOpening && (
                          <div className="p-2.5 sm:p-3 rounded-lg bg-primary/5 border border-primary/10 min-w-0 max-w-full">
                            <p className="text-xs sm:text-sm font-medium text-primary mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2 min-w-0">
                              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                              <span className="truncate">Suggested Opening</span>
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground italic break-words overflow-wrap-anywhere">
                              &quot;{analysis.rewrittenOpening}&quot;
                            </p>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <NewProposalContent />
    </Suspense>
  );
}
