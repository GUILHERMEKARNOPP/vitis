import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine, Star, ChevronRight, Bell, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { wines, regioes } from "@/lib/wines";
import { useCart } from "@/hooks/useCart";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Início — Vitis" },
      { name: "description", content: "Descubra vinhos recomendados, tendências e regiões." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { cartCount } = useCart();
  const recomendados = wines.slice(0, 3);
  const tendencias = wines.slice(2, 6);

  return (
    <AppShell>
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <div>
          <p className="text-sm text-muted-foreground">Olá,</p>
          <h1 className="font-display text-3xl font-semibold text-foreground">Bem-vindo</h1>
        </div>
        <div className="flex gap-2">
          <Link
            to="/carrinho"
            className="relative grid h-11 w-11 place-items-center rounded-full bg-card border border-border text-foreground hover:bg-muted/30 active:scale-95 transition-transform"
            aria-label="Carrinho de compras"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="grid h-11 w-11 place-items-center rounded-full bg-card border border-border text-foreground hover:bg-muted/30 active:scale-95 transition-transform" aria-label="Notificações">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Scan CTA */}
      <div className="px-5">
        <Link
          to="/scan"
          className="flex items-center gap-4 rounded-3xl bg-primary p-5 text-primary-foreground shadow-lg shadow-primary/20"
        >
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-foreground/15">
            <ScanLine className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="font-display text-xl font-semibold leading-tight">Escaneie um rótulo</p>
            <p className="text-sm opacity-80">Descubra o vinho na hora</p>
          </div>
          <ChevronRight className="h-5 w-5 opacity-70" />
        </Link>
      </div>

      {/* Recomendados */}
      <section className="mt-8">
        <SectionHeader title="Recomendados para você" />
        <div className="flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {recomendados.map((w) => (
            <Link
              key={w.id}
              to="/vinho/$id"
              params={{ id: w.id }}
              className="w-56 shrink-0 overflow-hidden rounded-3xl bg-card border border-border shadow-sm"
            >
              <div className="h-56 bg-secondary">
                <img src={w.imagem} alt={w.nome} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground">{w.produtor}</p>
                <p className="font-display text-lg font-semibold leading-tight line-clamp-2">
                  {w.nome}
                </p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-semibold">{w.nota}</span>
                  <span className="text-muted-foreground">({w.avaliacoes})</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tendências */}
      <section className="mt-6">
        <SectionHeader title="Tendências da semana" />
        <div className="space-y-3 px-5">
          {tendencias.map((w) => (
            <Link
              key={w.id}
              to="/vinho/$id"
              params={{ id: w.id }}
              className="flex items-center gap-4 rounded-2xl bg-card border border-border p-3"
            >
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                <img src={w.imagem} alt={w.nome} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{w.tipo} · {w.pais}</p>
                <p className="font-display text-base font-semibold leading-tight truncate">{w.nome}</p>
                <div className="mt-1 flex items-center gap-1 text-sm">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span className="font-semibold">{w.nota}</span>
                  <span className="text-muted-foreground text-xs">· R$ {w.preco}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>

      {/* Regiões */}
      <section className="mt-8">
        <SectionHeader title="Explore por região" />
        <div className="grid grid-cols-2 gap-3 px-5">
          {regioes.map((r) => (
            <div key={r.nome} className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <img src={r.imagem} alt={r.nome} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="font-display text-lg font-semibold leading-none">{r.nome}</p>
                <p className="text-xs opacity-80">{r.pais}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-5 pb-3">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <button className="text-xs font-medium text-primary">Ver tudo</button>
    </div>
  );
}
