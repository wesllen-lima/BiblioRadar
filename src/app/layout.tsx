import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import CookieConsent from "@/components/CookieConsent";
import LanguageSwitch from "@/components/LanguageSwitch";
import { I18nProvider } from "@/components/I18nProvider";
import { pickLocale, type Locale } from "@/lib/i18n";
import { headers, cookies } from "next/headers";

const THEME_BOOTSTRAP = `
(function () {
  try {
    var saved = localStorage.getItem("theme");
    var system = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var theme = saved || system;
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export const metadata = {
  title: "BiblioRadar",
  description: "Encontre livros e PDFs legais em várias fontes — rápido e direto.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ck = await cookies();
  const saved = ck.get("br_lang")?.value || null;
  const h = await headers();
  const accept = h.get("accept-language") || "";
  const initialLocale = pickLocale(saved ?? accept) as Locale;

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="min-h-screen">
        <I18nProvider initialLocale={initialLocale}>
          <header className="mx-auto max-w-6xl px-3 md:px-6 mt-1 mb-2">
            <nav className="nav-pill">
              <div className="brand-chip">
                <span className="brand-dot" aria-hidden />
                <span className="brand-title">BiblioRadar</span>
              </div>
              <div className="nav-actions">
                <button type="button" className="search-chip hidden md:inline-flex" title="Ctrl + K">
                  <span className="hidden sm:inline">Buscar</span>
                  <kbd>Ctrl</kbd><span className="opacity-70">+</span><kbd>K</kbd>
                </button>
                <a href="#providers-manager" className="btn-primary btn-sm">+ Provedor</a>
                <LanguageSwitch />
                <ThemeToggle />
              </div>
            </nav>
          </header>

          <main className="mx-auto max-w-6xl px-3 md:px-6">{children}</main>

          <CookieConsent />
        </I18nProvider>
      </body>
    </html>
  );
}
