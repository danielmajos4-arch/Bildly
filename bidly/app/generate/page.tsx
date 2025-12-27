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
import { toast } from "sonner";

export default function GeneratePage() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [platform, setPlatform] = useState("");
  const [generatedProposal, setGeneratedProposal] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateProposal = useAction(api.ai.generateProposal);

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
                {generatedProposal ? (
                  <Textarea
                    value={generatedProposal}
                    onChange={(e) => handleProposalChange(e.target.value)}
                    className="min-h-[400px] resize-none border-slate-200 bg-white/50 text-sm leading-relaxed transition-colors focus:border-indigo-300 focus:ring-indigo-200"
                  />
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

