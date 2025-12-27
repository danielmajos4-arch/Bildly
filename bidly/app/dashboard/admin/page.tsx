"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Shield,
  AlertCircle,
} from "lucide-react";

const PROFESSIONS = [
  { value: "all", label: "All Users" },
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "writer", label: "Writer" },
  { value: "marketer", label: "Marketer" },
  { value: "va", label: "Virtual Assistant" },
  { value: "consultant", label: "Consultant" },
];

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<Id<"coachingRules"> | null>(null);

  // Form state
  const [triggerKeywords, setTriggerKeywords] = useState("");
  const [userProfession, setUserProfession] = useState<string>("all");
  const [customInstruction, setCustomInstruction] = useState("");
  const [priority, setPriority] = useState("1");
  const [active, setActive] = useState(true);

  const adminCheck = useQuery(api.admin.isAdmin);
  const rules = useQuery(api.coachingRules.getAllRules, { includeInactive: true });
  const createRule = useMutation(api.coachingRules.createRule);
  const updateRule = useMutation(api.coachingRules.updateRule);
  const deleteRule = useMutation(api.coachingRules.deleteRule);

  useEffect(() => {
    if (adminCheck !== undefined) {
      setIsAdmin(adminCheck);
      if (!adminCheck) {
        toast.error("Access denied. Admin only.");
        router.push("/dashboard");
      }
    }
  }, [adminCheck, router]);

  const resetForm = () => {
    setTriggerKeywords("");
    setUserProfession("all");
    setCustomInstruction("");
    setPriority("1");
    setActive(true);
    setEditingId(null);
    setIsCreating(false);
  };

  const handleEdit = (rule: NonNullable<typeof rules>[number]) => {
    setEditingId(rule._id);
    setTriggerKeywords(rule.triggerKeywords.join(", "));
    setUserProfession(rule.userProfession || "all");
    setCustomInstruction(rule.customInstruction);
    setPriority(rule.priority.toString());
    setActive(rule.active);
    setIsCreating(true);
  };

  const handleDelete = async (id: Id<"coachingRules">) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      await deleteRule({ ruleId: id });
      toast.success("Rule deleted");
    } catch (error) {
      console.error("Error deleting rule:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete rule";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!triggerKeywords.trim()) {
      toast.error("Please enter at least one trigger keyword");
      return;
    }

    if (!customInstruction.trim()) {
      toast.error("Please enter a custom instruction");
      return;
    }

    try {
      const keywordsArray = triggerKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const professionValue = userProfession === "all" ? undefined : userProfession;

      if (editingId) {
        await updateRule({
          ruleId: editingId,
          triggerKeywords: keywordsArray,
          userProfession: professionValue,
          customInstruction,
          priority: parseInt(priority),
          active,
        });
        toast.success("Rule updated!");
      } else {
        await createRule({
          triggerKeywords: keywordsArray,
          userProfession: professionValue,
          customInstruction,
          priority: parseInt(priority),
          active,
        });
        toast.success("Rule created!");
      }

      resetForm();
    } catch (error) {
      console.error("Error saving rule:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save rule";
      toast.error(errorMessage);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Header title="Admin Dashboard" subtitle="Access Denied" />
        <main className="p-4 sm:p-6 lg:p-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have permission to access this page.
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="Admin Dashboard"
        subtitle="Manage coaching rules to customize AI responses"
      />

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rules List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Coaching Rules</h2>
              <Button
                onClick={() => {
                  resetForm();
                  setIsCreating(true);
                }}
                className="gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                New Rule
              </Button>
            </div>

            {/* Create/Edit Form */}
            {isCreating && (
              <Card className="border-0 shadow-lg border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">
                        {editingId ? "Edit Rule" : "Create New Rule"}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={resetForm}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Trigger Keywords */}
                    <div className="space-y-2">
                      <Label htmlFor="keywords">
                        Trigger Keywords <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="keywords"
                        placeholder="time blocking, schedule, calendar (comma-separated)"
                        value={triggerKeywords}
                        onChange={(e) => setTriggerKeywords(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter keywords separated by commas. Rule triggers when user message contains any of these keywords.
                      </p>
                    </div>

                    {/* User Profession */}
                    <div className="space-y-2">
                      <Label htmlFor="profession">User Profession</Label>
                      <Select value={userProfession} onValueChange={setUserProfession}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select profession (or leave for all users)" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROFESSIONS.map((prof) => (
                            <SelectItem key={prof.value} value={prof.value}>
                              {prof.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Leave empty to apply to all users, or select a specific profession.
                      </p>
                    </div>

                    {/* Custom Instruction */}
                    <div className="space-y-2">
                      <Label htmlFor="instruction">
                        Custom Instruction <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="instruction"
                        placeholder="Always suggest specific time ranges (e.g., '9am-11am' not 'morning'). Recommend 2-hour focused blocks."
                        value={customInstruction}
                        onChange={(e) => setCustomInstruction(e.target.value)}
                        className="resize-none"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        This instruction will be appended to the AI's system prompt when the rule matches.
                      </p>
                    </div>

                    {/* Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Input
                          id="priority"
                          type="number"
                          min="1"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Higher priority rules are applied first. Default: 1
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            id="active"
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            className="w-4 h-4 rounded"
                          />
                          <Label htmlFor="active" className="cursor-pointer">
                            Active
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="gap-2">
                        <Save className="w-4 h-4" />
                        {editingId ? "Update" : "Create"} Rule
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Rules List */}
            {rules === undefined ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading rules...</p>
                </CardContent>
              </Card>
            ) : rules.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No rules yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first coaching rule to customize AI responses.
                  </p>
                  <Button onClick={() => setIsCreating(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create First Rule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {rules.map((rule: NonNullable<typeof rules>[number]) => (
                  <Card
                    key={rule._id}
                    className={`border-0 shadow-lg overflow-hidden ${
                      !rule.active ? "opacity-60" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="font-semibold text-lg">
                              {rule.triggerKeywords.join(", ")}
                            </h4>
                            {!rule.active && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            <Badge variant="outline">
                              Priority: {rule.priority}
                            </Badge>
                            {rule.userProfession && (
                              <Badge variant="secondary">
                                {PROFESSIONS.find((p) => p.value === rule.userProfession)?.label || rule.userProfession}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {rule.customInstruction}
                          </p>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(rule)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(rule._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Coaching rules allow you to customize how the AI responds to users based on keywords and context.
                </p>
                <div className="space-y-2">
                  <div>
                    <strong className="text-foreground">Trigger Keywords:</strong> When a user's message contains any of these keywords, the rule activates.
                  </div>
                  <div>
                    <strong className="text-foreground">User Profession:</strong> Optionally limit the rule to specific user types (e.g., developers only).
                  </div>
                  <div>
                    <strong className="text-foreground">Priority:</strong> Higher priority rules are applied first when multiple rules match.
                  </div>
                  <div>
                    <strong className="text-foreground">Custom Instruction:</strong> This text is appended to the AI's system prompt, guiding its response.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="text-lg">Example Rule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>Keywords:</strong> time blocking, schedule
                </div>
                <div>
                  <strong>Profession:</strong> All Users
                </div>
                <div>
                  <strong>Instruction:</strong> Always suggest specific time ranges (e.g., '9am-11am' not 'morning'). Recommend 2-hour focused blocks.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

