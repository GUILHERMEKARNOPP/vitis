import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Sparkles, ChevronRight, Check } from "lucide-react";
import { wines as staticWines } from "@/lib/wines";
import { useWines } from "@/hooks/useWines";

type SearchParams = {
  wineId?: string;
};

export const Route = createFileRoute("/scan/resultado")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      wineId: typeof search.wineId === "string" ? search.wineId : undefined,
    };
  },
  head: () => ({
    meta: [{ title: "Vinho encontrado — Vitis" }],
  }),
  component: ScanResult,
});

function ScanResult() {
  const { wineId } = useSearch({ from: "/scan/resultado" });
  const { wines, loading } = useWines();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Encontra o vinho pelo ID ou pega o primeiro como fallback seguro
  const wine = wines.find((w) => w.id === wineId) || wines[0] || staticWines[0];
  const recomendacoes = wines.filter((w) => w.id !== wine.id).slice(0, 3);

  return (
    <div className="app-shell">
      <div className="relative h-72 overflow-hidden bg-primary">
        <img src={wine.imagem} alt={wine.nome} className="h-full w-full object-cover opacity-90 animate-fade-in" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute left-5 top-8 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-primary shadow">
          <Check className="h-3.5 w-3.5" />
          Rótulo identificado
        </div>
      </div>

      <div className="-mt-10 relative px-5">
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs text-accent-foreground/75 font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
            <span>Correspondência de Rótulo: 98%</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {wine.produtor}
            </p>
            <h1 className="font-display text-2xl font-bold text-foreground leading-tight mt-0.5">
              {wine.nome}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {wine.regiao}, {wine.pais} · Safra {wine.safra}
            </p>
          </div>

          <Link
            to="/vinho/$id"
            params={{ id: wine.id }}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:bg-primary/95 transition-transform active:scale-[0.98] mt-4"
          >
            Ver Ficha Completa
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Recomendações */}
        <div className="mt-6 space-y-3">
          <p className="font-display text-lg font-semibold">Você também pode gostar</p>
          <div className="space-y-2">
            {recomendacoes.map((w) => (
              <Link
                key={w.id}
                to="/vinho/$id"
                params={{ id: w.id }}
                className="flex items-center gap-4 rounded-2xl bg-card border border-border p-3 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-transform"
              >
                <div className="h-16 w-14 overflow-hidden rounded-xl bg-secondary">
                  <img src={w.imagem} alt={w.nome} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase">{w.produtor}</p>
                  <p className="font-display font-semibold text-sm truncate mt-0.5">{w.nome}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>

        <Link
          to="/scan"
          className="mt-6 mb-10 flex h-12 items-center justify-center rounded-full border border-border bg-card font-medium hover:bg-muted/30 active:scale-[0.98] transition-transform text-sm"
        >
          Escanear Outro Rótulo
        </Link>
      </div>
    </div>
  );
}
