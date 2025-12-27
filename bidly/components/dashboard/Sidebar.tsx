"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { 
  PenSquare, 
  History, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Sparkles,
  Zap,
  X,
  MessageSquare,
  Scale,
  User,
  FileText,
  Reply,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const mainNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "New Proposal", href: "/dashboard/new", icon: PenSquare },
  { name: "Message Converter", href: "/dashboard/converter", icon: Reply },
  { name: "Templates", href: "/dashboard/templates", icon: FileText },
  { name: "Profile Generator", href: "/dashboard/profile", icon: User },
  { name: "History", href: "/dashboard/history", icon: History },
];

const aiFeatures = [
  { name: "BidlyAI Chat", href: "/dashboard/chat", icon: MessageSquare, isNew: true },
  { name: "Work-Life Balance", href: "/dashboard/balance", icon: Scale, isNew: true },
];

const settingsNavigation = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when navigating
    if (onClose) {
      onClose();
    }
  };

  const userInitials = user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U";

  const NavItem = ({ item }: { item: { name: string; href: string; icon: React.ElementType; isNew?: boolean } }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={handleNavClick}
        className={cn(
          "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 relative min-w-0 max-w-full",
          isActive
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        <span className="truncate min-w-0 flex-1">{item.name}</span>
        {item.isNew && !isActive && (
          <span className="absolute right-2 sm:right-3 px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold bg-gradient-to-r from-primary to-purple-500 text-white rounded-full shrink-0">
            NEW
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "w-56 sm:w-64 bg-card border-r border-border flex flex-col h-screen fixed left-0 top-0 z-50",
          "transition-transform duration-300 ease-in-out",
          // Mobile: hidden by default, show when isOpen
          // Desktop (lg+): always visible
          isOpen 
            ? "translate-x-0" 
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-14 sm:h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 min-w-0 max-w-full">
          <Link href="/dashboard" className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1" onClick={handleNavClick}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
            </div>
            <span className="text-lg sm:text-xl font-semibold tracking-tight truncate min-w-0">Bidly</span>
          </Link>
          
          {/* Close button - mobile only */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden shrink-0 h-9 w-9"
            onClick={onClose}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto min-w-0 max-w-full">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>

          {/* AI Features Section */}
          <div className="pt-4">
            <div className="px-3 sm:px-4 pb-2 min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                <span className="truncate">AI Features</span>
              </p>
            </div>
            <div className="space-y-1">
              {aiFeatures.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="pt-4">
            <Separator className="mb-4" />
            <div className="space-y-1">
              {settingsNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          </div>
        </nav>

        {/* Quick action */}
        <div className="px-3 sm:px-4 py-3 sm:py-4 min-w-0 max-w-full">
          <Link href="/dashboard/new" onClick={handleNavClick} className="w-full block min-w-0 max-w-full">
            <Button className="w-full gap-1.5 sm:gap-2 h-11 sm:h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 text-xs sm:text-sm min-w-0 max-w-full">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Generate Proposal</span>
            </Button>
          </Link>
        </div>

        {/* User section */}
        <div className="border-t border-border p-3 sm:p-4 space-y-2 sm:space-y-3 min-w-0 max-w-full">
          {user && (
            <div className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2 min-w-0">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 max-w-full">
                <p className="text-xs sm:text-sm font-medium truncate break-words overflow-wrap-anywhere">
                  {user.fullName || user.firstName || "User"}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate break-words overflow-wrap-anywhere">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 sm:gap-3 text-muted-foreground hover:text-foreground text-xs sm:text-sm min-w-0 max-w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="truncate">Sign Out</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
