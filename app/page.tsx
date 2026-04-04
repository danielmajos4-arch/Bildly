import Image from "next/image";
import Link from "next/link";
import { SiX } from "react-icons/si";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { TbFileSearch } from "react-icons/tb";
import { FaPaperPlane } from "react-icons/fa6";
import {
  TbClipboardCheck,
  TbUserEdit,
  TbApps,
  TbSignature,
  TbFileStack,
  TbStopwatch,
} from "react-icons/tb";
import { LandingNav } from "@/components/landing/LandingNav";
import {
  Feather,
  Star,
  FileText,
  Clock,
  BellOff,
  XCircle,
  CheckCircle2,
  ArrowRight,
  Mail,
} from "lucide-react";

/* ─── DATA ─────────────────────────────────────── */

const PROBLEM_CARDS = [
  {
    icon: FileText,
    title: "Generic proposals",
    body: "ChatGPT proposals all sound the same. Clients can smell a template from a mile away.",
  },
  {
    icon: Clock,
    title: "Hours wasted",
    body: "Writing a tailored proposal for every job post takes time most freelancers don't have.",
  },
  {
    icon: BellOff,
    title: "No replies",
    body: "You send 10 proposals and hear nothing back. You don't even know what went wrong.",
  },
];

const STEPS = [
  {
    num: "01",
    icon: HiOutlineClipboardDocumentList,
    title: "Paste the job post",
    body: "Drop in any Upwork, Fiverr, or freelancer job description.",
  },
  {
    num: "02",
    icon: TbFileSearch,
    title: "Bidly reads and thinks",
    body: "Our AI analyzes what the client actually wants \u2014 not just what they wrote.",
  },
  {
    num: "03",
    icon: FaPaperPlane,
    title: "Get a winning proposal",
    body: "A personalized, send-ready proposal in your voice. In under 30 seconds.",
  },
];

const FEATURES = [
  {
    icon: TbClipboardCheck,
    title: "Proposal Scoring",
    body: "Every proposal gets scored on Hook, Specificity, Credibility, Clarity, and CTA. You know before you send.",
  },
  {
    icon: TbUserEdit,
    title: "Profile Optimizer",
    body: "Paste your Upwork profile. Get a rewritten version that ranks higher and converts more views into interviews.",
  },
  {
    icon: TbApps,
    title: "Platform Aware",
    body: "Works for Upwork, Fiverr, Freelancer.com, and direct outreach. Not locked to one platform.",
  },
  {
    icon: TbSignature,
    title: "Writes In Your Voice",
    body: "Trained on your skill set, experience, and platform. Every proposal sounds like you, not a robot.",
  },
  {
    icon: TbFileStack,
    title: "Proposal History",
    body: "Every proposal saved. Search, copy, or regenerate with one click.",
  },
  {
    icon: TbStopwatch,
    title: "30 Second Generation",
    body: "No waiting. Paste the job, hit generate, send the proposal. That fast.",
  },
];

/* fictional — replace with real testimonials when available */
const TESTIMONIALS = [
  {
    quote:
      "I built Bidly because I was tired of losing Upwork jobs to weaker devs with better proposals. Now I use it myself for every application. The proposal scoring alone changed how I think about pitching \u2014 it told me my hooks were weak before I even hit send. First week using it properly, my reply rate doubled.",
    name: "Daniel Oyinloluwa",
    role: "Full-Stack Developer & Founder of Bidly",
  },
  {
    quote:
      "I was sending 20 proposals a week and getting nothing. After Bidly, I\u2019m getting replies on 3 out of every 5.",
    name: "Priya K.",
    role: "UI/UX Designer on Fiverr",
  },
  {
    quote:
      "The proposal scoring is what got me. It told me my hooks were weak before I even sent them. Game changer.",
    name: "David O.",
    role: "Full-Stack Developer",
  },
];

const LOGOS = [
  { src: "https://cdn.worldvectorlogo.com/logos/upwork-1.svg", alt: "Upwork", width: 120 },
  { src: "https://cdn.worldvectorlogo.com/logos/fiverr-1.svg", alt: "Fiverr", width: 120 },
  { src: "https://cdn.worldvectorlogo.com/logos/freelancer-1.svg", alt: "Freelancer.com", width: 120 },
  { src: "https://cdn.worldvectorlogo.com/logos/toptal-1.svg", alt: "Toptal", width: 120 },
  { src: "https://cdn.worldvectorlogo.com/logos/linkedin-icon-2.svg", alt: "LinkedIn", width: 120 },
];

/* ─── COMPONENTS ───────────────────────────────── */

