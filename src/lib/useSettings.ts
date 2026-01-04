"use client";

import { useState, useEffect } from "react";

export type SearchLanguage = "all" | "pt" | "en" | "es";

const STORAGE_KEY = "biblio_settings";

type Settings = {
  searchLanguage: SearchLanguage;
};

const DEFAULT_SETTINGS: Settings = {
  searchLanguage: "all",
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateSetting = (key: keyof Settings, value: Settings[typeof key]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    window.dispatchEvent(new Event("settings-updated"));
  };

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSettings(JSON.parse(saved));
    };
    window.addEventListener("settings-updated", load);
    return () => window.removeEventListener("settings-updated", load);
  }, []);

  return { settings, updateSetting, isLoaded };
}