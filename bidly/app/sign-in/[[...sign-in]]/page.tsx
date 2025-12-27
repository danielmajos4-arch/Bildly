"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Clerk SignIn */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
          </div>
          <span className="text-xl sm:text-2xl font-semibold tracking-tight">Bidly</span>
        </Link>

        <SignIn 
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
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366F1_1px,transparent_1px),linear-gradient(to_bottom,#6366F1_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative text-center max-w-lg">
          <blockquote className="text-2xl font-medium text-foreground mb-6 italic">
            &ldquo;Bidly helped me increase my proposal acceptance rate by 3x. 
            I went from struggling to find clients to having more work than I can handle.&rdquo;
          </blockquote>
          <div>
            <p className="font-semibold text-foreground">Sarah Chen</p>
            <p className="text-sm text-muted-foreground">Freelance Designer, Upwork Top Rated</p>
          </div>
        </div>
      </div>
    </div>
  );
}

