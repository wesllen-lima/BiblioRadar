"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    setTheme(currentTheme);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={toggle}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title={theme === "light" ? "Mudar para Escuro" : "Mudar para Claro"}
      aria-label="Alternar Tema"
    >
      <Sun 
        size={18} 
        className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] absolute
          ${theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}
        `} 
      />
      
      <Moon 
        size={18} 
        className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] absolute
          ${theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}
        `} 
      />
    </button>
  );
}