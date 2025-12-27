# Bidly - AI-Powered Freelance Proposal Generator

Win more freelance work with AI-powered proposals that get you hired on Upwork, Fiverr, and beyond.

## Features

- **AI Proposal Generator** - Generate personalized, converting proposals in seconds
- **Message Converter** - Convert buyer messages into winning responses (back-and-forth conversation support)
- **Template Library** - Pre-built templates for common freelance niches
- **Profile Generator** - Optimize your freelancer profiles for different platforms
- **Proposal Analysis** - Get optimization scores and improvement suggestions
- **Work-Life Balance** - AI-powered scheduling assistant
- **BidlyAI Chat** - General-purpose AI assistant for freelancers

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (serverless backend)
- **Authentication**: Clerk
- **AI**: Anthropic Claude (Sonnet 4)
- **UI Components**: Radix UI, shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Convex account
- Clerk account
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bidly
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
# Format: pk_test_... or pk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_ISSUER_DOMAIN=your_clerk_domain

# Convex Backend
# Get this after running: npx convex deploy
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Admin (optional - for admin features)
ADMIN_EMAIL=your_admin_email@example.com
```

⚠️ **Important for Builds**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `NEXT_PUBLIC_CONVEX_URL` are required during the build process. The build will fail if these are not set. For production deployments on Vercel, these must be configured in the Vercel dashboard before building.

4. Set up Convex:

```bash
npx convex dev
```

This will:
- Create a Convex project (if needed)
- Push the schema
- Set up environment variables in Convex dashboard

5. Set up Clerk:

- Create a Clerk account at https://clerk.com
- Create a new application
- Configure authentication providers
- Add your domain to allowed origins
- Copy the keys to your `.env.local`

6. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

### Required

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key  
- `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT issuer domain
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude

### Optional

- `ADMIN_EMAIL` - Email address for admin access to coaching rules

### Convex Environment Variables

Set these in your Convex dashboard:

- `ANTHROPIC_API_KEY` - Same as above
- `ADMIN_EMAIL` - Same as above

## Project Structure

```
bidly/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── onboarding/        # User onboarding
│   └── ...                # Other pages
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── landing/           # Landing page components
│   └── ui/                # UI primitives
├── convex/                # Convex backend
│   ├── ai.ts              # AI actions
│   ├── proposals.ts       # Proposal queries/mutations
│   ├── users.ts           # User management
│   └── schema.ts          # Database schema
└── lib/                   # Utilities
```

## Usage Limits

Free tier includes:
- 10 proposals per month
- 2 profile generations per month
- Unlimited message conversions (shares proposal limit)

## Deployment

### Vercel (Recommended)

#### Prerequisites
- GitHub account with your code pushed to a repository
- Vercel account (sign up at https://vercel.com)
- Convex project deployed (see Convex Deployment below)
- Clerk application configured with production domain

#### Step-by-Step Deployment

1. **Deploy Convex Backend First**:
   ```bash
   cd bidly
   npx convex deploy
   ```
   This will give you your production `NEXT_PUBLIC_CONVEX_URL`. Save this for step 4.

2. **Push Code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Import Project to Vercel**:
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository
   - **Important**: If your Next.js app is in a subdirectory (`bidly/`), configure:
     - **Root Directory**: Set to `bidly` (or leave blank if deploying from root)
     - **Framework Preset**: Next.js (auto-detected)
     - **Build Command**: `npm run build` (or leave default)
     - **Output Directory**: `.next` (default)
     - **Install Command**: `npm install` (default)

4. **Configure Environment Variables**:
   In Vercel dashboard, go to your project → Settings → Environment Variables and add:
   
   **Required Variables**:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_JWT_ISSUER_DOMAIN=your_clerk_domain
   NEXT_PUBLIC_CONVEX_URL=your_production_convex_url
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```
   
   **Optional Variables**:
   ```
   ADMIN_EMAIL=your_admin_email@example.com
   ```
   
   ⚠️ **Important**: Make sure to add these for **Production**, **Preview**, and **Development** environments (or select "All" when adding).

5. **Configure Clerk for Production**:
   - Go to your Clerk Dashboard → Configure → Domains
   - Add your Vercel domain (e.g., `your-app.vercel.app`)
   - Update your production domain in Clerk settings

6. **Deploy**:
   - Click "Deploy" in Vercel
   - Wait for the build to complete
   - Your app will be live at `https://your-app.vercel.app`

7. **Set Custom Domain (Optional)**:
   - In Vercel dashboard → Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed
   - Update Clerk domain settings with your custom domain

#### Troubleshooting

- **Build Fails**: Check build logs in Vercel dashboard. Common issues:
  - Missing environment variables
  - TypeScript errors
  - Missing dependencies

- **Authentication Issues**: Ensure Clerk domain is configured correctly and environment variables match

- **Convex Connection Issues**: Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly and Convex is deployed

### Convex Deployment

Deploy your Convex backend to production:

```bash
cd bidly
npx convex deploy
```

This will:
- Deploy your Convex functions and schema
- Give you a production URL (use this for `NEXT_PUBLIC_CONVEX_URL`)
- Set up production environment variables in Convex dashboard

**Don't forget**: Set `ANTHROPIC_API_KEY` and `ADMIN_EMAIL` in your Convex dashboard under Settings → Environment Variables.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Private - All rights reserved
