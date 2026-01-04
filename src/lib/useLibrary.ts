"use client";

import { useState, useEffect } from "react";
import type { BookResult } from "./types";

const LIB_KEY = "br_library_v1";

export function useLibrary() {
  const [items, setItems] = useState<BookResult[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LIB_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {
      console.error("Erro ao carregar biblioteca:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveToDisk = (newItems: BookResult[]) => {
    try {
      localStorage.setItem(LIB_KEY, JSON.stringify(newItems));
      setItems(newItems);
      // Dispara evento para sincronizar outros componentes se necessário
      window.dispatchEvent(new Event("library-updated"));
    } catch (e) {
      console.error("Erro ao salvar biblioteca (Quota?):", e);
    }
  };

  const toggleBook = (book: BookResult) => {
    const exists = items.some((b) => b.id === book.id);
    let newList;
    if (exists) {
      newList = items.filter((b) => b.id !== book.id);
    } else {
      newList = [book, ...items];
    }
    saveToDisk(newList);
  };

  const isSaved = (id: string) => items.some((b) => b.id === id);

  return { items, toggleBook, isSaved, isLoaded };
}