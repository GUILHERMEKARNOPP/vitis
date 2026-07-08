import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Star, Wine, Heart, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { wines, type Wine as WineType } from "@/lib/wines";

export const Route = createFileRoute("/adega")({
  head: () => ({
    meta: [{ title: "Minha Adega — Vitis" }],
  }),
  component: AdegaPage,
});

function AdegaPage() {
  const { user } = useAuth();
  const [minhaAdega, setMinhaAdega] = useState<WineType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMinhaAdega([]);
      setLoading(false);
      return;
    }

    const cellarRef = collection(db, "users", user.uid, "cellar");
    const unsubscribe = onSnapshot(
      cellarRef,
      (snapshot) => {
        const list: WineType[] = [];
        snapshot.forEach((docSnap) => {
          const wine = wines.find((w) => w.id === docSnap.id);
          if (wine) {
            list.push(wine);
          }
        });
        setMinhaAdega(list);
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore inacessível para adega. Usando adega vazia:", error);
        setMinhaAdega([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Estatísticas Dinâmicas
  const totalVinhos = minhaAdega.length;

  const tipoFavorito = () => {
    if (minhaAdega.length === 0) return "Nenhum";
    const counts: Record<string, number> = {};
    minhaAdega.forEach((w) => {
      counts[w.tipo] = (counts[w.tipo] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  };

  const regiaoFavorita = () => {
    if (minhaAdega.length === 0) return "Nenhuma";
    const counts: Record<string, number> = {};
    minhaAdega.forEach((w) => {
      counts[w.regiao] = (counts[w.regiao] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  };

  return (
    <AppShell>
      <header className="px-5 pt-8 pb-4">
        <h1 className="font-display text-3xl font-semibold">Minha Adega</h1>
        <p className="text-sm text-muted-foreground">Sua coleção pessoal de vinhos favoritos</p>
      </header>

      {!user ? (
        <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary mb-4">
            <LogIn className="h-8 w-8" />
          </div>
          <h2 className="font-display text-xl font-semibold">Acesse sua adega</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            Faça login com sua conta para salvar garrafas, gerenciar sua adega e acompanhar seu histórico.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10"
          >
            Fazer Login
          </Link>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="pb-28">
          {/* Stats */}
          <div className="px-5">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Vinhos" value={totalVinhos.toString()} />
              <Stat label="Tipo favorito" value={tipoFavorito()} />
              <Stat label="Região fav." value={regiaoFavorita()} />
            </div>
          </div>

          {/* Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 px-5">
            {minhaAdega.map((w) => (
              <Link
                key={w.id}
                to="/vinho/$id"
                params={{ id: w.id }}
                className="overflow-hidden rounded-2xl bg-card border border-border flex flex-col shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-transform"
              >
                <div className="aspect-square bg-secondary relative overflow-hidden">
                  <img src={w.imagem} alt={w.nome} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-black/40 backdrop-blur text-accent">
                    <Heart className="h-4 w-4 fill-current" />
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{w.tipo}</p>
                    <p className="font-display text-sm font-semibold leading-tight line-clamp-2 mt-0.5">{w.nome}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <span className="font-semibold">{w.nota}</span>
                    <span className="text-muted-foreground">({w.avaliacoes})</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Add card */}
            <Link
              to="/scan"
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:bg-muted/10 transition-colors"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Plus className="h-6 w-6" />
              </div>
              <p className="text-xs font-medium">Adicionar vinho</p>
            </Link>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-3 text-center shadow-sm">
      <p className="font-display text-base font-bold text-primary truncate" title={value}>{value}</p>
      <p className="mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground truncate">{label}</p>
    </div>
  );
}
