import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import { I18nProvider } from "@/components/I18nProvider";
import HeaderNav from "@/components/HeaderNav";
import { pickLocale, type Locale } from "@/lib/i18n";
import { headers, cookies } from "next/headers";
import { Toaster } from "sonner";

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
  description: "Encontre livros, artigos científicos e PDFs legais em várias fontes.",
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
      <body className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <I18nProvider initialLocale={initialLocale}>
          <HeaderNav />
          <main className="mx-auto max-w-6xl px-3 md:px-6 min-h-[80vh]">
            {children}
          </main>
          <CookieConsent />
          {/* Componente de Notificações */}
          <Toaster position="bottom-center" richColors closeButton />
        </I18nProvider>
      </body>
    </html>
  );
}