import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Bidly - Win More Freelance Work",
  description: "AI-powered proposals that get you hired on Upwork, Fiverr, and beyond",
  icons: {
    icon: [
      { url: "/bidly-favicon.png", sizes: "512x512", type: "image/png" },
      { url: "/bidly-favicon.png", sizes: "192x192", type: "image/png" },
      { url: "/bidly-favicon.png", sizes: "96x96", type: "image/png" },
      { url: "/bidly-favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/bidly-favicon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [
      { url: "/bidly-favicon.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
