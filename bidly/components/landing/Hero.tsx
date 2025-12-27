"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { 
  FadeUp, 
  FadeIn, 
  ScaleIn, 
  FloatingElement, 
  PulseGlow 
} from "./Animations";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background decoration with floating animation */}
      <div className="absolute inset-0 -z-10">
        <FloatingElement duration={8} distance={30}>
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
        </FloatingElement>
        <FloatingElement duration={10} distance={25}>
          <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
        </FloatingElement>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366F1_1px,transparent_1px),linear-gradient(to_bottom,#6366F1_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-[0.03]" />
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <ScaleIn delay={0.1}>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs md:text-sm font-medium mb-6 sm:mb-8 max-w-full min-w-0">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 shrink-0" />
            <span className="truncate">AI-Powered Proposal Generator</span>
          </div>
        </ScaleIn>
        
        {/* Headline */}
        <FadeUp delay={0.2}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground mb-4 sm:mb-6 px-2 sm:px-0 min-w-0 max-w-full break-words overflow-wrap-anywhere">
            Win More Freelance Work
            <br />
            <span className="text-primary">in 30 Seconds</span>
          </h1>
        </FadeUp>
        
        {/* Subheadline */}
        <FadeUp delay={0.35}>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 px-2 sm:px-4 min-w-0 break-words overflow-wrap-anywhere">
            AI-powered proposals that get you hired on Upwork, Fiverr, and beyond. 
            Stop spending hours writing — start winning more clients.
          </p>
        </FadeUp>
        
        {/* CTA Buttons */}
        <ScaleIn delay={0.5}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 px-2 sm:px-0 w-full max-w-full">
            <Button 
              asChild 
              size="lg" 
              className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 w-full sm:w-auto min-w-0 max-w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="/sign-up" className="flex items-center justify-center gap-2 min-w-0 w-full">
                <span className="truncate">Start Winning</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-2 w-full sm:w-auto min-w-0 max-w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="#features" className="truncate">See How It Works</Link>
            </Button>
          </div>
        </ScaleIn>
        
        {/* Trust indicators */}
        <FadeIn delay={0.65}>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-muted-foreground px-2 sm:px-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success shrink-0" />
              <span className="truncate">No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success shrink-0" />
              <span className="truncate">3 free proposals</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success shrink-0" />
              <span className="truncate">Works in seconds</span>
            </div>
          </div>
        </FadeIn>
        
        {/* Demo Preview */}
        <FadeUp delay={0.8} className="mt-12 sm:mt-16 relative mx-2 sm:mx-0 max-w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none h-full" />
          <PulseGlow className="rounded-xl sm:rounded-2xl max-w-full">
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-6 md:p-8 max-w-3xl mx-auto min-w-0 max-w-full">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 md:mb-4 min-w-0">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-red-400 shrink-0" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400 shrink-0" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-green-400 shrink-0" />
                <span className="ml-1.5 sm:ml-2 md:ml-4 text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate min-w-0">Bidly — Proposal Generator</span>
              </div>
              <div className="space-y-2 sm:space-y-3 md:space-y-4 text-left min-w-0">
                <div className="bg-muted rounded-lg p-2.5 sm:p-3 md:p-4 min-w-0 max-w-full">
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1 sm:mb-2">Job Description</p>
                  <p className="text-xs sm:text-sm md:text-base text-foreground break-words overflow-wrap-anywhere">Looking for a React developer to build a modern dashboard with real-time data visualization...</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 sm:p-3 md:p-4 min-w-0 max-w-full">
                  <p className="text-[10px] sm:text-xs md:text-sm text-primary mb-1 sm:mb-2 font-medium">Generated Proposal</p>
                  <p className="text-xs sm:text-sm md:text-base text-foreground leading-relaxed break-words overflow-wrap-anywhere">
                    Your dashboard project caught my attention immediately — real-time data visualization is exactly what I specialize in. 
                    Having built similar solutions for fintech and analytics platforms, I understand the technical challenges and user experience considerations involved...
                  </p>
                </div>
              </div>
            </div>
          </PulseGlow>
        </FadeUp>
      </div>
    </section>
  );
}
