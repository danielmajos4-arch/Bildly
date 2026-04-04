"use client";
export const dynamic = "force-dynamic";

import { useState, Suspense, type ReactNode } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface OptimizationResult {
  optimizedTitle: string;
  optimizedOverview: string;
  originalTitle: string;
  originalOverview: string;
}

/** Upwork profile overview field limit */
const UPWORK_OVERVIEW_CHAR_LIMIT = 5000;

/** Bold numbers, metrics, and ranges in optimized copy (proof stands out vs. before). */
const PROOF_METRIC_REGEX =
  /(\$?\d[\d,]*(?:\.\d+)?(?:\+|%)?|\d+\s*-\s*\d+)/g;

function highlightProofMetrics(text: string): ReactNode {
  if (!text) return text;
  const parts = text.split(PROOF_METRIC_REGEX);
  return parts.map((part, i) => {
    if (!part) return null;
    if (
      /^\$?\d[\d,]*(?:\.\d+)?(?:\+|%)?$/.test(part) ||
      /^\d+\s*-\s*\d+$/.test(part.trim())
    ) {
      return (
        <strong key={i} className="font-semibold text-[#111827]">
          {part}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function formatCharChangeSummary(before: number, after: number): string {
  if (before === after) {
    return `Same length — ${before.toLocaleString()} characters`;
  }
  if (before > after) {
    const fewer = before - after;
    return `Reduced from ${before.toLocaleString()} to ${after.toLocaleString()} characters (${fewer.toLocaleString()} fewer)`;
  }
  const more = after - before;
  return `Increased from ${before.toLocaleString()} to ${after.toLocaleString()} characters (${more.toLocaleString()} more)`;
}

function ProfileOptimizerContent() {
  const optimizeProfile = useAction(api.ai.generateProfileOptimization);

  const [currentTitle, setCurrentTitle] = useState("");
  const [primaryService, setPrimaryService] = useState("");
  const [currentOverview, setCurrentOverview] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isFormValid =
    currentTitle.trim().length > 0 &&
    primaryService.trim().length >= 2 &&
    currentOverview.trim().length >= 50;

  const runOptimization = async (options?: { isRegenerate?: boolean }) => {
    const isRegenerate = options?.isRegenerate ?? false;
    if (!isFormValid) {
      if (!currentTitle.trim()) {
        toast.error("Please enter your professional title");
      } else if (primaryService.trim().length < 2) {
        toast.error("Enter your primary service (1–2 keywords)");
      } else if (currentOverview.trim().length < 50) {
        toast.error("Profile overview must be at least 50 characters");
      }
      return;
    }

    if (!isRegenerate) {
      setResult(null);
    }
    setIsOptimizing(true);

    try {
      const res = await optimizeProfile({
        currentTitle: currentTitle.trim(),
        currentOverview: currentOverview.trim(),
        primaryService: primaryService.trim(),
      });
      setResult(res);
      toast.success(
        isRegenerate ? "New optimized version ready!" : "Profile optimized!",
      );
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Generation failed, please try again";
      toast.error(msg);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleOptimize = () => runOptimization();
  const handleRegenerate = () => runOptimization({ isRegenerate: true });

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = async () => {
    if (!result) return;
    const fullText = `Title:\n${result.optimizedTitle}\n\nOverview:\n${result.optimizedOverview}`;
    await navigator.clipboard.writeText(fullText);
    setCopiedField("all");
    toast.success("Copied title & overview!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <>
      <Header
        title="Optimize Your Upwork Profile"
        subtitle="We infer your niche from your overview, lead with it when clear, and pair it with keywords and 2–3 specific numbers—no keyword stuffing."
      />

      <main className="px-4 py-6 md:px-8 md:py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Input Form */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="currentTitle"
                  className="text-sm font-medium text-gray-700"
                >
                  Your Professional Title{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="currentTitle"
                  placeholder="e.g., Full-Stack Developer | React & Node.js Expert"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  disabled={isOptimizing}
                  className="border-gray-300 rounded-lg px-4 py-2"
                />
                <p className="text-xs text-gray-500 text-right">
                  {currentTitle.length} / 80 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="primaryService"
                  className="text-sm font-medium text-gray-700"
                >
                  Primary service{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="primaryService"
                  placeholder='e.g. "Next.js development", "AI integration", "SaaS MVP"'
                  value={primaryService}
                  onChange={(e) => setPrimaryService(e.target.value)}
                  disabled={isOptimizing}
                  maxLength={80}
                  className="border-gray-300 rounded-lg px-4 py-2"
                />
                <p className="text-xs text-gray-500">
                  1–2 keywords you want to rank for—we&apos;ll weave this into the first
                  ~160 characters naturally. Secondary terms (tools, stack, related
                  phrases) are taken from your overview below.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="currentOverview"
                  className="text-sm font-medium text-gray-700"
                >
                  Paste your current profile overview{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="currentOverview"
                  placeholder="Paste your current Upwork profile overview here (minimum 50 characters)..."
                  value={currentOverview}
                  onChange={(e) => setCurrentOverview(e.target.value)}
                  disabled={isOptimizing}
                  className="min-h-[200px] resize-none border-gray-300 rounded-lg px-4 py-2"
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {currentOverview.trim().length < 50
                      ? `${50 - currentOverview.trim().length} more characters needed`
                      : "Minimum met"}
                  </span>
                  <span>{currentOverview.length.toLocaleString()} characters</span>
                </div>
              </div>

              <Button
                onClick={handleOptimize}
                disabled={isOptimizing || !isFormValid}
                className="w-full h-12 text-base bg-brand-600 hover:bg-brand-700 text-white rounded-lg"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Optimizing your profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Optimize My Profile
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Results */}
          {result &&
            (() => {
              const overviewChars = result.optimizedOverview.length;
              const overUpworkLimit = overviewChars > UPWORK_OVERVIEW_CHAR_LIMIT;
              return (
            <div className="space-y-6">
              <div
                role="status"
                className={`rounded-lg border p-4 text-sm ${
                  overUpworkLimit
                    ? "border-amber-200 bg-amber-50 text-amber-950"
                    : "border-emerald-200 bg-emerald-50 text-emerald-950"
                }`}
              >
                {overUpworkLimit ? (
                  <p>
                    <span className="mr-1.5" aria-hidden>
                      ⚠️
                    </span>
                    Optimized profile is{" "}
                    <span className="font-semibold text-red-600 tabular-nums">
                      {overviewChars.toLocaleString()}
                    </span>{" "}
                    characters. Upwork&apos;s limit is {UPWORK_OVERVIEW_CHAR_LIMIT.toLocaleString()}.
                    Consider shortening.
                  </p>
                ) : (
                  <p>
                    <span className="mr-1.5" aria-hidden>
                      ✓
                    </span>
                    <span className="font-medium text-emerald-800 tabular-nums">
                      {overviewChars.toLocaleString()}
                    </span>{" "}
                    characters (within Upwork&apos;s {UPWORK_OVERVIEW_CHAR_LIMIT.toLocaleString()}{" "}
                    limit)
                  </p>
                )}
              </div>

              {/* Title comparison */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-[#1F2937]">
                    Professional Title
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopy(result.optimizedTitle, "title")
                    }
                    disabled={isOptimizing}
                    className="border-gray-200"
                  >
                    {copiedField === "title" ? (
                      <>
                        <Check className="w-4 h-4 text-green-600 mr-1.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-1">
                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Before
                    </p>
                    <div className="rounded-lg bg-white p-4">
                      <p className="text-sm text-[#1F2937] leading-snug">
                        {result.originalTitle}
                      </p>
                    </div>
                    <p className="px-3 pb-2 pt-1 text-xs tabular-nums text-[#6B7280]">
                      {result.originalTitle.length} / 80 characters
                    </p>
                  </div>
                  <div className="rounded-xl border-2 border-brand-200 bg-brand-50/50 p-1 ring-1 ring-brand-100">
                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                      After
                    </p>
                    <div className="rounded-lg bg-white p-4">
                      <p className="text-sm text-[#1F2937] leading-snug">
                        {highlightProofMetrics(result.optimizedTitle)}
                      </p>
                    </div>
                    <p className="px-3 pb-2 pt-1 text-xs tabular-nums text-[#6B7280]">
                      {result.optimizedTitle.length} / 80 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Overview comparison */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-[#1F2937]">
                    Profile Overview
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopy(result.optimizedOverview, "overview")
                    }
                    disabled={isOptimizing}
                    className="border-gray-200"
                  >
                    {copiedField === "overview" ? (
                      <>
                        <Check className="w-4 h-4 text-green-600 mr-1.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-1">
                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Before
                    </p>
                    <div className="max-h-[400px] overflow-y-auto rounded-lg bg-white p-4">
                      <p className="text-sm text-[#1F2937] whitespace-pre-wrap leading-relaxed">
                        {result.originalOverview}
                      </p>
                    </div>
                    <p className="px-3 pb-2 pt-1 text-xs tabular-nums text-[#6B7280]">
                      {result.originalOverview.length.toLocaleString()} characters
                    </p>
                  </div>
                  <div className="rounded-xl border-2 border-brand-200 bg-brand-50/50 p-1 ring-1 ring-brand-100">
                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                      After
                    </p>
                    <div className="max-h-[400px] overflow-y-auto rounded-lg bg-white p-4">
                      <p className="text-sm text-[#1F2937] whitespace-pre-wrap leading-relaxed">
                        {highlightProofMetrics(result.optimizedOverview)}
                      </p>
                    </div>
                    <p
                      className={`px-3 pb-2 pt-1 text-xs tabular-nums ${
                        overUpworkLimit
                          ? "font-medium text-red-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {overviewChars.toLocaleString()} / {UPWORK_OVERVIEW_CHAR_LIMIT.toLocaleString()}{" "}
                      characters
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-gray-100 pt-4 text-center">
                  <p className="text-sm font-medium text-[#1F2937]">
                    {formatCharChangeSummary(
                      result.originalOverview.length,
                      overviewChars,
                    )}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleRegenerate}
                disabled={isOptimizing || !isFormValid}
                className="w-full h-11 border-gray-300 text-[#1F2937] hover:bg-gray-50"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </>
                )}
              </Button>

              {/* Copy all */}
              <Button
                onClick={handleCopyAll}
                disabled={isOptimizing}
                className="w-full h-11 bg-brand-600 hover:bg-brand-700 text-white"
              >
                {copiedField === "all" ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied Both!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Optimized Title & Overview
                  </>
                )}
              </Button>
            </div>
              );
            })()}
        </div>
      </main>
    </>
  );
}

export default function ProfileOptimizerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        </div>
      }
    >
      <ProfileOptimizerContent />
    </Suspense>
  );
}
