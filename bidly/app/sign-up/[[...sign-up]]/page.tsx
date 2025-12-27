"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Zap, Check } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative text-white max-w-lg">
          <h2 className="text-4xl font-bold mb-6">
            Start winning more freelance work today
          </h2>
          <ul className="space-y-4">
            {[
              "Generate personalized proposals in seconds",
              "Stand out from thousands of other freelancers",
              "Increase your response rate by up to 85%",
              "Works with Upwork, Fiverr, and more",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-white/90">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side - Clerk SignUp */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
          </div>
          <span className="text-xl sm:text-2xl font-semibold tracking-tight">Bidly</span>
        </Link>

        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-primary hover:bg-primary/90 text-sm normal-case",
              card: "shadow-none",
              headerTitle: "text-2xl font-bold",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: 
                "border-2 hover:bg-muted/50",
              formFieldInput: 
                "h-11 border-input focus:ring-primary",
              footerActionLink: 
                "text-primary hover:text-primary/90",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}

