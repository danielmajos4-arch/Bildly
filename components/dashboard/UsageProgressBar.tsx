"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function usageBarIndicatorStyle(
  proposalsUsed: number,
  proposalsLimit: number
): CSSProperties {
  const pct = Math.min(100, (proposalsUsed / proposalsLimit) * 100);
  let backgroundColor: string | undefined;
  if (proposalsUsed >= proposalsLimit) {
    backgroundColor = "#EF4444";
  } else if (proposalsUsed >= proposalsLimit * 0.8) {
    backgroundColor = "#F59E0B";
  }
  return {
    width: `${pct}%`,
    ...(backgroundColor ? { backgroundColor } : {}),
  };
}

interface UsageProgressBarProps {
  proposalsUsed: number;
  proposalsLimit: number;
  trackClassName?: string;
}

/**
 * Shared proposal quota bar: brand fill under 80%, amber at 80%+, red at limit.
 */
export function UsageProgressBar({
  proposalsUsed,
  proposalsLimit,
  trackClassName,
}: UsageProgressBarProps) {
  return (
    <div
      className={cn(
        "bg-gray-200 rounded-full overflow-hidden",
        trackClassName ?? "h-1.5"
      )}
    >
      <div
        className="h-full rounded-full transition-all duration-500 bg-brand-600"
        style={usageBarIndicatorStyle(proposalsUsed, proposalsLimit)}
      />
    </div>
  );
}
