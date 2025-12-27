"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
          >
            <Zap className="w-5 h-5 text-white fill-white" />
          </motion.div>
          <span className="text-xl font-semibold tracking-tight">Bidly</span>
        </Link>
        
        {/* Desktop navigation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="hidden sm:flex items-center gap-2 md:gap-3"
        >
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground text-xs sm:text-sm min-w-0">
            <Link href="/sign-in" className="truncate">Sign In</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm min-w-0">
            <Link href="/sign-up" className="truncate">Get Started</Link>
          </Button>
        </motion.div>

        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="sm:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <AnimatePresence mode="wait">
            {isMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
            className={cn(
              "sm:hidden border-t border-border/50 bg-background/95 backdrop-blur-md overflow-hidden"
            )}
          >
            <div className="px-4 py-4 space-y-3 min-w-0 max-w-full">
              <Button 
                variant="ghost" 
                asChild 
                className="w-full justify-center text-muted-foreground hover:text-foreground min-w-0 max-w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link href="/sign-in" className="truncate">Sign In</Link>
              </Button>
              <Button 
                asChild 
                className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 min-w-0 max-w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link href="/sign-up" className="truncate">Get Started</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
