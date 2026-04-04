"use client";
export const dynamic = "force-dynamic";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Loader2,
  RefreshCw,
  X,
  Save,
  Sparkles,
  AlertTriangle,
  Paperclip,
  FileText,
  Plus,
} from "lucide-react";

const PLATFORMS = [
  { value: "Upwork", label: "Upwork" },
  { value: "Fiverr", label: "Fiverr" },
  { value: "Freelancer", label: "Freelancer.com" },
  { value: "Direct Outreach", label: "Direct Outreach" },
  { value: "Other", label: "Other" },
];

interface AiScores {
  hook: number;
  specificity: number;
  credibility: number;
  clarity: number;
  cta: number;
  overall: number;
}

interface GenerationResult {
  proposal: string;
  wordCount: number;
  characterCount: number;
  aiScores: AiScores;
  applicationAnswers?: string;
  customInstructions?: string;
}

const QUICK_INSTRUCTIONS = [
  "More technical",
  "Sound humble",
  "Focus on speed",
  "Keep it short (under 150 words)",
  "Casual tone",
] as const;

function parseQAPairs(text: string): { question: string; answer: string }[] {
  const pairs: { question: string; answer: string }[] = [];
  const regex = /Q:\s*(.+?)\nA:\s*([\s\S]+?)(?=\n\nQ:|$)/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    pairs.push({ question: m[1].trim(), answer: m[2].trim() });
  }
  return pairs;
}

const SCORE_LABELS: { key: keyof AiScores; label: string }[] = [
  { key: "hook", label: "Hook" },
  { key: "specificity", label: "Specificity" },
  { key: "credibility", label: "Credibility" },
  { key: "clarity", label: "Clarity" },
  { key: "cta", label: "CTA" },
  { key: "overall", label: "Overall" },
];

function getScoreColor(score: number) {
  if (score >= 8) return "#10B981";
  if (score >= 5) return "#F59E0B";
  return "#EF4444";
}

function getScoreBgClass(score: number) {
  if (score >= 8) return "bg-green-50 border-green-200";
  if (score >= 5) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".md", ".txt"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 3;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function extractFileText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "txt" || ext === "md") {
    return file.text();
  }

  if (ext === "pdf") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text +=
        content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ") + "\n";
    }
    return text;
  }

  if (ext === "doc" || ext === "docx") {
    const mammoth = await import("mammoth");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  return "";
}


