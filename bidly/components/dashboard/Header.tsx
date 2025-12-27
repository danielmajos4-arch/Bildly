"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const proposalCount = useQuery(api.proposals.getProposalCount) ?? 0;
  const { open } = useSidebar();

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-3 sm:px-4 md:px-8 sticky top-0 z-40 min-w-0 max-w-full">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden shrink-0 h-9 w-9"
          onClick={open}
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        
        <div className="min-w-0 flex-1 max-w-full">
          <h1 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight truncate break-words overflow-wrap-anywhere">{title}</h1>
          {subtitle && (
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate break-words overflow-wrap-anywhere">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <Badge variant="secondary" className="px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs md:text-sm min-w-0 max-w-full">
          <span className="truncate">{proposalCount}</span> <span className="hidden sm:inline">proposals</span>
        </Badge>
      </div>
    </header>
  );
}
