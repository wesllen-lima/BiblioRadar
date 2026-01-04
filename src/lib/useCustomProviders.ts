"use client";

import { useState, useEffect } from "react";
import type { CustomProvider } from "@/components/ProvidersManager";

const STORAGE_KEY = "biblio_custom_providers";

export function useCustomProviders() {
  const [providers, setProviders] = useState<CustomProvider[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProviders(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProviders = (newList: CustomProvider[]) => {
    setProviders(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    window.dispatchEvent(new Event("providers-updated"));
  };

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProviders(JSON.parse(saved));
    };
    window.addEventListener("providers-updated", handleStorage);
    return () => window.removeEventListener("providers-updated", handleStorage);
  }, []);

  return { providers, saveProviders, isLoaded };
}