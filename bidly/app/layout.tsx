import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bidly - Win More Freelance Work",
  description: "AI-powered proposals that get you hired on Upwork, Fiverr, and beyond",
  icons: {
    icon: [
      { url: "/icon.webp", sizes: "512x512", type: "image/webp" },
      { url: "/icon.webp", sizes: "256x256", type: "image/webp" },
      { url: "/icon.webp", sizes: "192x192", type: "image/webp" },
      { url: "/icon.webp", sizes: "128x128", type: "image/webp" },
      { url: "/icon.webp", sizes: "96x96", type: "image/webp" },
      { url: "/icon.webp", sizes: "64x64", type: "image/webp" },
      { url: "/icon.webp", sizes: "32x32", type: "image/webp" },
    ],
    apple: [
      { url: "/icon.webp", sizes: "180x180", type: "image/webp" },
    ],
    shortcut: [
      { url: "/icon.webp", sizes: "512x512", type: "image/webp" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
