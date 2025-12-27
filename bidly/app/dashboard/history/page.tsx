"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  FileText, 
  Copy, 
  Check, 
  Clock,
  ChevronRight,
  Search,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function HistoryPage() {
  const proposals = useQuery(api.proposals.getUserProposals) || [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  // Auto-select first proposal on desktop
  useEffect(() => {
    if (proposals.length > 0 && !selectedId && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSelectedId(proposals[0]._id);
      setEditedContent(proposals[0].generatedProposal);
    }
  }, [proposals, selectedId]);

  const selectedProposal = proposals.find((p: NonNullable<typeof proposals>[number]) => p._id === selectedId);

  const filteredProposals = proposals.filter((p: NonNullable<typeof proposals>[number]) => 
    p.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (id: string) => {
    const proposal = proposals.find((p: NonNullable<typeof proposals>[number]) => p._id === id);
    if (proposal) {
      setSelectedId(id);
      setEditedContent(proposal.generatedProposal);
      setMobileView("detail");
    }
  };

  const handleBack = () => {
    setMobileView("list");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedContent);
    setIsCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (proposals === undefined) {
    return (
      <>
        <Header title="Proposal History" subtitle="Loading..." />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Proposal History"
        subtitle={`${proposals.length} proposals generated`}
      />
      
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Mobile: Toggle between list and detail view */}
        <div className="lg:hidden">
          {mobileView === "list" ? (
            /* Mobile List View */
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-5 h-5 text-primary" />
                  All Proposals
                </CardTitle>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search proposals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredProposals.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      {proposals.length === 0 ? "No proposals yet" : "No results found"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {proposals.length === 0 
                        ? "Generate your first proposal to see it here"
                        : "Try a different search term"
                      }
                    </p>
                    {proposals.length === 0 && (
                      <Button asChild>
                        <Link href="/dashboard/new">Create Proposal</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredProposals.map((proposal: NonNullable<typeof filteredProposals>[number]) => (
                      <div
                        key={proposal._id}
                        onClick={() => handleSelect(proposal._id)}
                        className="p-4 cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate text-sm">
                              {proposal.jobTitle}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {proposal.platform}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(proposal.createdAt)}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Mobile Detail View */
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1 -ml-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                </div>
                <CardTitle className="text-base">
                  {selectedProposal?.jobTitle}
                </CardTitle>
                {selectedProposal && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{selectedProposal.platform}</Badge>
                    {selectedProposal.clientName && (
                      <span>Client: {selectedProposal.clientName}</span>
                    )}
                    <span>{formatDate(selectedProposal.createdAt)}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {selectedProposal && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                        Job Description
                      </h4>
                      <div className="bg-muted rounded-lg p-3 text-sm max-h-24 overflow-y-auto">
                        {selectedProposal.jobDescription}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                        Generated Proposal
                      </h4>
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[200px] resize-none text-sm leading-relaxed"
                        readOnly
                      />
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{editedContent.split(/\s+/).filter(Boolean).length} words</span>
                        <span>{editedContent.length} characters</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="gap-2 flex-1"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Desktop: Side-by-side view */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
          {/* Proposals List */}
          <Card className="border-0 shadow-lg lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-5 h-5 text-primary" />
                All Proposals
              </CardTitle>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search proposals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-22rem)]">
                {filteredProposals.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      {proposals.length === 0 ? "No proposals yet" : "No results found"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {proposals.length === 0 
                        ? "Generate your first proposal to see it here"
                        : "Try a different search term"
                      }
                    </p>
                    {proposals.length === 0 && (
                      <Button asChild>
                        <Link href="/dashboard/new">Create Proposal</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredProposals.map((proposal: NonNullable<typeof filteredProposals>[number]) => (
                      <div
                        key={proposal._id}
                        onClick={() => handleSelect(proposal._id)}
                        className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedId === proposal._id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate text-sm">
                              {proposal.jobTitle}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {proposal.platform}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(proposal.createdAt)}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Proposal Detail */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {selectedProposal ? selectedProposal.jobTitle : "Select a Proposal"}
                </CardTitle>
                {selectedProposal && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="gap-2"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
              {selectedProposal && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2 flex-wrap">
                  <Badge variant="secondary">{selectedProposal.platform}</Badge>
                  {selectedProposal.clientName && (
                    <span>Client: {selectedProposal.clientName}</span>
                  )}
                  <span>{formatDate(selectedProposal.createdAt)}</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedProposal ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                      Job Description
                    </h4>
                    <div className="bg-muted rounded-lg p-4 text-sm max-h-28 overflow-y-auto">
                      {selectedProposal.jobDescription}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                      Generated Proposal
                    </h4>
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="min-h-[280px] resize-none text-base leading-relaxed"
                      readOnly
                    />
                    <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                      <span>{editedContent.split(/\s+/).filter(Boolean).length} words</span>
                      <span>{editedContent.length} characters</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="min-h-[400px] flex items-center justify-center text-center">
                  <div>
                    <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Select a proposal to view
                    </h3>
                    <p className="text-muted-foreground max-w-sm">
                      Click on any proposal from the list to view or copy it
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
