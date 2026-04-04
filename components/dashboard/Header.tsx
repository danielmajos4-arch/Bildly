"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { open } = useSidebar();

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden h-9 w-9"
          onClick={open}
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[#1F2937] truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[#6B7280] truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}
