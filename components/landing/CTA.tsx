"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FadeUp, ScaleIn, FloatingElement } from "./Animations";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration with floating animation */}
      <div className="absolute inset-0 -z-10">
        <FloatingElement duration={12} distance={40}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        </FloatingElement>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center min-w-0 max-w-full">
        <FadeUp>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 break-words overflow-wrap-anywhere px-2 sm:px-0">
            Ready to Win More Work?
          </h2>
        </FadeUp>
        
        <FadeUp delay={0.15}>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 break-words overflow-wrap-anywhere px-2 sm:px-0">
            Join thousands of freelancers who are already landing more clients 
            with AI-powered proposals. Start free today.
          </p>
        </FadeUp>
        
        <ScaleIn delay={0.3}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-2 sm:px-0">
            <Button 
              asChild 
              size="lg"
              className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto min-w-0 max-w-full"
            >
              <Link href="/sign-up" className="flex items-center justify-center gap-2 min-w-0 w-full">
                <span className="truncate">Get Started Free</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              </Link>
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground break-words overflow-wrap-anywhere">
              No credit card required • 3 free proposals
            </p>
          </div>
        </ScaleIn>
      </div>
    </section>
  );
}
