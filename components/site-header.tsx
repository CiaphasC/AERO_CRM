"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  GitBranch,
  Home,
  Menu,
  Network,
  Route,
  Share2,
  Workflow,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/journey", label: "Journey", icon: Route },
  { href: "/bpmn", label: "BPMN", icon: Workflow },
  { href: "/arquitectura", label: "Arquitectura", icon: Network },
  { href: "/uml", label: "Clases", icon: Share2 },
  { href: "/secuencia", label: "Secuencia", icon: GitBranch },
  { href: "/calendario", label: "Calendario", icon: CalendarCheck },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-[rgba(4,9,20,0.78)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/80 to-transparent" aria-hidden />
      <div className="mx-auto flex w-full max-w-[92rem] flex-col px-6 py-4 sm:px-10 xl:px-16">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 whitespace-nowrap">
            <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-400 to-indigo-500 text-sm font-semibold text-slate-950 shadow-[0_20px_60px_-25px_rgba(56,189,248,0.75)] ring-1 ring-white/50">
              AL
            </span>
            <div className="leading-tight">
              <p className="text-base font-semibold text-white">Airbridge Labs</p>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Conversational Control Tower</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-2 py-1 shadow-[0_18px_60px_-35px_rgba(56,189,248,0.55)] lg:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-2 overflow-hidden rounded-xl px-3.5 py-2 text-sm font-medium transition",
                      isActive ? "text-white" : "text-slate-300 hover:text-white",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-br from-sky-500/25 to-indigo-500/25 opacity-0 transition group-hover:opacity-100",
                        isActive && "opacity-100 shadow-[0_8px_30px_-18px_rgba(56,189,248,0.8)]",
                      )}
                      aria-hidden
                    />
                    <Icon className="relative h-4 w-4" aria-hidden />
                    <span className="relative">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-sky-400/40 hover:text-white lg:hidden"
              onClick={() => setIsMenuOpen((state) => !state)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              <span className="sr-only">Abrir navegacion principal</span>
              {isMenuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>
        <nav
          id="mobile-nav"
          className={cn(
            "grid gap-2 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(6,12,24,0.94)] px-3 py-3 text-sm text-slate-200 shadow-[0_22px_60px_-30px_rgba(56,189,248,0.6)] transition-all lg:hidden",
            isMenuOpen ? "mt-4 opacity-100" : "pointer-events-none mt-0 hidden opacity-0",
          )}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={`mobile-${item.href}`}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3.5 py-2",
                  isActive
                    ? "border-sky-400/60 bg-sky-500/15 text-white"
                    : "border-white/10 bg-white/5 text-slate-200 hover:border-sky-400/40 hover:text-white",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </span>
                <span className="text-xs text-slate-400">Abrir</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}


