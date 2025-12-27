# 🚀 Bidly.it - AI-Powered Freelance Proposal Generator

<div align="center">

**Win more freelance work with AI-powered proposals that get you hired on Upwork, Fiverr, and beyond.**

[![TypeScript](https://img.shields.io/badge/TypeScript-95.6%25-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Convex](https://img.shields.io/badge/Convex-Backend-orange?style=for-the-badge)](https://convex.dev/)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204-purple?style=for-the-badge)](https://anthropic.com/)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Proposal Generator** | Generate personalized, high-converting proposals in seconds |
| 💬 **Message Converter** | Convert buyer messages into winning responses with back-and-forth conversation support |
| 📝 **Template Library** | Pre-built templates for common freelance niches |
| 👤 **Profile Generator** | Optimize your freelancer profiles for different platforms |
| 📊 **Proposal Analysis** | Get optimization scores and improvement suggestions |
| ⚖️ **Work-Life Balance** | AI-powered scheduling assistant |
| 💡 **BidlyAI Chat** | General-purpose AI assistant for freelancers |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (serverless)
- **Authentication**: Clerk
- **AI**: Anthropic Claude (Sonnet 4)
- **UI**: Radix UI, shadcn/ui

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/danielmajos4-arch/Bildly.git
cd Bildly/bidly

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start Convex backend
npx convex dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📁 Project Structure

```
Bildly/
├── bidly/                  # Main Next.js application
│   ├── app/               # Next.js app directory
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── onboarding/    # User onboarding
│   │   └── ...           
│   ├── components/        # React components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── landing/       # Landing page components
│   │   └── ui/            # UI primitives (shadcn)
│   ├── convex/            # Convex backend functions
│   └── lib/               # Utilities
└── convex/                # Shared Convex configuration
```

---

## 🔐 Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk JWT issuer domain |
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |

### Optional

| Variable | Description |
|----------|-------------|
| `ADMIN_EMAIL` | Email for admin access |

---

## 📊 Usage Limits

**Free Tier includes:**
- ✅ 10 proposals per month
- ✅ 2 profile generations per month
- ✅ Unlimited message conversions

---

## 🚢 Deployment

### Vercel (Recommended)

1. Deploy Convex: `npx convex deploy`
2. Push to GitHub
3. Import to Vercel → Set root directory to `bidly`
4. Add environment variables
5. Deploy!

See [`bidly/DEPLOYMENT.md`](./bidly/DEPLOYMENT.md) for detailed instructions.

---

## 📄 License

Private - All rights reserved

---

<div align="center">

**Built with ❤️ for freelancers everywhere**

</div>

