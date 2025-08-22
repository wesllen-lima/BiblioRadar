Aqui vai um **README.md** já alinhado com o estado atual (v1 inicial) do BiblioRadar — com i18n PT-BR/EN, cache de busca no navegador, paginação dos cards, skeleton otimizado e priorização opcional de sites externos.

---

# BiblioRadar

Buscador “cartonado” de livros e PDFs em fontes públicas (Project Gutenberg, Internet Archive, Open Library) com suporte a **feeds OPDS**, **scrapers CSS** e **atalhos para sites externos** – totalmente **client-first**, sem banco de dados. Preferências ficam no navegador (cookies essenciais com fallback seguro).

> **Demo local**: veja **Começando** e rode `npm run dev`.

---

## ✨ Destaques

- **Busca dinâmica** com _debounce_, **cancelamento** e **timeout** por fonte.
- **Agregação**: Gutenberg, Internet Archive, Open Library + seus **OPDS** e **Scrapers CSS**.
- **Ranking de relevância** no cliente (título/autor, boosts para PDF/idioma/ano/fonte) com **dedupe** e **poda**.
- **Lista paginada** em client side (20 por página) com **“Carregar mais”**.
- **Priorizar sites externos**: alternador para destacar links vindos da sua lista de sites.
- **Download do PDF** direto da fonte ou **via servidor** (proxy `/api/download` para contornar CORS).
- **Cache de busca** no navegador com chave estável + TTL, evitando requisições repetidas.
- **Tema claro/escuro** (tokens **OKLCH**) com UI “cartonada”.
- **i18n** PT-BR/EN: detecção inicial por região, persistência em cookie, com **LanguageSwitch**.
- **Acessibilidade & UX**: foco visível, atalhos de teclado (`/` foca a busca), skeletons fluidos.

---

## 🖼️ Screenshots

> Substitua pelos seus PNGs em `public/`.

- Tema claro
  `![BiblioRadar — claro](public/screen-light.png)`

- Tema escuro
  `![BiblioRadar — escuro](public/screen-dark.png)`

---

## 🧱 Stack

- **Next.js (App Router)**
- **Tailwind CSS v4** (tokens em `app/globals.css`)
- **TypeScript** + ESLint
- Rotas **/api** para busca/OPDS/scrape/download
- **Sem banco de dados** (cookies + storage)

---

## 🚀 Começando

### Requisitos

- Node.js 18+ (recomendado 20+)
- npm/pnpm/yarn

### Instalação

```bash
git clone https://github.com/<seu-usuario>/biblioradar.git
cd biblioradar
npm install
```

### Rodar local

```bash
npm run dev
# http://localhost:3000
```

### Build/produção

```bash
npm run build
npm start
```

### Deploy

- **Vercel** (Next.js) ou qualquer host Node com rotas /api habilitadas.

---

## ⚙️ Configuração rápida

Tudo é configurável pela **UI** e salvo no navegador:

- **Provedores**: adicione OPDS ou Scraper (CSS) na seção “Gerenciar provedores”.
- **Sites externos**: cadastre modelos de URL com `{query}`, `{plus}` ou `{raw}`.
- **Tema** e **Idioma**: via botões na navbar.

Se quiser _defaults_ no código, veja:

- `components/ProvidersManager.tsx`
- `components/ExternalSites.tsx`

---

## 🗂️ Estrutura principal

```
app/
  layout.tsx            # navbar (brand, busca, idioma, tema) + CookieConsent
  globals.css           # tokens/cartonado (OKLCH), utilitários e componentes base
  page.tsx              # home: busca, lista paginada, priorização de externos

components/
  AboutSidebar.tsx
  BookCard.tsx
  CookieConsent.tsx
  ExternalQuick.tsx
  ExternalSites.tsx
  I18nProvider.tsx
  LanguageSwitch.tsx
  ProvidersManager.tsx
  ResultsList.tsx
  SkeletonCard.tsx
  ThemeToggle.tsx

lib/
  clientMerge.ts
  cookieStore.ts
  i18n.ts
  rank.ts
  searchCache.ts

lib/providers/
  base.ts
  gutenberg.ts
  internetArchive.ts
  openLibrary.ts
  opds.ts

app/api/
  download/route.ts
  scrape/route.ts
  search/route.ts
  search-by-provider/route.ts
```

---

## 🔎 Como a busca funciona

1. **Fontes base**: Gutenberg, Internet Archive, Open Library.
2. **Fontes extras**:

   - **OPDS**: busca no feed.
   - **Scraper (CSS)**: extrai itens a partir de seletores fornecidos.

3. **Agregação** e **dedupe** (título+autores).
4. **Ranking** (`lib/rank.ts`): tokens, ordem da frase, boosts (PDF/ano/idioma/fonte), poda de ruído.
5. **Cache** (`lib/searchCache.ts`): chave com `q`, _flag_ PDF, assinatura dos provedores; TTL configurado.
6. **UI**: paginação de 20 em 20; botão para **priorizar sites externos**.

---

## 🧑‍💻 Atalhos & UX

- `/` foca a busca.
- Foco visível em botões/link; cards com _rise_; skeleton responsivo.
- “Via servidor” usa `/api/download` quando o host bloqueia CORS no PDF.

---

## 🎨 Tema “Cartonado” & Responsividade

- Tokens OKLCH e componentes (`.card`, `.panel`, `.btn`, `.chip`, `.toolbar`, `.nav-pill`).
- Layout fluido do **mobile ao desktop**; barra superior compactada em telas estreitas.

---

## 🔐 Privacidade

- **Cookies essenciais**: idioma, tema, “Somente PDF”, provedores e sites externos.
- **Fallback**: quando o cookie excede \~4KB, valores grandes vão para `localStorage` com ponte no cookie.
- **Sem analytics**.

---

## ⚠️ Uso responsável

O BiblioRadar só lista o que as fontes tornam público. Ao adicionar feeds/scrapers/sites, respeite licenças e termos de uso.

---

## 🧪 Testes manuais

- Consultas curtas/longas; alternar **Somente PDF**.
- Adicionar um **OPDS** e um **Scraper** simples; validar resultados.
- Cadastrar “site externo” com `{query}` e usar o botão rápido.
- Alternar **priorização de sites externos**.
- Trocar **idioma** e **tema**; recarregar e checar persistência.
- Tentar baixar **PDF via proxy** quando direto falhar.

---

## 🧭 Roadmap

- [ ] Importar/Exportar preferências (JSON).
- [ ] Filtros por idioma/ano/fonte na UI.
- [ ] Scroll infinito opcional.
- [ ] Pré-visualização mais rica de sites externos.
- [ ] Testes e2e (Playwright).

---

## 🤝 Contribuindo

1. Fork
2. Branch: `git checkout -b feat/minha-ideia`
3. Commit: `git commit -m "feat: ..."`
4. PR

Padrões: TypeScript, zero warnings de ESLint, UI “cartonada”, sem cores fixas que quebrem o dark.

---

## 📄 Licença

**MIT** — veja `LICENSE`.

---

Feito com Next.js + Tailwind v4 — com carinho e um toque de **cartonado**.
