import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-6 sm:py-8 md:py-12 min-w-0 max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 min-w-0 max-w-full">
        <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left gap-4 sm:gap-5 md:gap-6 min-w-0">
          <div className="flex items-center min-w-0">
            <Image
              src="/bidly-logo.png"
              alt="Bidly"
              width={280}
              height={84}
              className="h-24 w-auto"
            />
          </div>
          
          <div className="flex items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8 text-xs sm:text-sm text-muted-foreground flex-wrap justify-center min-w-0">
            <Link href="/privacy" className="hover:text-foreground transition-colors truncate min-w-0">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors truncate min-w-0">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors truncate min-w-0">
              Contact
            </Link>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground break-words overflow-wrap-anywhere min-w-0 max-w-full px-2 sm:px-0">
            © {new Date().getFullYear()} Bidly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
