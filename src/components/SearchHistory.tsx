"use client";

import { useEffect, useState } from "react";
import { Clock, Search } from "lucide-react";
import { getSearchHistory, clearHistory } from "@/lib/history";

export default function SearchHistory({ 
  onSelect, 
  visible 
}: { 
  onSelect: (term: string) => void;
  visible: boolean;
}) {
  const [history, setHistory] = useState<string[]>([]);

  const load = () => setHistory(getSearchHistory());

  useEffect(() => {
    load();
    window.addEventListener("history-updated", load);
    return () => window.removeEventListener("history-updated", load);
  }, []);

  if (!visible || history.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <span className="flex items-center gap-1"><Clock size={12} /> Recentes</span>
        <button onClick={clearHistory} className="hover:text-destructive transition-colors">Limpar</button>
      </div>
      <ul className="mt-1">
        {history.map((term, i) => (
          <li key={i}>
            <button
              onClick={() => onSelect(term)}
              onMouseDown={(e) => e.preventDefault()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 text-sm text-foreground text-left group transition-colors"
            >
              <Search size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              {term}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}