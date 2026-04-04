"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  PenSquare,
  History,
  Settings,
  LogOut,
  LayoutDashboard,
  UserCheck,
  X,
  Feather,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile Optimizer", href: "/dashboard/profile-optimizer", icon: UserCheck },
  { name: "New Proposal", href: "/dashboard/new", icon: PenSquare },
  { name: "History", href: "/dashboard/history", icon: History },
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
  const usageStats = useQuery(api.users.getUsageStats);

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const userInitials =
    user?.firstName?.[0] ||
    user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ||
    "U";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-50",
          "transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo — shorter on mobile drawer, full size on desktop */}
        <div className="h-20 lg:h-28 px-4 flex items-center justify-between border-b border-gray-100 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center min-w-0"
            onClick={handleNavClick}
          >
            <Image
              src="/bidly-logo.png"
              alt="Bidly"
              width={400}
              height={120}
              className="h-16 w-auto lg:h-28"
              priority
            />
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-brand-50 border border-brand-100 text-brand-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon
                  className={cn(
                    "w-[18px] h-[18px] transition-colors",
                    isActive
                      ? "text-brand-600"
                      : "text-gray-400 group-hover:text-brand-600"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Usage */}
        {usageStats && (
          <div className="mx-3 mb-3 px-4 py-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Feather className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-xs font-medium text-gray-600">
                {usageStats.isPro
                  ? `${usageStats.proposalsUsed} / unlimited`
                  : `${usageStats.proposalsUsed} / ${usageStats.proposalsLimit} proposals`}
              </span>
            </div>
            {!usageStats.isPro && usageStats.proposalsLimit != null && (
              <>
                <UsageProgressBar
                  proposalsUsed={usageStats.proposalsUsed}
                  proposalsLimit={usageStats.proposalsLimit}
                />
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Resets in {usageStats.daysUntilReset} days
                </p>
              </>
            )}
          </div>
        )}

        {/* User */}
        <div className="border-t border-gray-100 p-4 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-xs">
                  {userInitials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName || user.firstName || "User"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          )}
          <button
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
