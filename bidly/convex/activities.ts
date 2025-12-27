import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Calculate hours between two times (24-hour format strings like "08:00")
function calculateHoursBetween(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  // Handle overnight schedules (e.g., 22:00 to 06:00)
  let diffMinutes = endMinutes - startMinutes;
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Add 24 hours
  }
  
  return Math.round((diffMinutes / 60) * 100) / 100; // Round to 2 decimals
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    work: "#6366f1", // Indigo
    health: "#22c55e", // Green
    education: "#f59e0b", // Amber
    personal: "#ec4899", // Pink
    "side-hustle": "#8b5cf6", // Purple
  };
  return colors[category] || "#64748b"; // Default slate
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY QUERIES
// ═══════════════════════════════════════════════════════════════════════════

// Get all activities for the current user
export const getUserActivities = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Return only active activities by default, sorted by start time
    return activities
      .filter(a => a.isActive !== false)
      .sort((a, b) => {
        // Sort by start time if available
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        // Otherwise sort by priority
        return (b.priority || 0) - (a.priority || 0);
      });
  },
});

// Get activity statistics
export const getActivityStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const activeActivities = activities.filter(a => a.isActive !== false);
    
    // Calculate stats by category
    const categoryStats: Record<string, { hours: number; count: number }> = {};
    let totalHours = 0;

    for (const activity of activeActivities) {
      const hours = activity.hoursPerWeek || 0;
      totalHours += hours;
      
      if (!categoryStats[activity.category]) {
        categoryStats[activity.category] = { hours: 0, count: 0 };
      }
      categoryStats[activity.category].hours += hours;
      categoryStats[activity.category].count += 1;
    }

    // Calculate percentages
    const breakdown = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      hours: stats.hours,
      count: stats.count,
      percentage: totalHours > 0 ? Math.round((stats.hours / totalHours) * 100) : 0,
    }));

    // Build daily schedule for gap analysis
    const scheduleByDay: Record<string, Array<{ activity: string; start: string; end: string }>> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    for (const activity of activeActivities) {
      if (activity.startTime && activity.endTime && activity.daysOfWeek) {
        for (const day of activity.daysOfWeek) {
          if (scheduleByDay[day]) {
            scheduleByDay[day].push({
              activity: activity.name,
              start: activity.startTime,
              end: activity.endTime,
            });
          }
        }
      }
    }

    // Sort each day's schedule by start time
    for (const day of Object.keys(scheduleByDay)) {
      scheduleByDay[day].sort((a, b) => a.start.localeCompare(b.start));
    }

    return {
      totalActivities: activeActivities.length,
      totalHoursPerWeek: Math.round(totalHours * 10) / 10,
      averageHoursPerDay: Math.round((totalHours / 7) * 10) / 10,
      breakdown: breakdown.sort((a, b) => b.hours - a.hours),
      isOverworked: totalHours > 60, // More than 60 hours/week
      hasBalance: breakdown.some(b => b.category === "health" || b.category === "personal"),
      scheduleByDay,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════

// Add a new activity
export const addActivity = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    daysOfWeek: v.optional(v.array(v.string())),
    priority: v.optional(v.number()),
    notes: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Calculate hours from time range
    let hoursPerDay = 0;
    let hoursPerWeek = 0;
    
    if (args.startTime && args.endTime) {
      hoursPerDay = calculateHoursBetween(args.startTime, args.endTime);
      const daysCount = args.daysOfWeek?.length || 0;
      hoursPerWeek = Math.round(hoursPerDay * daysCount * 10) / 10;
    }

    // Build schedule string for display
    const scheduleStr = args.startTime && args.endTime
      ? `${formatTime(args.startTime)} - ${formatTime(args.endTime)}`
      : undefined;

    const now = Date.now();
    const activityId = await ctx.db.insert("activities", {
      userId: user._id,
      name: args.name,
      category: args.category,
      startTime: args.startTime,
      endTime: args.endTime,
      daysOfWeek: args.daysOfWeek,
      hoursPerDay,
      hoursPerWeek,
      priority: args.priority || 3,
      schedule: scheduleStr,
      notes: args.notes,
      color: args.color || getCategoryColor(args.category),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return activityId;
  },
});

// Update an activity
export const updateActivity = mutation({
  args: {
    activityId: v.id("activities"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    daysOfWeek: v.optional(v.array(v.string())),
    priority: v.optional(v.number()),
    notes: v.optional(v.string()),
    color: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { activityId, ...updates } = args;
    
    // Verify ownership
    const activity = await ctx.db.get(activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || activity.userId !== user._id) {
      throw new Error("Not authorized");
    }

    // Calculate new hours if times are being updated
    const startTime = updates.startTime ?? activity.startTime;
    const endTime = updates.endTime ?? activity.endTime;
    const daysOfWeek = updates.daysOfWeek ?? activity.daysOfWeek;

    let hoursPerDay = activity.hoursPerDay;
    let hoursPerWeek = activity.hoursPerWeek;
    let schedule = activity.schedule;

    if (startTime && endTime) {
      hoursPerDay = calculateHoursBetween(startTime, endTime);
      const daysCount = daysOfWeek?.length || 0;
      hoursPerWeek = Math.round(hoursPerDay * daysCount * 10) / 10;
      schedule = `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }

    await ctx.db.patch(activityId, {
      ...updates,
      hoursPerDay,
      hoursPerWeek,
      schedule,
      updatedAt: Date.now(),
    });

    return activityId;
  },
});

// Delete an activity
export const deleteActivity = mutation({
  args: {
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const activity = await ctx.db.get(args.activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || activity.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.activityId);
    return true;
  },
});

// Create multiple activities at once (batch creation)
export const createActivitiesBatch = mutation({
  args: {
    activities: v.array(
      v.object({
        name: v.string(),
        category: v.string(),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        daysOfWeek: v.optional(v.array(v.string())),
        priority: v.optional(v.number()),
        notes: v.optional(v.string()),
        color: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (!args.activities || args.activities.length === 0) {
      throw new Error("No activities provided");
    }

    const createdIds: string[] = [];
    const now = Date.now();

    // Create all activities
    for (const activityData of args.activities) {
      // Validate required fields
      if (!activityData.name || !activityData.name.trim()) {
        continue; // Skip invalid activities
      }

      // Validate category
      const validCategories = ["work", "health", "education", "personal", "side-hustle"];
      const category = validCategories.includes(activityData.category)
        ? activityData.category
        : "personal";

      // Calculate hours from time range
      let hoursPerDay = 0;
      let hoursPerWeek = 0;
      let schedule: string | undefined;

      if (activityData.startTime && activityData.endTime) {
        hoursPerDay = calculateHoursBetween(activityData.startTime, activityData.endTime);
        const daysCount = activityData.daysOfWeek?.length || 0;
        hoursPerWeek = Math.round(hoursPerDay * daysCount * 10) / 10;
        schedule = `${formatTime(activityData.startTime)} - ${formatTime(activityData.endTime)}`;
      }

      const activityId = await ctx.db.insert("activities", {
        userId: user._id,
        name: activityData.name.trim(),
        category,
        startTime: activityData.startTime,
        endTime: activityData.endTime,
        daysOfWeek: activityData.daysOfWeek || [],
        hoursPerDay,
        hoursPerWeek,
        priority: activityData.priority || 3,
        schedule,
        notes: activityData.notes,
        color: activityData.color || getCategoryColor(category),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      createdIds.push(activityId);
    }

    return {
      createdIds,
      count: createdIds.length,
    };
  },
});

// Helper to format 24-hour time to 12-hour display
function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}
