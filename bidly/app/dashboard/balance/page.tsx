"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Scale,
  Briefcase,
  Heart,
  GraduationCap,
  User2,
  Rocket,
  Trash2,
  Edit2,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Calendar,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { id: "work", label: "Work", icon: Briefcase, color: "#6366f1" },
  { id: "health", label: "Health", icon: Heart, color: "#22c55e" },
  { id: "education", label: "Education", icon: GraduationCap, color: "#f59e0b" },
  { id: "personal", label: "Personal", icon: User2, color: "#ec4899" },
  { id: "side-hustle", label: "Side Hustle", icon: Rocket, color: "#8b5cf6" },
];

const DAYS_OF_WEEK = [
  { id: "monday", label: "Mon", fullLabel: "Monday" },
  { id: "tuesday", label: "Tue", fullLabel: "Tuesday" },
  { id: "wednesday", label: "Wed", fullLabel: "Wednesday" },
  { id: "thursday", label: "Thu", fullLabel: "Thursday" },
  { id: "friday", label: "Fri", fullLabel: "Friday" },
  { id: "saturday", label: "Sat", fullLabel: "Saturday" },
  { id: "sunday", label: "Sun", fullLabel: "Sunday" },
];

// Helper to format 24-hour time to 12-hour display
function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Helper to format days array to readable string
function formatDays(days: string[]): string {
  if (days.length === 7) return "Every day";
  if (days.length === 5 && 
      days.includes("monday") && 
      days.includes("tuesday") && 
      days.includes("wednesday") && 
      days.includes("thursday") && 
      days.includes("friday") &&
      !days.includes("saturday") &&
      !days.includes("sunday")) {
    return "Weekdays";
  }
  if (days.length === 2 && 
      days.includes("saturday") && 
      days.includes("sunday")) {
    return "Weekends";
  }
  return days.map(d => DAYS_OF_WEEK.find(day => day.id === d)?.label || d).join(", ");
}

