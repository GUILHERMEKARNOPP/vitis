import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Heart, Share2, Star, Bookmark, Beef, Fish, Wheat, Cookie, ShoppingBag } from "lucide-react";
import { getWine } from "@/lib/wines";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/vinho/$id")({
  head: ({ params }) => ({
    meta: [{ title: `${params.id} — Vitis` }],
  }),
  loader: ({ params }) => {
    const wine = getWine(params.id);
    if (!wine) throw notFound();
    return { wine };
  },
  component: WineDetail,
  notFoundComponent: () => (
    <div className="app-shell p-8 text-center">
      <p className="mt-20 text-muted-foreground">Vinho não encontrado.</p>
      <Link to="/home" className="mt-4 inline-block text-primary underline">Voltar</Link>
    </div>
  ),
});

const harmonizationIcons: Record<string, typeof Beef> = {
  "Carnes vermelhas": Beef,
  "Cordeiro": Beef,
  "Filé mignon": Beef,
  "Churrasco": Beef,
  "Peixes grelhados": Fish,
  "Frutos do mar": Fish,
  "Sushi": Fish,
  "Ostras": Fish,
  "Massas ao ragu": Wheat,
  "Empanadas": Wheat,
  "Saladas": Wheat,
  "Frango grelhado": Wheat,
  "Aperitivos": Cookie,
  "Sobremesas leves": Cookie,
  "Queijos curados": Cookie,
  "Queijos azuis": Cookie,
  "Queijos maduros": Cookie,
  "Caviar": Fish,
};

function WineDetail() {
  const { wine } = Route.useLoaderData();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsSaved(false);
      return;
    }
    const docRef = doc(db, "users", user.uid, "cellar", wine.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setIsSaved(docSnap.exists());
    }, (error) => {
      console.warn("Erro ao ler adega do Firestore:", error);
    });
    return () => unsubscribe();
  }, [user, wine.id]);

  const handleToggleCellar = async () => {
    if (!user) {
      toast.error("Faça login para salvar vinhos em sua adega.");
      navigate({ to: "/" });
      return;
    }

    const docRef = doc(db, "users", user.uid, "cellar", wine.id);
    try {
      if (isSaved) {
        await deleteDoc(docRef);
        toast.info(`${wine.nome} removido da sua adega.`);
      } else {
        await setDoc(docRef, { savedAt: new Date().toISOString() });
        toast.success(`${wine.nome} salvo na sua adega!`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível salvar o vinho. Verifique a conexão.");
    }
  };

  const handleAddToCart = async () => {
    if (!user || user.isAnonymous) {
      toast.error("Acesso restrito: faça login para usar o carrinho.");
      navigate({
        to: "/",
        search: {
          redirect: `/vinho/${wine.id}`,
          reason: "cart_needs_login",
        },
      });
      return;
    }
    await addToCart(wine.id);
    toast.success(`${wine.nome} adicionado ao carrinho!`, {
      action: {
        label: "Ver Carrinho",
        onClick: () => navigate({ to: "/carrinho" }),
      },
    });
  };

  return (
    <div className="app-shell">
      {/* Hero */}
      <div className="relative h-[420px] overflow-hidden bg-primary/10">
        <img src={wine.imagem} alt={wine.nome} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
          <Link to="/home" className="grid h-10 w-10 place-items-center rounded-full bg-white/90 backdrop-blur">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-full bg-white/90 backdrop-blur text-foreground">
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleToggleCellar}
              className={`grid h-10 w-10 place-items-center rounded-full bg-white/90 backdrop-blur transition-colors ${
                isSaved ? "text-primary" : "text-foreground"
              }`}
              aria-label="Salvar na adega"
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="-mt-16 relative px-5">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {wine.tipo} · {wine.uva}
        </span>
        <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
          {wine.produtor}
        </p>
        <h1 className="font-display text-3xl font-semibold text-foreground leading-tight">
          {wine.nome}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {wine.regiao}, {wine.pais} · {wine.safra}
        </p>

        {/* Rating + price */}
        <div className="mt-5 flex items-center gap-6 rounded-2xl bg-card border border-border p-4">
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-accent text-accent" />
              <span className="font-display text-2xl font-semibold">{wine.nota}</span>
            </div>
            <p className="text-xs text-muted-foreground">{wine.avaliacoes.toLocaleString("pt-BR")} avaliações</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex-1">
            <p className="font-display text-2xl font-semibold">R$ {wine.preco}</p>
            <p className="text-xs text-muted-foreground">preço médio</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button className="flex-1 h-12 rounded-full border border-border font-medium flex items-center justify-center gap-2 hover:bg-muted/30 active:scale-95 transition-transform">
            <Star className="h-4 w-4" />
            Avaliar
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/95 active:scale-95 transition-transform shadow-sm shadow-primary/20"
          >
            <ShoppingBag className="h-4 w-4" />
            Adicionar ao Carrinho
          </button>
        </div>

        {/* Descrição */}
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold">Notas de prova</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{wine.descricao}</p>
        </section>

        {/* Sabores */}
        <section className="mt-6">
          <h2 className="font-display text-xl font-semibold">Perfil de sabor</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {wine.sabores.map((s: string) => (
              <span
                key={s}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Harmonização */}
        <section className="mt-6">
          <h2 className="font-display text-xl font-semibold">Harmoniza com</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {wine.harmonizacao.map((h: string) => {
              const Icon = harmonizationIcons[h] ?? Wheat;
              return (
                <div key={h} className="rounded-2xl border border-border bg-card p-3 text-center">
                  <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium leading-tight">{h}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Reviews mock */}
        <section className="mt-8 mb-8">
          <h2 className="font-display text-xl font-semibold">Avaliações da comunidade</h2>
          <div className="mt-3 space-y-3">
            {[
              { nome: "Marina C.", nota: 4.8, texto: "Espetacular. Encorpado, mas equilibrado. Combinou perfeitamente com o cordeiro." },
              { nome: "Rafael O.", nota: 4.5, texto: "Excelente relação preço/qualidade. Ótimo para uma ocasião especial." },
            ].map((r) => (
              <div key={r.nome} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.nome}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {r.nota}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.texto}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
