"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  Plus,
  Loader2,
  Bot,
  User,
  Sparkles,
  Scale,
  Trash2,
  Clock,
  Calendar,
  CheckCircle,
  X,
  Edit2,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type ConversationType = "general" | "balance" | "proposal";

type DetectedActivity = {
  name: string;
  category: string;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string[];
  priority?: number;
  notes?: string;
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [chatType, setChatType] = useState<ConversationType>("balance");
  const [detectedActivities, setDetectedActivities] = useState<DetectedActivity[] | null>(null);
  const [isCreatingActivities, setIsCreatingActivities] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const conversations = useQuery(api.chat.getUserConversations, {});
  const currentConversation = useQuery(
    api.chat.getConversation,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip"
  );

  const sendChatMessage = useAction(api.ai.sendChatMessage);
  const sendBalanceMessage = useAction(api.ai.sendBalanceMessage);
  const createActivitiesBatch = useMutation(api.activities.createActivitiesBatch);
  const deleteConversation = useMutation(api.chat.deleteConversation);
  const updateConversationTitle = useMutation(api.chat.updateConversationTitle);
  
  const [renamingId, setRenamingId] = useState<Id<"conversations"> | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState<Id<"conversations"> | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const scrollToBottom = () => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      };
      // Small delay to ensure DOM is updated
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [currentConversation?.messages, isLoading]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);
    setDetectedActivities(null); // Clear previous detected activities

    try {
      let result;
      
      if (chatType === "balance") {
        result = await sendBalanceMessage({
          message: userMessage,
          conversationId: selectedConversationId || undefined,
        });
        
        // Check if activities were detected
        if (result.activities && result.activities.length > 0) {
          setDetectedActivities(result.activities);
        }
      } else {
        result = await sendChatMessage({
          message: userMessage,
          conversationId: selectedConversationId || undefined,
          type: chatType,
        });
      }

      if (!selectedConversationId && result.conversationId) {
        setSelectedConversationId(result.conversationId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateActivities = async () => {
    if (!detectedActivities || detectedActivities.length === 0) return;

    setIsCreatingActivities(true);
    try {
      const result = await createActivitiesBatch({
        activities: detectedActivities,
      });

      toast.success(`Successfully created ${result.count} activit${result.count === 1 ? "y" : "ies"}!`, {
        action: {
          label: "View Schedule",
          onClick: () => window.location.href = "/dashboard/balance",
        },
      });

      setDetectedActivities(null);
    } catch (error) {
      console.error("Error creating activities:", error);
      toast.error("Failed to create activities. Please try again.");
    } finally {
      setIsCreatingActivities(false);
    }
  };

  const handleCancelActivities = () => {
    setDetectedActivities(null);
  };

  const handleNewChat = () => {
    setSelectedConversationId(null);
    setMessage("");
  };

  const handleDeleteConversation = async (conversationId: Id<"conversations">) => {
    if (!confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteConversation({ conversationId });
      toast.success("Conversation deleted");
      
      // If we deleted the currently selected conversation, clear selection
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
        setMessage("");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete conversation";
      toast.error(errorMessage);
    }
  };

  const handleStartRename = (conversationId: Id<"conversations">, currentTitle: string) => {
    setRenamingId(conversationId);
    setRenameValue(currentTitle);
    // Focus input after state update
    setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 0);
  };

  const handleSaveRename = async (conversationId: Id<"conversations">) => {
    if (!renameValue.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      await updateConversationTitle({
        conversationId,
        title: renameValue.trim(),
      });
      toast.success("Conversation renamed");
      setRenamingId(null);
      setRenameValue("");
    } catch (error) {
      console.error("Error renaming conversation:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to rename conversation";
      toast.error(errorMessage);
    }
  };

  const handleCancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  // Handle Enter/Escape keys in rename input
  const handleRenameKeyDown = (e: React.KeyboardEvent, conversationId: Id<"conversations">) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveRename(conversationId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelRename();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const getChatTypeIcon = (type: string) => {
    switch (type) {
      case "balance":
        return <Scale className="w-4 h-4 text-green-500" />;
      case "proposal":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <>
      <Header
        title="BidlyAI Chat"
        subtitle="Your personal AI assistant for freelancing and life balance"
      />

      <main className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-10rem)] overflow-hidden flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* Sidebar - Conversations List */}
          <Card className="border-0 shadow-lg lg:col-span-1 hidden lg:flex lg:flex-col">
            <div className="p-4 border-b">
              <Button
                onClick={handleNewChat}
                className="w-full gap-2"
                variant="default"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </div>

            {/* Chat Type Selector */}
            <div className="p-4 border-b space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Chat Mode
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={chatType === "general" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChatType("general")}
                  className="gap-1.5 text-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  General
                </Button>
                <Button
                  variant={chatType === "balance" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChatType("balance")}
                  className="gap-1.5 text-xs"
                >
                  <Scale className="w-3.5 h-3.5" />
                  Balance
                </Button>
              </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversations?.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No conversations yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start a new chat above
                    </p>
                  </div>
                ) : (
                  conversations?.map((conv: NonNullable<typeof conversations>[number]) => (
                    <DropdownMenu 
                      key={conv._id}
                      open={contextMenuOpen === conv._id}
                      onOpenChange={(open) => setContextMenuOpen(open ? conv._id : null)}
                    >
                      <div
                        className={`group relative w-full text-left p-3 rounded-lg transition-all min-w-0 ${
                          selectedConversationId === conv._id
                            ? "bg-primary/10 border-l-2 border-l-primary"
                            : "hover:bg-muted/50"
                        }`}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenuOpen(conv._id);
                        }}
                      >
                        {renamingId === conv._id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              ref={renameInputRef}
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => handleRenameKeyDown(e, conv._id)}
                              onBlur={() => handleSaveRename(conv._id)}
                              className="h-8 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setSelectedConversationId(conv._id)}
                              className="w-full text-left flex-1 min-w-0"
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                <div className="shrink-0 mt-0.5">
                                  {getChatTypeIcon(conv.type)}
                                </div>
                                <div className="flex-1 min-w-0 pr-8">
                                  <p className="text-sm font-medium break-words overflow-wrap-anywhere line-clamp-2">
                                    {conv.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3 shrink-0" />
                                    {formatDate(conv.updatedAt)}
                                  </p>
                                </div>
                              </div>
                            </button>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContextMenuOpen(conv._id);
                                }}
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                          </>
                        )}
                      </div>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem
                          onClick={() => {
                            handleStartRename(conv._id, conv.title);
                            setContextMenuOpen(null);
                          }}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            handleDeleteConversation(conv._id);
                            setContextMenuOpen(null);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Main Chat Area */}
          <Card className="border-0 shadow-lg lg:col-span-3 flex flex-col overflow-hidden min-h-0">
            {/* Mobile: New Chat & Mode Selector */}
            <div className="lg:hidden p-4 border-b flex items-center gap-2">
              <Button
                onClick={handleNewChat}
                size="sm"
                variant="outline"
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                New
              </Button>
              <Button
                variant={chatType === "general" ? "default" : "outline"}
                size="sm"
                onClick={() => setChatType("general")}
                className="gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                General
              </Button>
              <Button
                variant={chatType === "balance" ? "default" : "outline"}
                size="sm"
                onClick={() => setChatType("balance")}
                className="gap-1.5"
              >
                <Scale className="w-4 h-4" />
                Balance
              </Button>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 p-4 overflow-y-auto overscroll-contain min-h-0"
            >
              {!currentConversation?.messages?.length ? (
                // Welcome Screen
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                    <Bot className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {chatType === "balance" ? "Work-Life Balance Coach" : "Hey there! 👋"}
                  </h2>
                  <p className="text-muted-foreground max-w-md mb-8">
                    {chatType === "balance"
                      ? "I'm here to help you balance your work, health, education, and personal life. Tell me about your daily activities and I'll help you optimize your time."
                      : "I'm BidlyAI, your freelancing companion. Ask me anything about proposals, freelancing tips, or just chat!"}
                  </p>
                  
                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {chatType === "balance" ? (
                      <>
                        <SuggestionChip
                          text="I'm juggling too many things"
                          onClick={() => setMessage("I'm juggling too many things - I'm a student, freelance developer, and trying to stay fit. How do I manage it all?")}
                        />
                        <SuggestionChip
                          text="Create a weekly schedule"
                          onClick={() => setMessage("Can you help me create a realistic weekly schedule? I work as a developer, go to school, and want time for gym and personal projects.")}
                        />
                        <SuggestionChip
                          text="I feel burnt out"
                          onClick={() => setMessage("I've been feeling burnt out lately. I work long hours and can't seem to find time for myself. What should I do?")}
                        />
                      </>
                    ) : (
                      <>
                        <SuggestionChip
                          text="How do I win more proposals?"
                          onClick={() => setMessage("How do I win more proposals on Upwork? What makes a proposal stand out?")}
                        />
                        <SuggestionChip
                          text="Review my proposal strategy"
                          onClick={() => setMessage("Can you help me review my proposal strategy? I've been sending proposals but not getting responses.")}
                        />
                        <SuggestionChip
                          text="Tips for new freelancers"
                          onClick={() => setMessage("I'm new to freelancing. What are your top tips for getting started and landing first clients?")}
                        />
                      </>
                    )}
                  </div>
                </div>
              ) : (
                // Messages List
                <div className="space-y-6">
                  {currentConversation.messages.map((msg: NonNullable<typeof currentConversation.messages>[number], index: number) => (
                    <div
                      key={msg._id || index}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                        <p
                          className={`text-xs mt-2 ${
                            msg.role === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Schedule Creation Confirmation */}
            {detectedActivities && detectedActivities.length > 0 && (
              <div className="p-4 border-t bg-gradient-to-br from-green-500/10 to-green-500/5 flex-shrink-0">
                <Card className="border-green-500/20 shadow-lg">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Schedule Detected!</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          I found {detectedActivities.length} activit{detectedActivities.length === 1 ? "y" : "ies"} to add to your schedule. Review and confirm:
                        </p>
                        
                        {/* Activities Preview */}
                        <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4">
                          {detectedActivities.map((activity, index) => {
                            const categoryColors: Record<string, string> = {
                              work: "#6366f1",
                              health: "#22c55e",
                              education: "#f59e0b",
                              personal: "#ec4899",
                              "side-hustle": "#8b5cf6",
                            };
                            const categoryLabels: Record<string, string> = {
                              work: "Work",
                              health: "Health",
                              education: "Education",
                              personal: "Personal",
                              "side-hustle": "Side Hustle",
                            };
                            
                            const formatTime12h = (time24?: string) => {
                              if (!time24) return "";
                              const [hours, minutes] = time24.split(":").map(Number);
                              const period = hours >= 12 ? "PM" : "AM";
                              const hours12 = hours % 12 || 12;
                              return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
                            };

                            const formatDays = (days?: string[]) => {
                              if (!days || days.length === 0) return "No days specified";
                              if (days.length === 7) return "Every day";
                              if (days.length === 5 && 
                                  days.includes("monday") && days.includes("tuesday") && 
                                  days.includes("wednesday") && days.includes("thursday") && 
                                  days.includes("friday") && !days.includes("saturday") && 
                                  !days.includes("sunday")) {
                                return "Weekdays";
                              }
                              if (days.length === 2 && days.includes("saturday") && days.includes("sunday")) {
                                return "Weekends";
                              }
                              return days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ");
                            };

                            return (
                              <div
                                key={index}
                                className="p-3 rounded-lg bg-muted/50 border border-border"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium">{activity.name}</h4>
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                        style={{
                                          backgroundColor: `${categoryColors[activity.category] || "#64748b"}15`,
                                          color: categoryColors[activity.category] || "#64748b",
                                        }}
                                      >
                                        {categoryLabels[activity.category] || activity.category}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                      {activity.startTime && activity.endTime && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {formatTime12h(activity.startTime)} - {formatTime12h(activity.endTime)}
                                        </span>
                                      )}
                                      {activity.daysOfWeek && activity.daysOfWeek.length > 0 && (
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {formatDays(activity.daysOfWeek)}
                                        </span>
                                      )}
                                      {activity.priority && (
                                        <span>Priority: {activity.priority}/5</span>
                                      )}
                                    </div>
                                    {activity.notes && (
                                      <p className="text-xs text-muted-foreground mt-1 italic">
                                        {activity.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCreateActivities}
                            disabled={isCreatingActivities}
                            className="flex-1 gap-2"
                          >
                            {isCreatingActivities ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Create Schedule
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={handleCancelActivities}
                            variant="outline"
                            disabled={isCreatingActivities}
                            className="gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex-shrink-0">
              <div className="flex gap-3 items-end">
                <Textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    chatType === "balance"
                      ? "Tell me about your daily activities and goals..."
                      : "Ask me anything about freelancing..."
                  }
                  className="min-h-[52px] max-h-[200px] resize-none overflow-y-auto"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  size="icon"
                  className="h-[52px] w-[52px] rounded-xl shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {chatType === "balance" 
                  ? "💡 Tip: Share your current schedule and responsibilities for personalized advice"
                  : "💡 Tip: Be specific about your situation for better advice"}
              </p>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}

// Suggestion Chip Component
function SuggestionChip({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm transition-colors border border-border hover:border-primary/30"
    >
      {text}
    </button>
  );
}

