import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { WalletProvider } from "@/lib/wallet";
import ConnectWallet from "@/app/components/ConnectWallet";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voicenomics | Voice → DAT → Voice-as-a-Service",
  description:
    "Mocked MVP for DAT-based Voice-as-a-Service: upload voice, mint DAT, synthesize with policy checks, and track royalties.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WalletProvider>
        <header className="border-b sticky top-0 z-40" style={{ background: "var(--surfaceInverse)", boxShadow: "0 1px 2px rgba(16,24,40,.04)" }}>
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight flex items-center gap-2">
              <Image src="/logo.svg" alt="logo" width={28} height={28} />
              <span>Voicenomics</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/marketplace" className="hover:underline">Marketplace</Link>
              <Link href="/upload" className="hover:underline">Upload / Mint DAT</Link>
              <Link href="/synthesize" className="hover:underline">Synthesize</Link>
              <Link href="/activity" className="hover:underline">Activity</Link>
              <ConnectWallet />
            </nav>
          </div>
          <div className="text-[13px]" style={{ background: "var(--backgroundGlobal)" }}>
            <div className="mx-auto max-w-6xl px-6 py-2">
              <span className="mr-2 font-medium">AI Unchained Hackathon</span>
              <a className="underline" href="https://dorahacks.io/hackathon/ai-unchained" target="_blank" rel="noreferrer">Details</a>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
