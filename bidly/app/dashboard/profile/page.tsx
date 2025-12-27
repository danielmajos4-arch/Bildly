"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Loader2,
  User,
  Briefcase,
  Target,
  X,
  Plus,
  Lightbulb,
  TrendingUp,
  AlertCircle
} from "lucide-react";

const PLATFORMS = ["Upwork", "Fiverr", "LinkedIn"] as const;

const SUGGESTED_SKILLS = [
  "React", "Node.js", "TypeScript", "Python", "UI/UX Design",
  "Figma", "SEO", "Content Writing", "WordPress", "Shopify",
  "Data Analysis", "Project Management", "Video Editing", "Social Media"
];

export default function ProfileGeneratorPage() {
  const generateProfile = useAction(api.ai.generateProfile);
  const currentUser = useQuery(api.users.getCurrentUser);
  const usageCheck = useQuery(api.users.canGenerateProfile);
  
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [yearsExperience, setYearsExperience] = useState(3);
  const [targetClients, setTargetClients] = useState("");
  const [platform, setPlatform] = useState<typeof PLATFORMS[number]>("Upwork");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProfile, setGeneratedProfile] = useState<{
    title: string;
    overview: string;
    skillsSection: string;
    optimizationScore: number;
    suggestions: string[];
  } | null>(null);
  
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 15) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const handleGenerate = async () => {
    if (skills.length < 2) {
      toast.error("Please add at least 2 skills");
      return;
    }
    if (!targetClients.trim()) {
      toast.error("Please describe your target clients");
      return;
    }

    setIsGenerating(true);
    setGeneratedProfile(null);

    try {
      const result = await generateProfile({
        skills,
        yearsExperience,
        targetClients,
        platform,
      });
      
      setGeneratedProfile(result);
      toast.success("Profile generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate profile. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Great";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Work";
  };

  return (
    <>
      <Header 
        title="Profile Generator"
        subtitle="Create an optimized profile for any freelance platform"
      />
      
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="w-5 h-5 text-primary" />
                  Profile Details
                </CardTitle>
                <CardDescription>
                  Tell us about your skills and who you want to work with
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Platform Selection */}
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Tabs value={platform} onValueChange={(v) => setPlatform(v as typeof PLATFORMS[number])}>
                    <TabsList className="grid grid-cols-3 w-full">
                      {PLATFORMS.map((p) => (
                        <TabsTrigger key={p} value={p} className="text-sm">
                          {p}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                  <p className="text-xs text-muted-foreground">
                    Each platform has different optimization requirements
                  </p>
                </div>

                {/* Skills Input */}
                <div className="space-y-3">
                  <Label>Skills <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a skill and press Enter"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isGenerating}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => addSkill(skillInput)}
                      disabled={!skillInput.trim() || isGenerating}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Skills Tags */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1 py-1 px-2">
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-destructive transition-colors"
                            disabled={isGenerating}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Suggested Skills */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Quick add:</p>
                    <div className="flex flex-wrap gap-1">
                      {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).slice(0, 8).map((skill) => (
                        <button
                          key={skill}
                          onClick={() => addSkill(skill)}
                          disabled={isGenerating}
                          className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Years of Experience */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Years of Experience</Label>
                    <span className="text-sm font-medium text-primary">{yearsExperience} years</span>
                  </div>
                  <Slider
                    value={[yearsExperience]}
                    onValueChange={([v]) => setYearsExperience(v)}
                    min={0}
                    max={20}
                    step={1}
                    disabled={isGenerating}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Beginner</span>
                    <span>Expert</span>
                  </div>
                </div>

                {/* Target Clients */}
                <div className="space-y-2">
                  <Label>Target Clients <span className="text-destructive">*</span></Label>
                  <Textarea
                    placeholder="e.g., SaaS startups looking to build MVPs, e-commerce businesses needing custom Shopify stores, agencies that need reliable frontend developers..."
                    value={targetClients}
                    onChange={(e) => setTargetClients(e.target.value)}
                    disabled={isGenerating}
                    className="min-h-[100px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific about the types of clients and projects you want to attract
                  </p>
                </div>

                {/* Profile hint */}
                {currentUser?.name && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-primary">Using your profile</p>
                      <p className="text-muted-foreground">
                        Your name ({currentUser.name}) and background will be incorporated into the generated profile.
                      </p>
                    </div>
                  </div>
                )}

                {/* Usage limit warning */}
                {usageCheck && !usageCheck.canGenerate && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
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
                    <span>Profile generations remaining</span>
                    <Badge variant="secondary">{usageCheck.remaining} left</Badge>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || skills.length < 2 || !targetClients.trim() || !usageCheck?.canGenerate}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg gap-2 shadow-lg shadow-primary/25"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Optimizing for {platform}...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate {platform} Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated Profile */}
          <div className="space-y-6">
            {generatedProfile ? (
              <>
                {/* Optimization Score */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Optimization Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(generatedProfile.optimizationScore)}`}>
                            {generatedProfile.optimizationScore}/100
                          </p>
                        </div>
                      </div>
                      <Badge variant={generatedProfile.optimizationScore >= 80 ? "default" : "secondary"}>
                        {getScoreLabel(generatedProfile.optimizationScore)}
                      </Badge>
                    </div>
                    <Progress value={generatedProfile.optimizationScore} className="h-2" />
                  </CardContent>
                </Card>

                {/* Title */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        Professional Title
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(generatedProfile.title, "title")}
                      >
                        {copiedField === "title" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{generatedProfile.title}</p>
                  </CardContent>
                </Card>

                {/* Overview */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Overview / About</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(generatedProfile.overview, "overview")}
                      >
                        {copiedField === "overview" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                      {generatedProfile.overview}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {generatedProfile.overview.length} characters
                    </p>
                  </CardContent>
                </Card>

                {/* Skills Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Skills Highlight
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(generatedProfile.skillsSection, "skills")}
                      >
                        {copiedField === "skills" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm">
                      {generatedProfile.skillsSection}
                    </div>
                  </CardContent>
                </Card>

                {/* Suggestions */}
                <Card className="border-0 shadow-lg border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      Improvement Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {generatedProfile.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary font-medium">{i + 1}.</span>
                          <span className="text-muted-foreground">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-0 shadow-lg h-full min-h-[500px] flex items-center justify-center">
                <CardContent className="text-center px-8">
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Your optimized profile will appear here
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Add your skills, experience, and target clients, then generate a platform-optimized profile
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

