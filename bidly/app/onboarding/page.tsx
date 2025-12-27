"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Plus, 
  Briefcase, 
  Palette, 
  FileText,
  Check,
  Sparkles,
  Loader2
} from "lucide-react";

const SKILL_SUGGESTIONS = [
  "Web Development", "React", "Node.js", "Python", "UI/UX Design",
  "Mobile Development", "WordPress", "Graphic Design", "Copywriting",
  "SEO", "Data Analysis", "Video Editing", "Social Media", "Photography"
];

const STYLE_OPTIONS = [
  { id: "professional", label: "Professional", description: "Formal, polished, and business-like" },
  { id: "friendly", label: "Friendly", description: "Warm, approachable, and conversational" },
  { id: "confident", label: "Confident", description: "Bold, direct, and assertive" },
  { id: "creative", label: "Creative", description: "Unique, imaginative, and expressive" },
];

const PLATFORM_OPTIONS = [
  { id: "upwork", label: "Upwork", icon: "🟢" },
  { id: "fiverr", label: "Fiverr", icon: "🟡" },
  { id: "freelancer", label: "Freelancer.com", icon: "🔵" },
  { id: "toptal", label: "Toptal", icon: "🟣" },
  { id: "other", label: "Other", icon: "⚪" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded: isClerkLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const currentUser = useQuery(api.users.getCurrentUser);
  
  const [step, setStep] = useState(1);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const totalSteps = 4;
  
  // Profile state
  const [profession, setProfession] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [style, setStyle] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState("");

  // Sync user to Convex on mount
  useEffect(() => {
    const syncUserToConvex = async () => {
      if (isClerkLoaded && user) {
        try {
          await syncUser({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            name: user.fullName || user.firstName || undefined,
            imageUrl: user.imageUrl || undefined,
          });
        } catch (error) {
          console.error("Failed to sync user:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    
    syncUserToConvex();
  }, [isClerkLoaded, user, syncUser]);

  // Redirect if already onboarded
  useEffect(() => {
    if (currentUser?.onboardingComplete) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const addSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const togglePlatform = (platformId: string) => {
    if (platforms.includes(platformId)) {
      setPlatforms(platforms.filter((p) => p !== platformId));
    } else {
      setPlatforms([...platforms, platformId]);
    }
  };

  const handleNext = async () => {
    if (step === 1 && !profession) {
      toast.error("Please tell us what you do");
      return;
    }
    if (step === 2 && skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }
    if (step === 3 && !style) {
      toast.error("Please select your preferred style");
      return;
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save profile to Convex
      setIsSaving(true);
      try {
        await updateProfile({
          profession,
          skills,
          experience: experience || undefined,
          style,
          platforms: platforms.length > 0 ? platforms : undefined,
          portfolio: portfolio || undefined,
          onboardingComplete: true,
        });
        toast.success("Profile created! Let's generate your first proposal.");
        router.push("/dashboard");
      } catch (error) {
        console.error("Failed to save profile:", error);
        toast.error("Failed to save profile. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (!isClerkLoaded || isSyncing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
            <span className="text-xs sm:text-sm text-muted-foreground">{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: What do you do? */}
        {step === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center px-4 sm:px-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">What do you do?</CardTitle>
              <CardDescription className="text-sm sm:text-base">Tell us about your profession so we can personalize your proposals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              <div className="space-y-2">
                <Label htmlFor="profession">Your Profession</Label>
                <Input
                  id="profession"
                  placeholder="e.g., Full-Stack Developer, UI/UX Designer"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="h-11 sm:h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Brief Description (optional)</Label>
                <Textarea
                  id="experience"
                  placeholder="Tell us a bit about your experience and what makes you unique..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center px-4 sm:px-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">What are your skills?</CardTitle>
              <CardDescription className="text-sm sm:text-base">Add skills to highlight in your proposals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(newSkill))}
                  className="h-11 sm:h-12 flex-1"
                />
                <Button onClick={() => addSkill(newSkill)} variant="outline" size="icon" className="h-11 w-11 sm:h-12 sm:w-12 shrink-0">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm gap-2">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 6).map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors text-xs sm:text-sm"
                      onClick={() => addSkill(skill)}
                    >
                      + {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Writing Style */}
        {step === 3 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center px-4 sm:px-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Palette className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Pick your writing style</CardTitle>
              <CardDescription className="text-sm sm:text-base">This will influence the tone of your generated proposals</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {STYLE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setStyle(option.id)}
                    className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${
                      style === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span className="font-semibold text-sm sm:text-base">{option.label}</span>
                      {style === option.id && (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{option.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Platforms & Portfolio */}
        {step === 4 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center px-4 sm:px-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Almost there!</CardTitle>
              <CardDescription className="text-sm sm:text-base">Where do you find work and where can clients see your work?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              <div className="space-y-3">
                <Label>Platforms you use (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border-2 transition-all text-sm sm:text-base ${
                        platforms.includes(platform.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span>{platform.icon}</span>
                      <span className="font-medium">{platform.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio Link (optional)</Label>
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  className="h-11 sm:h-12"
                />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll mention this in your proposals when relevant
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 sm:mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isSaving}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <Button 
            onClick={handleNext} 
            className="gap-2 bg-primary hover:bg-primary/90"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {step === totalSteps ? "Complete Setup" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
