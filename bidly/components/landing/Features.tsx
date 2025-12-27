"use client";

import { Zap, Fingerprint, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FadeUp, StaggerContainer, StaggerItem } from "./Animations";

const features = [
  {
    icon: Zap,
    title: "Generate in Seconds",
    description: "Stop spending 30+ minutes on each proposal. Our AI creates tailored proposals in seconds, not hours.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Fingerprint,
    title: "Personalized Every Time",
    description: "Each proposal is unique. Our AI uses your skills, experience, and portfolio to craft winning pitches.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Optimized for Upwork, Fiverr, Freelancer, and any other platform. Same quality, every time.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <FadeUp>
          <div className="text-center mb-12 sm:mb-14 md:mb-16 px-2 sm:px-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4 break-words overflow-wrap-anywhere min-w-0">
              Why Freelancers Love Bidly
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto break-words overflow-wrap-anywhere min-w-0 px-2 sm:px-0">
              We&apos;ve helped thousands of freelancers win more work with less effort. 
              Here&apos;s what makes us different.
            </p>
          </div>
        </FadeUp>
        
        {/* Features grid */}
        <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.12}>
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <Card 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card h-full"
              >
                <CardContent className="p-4 sm:p-6 md:p-8 min-w-0 max-w-full">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4 sm:mb-5 md:mb-6 shrink-0`}>
                    <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 min-w-0 break-words overflow-wrap-anywhere">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base break-words overflow-wrap-anywhere min-w-0">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
        
        {/* Stats */}
        <StaggerContainer className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 px-2 sm:px-0" staggerDelay={0.1}>
          {[
            { value: "10K+", label: "Proposals Generated" },
            { value: "85%", label: "Higher Response Rate" },
            { value: "30s", label: "Average Generation Time" },
            { value: "4.9★", label: "User Rating" },
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="text-center min-w-0 max-w-full">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2 break-words">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground break-words overflow-wrap-anywhere px-1">{stat.label}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
