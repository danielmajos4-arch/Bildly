# Deployment Guide for Bidly

## Step-by-Step Deployment Instructions

### Prerequisites
- Node.js installed
- Vercel account (logged in via CLI)
- Convex account (will be created during setup)
- Clerk account with API keys
- Anthropic API key

---

## Step 1: Initialize Convex Backend

**You need to run this command interactively:**

```bash
cd bidly
npx convex dev
```

This will:
- Open your browser to log in to Convex (or create an account)
- Create a new Convex project
- Generate a `convex.json` file
- Set up your `.env.local` with Convex deployment URL

**Important:** Let it run until you see "Convex functions are ready!" then press `Ctrl+C` to stop it.

---

## Step 2: Deploy Convex Backend to Production

After Step 1 is complete, run:

```bash
npx convex deploy
```

This will:
- Deploy your Convex functions to production
- Give you a production Convex URL (save this!)

**Copy the production URL** - you'll need it for Vercel environment variables.

---

## Step 3: Set Environment Variables in Vercel

Go to your Vercel project dashboard:
1. Navigate to: https://vercel.com/majostechs-projects/bidly/settings/environment-variables
2. Add these environment variables:

### Required Variables:

| Variable Name | Value | Where to Get It |
|--------------|-------|----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_...` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | `sk_...` | Clerk Dashboard → API Keys |
| `CLERK_JWT_ISSUER_DOMAIN` | `https://...clerk.accounts.dev` | Clerk Dashboard → Domains |
| `NEXT_PUBLIC_CONVEX_URL` | `https://...convex.cloud` | From Step 2 (Convex deployment) |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Anthropic Dashboard |

### Optional Variables:

| Variable Name | Value |
|--------------|-------|
| `ADMIN_EMAIL` | Your admin email address |

**Important:** Make sure to select "Production", "Preview", and "Development" for each variable (or select "All" when adding).

---

## Step 4: Deploy to Vercel

After setting all environment variables, deploy:

```bash
vercel --prod
```

Or use the Vercel dashboard "Deploy" button.

---

## Step 5: Configure Clerk for Production

After deployment:
1. Go to Clerk Dashboard → Configure → Domains
2. Add your Vercel domain (e.g., `your-app.vercel.app`)
3. Update production domain settings

---

## Troubleshooting

### Build fails with "No address provided to ConvexReactClient"
- Make sure `NEXT_PUBLIC_CONVEX_URL` is set in Vercel environment variables
- Redeploy after adding the variable

### Build fails with "Missing publishableKey"
- Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in Vercel
- Redeploy after adding the variable

### Convex deployment fails
- Make sure you've run `npx convex dev` first
- Check that `convex.json` exists in your project

---

## Quick Reference Commands

```bash
# Initialize Convex (interactive - run this first!)
npx convex dev

# Deploy Convex backend
npx convex deploy

# Deploy to Vercel
vercel --prod

# Check Vercel deployment status
vercel ls
```






