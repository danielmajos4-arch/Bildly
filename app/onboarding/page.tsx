"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  ArrowRight,
  ArrowLeft,
  Loader2,
  X,
} from "lucide-react";

const TOTAL_STEPS = 3;

const YEARS_OPTIONS = [
  { value: "0-1", label: "0–1 years" },
  { value: "1-3", label: "1–3 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5-10", label: "5–10 years" },
  { value: "10+", label: "10+ years" },
];

const PLATFORM_OPTIONS = [
  { id: "Upwork", label: "Upwork" },
  { id: "Fiverr", label: "Fiverr" },
  { id: "Freelancer", label: "Freelancer" },
  { id: "Direct", label: "Direct outreach" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded: isClerkLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const currentUser = useQuery(api.users.getCurrentUser);

  const [isSyncing, setIsSyncing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1);

  const [profession, setProfession] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [pastWorkSummary, setPastWorkSummary] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

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

  useEffect(() => {
    if (currentUser?.onboardingComplete) {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (!isClerkLoaded || user) return;
    router.replace("/sign-in");
  }, [isClerkLoaded, user, router]);

  const addSkill = () => {
    const t = skillInput.trim();
    if (t && !skills.includes(t)) {
      setSkills([...skills, t]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const submitOnboarding = async (skipOptional: boolean) => {
    setIsSaving(true);
    try {
      await completeOnboarding({
        profession: profession.trim(),
        skills,
        pastWorkSummary: pastWorkSummary.trim(),
        portfolioLink:
          skipOptional || !portfolioLink.trim()
            ? undefined
            : portfolioLink.trim(),
        yearsExperience:
          skipOptional || !yearsExperience ? undefined : yearsExperience,
        primaryPlatforms:
          skipOptional || selectedPlatforms.length === 0
            ? undefined
            : selectedPlatforms,
      });
      toast.success("You're all set.");
      router.replace("/dashboard");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    if (step === 1) {
      if (!profession.trim()) {
        toast.error("Please enter your profession");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (skills.length < 3) {
        toast.error("Add at least 3 skills");
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!pastWorkSummary.trim()) {
        toast.error("Please describe your past work");
        return;
      }
      void submitOnboarding(false);
    }
  };

  const handleSkipOptional = () => {
    if (!pastWorkSummary.trim()) {
      toast.error("Please describe your past work first");
      return;
    }
    void submitOnboarding(true);
  };

  if (!isClerkLoaded || isSyncing) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-sm text-[#6B7280]">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/20 to-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm mb-4 overflow-hidden">
            <Image
              src="/bidly-logo.png"
              alt="Bidly"
              width={48}
              height={48}
              className="w-10 h-10 object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Let&apos;s set up your profile
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            This helps Bidly generate better proposals for you
          </p>
        </div>

        <p className="text-center text-sm font-medium text-emerald-700 mb-6">
          Step {step} of {TOTAL_STEPS}
        </p>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="profession" className="text-sm font-semibold text-gray-900">
                  Your profession <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">
                  e.g. Full-Stack Developer, UI/UX Designer, Content Writer
                </p>
                <Input
                  id="profession"
                  placeholder="Full-Stack Developer"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="h-11 border-gray-200"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-900">
                  Your skills <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">
                  Add at least 3 skills — one at a time
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className="flex-1 border-gray-200"
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((s) => (
                      <Badge
                        key={s}
                        className="bg-emerald-50 text-emerald-800 border-emerald-200 pl-2 pr-1 py-1 gap-1"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSkill(s)}
                          className="rounded p-0.5 hover:bg-emerald-200/80"
                          aria-label={`Remove ${s}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">No skills yet.</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {skills.length}/3 minimum skills
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="pastWork" className="text-sm font-semibold text-gray-900">
                  Past work summary <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">
                  Briefly describe 1–2 relevant projects and results
                </p>
                <Textarea
                  id="pastWork"
                  placeholder='e.g. "Built an e-commerce site that increased conversions by 40%"'
                  value={pastWorkSummary}
                  onChange={(e) => setPastWorkSummary(e.target.value)}
                  className="min-h-[120px] border-gray-200 resize-none"
                />
              </div>

              <div className="border-t border-gray-100 pt-6">
                <p className="text-sm font-medium text-gray-900 mb-1">Optional</p>
                <p className="text-xs text-gray-500 mb-4">
                  You can skip these and add them later in Settings
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="portfolio" className="text-sm text-gray-700">
                      Portfolio link
                    </Label>
                    <Input
                      id="portfolio"
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={portfolioLink}
                      onChange={(e) => setPortfolioLink(e.target.value)}
                      className="mt-1 border-gray-200"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-700">Years of experience</Label>
                    <Select
                      value={yearsExperience || undefined}
                      onValueChange={setYearsExperience}
                    >
                      <SelectTrigger className="mt-1 border-gray-200">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-700">Primary platforms</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {PLATFORM_OPTIONS.map((p) => {
                        const on = selectedPlatforms.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePlatform(p.id)}
                            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                              on
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSkipOptional}
                  disabled={isSaving}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-4 underline-offset-4 hover:underline"
                >
                  Skip optional details
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1 || isSaving}
            className="text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                {step === TOTAL_STEPS ? "Save & finish" : "Save & continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
