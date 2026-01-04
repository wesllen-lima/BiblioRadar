export const DEFAULT_LOCALE = "pt-BR";
export type Locale = "pt-BR" | "en";
export const LOCALES: Locale[] = ["pt-BR", "en"];

export type Dict = Record<string, string>;

const ptBR: Dict = {
  "brand.name": "BiblioRadar",
  "home.title": "Explore o Conhecimento Universal",
  "home.tagline": "Sua porta de entrada para milhões de livros, artigos acadêmicos e documentos gratuitos.",
  
  "search.placeholder": "O que você quer aprender hoje? (Ctrl+K)",
  "search.aria": "Campo de busca",
  "search.onlyPdf": "Apenas PDF",
  "search.prioritizeExternal": "Priorizar Externos",
  "results.none": "Nenhum resultado encontrado para '{q}' {pdf}.",
  "results.searching": "Pesquisando em bibliotecas globais...",
  "results.loadMore": "Carregar mais resultados",
  
  "library.title": "Minha Estante",
  "library.empty": "Sua estante aguarda novas histórias",
  "library.emptyDesc": "Navegue, descubra e salve seus livros e artigos favoritos aqui para acesso rápido.",
  "library.saved": "Adicionado à sua estante",
  "library.removed": "Removido da estante",
  "library.back": "Continuar explorando",
  "library.count_one": "item salvo",
  "library.count_other": "itens salvos",

  "citation.title": "Citação Bibliográfica",
  "citation.copy": "Copiar Referência",
  "citation.copied": "Copiado!",
  
  "book.untitled": "Sem título",
  "book.unknownAuthor": "Autor desconhecido",
  "book.download": "Baixar PDF",
  "book.read": "Ler agora",
  "book.source": "Ver na Fonte",
  "book.serverTooltip": "Proxy Seguro (Ideal se o download direto falhar)",
  "book.notVerified": "Não verificado",
  
  "providers.title": "Fontes e Conexões",
  "providers.configure": "Configurar Fontes",
  "about.title": "Sobre o BiblioRadar",
  "about.desc": "Uma ferramenta open-source poderosa que unifica o acesso ao conhecimento humano.",
  "about.sources": "Conectado a:",
  "footer.disclaimer": "O BiblioRadar é um agregador de links públicos. Respeitamos os direitos autorais e não hospedamos conteúdo.",
  
  "action.share": "Compartilhar",
  "action.manage": "Gerenciar",
  "action.info": "Sobre",
  "action.close": "Fechar",
  "common.remove": "Remover",
  
  "cookies.title": "Privacidade em primeiro lugar",
  "cookies.desc": "Usamos armazenamento local apenas para suas preferências visuais.",
  "cookies.ok": "Perfeito",
  
  "settings.lang.title": "Preferência de Idioma",
  "settings.lang.desc": "Priorizar resultados de busca neste idioma (quando suportado pela fonte).",
  "settings.lang.all": "Todos os idiomas (Global)",
  "settings.lang.pt": "Português",
  "settings.lang.en": "Inglês",
  "settings.lang.es": "Espanhol",

  // Legado
  "nav.search": "Buscar",
  "nav.addProvider": "Adicionar",
  "pm.tab.opds": "OPDS",
  "pm.tab.scraper": "Scraper",
  "pm.opds.add": "Adicionar",
  "pm.scr.add": "Adicionar",
  "ext.quick.title": "Sites externos",
};

const en: Dict = {
  "brand.name": "BiblioRadar",
  "home.title": "Explore Universal Knowledge",
  "home.tagline": "Your gateway to millions of free books, academic papers, and documents.",
  
  "search.placeholder": "What do you want to learn today? (Ctrl+K)",
  "search.aria": "Search input",
  "search.onlyPdf": "PDF Only",
  "search.prioritizeExternal": "Prioritize External",
  "results.none": "No results found for '{q}' {pdf}.",
  "results.searching": "Searching global libraries...",
  "results.loadMore": "Load more results",
  
  "library.title": "My Library",
  "library.empty": "Your library awaits new stories",
  "library.emptyDesc": "Browse, discover, and save your favorite books and papers here for quick access.",
  "library.saved": "Added to library",
  "library.removed": "Removed from library",
  "library.back": "Keep exploring",
  "library.count_one": "item saved",
  "library.count_other": "items saved",

  "citation.title": "Bibliographic Citation",
  "citation.copy": "Copy",
  "citation.copied": "Copied!",
  
  "book.untitled": "Untitled",
  "book.unknownAuthor": "Unknown Author",
  "book.download": "Download PDF",
  "book.read": "Read now",
  "book.source": "Visit Source",
  "book.serverTooltip": "Secure Proxy (Use if direct download fails)",
  "book.notVerified": "Not verified",
  
  "providers.title": "Sources & Connections",
  "providers.configure": "Configure Sources",
  "about.title": "About BiblioRadar",
  "about.desc": "A powerful open-source tool unifying access to human knowledge.",
  "about.sources": "Connected to:",
  "footer.disclaimer": "BiblioRadar is a public link aggregator. We respect copyrights.",
  
  "action.share": "Share",
  "action.manage": "Manage",
  "action.info": "About",
  "action.close": "Close",
  "common.remove": "Remove",
  
  "cookies.title": "Privacy first",
  "cookies.desc": "We use local storage only for your visual preferences.",
  "cookies.ok": "Perfect",
  
  "settings.lang.title": "Language Preference",
  "settings.lang.desc": "Prioritize search results in this language (when supported by source).",
  "settings.lang.all": "All languages (Global)",
  "settings.lang.pt": "Portuguese",
  "settings.lang.en": "English",
  "settings.lang.es": "Spanish",
  
  "nav.search": "Search",
  "nav.addProvider": "Add",
  "pm.tab.opds": "OPDS",
  "pm.tab.scraper": "Scraper",
  "pm.opds.add": "Add",
  "pm.scr.add": "Add",
  "ext.quick.title": "External sites",
};

export const DICTS: Record<Locale, Dict> = { "pt-BR": ptBR, "en": en };

export function pickLocale(input?: string | null): Locale {
  if (!input) return DEFAULT_LOCALE;
  const x = input.toLowerCase();
  if (x.startsWith("pt") || x.includes("pt-br")) return "pt-BR";
  return "en";
}

export function format(str: string, params?: Record<string, unknown>) {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    String((params as Record<string, unknown>)[k] ?? "")
  );
}