import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { MagicalBackground } from "@/components/MagicalBackground";
import { HeaderOptimizer } from "@/components/HeaderOptimizer";
import "@/lib/error-handler";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Unwrap - Create Magical Gift Experiences",
  description: "Turn any moment into a magical surprise. Upload reservations, add personal messages, and schedule them for the perfect moment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <HeaderOptimizer />
        <MagicalBackground />
        <div className="relative z-10">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
