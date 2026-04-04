"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTheme, THEMES, type ThemeId } from "@/components/theme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Plus,
  Loader2,
  Check,
} from "lucide-react";

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

const STYLE_OPTIONS = [
  { id: "professional", label: "Professional", description: "Formal and business-like" },
  { id: "friendly", label: "Friendly", description: "Warm and conversational" },
  { id: "confident", label: "Confident", description: "Bold and direct" },
  { id: "creative", label: "Creative", description: "Unique and expressive" },
];

export default function SettingsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const { theme, setTheme } = useTheme();

  const [profession, setProfession] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [style, setStyle] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [pastWorkSummary, setPastWorkSummary] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [primaryPlatforms, setPrimaryPlatforms] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (currentUser && !isLoaded) {
      setProfession(currentUser.profession || "");
      setExperience(currentUser.experience || "");
      setSkills(currentUser.skills || []);
      setStyle(currentUser.style || "");
      setPortfolio(currentUser.portfolio || "");
      setPastWorkSummary(currentUser.pastWorkSummary || "");
      setYearsOfExperience(currentUser.yearsOfExperience || "");
      setPrimaryPlatforms(currentUser.platforms || []);
      setIsLoaded(true);
    }
  }, [currentUser, isLoaded]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const togglePlatform = (id: string) => {
    setPrimaryPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await updateProfile({
        profession: profession || undefined,
        skills: skills.length > 0 ? skills : undefined,
        experience: experience || undefined,
        style: style || undefined,
        portfolio: portfolio || undefined,
        pastWorkSummary: pastWorkSummary || undefined,
        yearsOfExperience: yearsOfExperience || undefined,
        platforms: primaryPlatforms.length > 0 ? primaryPlatforms : undefined,
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (id: ThemeId) => {
    setTheme(id);
    toast.success("Theme updated!");
  };

  if (currentUser === undefined) {
    return (
      <>
        <Header
          title="Settings"
          subtitle="Customize your profile and appearance"
        />
        <main className="px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="Settings"
        subtitle="Customize your profile and appearance"
      />

      <main className="px-4 py-6 md:px-8 md:py-8">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* ══════════════ Appearance ══════════════ */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Appearance</h2>
            <p className="text-sm text-gray-500 mb-6">
              Customize how Bidly looks for you
            </p>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Brand Color
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`relative p-5 rounded-xl border-2 transition-all text-center group ${
                      theme === t.id
                        ? "border-gray-900 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-3 shadow-sm transition-transform group-hover:scale-110"
                      style={{ backgroundColor: t.hex }}
                    />
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    {theme === t.id && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════════ Profile ══════════════ */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Profile</h2>
            <p className="text-sm text-gray-500 mb-6">
              This information will be used to personalize your proposals
            </p>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="profession" className="text-sm font-semibold text-gray-900">Your Profession</Label>
                <Input
                  id="profession"
                  placeholder="e.g., Full-Stack Developer"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="border-gray-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-semibold text-gray-900">About You</Label>
                <Textarea
                  id="experience"
                  placeholder="Tell us about your experience and what makes you unique..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="min-h-[100px] border-gray-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pastWorkSummary" className="text-sm font-semibold text-gray-900">
                  Past work summary
                </Label>
                <p className="text-xs text-gray-500">
                  1–2 standout projects and results (used in proposals)
                </p>
                <Textarea
                  id="pastWorkSummary"
                  placeholder="e.g. Built a SaaS dashboard that cut reporting time by 60%..."
                  value={pastWorkSummary}
                  onChange={(e) => setPastWorkSummary(e.target.value)}
                  className="min-h-[100px] border-gray-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">Years of experience</Label>
                <Select
                  value={yearsOfExperience || undefined}
                  onValueChange={setYearsOfExperience}
                >
                  <SelectTrigger className="border-gray-200 rounded-xl">
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

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">Primary platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map((p) => {
                    const on = primaryPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                          on
                            ? "bg-brand-600 text-white border-brand-600"
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
          </div>

          {/* ══════════════ Skills ══════════════ */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Skills</h2>
            <p className="text-sm text-gray-500 mb-6">
              Add your key skills. These will be highlighted in your proposals.
            </p>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  className="flex-1 border-gray-200 rounded-xl"
                />
                <Button onClick={addSkill} variant="outline" className="border-gray-200 rounded-xl">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add
                </Button>
              </div>

              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm gap-2 bg-brand-50 text-brand-700 border-0"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No skills added yet.
                </p>
              )}
            </div>
          </div>

          {/* ══════════════ Writing Style ══════════════ */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Writing Style</h2>
            <p className="text-sm text-gray-500 mb-6">
              Choose your preferred tone for generated proposals
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {STYLE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setStyle(option.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    style === option.id
                      ? "border-brand-600 bg-brand-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className={`font-medium text-sm ${style === option.id ? "text-brand-700" : "text-gray-900"}`}>
                    {option.label}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ══════════════ Portfolio ══════════════ */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Portfolio</h2>
            <p className="text-sm text-gray-500 mb-6">
              Add a link to your portfolio to reference in proposals
            </p>
            <Input
              type="url"
              placeholder="https://yourportfolio.com"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              className="border-gray-200 rounded-xl"
            />
          </div>

          {/* ══════════════ Save ══════════════ */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-base font-semibold shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </main>
    </>
  );
}