export default function BalancePage() {
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [editingId, setEditingId] = useState<Id<"activities"> | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [priority, setPriority] = useState("3");
  const [notes, setNotes] = useState("");

  const activities = useQuery(api.activities.getUserActivities) || [];
  const stats = useQuery(api.activities.getActivityStats);
  
  const addActivity = useMutation(api.activities.addActivity);
  const updateActivity = useMutation(api.activities.updateActivity);
  const deleteActivity = useMutation(api.activities.deleteActivity);

  const resetForm = () => {
    setName("");
    setCategory("");
    setStartTime("");
    setEndTime("");
    setSelectedDays([]);
    setPriority("3");
    setNotes("");
    setIsAddingActivity(false);
    setEditingId(null);
  };

  const toggleDay = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const selectWeekdays = () => {
    setSelectedDays(["monday", "tuesday", "wednesday", "thursday", "friday"]);
  };

  const selectWeekends = () => {
    setSelectedDays(["saturday", "sunday"]);
  };

  const selectAllDays = () => {
    setSelectedDays(DAYS_OF_WEEK.map(d => d.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !category) {
      toast.error("Please fill in the activity name and category");
      return;
    }

    if (!startTime || !endTime) {
      toast.error("Please enter the start and end times");
      return;
    }

    if (selectedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }

    try {
      if (editingId) {
        await updateActivity({
          activityId: editingId,
          name: name.trim(),
          category,
          startTime,
          endTime,
          daysOfWeek: selectedDays,
          priority: parseInt(priority),
          notes: notes.trim() || undefined,
        });
        toast.success("Activity updated!");
      } else {
        await addActivity({
          name: name.trim(),
          category,
          startTime,
          endTime,
          daysOfWeek: selectedDays,
          priority: parseInt(priority),
          notes: notes.trim() || undefined,
        });
        toast.success("Activity added!");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving activity:", error);
      toast.error("Failed to save activity");
    }
  };

  const handleEdit = (activity: typeof activities[0]) => {
    setEditingId(activity._id);
    setName(activity.name);
    setCategory(activity.category);
    setStartTime(activity.startTime || "");
    setEndTime(activity.endTime || "");
    setSelectedDays(activity.daysOfWeek || []);
    setPriority(activity.priority?.toString() || "3");
    setNotes(activity.notes || "");
    setIsAddingActivity(true);
  };

  const handleDelete = async (id: Id<"activities">) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    
    try {
      await deleteActivity({ activityId: id });
      toast.success("Activity deleted");
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("Failed to delete activity");
    }
  };

  const getCategoryData = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  };

  return (
    <>
      <Header
        title="Work-Life Balance"
        subtitle="Track your schedule and find your balance"
      />

      <main className="p-4 sm:p-6 lg:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activities</p>
                <p className="text-2xl font-bold">{stats?.totalActivities || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours/Week</p>
                <p className="text-2xl font-bold">{stats?.totalHoursPerWeek || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stats?.isOverworked ? "bg-red-500/10" : "bg-green-500/10"
              }`}>
                {stats?.isOverworked ? (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-bold">
                  {stats?.isOverworked ? "Overworked" : "Balanced"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <Button asChild className="w-full h-full min-h-[60px] gap-2">
                <Link href="/dashboard/chat">
                  <MessageSquare className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Get AI Advice</p>
                    <p className="text-xs opacity-80">Find free time slots</p>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activities List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Your Schedule</h2>
              <Button
                onClick={() => setIsAddingActivity(true)}
                className="gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Add Activity
              </Button>
            </div>

            {/* Add/Edit Form */}
            {isAddingActivity && (
              <Card className="border-0 shadow-lg border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">
                        {editingId ? "Edit Activity" : "Add New Activity"}
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

                    {/* Activity Name & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">What activity? *</Label>
                        <Input
                          id="name"
                          placeholder="e.g., School, Work, Gym, Side Project"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                  />
                                  {cat.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        What time? *
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="startTime" className="text-xs text-muted-foreground">
                            From
                          </Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="endTime" className="text-xs text-muted-foreground">
                            To
                          </Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="text-center"
                          />
                        </div>
                      </div>
                      {startTime && endTime && (
                        <p className="text-sm text-muted-foreground">
                          ⏱️ {formatTime(startTime)} - {formatTime(endTime)}
                        </p>
                      )}
                    </div>

                    {/* Days Selection */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Which days? *
                      </Label>
                      
                      {/* Quick select buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={selectWeekdays}
                          className="text-xs"
                        >
                          Weekdays
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={selectWeekends}
                          className="text-xs"
                        >
                          Weekends
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={selectAllDays}
                          className="text-xs"
                        >
                          Every Day
                        </Button>
                      </div>

                      {/* Individual day buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {DAYS_OF_WEEK.map((day) => (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedDays.includes(day.id)
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>

                      {selectedDays.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          📅 {formatDays(selectedDays)} ({selectedDays.length} day{selectedDays.length !== 1 ? "s" : ""})
                        </p>
                      )}
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label>Priority Level</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p.toString())}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${
                              parseInt(priority) === p
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        1 = Low importance, 5 = Critical/Non-negotiable
                      </p>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional details... e.g., flexible timing, can be moved around"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="resize-none"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingId ? "Update" : "Add"} Activity
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Activities Grid */}
            {activities.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Scale className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No activities yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                    Tell me about your daily schedule - when do you go to school? Work? Gym? I'll help you find balance.
                  </p>
                  <Button onClick={() => setIsAddingActivity(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Activity
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activities.map((activity: NonNullable<typeof activities>[number]) => {
                  const catData = getCategoryData(activity.category);
                  const Icon = catData.icon;
                  
                  return (
                    <Card
                      key={activity._id}
                      className="border-0 shadow-lg overflow-hidden group"
                    >
                      <div
                        className="h-1"
                        style={{ backgroundColor: activity.color || catData.color }}
                      />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${activity.color || catData.color}15` }}
                            >
                              <Icon
                                className="w-6 h-6"
                                style={{ color: activity.color || catData.color }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-lg">{activity.name}</h4>
                              
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  {catData.label}
                                </Badge>
                                
                                {activity.startTime && activity.endTime && (
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                                  </span>
                                )}
                                
                                {activity.hoursPerDay && (
                                  <span className="text-sm font-medium text-primary">
                                    {activity.hoursPerDay}h/day
                                  </span>
                                )}
                              </div>

                              {activity.daysOfWeek && activity.daysOfWeek.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-2">
                                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {formatDays(activity.daysOfWeek)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    • {activity.hoursPerWeek}h/week
                                  </span>
                                </div>
                              )}

                              {activity.notes && (
                                <p className="text-sm text-muted-foreground mt-2 italic">
                                  "{activity.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {/* Priority indicator */}
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <div
                                  key={n}
                                  className={`w-1.5 h-4 rounded-full ${
                                    n <= (activity.priority || 3)
                                      ? "bg-primary"
                                      : "bg-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(activity)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDelete(activity._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Breakdown Sidebar */}
          <div className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  Weekly Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats?.breakdown && stats.breakdown.length > 0 ? (
                  <>
                    {stats.breakdown.map((item: NonNullable<typeof stats>['breakdown'][number]) => {
                      const catData = getCategoryData(item.category);
                      return (
                        <div key={item.category} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: catData.color }}
                              />
                              <span className="font-medium">{catData.label}</span>
                            </div>
                            <span className="text-muted-foreground">
                              {item.hours}h ({item.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor: catData.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-4 border-t mt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Committed</span>
                        <span className="font-semibold">
                          {stats.totalHoursPerWeek}h/week
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Daily Average</span>
                        <span className="font-semibold">
                          {stats.averageHoursPerDay}h/day
                        </span>
                      </div>
                      
                      {stats.isOverworked && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 text-red-600 text-sm">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                          <p>
                            You're committing to over 60 hours per week. This might lead to burnout.
                          </p>
                        </div>
                      )}
                      {!stats.hasBalance && activities.length > 0 && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600 text-sm">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                          <p>
                            Consider adding health or personal activities for better balance.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">Add activities to see your breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Advice Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/5 to-green-500/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  💡 AI Can Help You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Based on your schedule, the AI can:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    Find free time slots for new activities
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    Suggest optimal times for gym/exercise
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    Help balance work and personal time
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    Create a realistic daily routine
                  </li>
                </ul>
                <Button asChild className="w-full mt-2 gap-2">
                  <Link href="/dashboard/chat">
                    <MessageSquare className="w-4 h-4" />
                    Chat with AI
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
