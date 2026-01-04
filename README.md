# BiblioRadar

**BiblioRadar** é um motor de busca unificado e *Local-First* para livros, artigos acadêmicos e documentos. Ele agrega fontes públicas (Project Gutenberg, Internet Archive, Open Library) com a flexibilidade de adicionar seus próprios **Feeds OPDS**, **Scrapers Customizados** e **Atalhos de Busca Profunda** (SciELO, Google Scholar, ArXiv).

Focado em privacidade e autonomia: **sem banco de dados, sem rastreamento.** Seus dados, sua estante e suas configurações vivem apenas no seu navegador.

> **Stack:** Next.js 15 (Turbopack) + Tailwind CSS v4 + TypeScript.

---

## ✨ Funcionalidades Principais

### 🔍 Busca & Inteligência

* **Busca Unificada:** Pesquisa simultânea em múltiplas APIs públicas.
* **Filtros Inteligentes:**
* Detecção automática de idioma (injeta filtros apenas em fontes que suportam).
* Filtro "Apenas PDF" para encontrar arquivos prontos para download.


* **Histórico Local:** Sugestões recentes aparecem instantaneamente ao focar na busca.
* **Vitrine Dinâmica ("Smart Feed"):** Quando não há busca, sugere livros baseados nos autores salvos na sua estante.

### 📚 Gestão de Conhecimento

* **Minha Estante:** Salve livros e artigos favoritos localmente (`localStorage`).
* **Gerador de Citações:** Cria referências prontas em **ABNT**, **APA** e **BibTeX** com um clique.
* **Download Proxy:** Rota de API (`/api/download`) para baixar PDFs contornando bloqueios de CORS.

### ⚙️ Extensibilidade (Página de Configurações)

* **Gerenciador de Fontes:** Adicione feeds OPDS ou Scrapers CSS para incluir novos repositórios diretamente na lista de resultados.
* **Busca Profunda (External Links):** Configure atalhos para sites que não possuem API aberta. O sistema gera links inteligentes com ícones reais (Favicons) e preview de URL.
* **Backup & Restore:** Exporte toda a sua biblioteca e configurações para um arquivo JSON e restaure em qualquer dispositivo.

### 🎨 Design & UX

* **Interface Moderna:** Design system com *Glassmorphism*, animações fluidas e suporte nativo a Tema Claro/Escuro (OKLCH).
* **Acessibilidade:** Navegação completa por teclado (`/` para buscar, `Ctrl+K`), focos visíveis e labels semânticos.
* **Internacionalização (i18n):** Suporte completo a Português (BR) e Inglês.

---

## 🖼️ Screenshots

| Home (Hero Search) | Estante & Citações | Configurações & Backup |
| --- | --- | --- |
| *Busca com histórico e vitrine* | *Biblioteca pessoal e modal ABNT* | *Gerenciador de fontes e dados* |
| `public/screen-home.png` | `public/screen-library.png` | `public/screen-settings.png` |

---

## 🚀 Como Rodar

### Pré-requisitos

* Node.js 18+ (Recomendado: 20 LTS)
* npm, pnpm ou yarn

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/biblioradar.git

# 2. Instale as dependências
cd biblioradar
npm install

# 3. Rode o servidor de desenvolvimento
npm run dev

```

Acesse **http://localhost:3000**.

---

## 🗂️ Estrutura do Projeto

A arquitetura foi refatorada para separar responsabilidades e configurações.

```
src/
├── app/
│   ├── layout.tsx          # Providers globais (Theme, I18n) e Navbar
│   ├── page.tsx            # Home: Busca, Vitrine e Resultados
│   ├── library/            # Página "Minha Estante"
│   └── settings/           # Página de Configurações (Fontes, Backup)
│
├── components/
│   ├── BookCard.tsx        # Card principal (Capa, Ações, Citation)
│   ├── FeaturedView.tsx    # Vitrine inteligente (Sugestões)
│   ├── SearchHistory.tsx   # Dropdown de histórico
│   ├── ExternalSites.tsx   # Botões de "Busca Profunda" na Home
│   ├── ProvidersManager.tsx# Gerenciador de OPDS/Scrapers
│   ├── DataManagement.tsx  # Lógica de Import/Export JSON
│   └── CitationModal.tsx   # Gerador ABNT/APA/BibTeX
│
├── lib/
│   ├── hooks/              # Hooks customizados (useLibrary, useSettings)
│   ├── smartLinks.ts       # Lógica de adaptação de URLs externas
│   ├── recommendedSites.ts # Lista curada (SciELO, ArXiv, etc.)
│   ├── searchCache.ts      # Cache de requisições em memória/session
│   └── rank.ts             # Algoritmo de relevância no cliente
│
└── app/api/                # Rotas Server-Side (Next.js API)
    ├── search/             # Agregador de APIs nativas
    ├── scrape/             # Executor de scrapers CSS
    └── download/           # Proxy para downloads de PDF

```

---

## ⚙️ Personalização Avançada

O BiblioRadar permite adicionar fontes de duas maneiras:

1. **Feed OPDS:**
* Ideal para: Bibliotecas digitais estruturadas (ex: *Standard Ebooks*).
* Como: Insira a URL do feed XML em `/settings`.


2. **Scraper CSS:**
* Ideal para: Sites de busca que retornam HTML estático.
* Configuração:
* `URL`: `https://site.com/busca?q={query}`
* `Seletores`: Defina o caminho CSS para o *item*, *título* e *link* (ex: `.result-item`, `h3 > a`, `a.pdf`).





---

## 🔒 Privacidade e Dados

O projeto segue a filosofia **Local-First**:

1. **Cookies:** Usados minimamente apenas para persistência de tema (Dark/Light) e Locale, evitando "flash" de conteúdo incorreto no server-side rendering.
2. **LocalStorage:**
* `br_library_v1`: Sua estante de livros.
* `biblio_custom_providers`: Suas fontes configuradas.
* `biblio_search_history`: Seu histórico recente.


3. **Segurança:**
* O Proxy de download possui *allowlist* estrita para evitar abusos.
* Nenhum dado é enviado para telemetria ou servidores de terceiros (além das próprias APIs de busca que você acionar).



---

## 🤝 Contribuindo

Pull Requests são bem-vindos!

1. **Fork** o projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-fonte`).
3. Commit suas mudanças.
4. Abra um PR.

**Dica:** Ao criar novos componentes, utilize as classes utilitárias do `globals.css` (ex: `.card`, `.btn-primary`, `.field`) para manter a consistência visual do Design System.

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Sinta-se livre para usar, modificar e distribuir.