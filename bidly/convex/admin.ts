import { query } from "./_generated/server";

/**
 * Check if the current authenticated user is an admin
 * Admin is determined by matching email against ADMIN_EMAIL environment variable
 */
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      // If no admin email is set, no one is admin (fail-safe)
      return false;
    }

    // Get user from database to check email
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return false;
    }

    // Check if user's email matches admin email (case-insensitive)
    return user.email.toLowerCase() === adminEmail.toLowerCase();
  },
});

/**
 * Helper function to check admin status and throw error if not admin
 * Use this in mutations that require admin access
 */
export async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error("Admin access not configured");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  if (user.email.toLowerCase() !== adminEmail.toLowerCase()) {
    throw new Error("Admin access required");
  }

  return user;
}