function StarRating() {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-16 sm:mb-20 md:mb-24">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 mb-4">
        {eyebrow}
      </p>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance text-gray-900 leading-[1.15]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-500 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── PAGE ─────────────────────────────────────── */

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <LandingNav />

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 sm:pt-40 md:pt-44 sm:pb-24 md:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-600/10 text-emerald-600 rounded-full text-sm font-medium px-5 py-2 mb-10">
            <Feather className="w-4 h-4 shrink-0" aria-hidden />
            AI-Powered Proposal Generator
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-balance text-gray-900 leading-[1.08] sm:leading-[1.06]">
            Stop Losing Jobs to
            <br />
            <span className="text-emerald-600">Bad Proposals.</span>
          </h1>

          <p className="mt-8 sm:mt-10 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Bidly reads the job post, understands what the client wants, and writes a winning proposal in your voice. In 30 seconds.
          </p>

          <div className="mt-12 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              href="/sign-up"
              className="bg-emerald-600 text-white font-semibold rounded-full px-8 py-3 hover:bg-emerald-700 transition-colors text-base"
            >
              Start Winning Free
            </Link>
            <a
              href="#how-it-works"
              className="bg-white text-gray-600 font-semibold rounded-full px-8 py-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-base"
            >
              See How It Works
            </a>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-400 leading-relaxed">
            <StarRating />
            <span>Trusted by freelancers on Upwork &amp; Fiverr</span>
          </div>

          <div className="relative max-w-4xl mx-auto mt-20 sm:mt-24 rounded-2xl overflow-hidden shadow-2xl border border-gray-200/80">
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200/60">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400 ml-4">bidly.space/dashboard/new</span>
            </div>
            <Image
              src="/dashboard-screenshot.png"
              alt="Bidly AI proposal generator dashboard"
              width={1200}
              height={750}
              className="w-full"
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="bg-gray-50 py-16 sm:py-20 overflow-hidden">
        <p className="text-sm text-gray-400 text-center mb-10 sm:mb-12 font-medium tracking-wide">
          Trusted by freelancers winning jobs on
        </p>
        <div className="flex overflow-hidden">
          <div className="carousel-track flex items-center whitespace-nowrap">
            {[0, 1, 2, 3].map((copy) => (
              <div key={copy} className="flex items-center shrink-0">
                {LOGOS.map((logo) => (
                  <div
                    key={`${copy}-${logo.alt}`}
                    className="flex items-center justify-center w-[200px] shrink-0 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.width}
                      height={40}
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-24 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeader
            eyebrow="The Problem"
            title="Every freelancer faces the same nightmare."
            subtitle="You know you can do the work. But your proposals aren't landing."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {PROBLEM_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg leading-snug">{card.title}</h3>
                  <p className="text-gray-500 text-[15px] leading-7">{card.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 md:py-28 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeader
            eyebrow="How It Works"
            title="From job post to winning proposal in 3 steps."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10 lg:gap-12 items-start">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative flex flex-col items-center text-center">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 -right-5 text-gray-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}

                  <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-600/20">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3">
                    Step {step.num}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg mb-3 leading-snug">{step.title}</h3>
                  <p className="text-gray-500 text-[15px] leading-7 max-w-[280px]">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeader
            eyebrow="Features"
            title="Everything you need to win more jobs."
            subtitle="Powerful tools built specifically for freelancers who compete on proposals."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3 leading-snug">{feature.title}</h3>
                  <p className="text-gray-500 text-[15px] leading-7">{feature.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="py-24 md:py-28 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeader
            eyebrow="The Difference"
            title="What Bidly writes vs what most freelancers send."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-red-500 mb-4 flex items-center gap-2 tracking-wide">
                <XCircle className="w-4 h-4 shrink-0" /> Without Bidly
              </h3>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex-1">
                <p className="text-gray-500 text-[15px] leading-7 italic">
                  &ldquo;Hi, I am a full stack developer with 5 years of experience. I am writing to express my interest in your project. I have worked on many similar projects and I am confident I can deliver what you need...&rdquo;
                </p>
                <p className="text-xs text-red-400 font-medium mt-6 tracking-wide">Generic. Ignored. No reply.</p>
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-green-600 mb-4 flex items-center gap-2 tracking-wide">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> With Bidly
              </h3>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-8 flex-1">
                <p className="text-gray-700 text-[15px] leading-7">
                  &ldquo;Relationship conflict analysis needs more than standard NLP &mdash; it needs context-aware sentiment detection that stays genuinely neutral. That&apos;s the hard part, and it&apos;s where most implementations fail.
                </p>
                <p className="text-gray-700 text-[15px] leading-7 mt-5">
                  Here&apos;s my approach: OCR + GPT fine-tuned on conflict detection, Python backend with entity recognition, React frontend with real-time feedback users actually trust.
                </p>
                <p className="text-gray-700 text-[15px] leading-7 mt-5">
                  One question &mdash; are you envisioning one-time analysis or a learning system that builds profiles over time?&rdquo;
                </p>
                <p className="text-xs text-green-600 font-medium mt-6 tracking-wide">Specific. Personal. Gets replies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeader
            eyebrow="Pricing"
            title="Simple pricing for serious freelancers."
            subtitle="Start free. Upgrade when you're ready. No hidden fees. No surprises."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Bidly Free */}
            <div className="bg-white border border-gray-200 rounded-2xl p-9 sm:p-10 shadow-sm flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900">Bidly Free</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">Get started at no cost</p>
              <p className="mt-8 text-4xl font-bold text-gray-900">
                $0 <span className="text-sm font-normal text-gray-500">/ month</span>
              </p>
              <ul className="mt-10 space-y-4 text-sm leading-relaxed flex-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> 10 proposals per month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Profile Optimizer (1 use per month)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Proposal history</li>
                <li className="flex items-center gap-2 text-gray-400"><XCircle className="w-4 h-4 text-gray-300 shrink-0" /> Proposal scoring</li>
                <li className="flex items-center gap-2 text-gray-400"><XCircle className="w-4 h-4 text-gray-300 shrink-0" /> Unlimited proposals</li>
                <li className="flex items-center gap-2 text-gray-400"><XCircle className="w-4 h-4 text-gray-300 shrink-0" /> Priority support</li>
              </ul>
              <Link
                href="/sign-up"
                className="mt-10 block text-center font-semibold text-gray-700 border border-gray-200 rounded-full py-3.5 hover:bg-gray-50 transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Bidly Plus */}
            <div className="bg-white border-2 border-emerald-600 rounded-2xl p-9 sm:p-10 shadow-lg shadow-emerald-100 flex flex-col">
              <span className="inline-block bg-emerald-600 text-white text-xs font-semibold rounded-full px-3 py-1.5 mb-4 w-fit tracking-wide">
                Most Popular
              </span>
              <h3 className="text-lg font-semibold text-gray-900">Bidly Plus</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">For freelancers serious about winning</p>
              <p className="mt-8 text-4xl font-bold text-emerald-600">
                $4.99 <span className="text-sm font-normal text-gray-500">/ month</span>
              </p>
              <p className="text-xs text-gray-400 mt-2 tracking-wide">Billed monthly. Cancel anytime.</p>
              <ul className="mt-10 space-y-4 text-sm leading-relaxed flex-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited proposals</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Proposal scoring (Hook, Specificity, Credibility, Clarity, CTA)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Profile Optimizer (unlimited)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Full proposal history + search</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Priority support</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Early access to new features</li>
              </ul>
              <Link
                href="/sign-up"
                className="mt-10 block text-center font-semibold text-white bg-emerald-600 rounded-full py-3.5 hover:bg-emerald-700 transition-colors"
              >
                Start Bidly Plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 md:py-28 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeader
            eyebrow="Testimonials"
            title="Freelancers winning more jobs."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow duration-200"
              >
                <div className="mb-6">
                  <StarRating />
                </div>
                <p className="text-gray-700 text-[15px] leading-7 flex-1 mb-8">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-gray-100 pt-6">
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 md:py-32 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white text-balance leading-[1.12]">
            Your next job is one
            <br />
            proposal away.
          </h2>
          <p className="mt-8 sm:mt-10 text-lg text-gray-400 max-w-lg mx-auto leading-relaxed">
            Start free. No credit card required. Generate your first winning proposal in 60 seconds.
          </p>
          <Link
            href="/sign-up"
            className="mt-12 inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold rounded-full px-10 py-4 text-lg hover:bg-emerald-700 transition-colors"
          >
            Start Winning Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-5">
              <Link href="/" className="inline-block leading-none">
                <Image
                  src="/bidly-logo.png"
                  alt="Bidly"
                  width={560}
                  height={168}
                  className="h-20 w-auto sm:h-24 md:h-[7rem]"
                  sizes="(max-width: 768px) 280px, 400px"
                />
              </Link>
              <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-sm">
                AI proposals that sound like you — so you win more freelance work without the grind.
              </p>
            </div>

            <div className="lg:col-span-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Product
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <a href="#features" className="hover:text-emerald-600 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-emerald-600 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-600 transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Company
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 hover:text-emerald-600 transition-colors"
                  >
                    <Mail className="w-4 h-4 shrink-0 text-gray-400" aria-hidden />
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-emerald-600 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-emerald-600 transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm text-gray-400 order-2 sm:order-1">
              &copy; {new Date().getFullYear()} Bidly. All rights reserved.
            </p>
            <div className="flex items-center gap-3 order-1 sm:order-2">
              <a
                href="https://x.com/bidly_space"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-sm hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                aria-label="Bidly on X"
              >
                <SiX className="h-[1.125rem] w-[1.125rem]" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
