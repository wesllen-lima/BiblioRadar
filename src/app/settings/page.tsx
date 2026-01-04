"use client";

import { useI18n } from "@/components/I18nProvider";
import ProvidersManager from "@/components/ProvidersManager";
import ExternalQuick from "@/components/ExternalQuick";
import DataManagement from "@/components/DataManagement";
import Link from "next/link";
import { ArrowLeft, Settings, Database, Globe, HardDrive, Shield, Share2, Languages } from "lucide-react";
import { useSettings, type SearchLanguage } from "@/lib/useSettings";

export default function SettingsPage() {
  const { t } = useI18n();
  const { settings, updateSetting } = useSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-10 pb-6 border-b border-border">
        <Link 
          href={"/" as any} 
          className="btn-ghost btn-sm w-fit pl-0 hover:bg-transparent hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Voltar para o Início
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Settings className="text-primary" size={32} />
            Configurações
          </h1>
          <p className="text-lg text-muted-foreground">
            Personalize suas fontes, integrações e gerencie seus dados locais.
          </p>
        </div>
      </div>

      <div className="grid gap-12">
        
        {/* Seção 0: Preferências Gerais */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Languages size={18} />
            </div>
            <h2 className="text-xl font-bold text-foreground">{t("settings.lang.title")}</h2>
          </div>
          
          <div className="card p-6 bg-card backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground max-w-lg">
              {t("settings.lang.desc")}
            </div>
            <select 
              value={settings.searchLanguage}
              onChange={(e) => updateSetting("searchLanguage", e.target.value as SearchLanguage)}
              className="field w-full sm:w-48 bg-background"
            >
              <option value="all">{t("settings.lang.all")}</option>
              <option value="pt">{t("settings.lang.pt")}</option>
              <option value="en">{t("settings.lang.en")}</option>
              <option value="es">{t("settings.lang.es")}</option>
            </select>
          </div>
        </section>

        <hr className="border-border/60" />

        {/* Seção 1: Dados */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
              <HardDrive size={18} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Gerenciamento de Dados</h2>
          </div>
          
          <div className="p-1">
            <DataManagement />
          </div>
        </section>

        <hr className="border-border/60" />

        {/* Seção 2: Fontes de Dados */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Database size={18} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Fontes de Dados (Busca Integrada)</h2>
          </div>
          
          <div className="card p-6 bg-card backdrop-blur-sm border-l-4 border-l-blue-500">
            <p className="text-sm text-muted-foreground mb-6">
              Adicione feeds <strong>OPDS</strong> ou <strong>Scrapers</strong>. 
              O conteúdo destas fontes aparecerá misturado aos resultados principais.
            </p>
            <ProvidersManager /> 
          </div>
        </section>

        <hr className="border-border/60" />

        {/* Seção 3: Sites Externos */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Globe size={18} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Acesso Rápido Externo</h2>
          </div>

          <div className="card p-6 bg-card backdrop-blur-sm border-l-4 border-l-emerald-500">
            <div className="flex gap-4 items-start mb-6">
              <Share2 className="text-emerald-500 shrink-0 mt-1" size={20} />
              <p className="text-sm text-muted-foreground">
                Configure atalhos para sites que não possuem API aberta (ex: Google Scholar).
                Ao pesquisar na Home, aparecerão botões para abrir sua busca nesses sites.
              </p>
            </div>
            <ExternalQuick />
          </div>
        </section>

        <hr className="border-border/60" />

        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
          <Shield size={20} className="text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground">
            <strong className="block text-foreground mb-1">Privacidade & Segurança</strong>
            O BiblioRadar funciona inteiramente no seu navegador ("Local-First"). 
            Não rastreamos suas buscas.
          </div>
        </div>

      </div>
    </div>
  );
}