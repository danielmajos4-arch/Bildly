"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Send, 
  Copy, 
  Check, 
  Loader2,
  MessageSquare,
  Lightbulb,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Link,
  Plus,
  X,
  User,
  CheckCircle2,
  History,
  Settings2,
  StopCircle,
  Bot,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from "@/convex/_generated/dataModel";

const PLATFORMS = [
  { value: "Fiverr", label: "Fiverr" },
  { value: "Upwork", label: "Upwork" },
];

const NICHES = [
  "Web Development",
  "Graphic Design",
  "Writing & Content",
  "Marketing",
  "Video Editing",
  "Virtual Assistant",
  "Data Entry",
  "Translation",
  "Other",
];

const LOADING_TIPS = [
  "Analyzing context...",
  "Crafting converting response...",
  "Adding your personal touch...",
  "Optimizing for conversion...",
  "Making it sound natural...",
];

function ConverterContent() {
  const convertMessage = useAction(api.ai.convertBuyerMessage);
  const currentUser = useQuery(api.users.getCurrentUser);
  const usageCheck = useQuery(api.users.canGenerateProposal);
  const conversations = useQuery(api.converter.getBuyerConversations) || [];
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"buyerConversations"> | null>(null);
  const selectedConversation = useQuery(
    api.converter.getConversation,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip"
  );
  
  const [message, setMessage] = useState("");
  const [platform, setPlatform] = useState("Fiverr");
  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingTip, setLoadingTip] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  
  // Custom context state
  const [portfolioLink, setPortfolioLink] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [newKeyPoint, setNewKeyPoint] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Cancel generation state
  const isCancelledRef = useRef(false);
  const generationIdRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [selectedConversation?.messages, isGenerating]);

  // Rotate loading tips while generating
  useEffect(() => {
    if (isGenerating) {
      setLoadingTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
      const interval = setInterval(() => {
        setLoadingTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  // Auto-show settings for new conversations without niche
  useEffect(() => {
    if (!selectedConversationId && !niche) {
      setShowSettings(true);
    }
  }, [selectedConversationId, niche]);

  const handleGenerate = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    if (message.length < 20) {
      toast.error("Please provide a longer message (at least 20 characters)");
      return;
    }
    const finalNiche = niche === "Other" ? customNiche : niche;
    if (!finalNiche.trim()) {
      toast.error("Please select a niche in settings");
      setShowSettings(true);
      return;
    }

    // Track this generation request
    const currentGenerationId = ++generationIdRef.current;
    isCancelledRef.current = false;
    
    setIsGenerating(true);
    const messageToSend = message;
    setMessage(""); // Clear input immediately for chat-like feel

    try {
      // Build custom context object
      const customContext = (portfolioLink || customInstructions || keyPoints.length > 0) ? {
        portfolioLink: portfolioLink || undefined,
        customInstructions: customInstructions || undefined,
        keyPoints: keyPoints.length > 0 ? keyPoints : undefined,
      } : undefined;

      const result = await convertMessage({
        buyerMessage: messageToSend,
        platform,
        niche: finalNiche,
        buyerName: buyerName || undefined,
        conversationId: selectedConversationId || undefined,
        customContext,
      });
      
      // Check if this generation was cancelled or superseded
      if (isCancelledRef.current || currentGenerationId !== generationIdRef.current) {
        return;
      }
      
      // Update selected conversation if new one was created
      if (result.conversationId && !selectedConversationId) {
        setSelectedConversationId(result.conversationId);
      }
      
      toast.success("Response generated!");
    } catch (error) {
      // Don't show error if cancelled
      if (isCancelledRef.current || currentGenerationId !== generationIdRef.current) {
        return;
      }
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate response. Please try again.";
      toast.error(errorMessage);
      setMessage(messageToSend); // Restore message on error
    } finally {
      if (currentGenerationId === generationIdRef.current) {
        setIsGenerating(false);
      }
    }
  };
  
  const handleStop = () => {
    isCancelledRef.current = true;
    setIsGenerating(false);
    toast.info("Generation stopped");
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleNewConversation = () => {
    setSelectedConversationId(null);
    setMessage("");
    setPlatform("Fiverr");
    setNiche("");
    setCustomNiche("");
    setBuyerName("");
    setPortfolioLink("");
    setCustomInstructions("");
    setKeyPoints([]);
    setNewKeyPoint("");
    setShowSettings(true);
    setShowConversations(false);
  };

  const handleSelectConversation = (conversationId: Id<"buyerConversations">) => {
    setSelectedConversationId(conversationId);
    setShowConversations(false);
    setMessage("");
    setShowSettings(false);
  };

  // Update form when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setPlatform(selectedConversation.platform);
      setNiche(selectedConversation.niche);
      setBuyerName(selectedConversation.buyerName || "");
    }
  }, [selectedConversation]);

  const handleAddKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setKeyPoints([...keyPoints, newKeyPoint.trim()]);
      setNewKeyPoint("");
    }
  };

  const handleRemoveKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const finalNiche = niche === "Other" ? customNiche : niche;
  const isInputValid = message.trim().length >= 20 && finalNiche.trim() !== "";
  const hasMessages = selectedConversation?.messages && selectedConversation.messages.length > 0;

  return (
    <>
      <Header 
        title="Message Converter"
        subtitle="Chat-style conversation converter for client messages"
      />
      
      <main className="p-3 sm:p-4 md:p-6 lg:p-8 h-[calc(100vh-10rem)] overflow-hidden flex flex-col">
        <div className="flex flex-1 gap-4 min-h-0">
          {/* Sidebar - Conversations */}
          <Card className="border-0 shadow-lg w-64 hidden lg:flex flex-col shrink-0">
            <div className="p-3 border-b">
              <Button
                onClick={handleNewConversation}
                className="w-full gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                New Conversation
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No conversations yet
                    </p>
                  </div>
                ) : (
                  conversations.map((conv: NonNullable<typeof conversations>[number]) => (
                    <button
                      key={conv._id}
                      onClick={() => handleSelectConversation(conv._id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedConversationId === conv._id
                          ? "bg-primary/10 border-l-2 border-l-primary"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <p className="text-sm font-medium truncate">{conv.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">{conv.platform}</Badge>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {conv.buyerName || "Client"}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Main Chat Area */}
          <Card className="border-0 shadow-lg flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Mobile conversations toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden shrink-0"
                  onClick={() => setShowConversations(!showConversations)}
                >
                  <History className="w-4 h-4" />
                </Button>
                
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {selectedConversation?.title || "New Conversation"}
                  </p>
                  {selectedConversation && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[10px]">{selectedConversation.platform}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {selectedConversation.niche}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="gap-1.5"
                    >
                  <Settings2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                  {showSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                {selectedConversationId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewConversation}
                    className="gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New</span>
                  </Button>
                )}
              </div>
              </div>
              
            {/* Mobile Conversations Dropdown */}
              {showConversations && (
              <div className="lg:hidden p-3 border-b bg-muted/30 max-h-[200px] overflow-y-auto">
                <div className="space-y-1">
                  {conversations.map((conv: NonNullable<typeof conversations>[number]) => (
                    <button
                      key={conv._id}
                      onClick={() => handleSelectConversation(conv._id)}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                        selectedConversationId === conv._id
                          ? "bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      <p className="text-sm font-medium truncate">{conv.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-[10px]">{conv.platform}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
              <div className="p-4 border-b bg-muted/30 space-y-4 shrink-0">
                <div className="grid sm:grid-cols-3 gap-4">
              {/* Platform */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Platform</Label>
                <Select value={platform} onValueChange={setPlatform} disabled={isGenerating}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Niche */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                  Niche <span className="text-destructive">*</span>
                </Label>
                <Select value={niche} onValueChange={(value) => {
                  setNiche(value);
                      if (value !== "Other") setCustomNiche("");
                }} disabled={isGenerating}>
                      <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((n) => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                  </div>

                  {/* Buyer Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Client Name</Label>
                    <Input
                      placeholder="e.g., John"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      disabled={isGenerating}
                      className="h-9"
                    />
                  </div>
                </div>

                {niche === "Other" && (
                  <Input
                    placeholder="Enter your custom niche"
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                    disabled={isGenerating}
                    className="h-9"
                  />
                )}

                {/* Advanced Options Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Advanced options
                    {(portfolioLink || customInstructions || keyPoints.length > 0) && (
                    <Badge variant="secondary" className="text-[10px]">Active</Badge>
                  )}
                </button>

                {showAdvanced && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs flex items-center gap-1">
                          <Link className="w-3 h-3" />
                          Portfolio Link
                      </Label>
                      <Input
                          placeholder="https://..."
                        value={portfolioLink}
                        onChange={(e) => setPortfolioLink(e.target.value)}
                          className="h-9 text-sm"
                      />
                    </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Custom Instructions</Label>
                        <Input
                          placeholder="How should the AI respond?"
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                          className="h-9 text-sm"
                      />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Key Points to Include</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., I have 5 years experience"
                          value={newKeyPoint}
                          onChange={(e) => setNewKeyPoint(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyPoint())}
                          className="h-9 text-sm flex-1"
                        />
                        <Button variant="outline" size="icon" onClick={handleAddKeyPoint} className="h-9 w-9">
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      {keyPoints.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {keyPoints.map((point, i) => (
                            <Badge key={i} variant="secondary" className="text-xs gap-1 py-1">
                              <span className="max-w-[150px] truncate">{point}</span>
                              <button onClick={() => handleRemoveKeyPoint(i)} className="hover:text-destructive">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Profile hint */}
              {currentUser?.profession && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 rounded-lg px-3 py-2">
                    <Lightbulb className="w-4 h-4 text-primary shrink-0" />
                    <span>Using your {currentUser.style || "professional"} style with {currentUser.skills?.length || 0} skills</span>
                  </div>
                )}
                </div>
              )}

            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto overscroll-contain min-h-0"
            >
              {!hasMessages && !isGenerating ? (
                // Empty State
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold mb-2">Convert Client Messages</h2>
                  <p className="text-muted-foreground text-sm max-w-sm mb-6">
                    Paste a client's message below and I'll craft a winning response. Continue the conversation as they reply!
                  </p>
                  
                  {!finalNiche && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-4 py-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Select a niche in settings to get started</span>
                    </div>
                  )}
                </div>
              ) : (
                // Messages
                <div className="space-y-4">
                  {selectedConversation?.messages?.map((msg: NonNullable<typeof selectedConversation.messages>[number], idx: number) => (
                    <div key={idx} className="space-y-3">
                      {/* Client Message */}
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="max-w-[80%] bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                          <p className="text-sm whitespace-pre-wrap">{msg.buyerMessage}</p>
                        </div>
                      </div>
                      
                      {/* Your Response */}
                      <div className="flex gap-3 justify-end">
                        <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3 group relative">
                          <p className="text-sm whitespace-pre-wrap">{msg.generatedResponse}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(msg.generatedResponse, idx)}
                            className="absolute -right-10 top-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isGenerating && (
                    <div className="flex gap-3 justify-end">
                      <div className="bg-primary/10 rounded-2xl rounded-tr-md px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">{loadingTip}</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                  </div>
                </div>
              )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Usage Warning */}
            {usageCheck && !usageCheck.canGenerate && (
              <div className="px-4 pb-2 shrink-0">
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{usageCheck.reason}</span>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t bg-background shrink-0">
              <div className="flex gap-2 items-end">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    hasMessages
                      ? "Paste the client's reply to continue..."
                      : "Paste the client's message here..."
                  }
                  className="min-h-[52px] max-h-[150px] resize-none flex-1"
                  disabled={isGenerating}
                />
                
                {isGenerating ? (
                    <Button
                      onClick={handleStop}
                      variant="destructive"
                    size="icon"
                    className="h-[52px] w-[52px] rounded-xl shrink-0"
                  >
                    <StopCircle className="w-5 h-5" />
                    </Button>
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={!isInputValid || !usageCheck?.canGenerate}
                    size="icon"
                    className="h-[52px] w-[52px] rounded-xl shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{message.length}/20+ characters</span>
                {usageCheck?.canGenerate && usageCheck.remaining !== undefined && (
                  <span>{usageCheck.remaining} conversions left</span>
                )}
                  </div>
                </div>
          </Card>
        </div>
      </main>
    </>
  );
}

export default function ConverterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ConverterContent />
    </Suspense>
  );
}
