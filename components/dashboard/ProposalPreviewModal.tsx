"use client";

import { useEffect } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, RefreshCw, X, Eye } from "lucide-react";

export type HistoryProposalRow = {
  _id: Id<"proposals">;
  jobTitle: string;
  jobDescription: string;
  generatedProposal: string;
  platform: string;
  createdAt: number;
  clientName?: string;
  budget?: string;
  customInstructions?: string;
};

type ProposalPreviewModalProps = {
  proposal: HistoryProposalRow | null;
  copiedId: string | null;
  onClose: () => void;
  onCopyProposal: (text: string, id: string) => void;
  onRegenerate: (proposal: HistoryProposalRow) => void;
};

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ProposalPreviewModal({
  proposal,
  copiedId,
  onClose,
  onCopyProposal,
  onRegenerate,
}: ProposalPreviewModalProps) {
  useEffect(() => {
    if (!proposal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [proposal, onClose]);

  if (!proposal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="proposal-preview-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(92dvh,900px)] w-full max-w-2xl flex-col rounded-t-2xl border border-gray-200 bg-white shadow-xl sm:rounded-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2 text-brand-600">
              <Eye className="h-4 w-4 shrink-0" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Preview
              </span>
            </div>
            <h2
              id="proposal-preview-title"
              className="text-lg font-semibold leading-snug text-[#1F2937]"
            >
              {proposal.jobTitle}
            </h2>
            <p className="mt-1 text-xs text-[#6B7280]">
              {proposal.platform}
              {" · "}
              {formatDate(proposal.createdAt)}
              {proposal.clientName ? ` · ${proposal.clientName}` : ""}
              {proposal.budget ? ` · ${proposal.budget}` : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4 pt-3 sm:px-6">
          {proposal.customInstructions && (
            <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-3 sm:px-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-800">
                Instructions used
              </h3>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
                {proposal.customInstructions}
              </p>
            </div>
          )}
          <div className="grid h-full min-h-0 gap-4 sm:grid-cols-2 sm:gap-4">
            <div className="flex min-h-0 flex-col rounded-xl border border-gray-100 bg-gray-50/80">
              <div className="shrink-0 border-b border-gray-100 px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Job post
                </h3>
              </div>
              <ScrollArea className="h-[min(40vh,320px)] sm:h-[min(52vh,420px)]">
                <p className="whitespace-pre-wrap p-3 text-sm leading-relaxed text-[#374151]">
                  {proposal.jobDescription || "—"}
                </p>
              </ScrollArea>
            </div>
            <div className="flex min-h-0 flex-col rounded-xl border border-brand-100 bg-brand-50/40">
              <div className="shrink-0 border-b border-brand-100/80 px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-800">
                  Your proposal
                </h3>
              </div>
              <ScrollArea className="h-[min(40vh,320px)] sm:h-[min(52vh,420px)]">
                <p className="whitespace-pre-wrap p-3 text-sm leading-relaxed text-[#1F2937]">
                  {proposal.generatedProposal}
                </p>
              </ScrollArea>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-6">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-gray-200"
              onClick={() =>
                onCopyProposal(proposal.generatedProposal, proposal._id)
              }
            >
              {copiedId === proposal._id ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy proposal
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-gray-200"
              onClick={() => onRegenerate(proposal)}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Regenerate
            </Button>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="sm:ml-auto"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
