"use client";
import { useEffect, useState } from "react";

type Mode = "light" | "dark";

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Mode) || "light";
    setMode(current);
  }, []);

  function apply(next: Mode) {
    const html = document.documentElement;
    html.style.transition = "color 180ms ease, background-color 180ms ease";
    document.body.style.transition = "color 180ms ease, background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease";
    requestAnimationFrame(() => {
      html.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      setMode(next);
      setTimeout(() => {
        html.style.transition = "";
        document.body.style.transition = "";
      }, 200);
    });
  }

  const toggle = () => apply(mode === "dark" ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar tema"
      className="icon-btn"
      title={mode === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {mode === "dark" ? "🌙" : "🌞"}
    </button>
  );
}
