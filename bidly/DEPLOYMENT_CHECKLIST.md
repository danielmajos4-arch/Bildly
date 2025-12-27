# Deployment Readiness Checklist

## Pre-Deployment Checklist

### ✅ Code Readiness
- [x] All pages marked as dynamic where needed (`force-dynamic`)
- [x] Build configuration verified (`next.config.ts`)
- [x] TypeScript compilation passes
- [x] No critical console errors
- [x] All dependencies installed and up to date

### ⚠️ Required Before Building

**IMPORTANT**: The build process requires environment variables to be set. Without them, the build will fail.

#### For Local Builds:
1. Create `.env.local` file in the `bidly/` directory
2. Copy values from `.env.example` and fill in your actual keys
3. Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with `pk_test_` or `pk_live_`

#### For Production Builds (Vercel):
- Environment variables MUST be set in Vercel dashboard before building
- They will be automatically available during the build process
- See "Environment Variables Setup" section below

### 🔑 Environment Variables Setup

#### Required Variables:

1. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**
   - Format: `pk_test_...` or `pk_live_...`
   - Get from: Clerk Dashboard → API Keys
   - ⚠️ Must be set for build to succeed

2. **CLERK_SECRET_KEY**
   - Format: `sk_test_...` or `sk_live_...`
   - Get from: Clerk Dashboard → API Keys
   - Used at runtime only

3. **CLERK_JWT_ISSUER_DOMAIN**
   - Format: `https://your-app.clerk.accounts.dev`
   - Get from: Clerk Dashboard → Domains

4. **NEXT_PUBLIC_CONVEX_URL**
   - Format: `https://your-deployment.convex.cloud`
   - Get from: Running `npx convex deploy`
   - ⚠️ Must be set for build to succeed

5. **ANTHROPIC_API_KEY**
   - Format: `sk-ant-...`
   - Get from: Anthropic Console
   - Used at runtime only

#### Optional Variables:
- **ADMIN_EMAIL**: Email for admin access to coaching rules

### 📦 Convex Backend Setup

1. **Initialize Convex** (if not done):
   ```bash
   cd bidly
   npx convex dev
   ```
   - This creates a Convex project
   - Generates `convex.json`
   - Sets up `.env.local` with Convex URL

2. **Deploy Convex to Production**:
   ```bash
   npx convex deploy
   ```
   - Saves the production URL
   - Use this URL for `NEXT_PUBLIC_CONVEX_URL` in Vercel

3. **Set Convex Environment Variables**:
   - Go to Convex Dashboard → Settings → Environment Variables
   - Add: `ANTHROPIC_API_KEY`
   - Add: `ADMIN_EMAIL` (optional)

### 🚀 Vercel Deployment Steps

1. **Push Code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - **Root Directory**: Set to `bidly` (if app is in subdirectory)
   - Framework: Next.js (auto-detected)

3. **Set Environment Variables in Vercel**:
   - Go to: Project → Settings → Environment Variables
   - Add all required variables (see above)
   - ⚠️ **Critical**: Select "Production", "Preview", AND "Development" for each variable
   - Or select "All" when adding

4. **Deploy**:
   - Click "Deploy" in Vercel dashboard
   - Or use CLI: `vercel --prod`
   - Build will use environment variables automatically

5. **Configure Clerk for Production**:
   - Go to Clerk Dashboard → Configure → Domains
   - Add your Vercel domain: `your-app.vercel.app`
   - Update production domain settings

### ✅ Post-Deployment Verification

- [ ] App loads at Vercel URL
- [ ] Authentication works (sign in/sign up)
- [ ] Dashboard accessible after login
- [ ] Proposal generation works
- [ ] Convex connection verified
- [ ] No console errors in browser
- [ ] Mobile responsive design works

### 🐛 Troubleshooting

#### Build Fails with "Missing publishableKey"
- **Cause**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` not set in Vercel
- **Fix**: Add the variable in Vercel dashboard and redeploy

#### Build Fails with "Invalid publishableKey"
- **Cause**: Key format is incorrect (must start with `pk_test_` or `pk_live_`)
- **Fix**: Verify key from Clerk dashboard and update in Vercel

#### Build Fails with "No address provided to ConvexReactClient"
- **Cause**: `NEXT_PUBLIC_CONVEX_URL` not set in Vercel
- **Fix**: Add the variable (from `npx convex deploy`) and redeploy

#### Authentication Not Working
- **Cause**: Clerk domain not configured for production
- **Fix**: Add Vercel domain to Clerk Dashboard → Domains

#### Convex Connection Issues
- **Cause**: Convex not deployed or URL incorrect
- **Fix**: Run `npx convex deploy` and verify URL in Vercel env vars

### 📝 Notes

- **Build Requirements**: Environment variables are required during build, not just runtime
- **Local Development**: Use `.env.local` for local builds and testing
- **Production**: All env vars must be set in Vercel before first deployment
- **Security**: Never commit `.env.local` or actual keys to git

### 🔄 Deployment Workflow

1. Develop locally with `.env.local`
2. Test build locally: `npm run build` (requires env vars)
3. Deploy Convex: `npx convex deploy`
4. Set env vars in Vercel
5. Push to GitHub
6. Vercel auto-deploys (or deploy manually)
7. Verify deployment
8. Configure Clerk domain
9. Test production app

---

**Status**: ✅ Code is ready for deployment once environment variables are configured in Vercel.

