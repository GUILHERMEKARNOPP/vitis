import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ChevronRight, Check } from "lucide-react";
import { wines } from "@/lib/wines";

export const Route = createFileRoute("/scan/resultado")({
  head: () => ({
    meta: [{ title: "Vinho encontrado — Vitis" }],
  }),
  component: ScanResult,
});

function ScanResult() {
  const wine = wines[0];

  return (
    <div className="app-shell">
      <div className="relative h-72 overflow-hidden bg-primary">
        <img src={wine.imagem} alt={wine.nome} className="h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute left-5 top-8 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-primary">
          <Check className="h-3.5 w-3.5" />
          Rótulo identificado
        </div>
      </div>

      <div className="-mt-10 relative px-5">
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-accent-foreground/70">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Correspondência: 98%</span>
          </div>
          <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
            {wine.produtor}
          </p>
          <h1 className="font-display text-3xl font-semibold text-foreground leading-tight">
            {wine.nome}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {wine.regiao}, {wine.pais} · Safra {wine.safra}
          </p>

          <Link
            to="/vinho/$id"
            params={{ id: wine.id }}
            className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-medium"
          >
            Ver ficha completa
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          <p className="font-display text-lg font-semibold">Você também pode gostar</p>
          {wines.slice(1, 4).map((w) => (
            <Link
              key={w.id}
              to="/vinho/$id"
              params={{ id: w.id }}
              className="flex items-center gap-4 rounded-2xl bg-card border border-border p-3"
            >
              <div className="h-16 w-14 overflow-hidden rounded-xl bg-secondary">
                <img src={w.imagem} alt={w.nome} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{w.produtor}</p>
                <p className="font-display font-semibold truncate">{w.nome}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <Link
          to="/scan"
          className="mt-6 mb-4 flex h-12 items-center justify-center rounded-full border border-border font-medium"
        >
          Escanear outro rótulo
        </Link>
      </div>
    </div>
  );
}
