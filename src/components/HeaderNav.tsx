"use client";

import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitch from "@/components/LanguageSwitch";
import Link from "next/link";
import { useLibrary } from "@/lib/useLibrary";
import { useEffect, useState } from "react";
import { Library, Settings, Search, BookOpen, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import type { Route } from "next";

export default function HeaderNav() {
  const { items } = useLibrary();
  const [count, setCount] = useState(0);
  const pathname = usePathname();
  
  useEffect(() => setCount(items.length), [items]);

  const focusSearch = () => {
    if (pathname === "/") {
      const input = document.querySelector('input[type="text"]');
      if (input instanceof HTMLInputElement) input.focus();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 pb-2">
      <div className="mx-auto max-w-5xl">
        <nav className="relative flex items-center justify-between rounded-full border border-border/40 bg-background/80 px-4 py-2 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          
          <Link href="/" className="group flex items-center gap-2 outline-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110 group-active:scale-95">
              <BookOpen size={16} />
            </div>
            <span className="hidden font-bold tracking-tight sm:inline-block group-hover:text-primary transition-colors">
              BiblioRadar
            </span>
          </Link>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={focusSearch}
              className="btn-ghost group relative hidden h-9 w-9 items-center justify-center rounded-full px-0 md:inline-flex hover:bg-muted/80"
              aria-label="Buscar"
            >
              <Search size={18} />
              <Tooltip text="Buscar (Ctrl+K)" />
            </button>

            <div className="mx-1 hidden h-4 w-px bg-border md:block" />

            <NavItem href="/" active={pathname === "/"} icon={<Home size={18} />} label="Início" />
            <NavItem href="/library" active={pathname === "/library"} icon={<Library size={18} />} label="Estante" count={count} />
            <NavItem href="/settings" active={pathname === "/settings"} icon={<Settings size={18} />} label="Config" />
            
            <div className="ml-2 flex items-center gap-1 border-l border-border pl-2">
              <LanguageSwitch />
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavItem({ href, active, icon, label, count }: { href: Route<string> | URL; active: boolean; icon: React.ReactNode; label: string; count?: number }) {
  return (
    <Link 
      href={href} 
      className={`group relative flex h-9 items-center justify-center gap-2 rounded-full px-3 transition-all duration-200 outline-none ${active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
    >
      <span className="relative">
        {icon}
        {count !== undefined && count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-[1rem] animate-in zoom-in items-center justify-center rounded-full bg-primary px-[3px] text-[9px] font-bold text-primary-foreground shadow-sm ring-2 ring-background">{count}</span>
        )}
      </span>
      <span className={`hidden text-sm sm:inline-block ${active ? "block" : "hidden sm:block"}`}>{label}</span>
      <Tooltip text={label} className="sm:hidden" />
    </Link>
  );
}

function Tooltip({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`pointer-events-none absolute top-full mt-2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-lg transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100 z-50 ${className}`}>
      {text}
      <span className="absolute -top-1 left-1/2 -ml-1 h-2 w-2 -rotate-45 bg-foreground" />
    </span>
  );
}