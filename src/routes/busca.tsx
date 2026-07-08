import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { wines, type WineType } from "@/lib/wines";

export const Route = createFileRoute("/busca")({
  head: () => ({
    meta: [{ title: "Buscar — Vitis" }],
  }),
  component: BuscaPage,
});

const tipos: (WineType | "Todos")[] = ["Todos", "Tinto", "Branco", "Rosé", "Espumante"];

function BuscaPage() {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<(typeof tipos)[number]>("Todos");

  const filtered = wines.filter((w) => {
    const matchesQ =
      !q ||
      w.nome.toLowerCase().includes(q.toLowerCase()) ||
      w.produtor.toLowerCase().includes(q.toLowerCase()) ||
      w.uva.toLowerCase().includes(q.toLowerCase());
    const matchesT = tipo === "Todos" || w.tipo === tipo;
    return matchesQ && matchesT;
  });

  return (
    <AppShell>
      <header className="px-5 pt-8 pb-4">
        <h1 className="font-display text-3xl font-semibold">Buscar</h1>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 h-12">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Vinho, produtor ou uva"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tipos.map((t) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className={`h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
              tipo === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-5 pt-2">
        <p className="mb-3 text-xs text-muted-foreground">
          {filtered.length} resultado{filtered.length !== 1 && "s"}
        </p>
        <div className="space-y-3">
          {filtered.map((w) => (
            <Link
              key={w.id}
              to="/vinho/$id"
              params={{ id: w.id }}
              className="flex items-center gap-4 rounded-2xl bg-card border border-border p-3"
            >
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                <img src={w.imagem} alt={w.nome} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{w.produtor}</p>
                <p className="font-display font-semibold leading-tight line-clamp-2">{w.nome}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{w.regiao}, {w.pais}</p>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    <span className="font-semibold">{w.nota}</span>
                  </div>
                  <span className="text-muted-foreground">· R$ {w.preco}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
