import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Airbridge Labs | WhatsApp CRM Diagrams",
  description:
    "Diagramas interactivos de arquitectura y operaciones para un CRM conversacional en WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#02030a] text-slate-100`}
      >
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.22),transparent_58%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(147,197,253,0.16),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(2,4,16,0.9)_0%,rgba(2,5,18,0.95)_40%,rgba(6,9,23,0.92)_100%)]" />
          <div className="relative z-10 flex min-h-screen flex-col">
            <SiteHeader />
            <main className="mx-auto w-full max-w-[92rem] flex-1 px-6 pb-20 pt-32 sm:px-10 lg:pt-40 xl:px-16">
              {children}
            </main>
            <footer className="border-t border-white/10 bg-[#050815]/95 py-6">
              <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-2 px-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-10 xl:px-16">
                <span>c {year} Airbridge Labs - Conversational Control Tower</span>
                <span className="text-slate-500">Diagramas curados con Next.js, React Diagrams y Supabase</span>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}