function NewProposalContent() {
  const searchParams = useSearchParams();
  const generateProposal = useAction(api.ai.generateProposal);
  const currentUser = useQuery(api.users.getCurrentUser);
  const usageCheck = useQuery(api.users.canGenerateProposal);
  const usageStats = useQuery(api.users.getUsageStats);

  const resultRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileLoaded = useRef(false);

  const [jobTitle, setJobTitle] = useState(searchParams.get("jobTitle") || "");
  const [jobDescription, setJobDescription] = useState(searchParams.get("jobDescription") || "");
  const [platform, setPlatform] = useState(searchParams.get("platform") || "Upwork");
  const [clientName, setClientName] = useState(searchParams.get("clientName") || "");
  const [budget, setBudget] = useState(searchParams.get("budget") || "");
  const [profession, setProfession] = useState(
    currentUser?.profession || ""
  );
  const [skills, setSkills] = useState<string[]>(
    currentUser?.skills || []
  );
  const [skillInput, setSkillInput] = useState("");
  const [pastWork, setPastWork] = useState("");
  const [portfolioLink, setPortfolioLink] = useState(
    currentUser?.portfolio || ""
  );

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isReadingFiles, setIsReadingFiles] = useState(false);

  const [hasApplicationQuestions, setHasApplicationQuestions] = useState(false);
  const [applicationQuestions, setApplicationQuestions] = useState<string[]>([""]);

  const [hasCustomInstructions, setHasCustomInstructions] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAnswersCopied, setIsAnswersCopied] = useState(false);
  const [copiedAnswerIndex, setCopiedAnswerIndex] = useState<number | null>(null);

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) =>
    setSkills(skills.filter((s) => s !== skill));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (e.target) e.target.value = "";

    for (const file of selected) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        toast.error(`Only PDF, DOCX, MD, or TXT files accepted`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large — max 10MB`);
        return;
      }
    }

    const total = uploadedFiles.length + selected.length;
    if (total > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    setUploadedFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index: number) =>
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

  const addQuestion = () => {
    if (applicationQuestions.length < 5) {
      setApplicationQuestions((prev) => [...prev, ""]);
    }
  };

  const updateQuestion = (index: number, value: string) =>
    setApplicationQuestions((prev) =>
      prev.map((q, i) => (i === index ? value : q))
    );

  const removeQuestion = (index: number) => {
    if (applicationQuestions.length > 1) {
      setApplicationQuestions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const appendQuickInstruction = (line: string) => {
    setCustomInstructions((prev) => {
      const t = prev.trim();
      if (!t) return line;
      const lines = t.split("\n").map((l) => l.trim());
      if (lines.includes(line)) return prev;
      return `${t}\n${line}`;
    });
  };

  useEffect(() => {
    const ci = searchParams.get("customInstructions");
    if (ci) {
      setHasCustomInstructions(true);
      setCustomInstructions(ci);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!currentUser || profileLoaded.current) return;
    profileLoaded.current = true;
    setProfession((prev) => prev || currentUser.profession || "");
    setSkills((prev) => (prev.length > 0 ? prev : currentUser.skills || []));
    setPortfolioLink((prev) => prev || currentUser.portfolio || "");
    setPastWork((prev) => prev || currentUser.pastWorkSummary || "");
  }, [currentUser]);

  useEffect(() => {
    if (!isGenerating) {
      setLoadingStep(0);
      return;
    }
    setLoadingStep(0);
    const t1 = setTimeout(() => setLoadingStep(1), 2000);
    const t2 = setTimeout(() => setLoadingStep(2), 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isGenerating]);

  const LOADING_STEPS = [
    "Analyzing job description...",
    "Generating winning proposal...",
    "Calculating win score...",
  ];

  const isFormValid =
    jobTitle.trim() !== "" &&
    jobDescription.trim() !== "" &&
    profession.trim() !== "" &&
    skills.length >= 3;

  const handleGenerate = async () => {
    if (!isFormValid) {
      if (!jobTitle.trim()) toast.error("Please enter a job title");
      else if (!jobDescription.trim())
        toast.error("Please enter a job description");
      else if (!profession.trim())
        toast.error("Please enter your profession");
      else if (skills.length < 3)
        toast.error("Please add at least 3 skills");
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setIsSaved(false);

    try {
      let attachmentContent: string | undefined;

      if (uploadedFiles.length > 0) {
        setIsReadingFiles(true);
        try {
          const texts = await Promise.all(uploadedFiles.map(extractFileText));
          const combined = texts.filter(Boolean).join("\n\n---\n\n");
          if (combined.trim()) attachmentContent = combined;
        } catch {
          toast.error("Failed to read one or more attachments");
        } finally {
          setIsReadingFiles(false);
        }
      }

      const filteredQuestions = hasApplicationQuestions
        ? applicationQuestions.filter((q) => q.trim())
        : [];

      const res = await generateProposal({
        jobTitle,
        jobDescription,
        clientName: clientName || undefined,
        platform,
        budget: budget || undefined,
        profession,
        skills,
        pastWork: pastWork || undefined,
        portfolioLink: portfolioLink || undefined,
        freelancerName: currentUser?.name || undefined,
        mainSkill: currentUser?.mainSkill || undefined,
        yearsOfExperience: currentUser?.yearsOfExperience || undefined,
        mainPlatform: currentUser?.mainPlatform || undefined,
        attachmentContent,
        applicationQuestions:
          filteredQuestions.length > 0 ? filteredQuestions : undefined,
        customInstructions:
          hasCustomInstructions && customInstructions.trim()
            ? customInstructions.trim()
            : undefined,
      });

      setResult(res);
      toast.success("Proposal generated!");

      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to generate";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.proposal);
    setIsCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setResult(null);
    setIsSaved(false);
    handleGenerate();
  };

  const handleSave = () => {
    setIsSaved(true);
    toast.success("Saved to history!");
  };

  const handleCopyAllAnswers = async () => {
    if (!result?.applicationAnswers) return;
    const pairs = parseQAPairs(result.applicationAnswers);
    const formatted = pairs
      .map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`)
      .join("\n\n");
    await navigator.clipboard.writeText(formatted);
    setIsAnswersCopied(true);
    toast.success("All answers copied!");
    setTimeout(() => setIsAnswersCopied(false), 2000);
  };

  const handleCopySingleAnswer = async (index: number) => {
    if (!result?.applicationAnswers) return;
    const pairs = parseQAPairs(result.applicationAnswers);
    if (pairs[index]) {
      await navigator.clipboard.writeText(pairs[index].answer);
      setCopiedAnswerIndex(index);
      toast.success(`Answer ${index + 1} copied!`);
      setTimeout(() => setCopiedAnswerIndex(null), 2000);
    }
  };

  return (
    <>
      <Header
        title="Generate Winning Proposal"
        subtitle="AI-powered proposals that get 35%+ response rates"
      />

      <main className="px-4 py-6 md:px-8 md:py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* ═══ FORM ═══ */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* ── Section 1: Job Details ── */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Job Details</h3>
                <p className="text-xs text-gray-400 mt-0.5">Information about the job you&apos;re applying to</p>
              </div>
              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Build React Dashboard with Stripe Integration"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  onBlur={() => markTouched("jobTitle")}
                  disabled={isGenerating}
                  className={`border-gray-300 rounded-lg px-4 py-2 ${
                    touched.jobTitle && !jobTitle.trim()
                      ? "border-red-400 focus:ring-red-400"
                      : ""
                  }`}
                />
                {touched.jobTitle && !jobTitle.trim() ? (
                  <p className="text-xs text-red-500">Job title is required</p>
                ) : (
                  <p className="text-xs text-gray-400">Be specific — this helps generate a targeted proposal</p>
                )}
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="jobDescription" className="text-sm font-medium text-gray-700">
                  Job Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  onBlur={() => markTouched("jobDescription")}
                  disabled={isGenerating}
                  className={`h-[200px] resize-none overflow-y-auto custom-scrollbar border-gray-300 rounded-lg px-4 py-2 ${
                    touched.jobDescription && !jobDescription.trim()
                      ? "border-red-400"
                      : ""
                  }`}
                />
                <div className="flex items-center justify-between">
                  {touched.jobDescription && !jobDescription.trim() ? (
                    <p className="text-xs text-red-500">Job description is required</p>
                  ) : (
                    <p className="text-xs text-gray-400">The more details you paste, the better the proposal</p>
                  )}
                  <p className="text-xs text-gray-400 shrink-0">
                    {jobDescription.length.toLocaleString()} chars
                  </p>
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Attachments{" "}
                  <span className="text-xs text-gray-400 font-normal">(optional)</span>
                </Label>
                <p className="text-xs text-gray-400">
                  Upload any docs the client attached — specs, briefs, design files. Bidly will read them to write a better proposal.
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating || uploadedFiles.length >= MAX_FILES}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 p-6 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Paperclip className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Drop files here or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOCX, MD, TXT — max 10MB each</p>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.md,.txt"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {uploadedFiles.map((file, i) => (
                      <div
                        key={`${file.name}-${i}`}
                        className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          <span className="text-xs text-gray-400 shrink-0">{formatFileSize(file.size)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          disabled={isGenerating}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isReadingFiles && (
                  <div className="flex items-center gap-2 text-sm text-brand-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reading attachments...
                  </div>
                )}
              </div>

              {/* Application Questions */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Does this job have application questions?
                </Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setHasApplicationQuestions(false);
                      setApplicationQuestions([""]);
                    }}
                    disabled={isGenerating}
                    className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      !hasApplicationQuestions
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasApplicationQuestions(true)}
                    disabled={isGenerating}
                    className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      hasApplicationQuestions
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Yes
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Some jobs require answers to specific questions in the application
                </p>
              </div>

              {hasApplicationQuestions && (
                <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Application Questions
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Copy-paste each question from the job post
                    </p>
                  </div>

                  {applicationQuestions.map((q, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-gray-500">
                          Question {i + 1}
                        </Label>
                        {applicationQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(i)}
                            disabled={isGenerating}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <Textarea
                        value={q}
                        onChange={(e) => updateQuestion(i, e.target.value)}
                        placeholder="e.g., Describe your recent experience with similar projects"
                        disabled={isGenerating}
                        className="h-[80px] resize-none overflow-y-auto custom-scrollbar border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                      />
                    </div>
                  ))}

                  {applicationQuestions.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addQuestion}
                      disabled={isGenerating}
                      className="border-gray-200 text-gray-600 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Question
                    </Button>
                  )}
                </div>
              )}

              {/* Custom Instructions */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Add custom instructions for how the proposal should sound?
                </Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setHasCustomInstructions(false);
                      setCustomInstructions("");
                    }}
                    disabled={isGenerating}
                    className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      !hasCustomInstructions
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasCustomInstructions(true)}
                    disabled={isGenerating}
                    className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      hasCustomInstructions
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Yes
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Optional — e.g. tone, length limits, or things to avoid
                </p>
              </div>

              {hasCustomInstructions && (
                <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Custom Instructions
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Tell Bidly how to write this proposal — these override default rules
                    </p>
                  </div>
                  <Textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder='e.g. "Make it sound humble" · "Keep it under 150 words" · "Do not mention my portfolio"'
                    disabled={isGenerating}
                    className="min-h-[100px] resize-y overflow-y-auto custom-scrollbar border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                  />
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Quick add
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_INSTRUCTIONS.map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => appendQuickInstruction(label)}
                          disabled={isGenerating}
                          className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50/50 transition-colors disabled:opacity-50"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100" />

            {/* ── Section 2: Platform & Budget ── */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Platform &amp; Budget</h3>
                <p className="text-xs text-gray-400 mt-0.5">Where you found this job</p>
              </div>
              {/* Platform */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Platform <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={platform}
                  onValueChange={setPlatform}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="border-gray-300 rounded-lg px-4 py-2">
                    <SelectValue />
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

              {/* Client Name + Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-sm font-medium text-gray-700">
                    Client Name
                  </Label>
                  <Input
                    id="clientName"
                    placeholder="If mentioned in job post"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    disabled={isGenerating}
                    className="border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-medium text-gray-700">
                    Budget
                  </Label>
                  <Input
                    id="budget"
                    placeholder="e.g., $500-1000 or $25/hr"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    disabled={isGenerating}
                    className="border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* ── Section 3: Your Info ── */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Your Info</h3>
                <p className="text-xs text-gray-400 mt-0.5">Tell us about yourself to personalize your proposal</p>
              </div>
              {/* Profession */}
              <div className="space-y-2">
                <Label htmlFor="profession" className="text-sm font-medium text-gray-700">
                  Your Profession <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="profession"
                  placeholder="e.g., Full-Stack Developer, UI/UX Designer"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  onBlur={() => markTouched("profession")}
                  disabled={isGenerating}
                  className={`border-gray-300 rounded-lg px-4 py-2 ${
                    touched.profession && !profession.trim()
                      ? "border-red-400"
                      : ""
                  }`}
                />
                {touched.profession && !profession.trim() ? (
                  <p className="text-xs text-red-500">
                    Profession is required
                  </p>
                ) : currentUser?.profession && profession === currentUser.profession ? (
                  <p className="text-xs text-gray-400">From your profile</p>
                ) : null}
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Your Skills <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add your relevant skills..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    disabled={isGenerating}
                    className="flex-1 border-gray-300 rounded-lg px-4 py-2"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSkill}
                    disabled={!skillInput.trim() || isGenerating}
                    className="border-gray-300"
                  >
                    Add
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="py-1.5 px-3 text-sm flex items-center gap-1.5 bg-brand-50 text-brand-700 border-0"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          disabled={isGenerating}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {touched.profession && skills.length < 3 ? (
                  <p className="text-xs text-red-500">
                    Please add at least 3 skills
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    Add 3–5 relevant skills for this specific job
                  </p>
                )}
              </div>

              {/* Past Work Summary */}
              <div className="space-y-2">
                <Label htmlFor="pastWork" className="text-sm font-medium text-gray-700">
                  Past Work Summary{" "}
                  <span className="text-xs text-gray-400 font-normal">
                    (recommended)
                  </span>
                </Label>
                <Textarea
                  id="pastWork"
                  placeholder="Briefly describe 1-2 relevant past projects with results (e.g., 'Built e-commerce site that increased conversions by 40%')"
                  value={pastWork}
                  onChange={(e) => setPastWork(e.target.value)}
                  disabled={isGenerating}
                  className="h-[120px] resize-none overflow-y-auto custom-scrollbar border-gray-300 rounded-lg px-4 py-2"
                />
                {currentUser?.pastWorkSummary &&
                  pastWork === currentUser.pastWorkSummary && (
                    <p className="text-xs text-gray-400">From your profile</p>
                  )}
              </div>

              {/* Portfolio Link */}
              <div className="space-y-2">
                <Label htmlFor="portfolioLink" className="text-sm font-medium text-gray-700">
                  Portfolio Link
                </Label>
                <Input
                  id="portfolioLink"
                  placeholder="Your portfolio URL"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  disabled={isGenerating}
                  className="border-gray-300 rounded-lg px-4 py-2"
                />
                {currentUser?.portfolio && portfolioLink === currentUser.portfolio && (
                  <p className="text-xs text-gray-400">From your profile</p>
                )}
              </div>

            </div>

            <div className="border-t border-gray-100" />

            {/* ── Generate ── */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-4">
              {/* Usage limit warning */}
              {usageCheck && !usageCheck.canGenerate && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700">
                      Usage Limit Reached
                    </p>
                    <p className="text-sm text-red-600 mt-0.5">
                      {usageCheck.reason ||
                        `You've used all your proposals this month.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  !isFormValid ||
                  (usageCheck ? !usageCheck.canGenerate : false)
                }
                className="w-full h-12 text-base bg-brand-600 hover:bg-brand-700 text-white rounded-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {isReadingFiles
                      ? "Reading attachments..."
                      : LOADING_STEPS[loadingStep] || "Generating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Winning Proposal
                  </>
                )}
              </Button>

              {/* Usage counter */}
              {usageStats && (
                <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <span>
                    {usageStats.isPro
                      ? `${usageStats.proposalsUsed} / unlimited proposals`
                      : `${usageStats.proposalsUsed} / ${usageStats.proposalsLimit} proposals used this month`}
                  </span>
                  {!usageStats.isPro && (
                    <span className="text-xs text-gray-400">
                      Resets in {usageStats.daysUntilReset} days
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ═══ RESULT DISPLAY ═══ */}
          {result && (
            <div ref={resultRef} className="space-y-6">
              {/* Generated Proposal */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">
                    Your Proposal
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{result.wordCount} words</span>
                    <span className="text-gray-300">|</span>
                    <span>
                      {result.characterCount.toLocaleString()} characters
                    </span>
                  </div>
                </div>
                {result.customInstructions && (
                  <div className="mb-4 rounded-lg border border-brand-100 bg-brand-50/50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-800 mb-1">
                      Instructions used
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {result.customInstructions}
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 h-[300px] overflow-y-auto custom-scrollbar">
                  <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                    {result.proposal}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                  <Button
                    onClick={handleCopy}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Proposal
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                    className="flex-1 bg-white border-gray-300 hover:bg-gray-50"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Regenerate
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    className="flex-1 bg-white border-gray-300 hover:bg-gray-50"
                    disabled={isSaved}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-green-600">Saved</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save to History
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Application Question Answers */}
              {result.applicationAnswers && (() => {
                const pairs = parseQAPairs(result.applicationAnswers!);
                if (pairs.length === 0) return null;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold text-gray-900">
                        Application Question Answers
                      </h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyAllAnswers}
                        className="bg-white border-gray-300 text-xs"
                      >
                        {isAnswersCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            Copy All Answers
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {pairs.map((qa, i) => (
                        <div
                          key={i}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-brand-600 mb-1">
                                Q{i + 1}
                              </p>
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                {qa.question}
                              </p>
                              <div className="h-[100px] overflow-y-auto custom-scrollbar">
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                  {qa.answer}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopySingleAnswer(i)}
                              className="shrink-0 text-gray-400 hover:text-brand-600 transition-colors mt-1"
                              title={`Copy answer ${i + 1}`}
                            >
                              {copiedAnswerIndex === i ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* AI Score Card */}
              <div className={`border rounded-lg p-6 ${getScoreBgClass(result.aiScores.overall)}`}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Proposal Score
                  </h2>
                  <span
                    className="text-3xl font-bold"
                    style={{ color: getScoreColor(result.aiScores.overall) }}
                  >
                    {result.aiScores.overall}/10
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SCORE_LABELS.filter((s) => s.key !== "overall").map((item) => {
                    const score = result.aiScores[item.key];
                    return (
                      <div
                        key={item.key}
                        className={`rounded-lg border p-3 ${getScoreBgClass(score)}`}
                      >
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <p
                          className="text-xl font-bold"
                          style={{ color: getScoreColor(score) }}
                        >
                          {score}/10
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Low score warning */}
              {result.aiScores.overall < 7 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 mb-1">
                        This proposal could be stronger
                      </p>
                      <p className="text-sm text-amber-700">
                        Try adding more specific details about the job, or hit Regenerate for a fresh take.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function NewProposalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        </div>
      }
    >
      <NewProposalContent />
    </Suspense>
  );
}
