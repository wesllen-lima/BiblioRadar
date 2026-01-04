"use client";

import { useState } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DataManagement() {
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    const data = {
      library: localStorage.getItem("br_library_v1"),
      providers: localStorage.getItem("biblio_custom_providers"),
      sites: localStorage.getItem("biblio_external_sites"),
      theme: localStorage.getItem("theme"),
      timestamp: new Date().toISOString(),
      version: 1
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `biblioradar-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Backup baixado com sucesso!", { icon: "📦" });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (!json.version) throw new Error("Arquivo inválido");

        if (json.library) localStorage.setItem("br_library_v1", json.library);
        if (json.providers) localStorage.setItem("biblio_custom_providers", json.providers);
        if (json.sites) localStorage.setItem("biblio_external_sites", json.sites);
        if (json.theme) {
          localStorage.setItem("theme", json.theme);
          document.documentElement.setAttribute("data-theme", json.theme);
        }

        toast.success("Dados restaurados! A página será recarregada.", { icon: "✅" });
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        toast.error("Erro ao ler arquivo de backup.", { icon: "❌" });
        console.error(err);
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm("Tem certeza? Isso apagará sua estante, provedores e configurações. Não pode ser desfeito.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <button 
        onClick={handleExport}
        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all group text-center h-full"
      >
        <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Download size={20} />
        </div>
        <div>
          <span className="block font-medium text-foreground">Fazer Backup</span>
          <span className="text-xs text-muted-foreground">Baixar JSON</span>
        </div>
      </button>

      <label className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all group text-center h-full cursor-pointer relative">
        <input 
          type="file" 
          accept=".json" 
          onChange={handleImport} 
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={importing}
        />
        <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
          {importing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" /> : <Upload size={20} />}
        </div>
        <div>
          <span className="block font-medium text-foreground">Restaurar</span>
          <span className="text-xs text-muted-foreground">Carregar JSON</span>
        </div>
      </label>

      <button 
        onClick={handleClear}
        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-destructive/5 hover:border-destructive/30 transition-all group text-center h-full"
      >
        <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Trash2 size={20} />
        </div>
        <div>
          <span className="block font-medium text-foreground">Resetar Tudo</span>
          <span className="text-xs text-muted-foreground">Apagar dados</span>
        </div>
      </button>
    </div>
  );
}