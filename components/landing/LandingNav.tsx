"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LandingNav() {
  return (
    <nav className="fixed top-4 sm:top-8 left-0 right-0 z-50 flex justify-center px-3">
      <div className="flex w-full max-w-[calc(100vw-1.5rem)] min-w-0 items-center gap-2 md:gap-3 md:w-fit md:max-w-none bg-white/80 backdrop-blur-md border border-gray-200/60 shadow-md rounded-full px-4 sm:px-5 py-2 sm:py-2.5">
        <Link href="/" className="relative flex shrink-0 items-center">
          <Image
            src="/bidly-logo.png"
            alt="Bidly"
            width={600}
            height={180}
            className="h-12 w-auto sm:h-14"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center gap-5 shrink-0">
          <a
            href="#features"
            className="text-sm md:text-base text-gray-600 hover:text-gray-900 transition-colors tracking-wide"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm md:text-base text-gray-600 hover:text-gray-900 transition-colors tracking-wide"
          >
            Pricing
          </a>
          <a
            href="#"
            className="text-sm md:text-base text-gray-600 hover:text-gray-900 transition-colors tracking-wide"
          >
            Blog
          </a>
        </div>

        <div className="flex min-w-0 shrink items-center gap-3 md:gap-4 ml-auto">
          <Link
            href="/sign-in"
            className="hidden md:inline text-sm md:text-base text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap tracking-wide"
          >
            Log in
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 shrink-0 text-gray-600"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <a href="#features">Features</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="#pricing">Pricing</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="#">Blog</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/sign-in">Log in</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/sign-up" className="font-semibold text-emerald-600">
                  Get started free
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/sign-up"
            className="bg-emerald-600 text-white text-sm font-semibold rounded-full px-4 py-2 hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
