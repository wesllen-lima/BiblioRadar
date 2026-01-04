"use client";

import { useEffect, useState, useCallback } from "react";
import type { BookResult } from "@/lib/types";
import { Sparkles, BookOpen, Atom, Cpu, Fingerprint, Globe } from "lucide-react";
import BookCard from "./BookCard";
import SkeletonCard from "./SkeletonCard";

const TOPICS = [
  { id: "br-classics", label: "Clássicos BR", query: "Machado de Assis OR Lima Barreto OR Clarice Lispector language:por", icon: BookOpen },
  { id: "scifi", label: "Sci-Fi & Futuro", query: "science fiction artificial intelligence future", icon: Atom },
  { id: "tech", label: "Tech & Dev", query: "software engineering clean code algorithms", icon: Cpu },
  { id: "mystery", label: "Mistério", query: "mystery thriller detective crime fiction", icon: Fingerprint },
  { id: "history", label: "História", query: "history civilization world war", icon: Globe },
];

export default function FeaturedView() {
  const [books, setBooks] = useState<BookResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState(TOPICS[0]);

  const loadTopic = useCallback(async (topic: typeof TOPICS[0]) => {
    setLoading(true);
    setActiveTopic(topic);
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(topic.query)}`);
      const data = await res.json();
      
      const results = (data.results || []) as BookResult[];
      const withCover = results.filter((b) => b.cover);
      const candidates = withCover.length >= 6 ? withCover : results;
      
      const shuffled = candidates.sort(() => 0.5 - Math.random()).slice(0, 6);
      setBooks(shuffled);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopic(TOPICS[0]);
  }, [loadTopic]);

  return (
    <div className="flex flex-col gap-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-purple-600 text-white shadow-lg shadow-brand/20">
            <Sparkles size={20} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Vitrine de Descobertas</h2>
            <p className="text-sm text-muted-foreground">Coleções curadas para inspirar sua próxima leitura.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
          {TOPICS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTopic.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => loadTopic(t)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border
                  ${isActive 
                    ? "bg-brand text-white border-brand shadow-md shadow-brand/25 scale-105" 
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <Icon size={14} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-[300px]">
        {loading ? (
          // CORRIGIDO: md:grid-cols-2 (era lg:grid-cols-3)
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          // CORRIGIDO: md:grid-cols-2 (era lg:grid-cols-3)
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.map((book) => (
              <div key={book.id} className="h-full transform transition-all duration-300 hover:-translate-y-1">
                <BookCard book={book} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}