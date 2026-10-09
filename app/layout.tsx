import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AmbientBackground } from "@/components/ambient-background";
import { ToastProvider } from "@/components/toast";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Orwo Family",
  description: "Private access for film projects, decks, posters, and trailers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <AmbientBackground />
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
