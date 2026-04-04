"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/dashboard/Header";
import { ProposalPreviewModal } from "@/components/dashboard/ProposalPreviewModal";
import type { HistoryProposalRow } from "@/components/dashboard/ProposalPreviewModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Search,
  Loader2,
  RefreshCw,
  FileText,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function HistoryPage() {
  const router = useRouter();
  const proposals = useQuery(api.proposals.getUserProposals);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<Id<"proposals"> | null>(null);

  const allProposals = proposals || [];

  const q = searchQuery.toLowerCase().trim();
  const filteredProposals = allProposals.filter((p) => {
    if (!q) return true;
    return (
      p.jobTitle.toLowerCase().includes(q) ||
      p.platform.toLowerCase().includes(q) ||
      p.jobDescription.toLowerCase().includes(q) ||
      p.generatedProposal.toLowerCase().includes(q)
    );
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCopy = async (proposalText: string, id: string) => {
    await navigator.clipboard.writeText(proposalText);
    setCopiedId(id);
    toast.success("Proposal copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const goRegenerate = (proposal: HistoryProposalRow) => {
    setPreviewId(null);
    const params = new URLSearchParams({
      jobTitle: proposal.jobTitle,
      jobDescription: proposal.jobDescription,
      platform: proposal.platform,
    });
    if (proposal.clientName) params.set("clientName", proposal.clientName);
    if (proposal.budget) params.set("budget", proposal.budget);
    if (proposal.customInstructions) {
      params.set("customInstructions", proposal.customInstructions);
    }
    router.push(`/dashboard/new?${params.toString()}`);
  };

  const previewProposal =
    previewId === null
      ? null
      : (allProposals.find((p) => p._id === previewId) ?? null);

  if (proposals === undefined) {
    return (
      <>
        <Header title="Proposal History" subtitle="Loading..." />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Proposal History"
        subtitle={`${allProposals.length} proposal${allProposals.length !== 1 ? "s" : ""} generated`}
      />

      <main className="px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {allProposals.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <Input
                placeholder="Search job title, platform, job post, or proposal text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray-200 bg-white pl-9"
              />
            </div>
          )}

          {allProposals.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
                <FileText className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-[#1F2937]">
                No proposals yet
              </h3>
              <p className="mb-6 mx-auto max-w-sm text-sm text-[#6B7280]">
                Generate your first winning proposal and it will appear here
                for easy access
              </p>
              <Button
                asChild
                className="bg-brand-600 px-6 py-3 text-white hover:bg-brand-700"
              >
                <Link href="/dashboard/new">Create Your First Proposal</Link>
              </Button>
            </div>
          )}

          {allProposals.length > 0 && filteredProposals.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
              <h3 className="mb-1 text-base font-medium text-[#1F2937]">
                No results found
              </h3>
              <p className="text-sm text-[#6B7280]">
                Try a different search term
              </p>
            </div>
          )}

          <div className="space-y-4">
            {filteredProposals.map((proposal) => (
              <article
                key={proposal._id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-gray-300 sm:p-6"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-[#1F2937]">
                      {proposal.jobTitle}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="border-0 bg-gray-100 text-xs text-[#6B7280]"
                      >
                        {proposal.platform}
                      </Badge>
                      <span className="text-xs text-[#6B7280]">
                        {formatDate(proposal.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="job" className="w-full">
                  <TabsList className="mb-3 h-auto w-full flex-wrap justify-start gap-1 bg-gray-100/80 p-1">
                    <TabsTrigger value="job" className="text-xs sm:text-sm">
                      Job post
                    </TabsTrigger>
                    <TabsTrigger value="proposal" className="text-xs sm:text-sm">
                      Your proposal
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="job" className="mt-0">
                    <ScrollArea className="h-[min(220px,40vh)] rounded-lg border border-gray-100 bg-gray-50/80">
                      <p className="whitespace-pre-wrap p-3 text-sm leading-relaxed text-[#374151]">
                        {proposal.jobDescription || "—"}
                      </p>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="proposal" className="mt-0">
                    <ScrollArea className="h-[min(220px,40vh)] rounded-lg border border-brand-100 bg-brand-50/30">
                      <p className="whitespace-pre-wrap p-3 text-sm leading-relaxed text-[#1F2937]">
                        {proposal.generatedProposal}
                      </p>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopy(proposal.generatedProposal, proposal._id)
                    }
                    className="border-gray-200 text-sm"
                  >
                    {copiedId === proposal._id ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goRegenerate(proposal)}
                    className="border-gray-200 text-sm"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewId(proposal._id)}
                    className="border-gray-200 text-sm"
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Preview
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <ProposalPreviewModal
        proposal={previewProposal}
        copiedId={copiedId}
        onClose={() => setPreviewId(null)}
        onCopyProposal={handleCopy}
        onRegenerate={goRegenerate}
      />
    </>
  );
}
