"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useTheme } from "next-themes";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  User, 
  Briefcase, 
  Link as LinkIcon, 
  X, 
  Plus, 
  Save, 
  Loader2, 
  Palette,
  Sun,
  Moon,
  Monitor,
  Type,
  Check
} from "lucide-react";

const STYLE_OPTIONS = [
  { id: "professional", label: "Professional", description: "Formal and business-like" },
  { id: "friendly", label: "Friendly", description: "Warm and conversational" },
  { id: "confident", label: "Confident", description: "Bold and direct" },
  { id: "creative", label: "Creative", description: "Unique and expressive" },
];

const COLOR_THEMES = [
  { id: "indigo", label: "Indigo", description: "Professional tech vibe", color: "#6366F1" },
  { id: "emerald", label: "Emerald", description: "Fresh, growth-focused", color: "#10B981" },
  { id: "rose", label: "Rose", description: "Creative, warm", color: "#F43F5E" },
  { id: "amber", label: "Amber", description: "Energetic, bold", color: "#F59E0B" },
  { id: "violet", label: "Violet", description: "Modern, unique", color: "#8B5CF6" },
  { id: "cyan", label: "Cyan", description: "Clean, minimal", color: "#06B6D4" },
];

const TEXT_SIZES = [
  { id: "sm", label: "Small", description: "Compact text" },
  { id: "base", label: "Default", description: "Standard size" },
  { id: "lg", label: "Large", description: "Easier to read" },
  { id: "xl", label: "Extra Large", description: "Maximum readability" },
];

const THEME_MODES = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export default function SettingsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [profession, setProfession] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [style, setStyle] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [colorTheme, setColorTheme] = useState("indigo");
  const [textSize, setTextSize] = useState("base");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load existing profile data from Convex
  useEffect(() => {
    if (currentUser && !isLoaded) {
      setProfession(currentUser.profession || "");
      setExperience(currentUser.experience || "");
      setSkills(currentUser.skills || []);
      setStyle(currentUser.style || "");
      setPortfolio(currentUser.portfolio || "");
      setColorTheme(currentUser.colorTheme || "indigo");
      setTextSize(currentUser.textSize || "base");
      setIsLoaded(true);
    }
  }, [currentUser, isLoaded]);

  // Apply color theme class to body
  useEffect(() => {
    if (!mounted) return;
    
    // Remove all theme classes
    document.body.classList.remove(
      "theme-emerald", "theme-rose", "theme-amber", "theme-violet", "theme-cyan"
    );
    
    // Add new theme class if not indigo (indigo is default)
    if (colorTheme && colorTheme !== "indigo") {
      document.body.classList.add(`theme-${colorTheme}`);
    }
  }, [colorTheme, mounted]);

  // Apply text size class to body
  useEffect(() => {
    if (!mounted) return;
    
    // Remove all text size classes
    document.body.classList.remove("text-size-sm", "text-size-base", "text-size-lg", "text-size-xl");
    
    // Add new text size class
    if (textSize) {
      document.body.classList.add(`text-size-${textSize}`);
    }
  }, [textSize, mounted]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
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
        colorTheme: colorTheme || undefined,
        textSize: textSize || undefined,
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while fetching user data
  if (currentUser === undefined) {
    return (
      <>
        <Header 
          title="Settings"
          subtitle="Customize your profile and appearance"
        />
        <main className="p-4 sm:p-6 lg:p-8 max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
      
      <main className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        <div className="space-y-6 sm:space-y-8">
          {/* Appearance Section */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Palette className="w-5 h-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how Bidly looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Color Theme */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Color Theme</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setColorTheme(theme.id)}
                      className={`relative p-3 sm:p-4 rounded-xl border-2 text-left transition-all group ${
                        colorTheme === theme.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className={`w-6 h-6 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all ${colorTheme === theme.id ? 'ring-primary' : 'ring-transparent'}`}
                          style={{ 
                            backgroundColor: theme.color
                          }}
                        />
                        <span className="font-medium text-sm">{theme.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{theme.description}</p>
                      {colorTheme === theme.id && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Mode (Light/Dark/System) */}
              {mounted && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Theme Mode</Label>
                  <div className="flex gap-2">
                    {THEME_MODES.map((mode) => {
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setTheme(mode.id)}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            theme === mode.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${theme === mode.id ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-sm font-medium ${theme === mode.id ? "" : "text-muted-foreground"}`}>
                            {mode.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Text Size */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Type className="w-4 h-4" />
                  Text Size
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TEXT_SIZES.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setTextSize(size.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        textSize === size.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <span 
                        className={`font-medium block ${
                          size.id === "sm" ? "text-sm" : 
                          size.id === "base" ? "text-base" : 
                          size.id === "lg" ? "text-lg" : "text-xl"
                        }`}
                      >
                        Aa
                      </span>
                      <span className="text-xs text-muted-foreground mt-1 block">{size.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Info */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="w-5 h-5 text-primary" />
                Profile
              </CardTitle>
              <CardDescription>
                This information will be used to personalize your proposals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profession">Your Profession</Label>
                <Input
                  id="profession"
                  placeholder="e.g., Full-Stack Developer"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">About You</Label>
                <Textarea
                  id="experience"
                  placeholder="Tell us about your experience and what makes you unique..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Briefcase className="w-5 h-5 text-primary" />
                Skills
              </CardTitle>
              <CardDescription>
                Add your key skills. These will be highlighted in your proposals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    className="flex-1"
                  />
                  <Button onClick={addSkill} variant="outline" className="gap-2 shrink-0">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                  </Button>
                </div>
                
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No skills added yet. Add your skills to personalize your proposals.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Writing Style */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Palette className="w-5 h-5 text-primary" />
                Writing Style
              </CardTitle>
              <CardDescription>
                Choose your preferred tone for generated proposals
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    <span className="font-semibold text-sm sm:text-base">{option.label}</span>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{option.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <LinkIcon className="w-5 h-5 text-primary" />
                Portfolio
              </CardTitle>
              <CardDescription>
                Add a link to your portfolio to reference in proposals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-11 sm:h-12 gap-2 shadow-lg shadow-primary/25"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </main>
    </>
  );
}
