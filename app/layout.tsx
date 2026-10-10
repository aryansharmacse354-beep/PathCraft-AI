import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PathCraft AI — Reverse-Engineered Career Intelligence",
  description: "AI-driven interactive skill tree and career roadmapper reverse-engineered for hyper-specific dream roles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0F19] text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        {children}
      </body>
    </html>
  );
}
