import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Star, Heart, Trophy, Wine as WineIcon, LogIn, UserPlus, Database } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { wines, type Wine as WineType } from "@/lib/wines";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [{ title: "Perfil — Vitis" }],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { user, logout, isAnonymous } = useAuth();
  const navigate = useNavigate();
  const [minhaAdega, setMinhaAdega] = useState<WineType[]>([]);
  const [loading, setLoading] = useState(true);

  const [seeding, setSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      wines.forEach((wine) => {
        const docRef = doc(db, "wines", wine.id);
        batch.set(docRef, wine, { merge: true });
      });
      await batch.commit();
      toast.success("Banco de dados semeado com 25 vinhos reais!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao semear banco de dados. Verifique a conexão.");
    } finally {
      setSeeding(false);
    }
  };

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
        console.warn("Erro ao buscar adega para perfil:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  // Cálculos dinâmicos
  const degustadosCount = minhaAdega.length;
  const notaMedia = () => {
    if (minhaAdega.length === 0) return 0;
    const sum = minhaAdega.reduce((acc, w) => acc + w.nota, 0);
    return (sum / minhaAdega.length).toFixed(1);
  };

  const getProfileName = () => {
    if (!user) return "";
    if (isAnonymous) return "Viticultor Convidado";
    return user.displayName || user.email?.split("@")[0] || "Viticultor";
  };

  const getMemberDate = () => {
    if (!user || !user.metadata.creationTime) return "2026";
    const date = new Date(user.metadata.creationTime);
    return date.toLocaleDateString("pt-BR", { year: "numeric", month: "long" });
  };

  return (
    <AppShell>
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <h1 className="font-display text-3xl font-semibold">Perfil</h1>
        {user && (
          <button
            onClick={handleLogout}
            className="grid h-11 w-11 place-items-center rounded-full bg-card border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/5 active:scale-95 transition-colors"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </header>

      {!user ? (
        <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary mb-4">
            <LogIn className="h-8 w-8" />
          </div>
          <h2 className="font-display text-xl font-semibold">Acesse seu perfil</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            Faça login para gerenciar suas conquistas, visualizar suas notas médias e sair da conta.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10"
          >
            Fazer Login
          </Link>
        </div>
      ) : (
        <div className="pb-28 space-y-6">
          {/* Card usuário */}
          <div className="px-5">
            <div className="rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.24_0.09_20)] p-5 text-primary-foreground shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 relative">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-foreground/15 font-display text-2xl font-bold border border-white/10 uppercase">
                  {getProfileName()[0]}
                </div>
                <div>
                  <p className="font-display text-xl font-semibold">{getProfileName()}</p>
                  <p className="text-xs opacity-75">
                    {isAnonymous ? "Sessão temporária" : user.email}
                  </p>
                  <p className="text-[10px] opacity-60 mt-0.5">Criado em {getMemberDate()}</p>
                </div>
              </div>
              
              <div className="mt-5 grid grid-cols-3 gap-2 text-center relative pt-4 border-t border-white/10">
                <MiniStat icon={<WineIcon className="h-4 w-4" />} value={degustadosCount.toString()} label="Na Adega" />
                <MiniStat icon={<Star className="h-4 w-4" />} value={notaMedia().toString()} label="Nota Média" />
                <MiniStat icon={<Heart className="h-4 w-4" />} value={degustadosCount > 0 ? Math.ceil(degustadosCount * 0.4).toString() : "0"} label="Favoritos" />
              </div>
            </div>
          </div>

          {/* Banner de Upgrade para Contas Anônimas */}
          {isAnonymous && (
            <div className="px-5">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">Conta de Convidado Ativa</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Seus dados de adega e carrinho estão salvos temporariamente neste navegador. Crie uma conta definitiva para não perdê-los!
                  </p>
                </div>
                <Link
                  to="/"
                  search={{ reason: "upgrade_account" }}
                  className="flex h-9 items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/95 transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Criar Conta Definitiva
                </Link>
              </div>
            </div>
          )}

          {/* Conquistas */}
          <section className="px-5">
            <h2 className="font-display text-lg font-semibold mb-3">Conquistas</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                { icone: <Trophy className="h-6 w-6" />, titulo: "Explorador", desc: "Primeiro vinho salvo", ativo: degustadosCount >= 1, cor: "bg-amber-500/10 text-amber-500" },
                { icone: <WineIcon className="h-6 w-6" />, titulo: "Sommelier", desc: "5 vinhos na adega", ativo: degustadosCount >= 5, cor: "bg-primary/10 text-primary" },
                { icone: <Star className="h-6 w-6" />, titulo: "Crítico", desc: "10 vinhos na adega", ativo: degustadosCount >= 10, cor: "bg-indigo-500/10 text-indigo-500" },
                { icone: <Heart className="h-6 w-6" />, titulo: "Colecionador", desc: "20 vinhos na adega", ativo: degustadosCount >= 20, cor: "bg-rose-500/10 text-rose-500" },
              ].map((b, i) => (
                <div
                  key={i}
                  className={`w-28 shrink-0 rounded-2xl border p-3 text-center transition-all ${
                    b.ativo ? "bg-card border-border opacity-100" : "bg-card/40 border-dashed border-border/60 opacity-50"
                  }`}
                >
                  <div className={`mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full ${b.ativo ? b.cor : "bg-muted text-muted-foreground"}`}>
                    {b.icone}
                  </div>
                  <p className="text-xs font-bold leading-tight truncate">{b.titulo}</p>
                  <p className="text-[9px] text-muted-foreground leading-none mt-1 line-clamp-2">{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Avaliações Recentes */}
          <section className="px-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold">Minha Coleção</h2>
              {degustadosCount > 0 && <Link to="/adega" className="text-xs font-medium text-primary">Ver todos</Link>}
            </div>
            {degustadosCount === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/20 p-8 text-center text-sm text-muted-foreground">
                Você ainda não adicionou vinhos à sua adega.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {minhaAdega.slice(0, 4).map((w) => (
                  <Link
                    key={w.id}
                    to="/vinho/$id"
                    params={{ id: w.id }}
                    className="overflow-hidden rounded-2xl bg-card border border-border flex flex-col hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-sm"
                  >
                    <div className="aspect-[4/3] bg-secondary overflow-hidden">
                      <img src={w.imagem} alt={w.nome} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-3">
                      <p className="font-display text-xs font-semibold leading-tight line-clamp-1">{w.nome}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px]">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span className="font-semibold">{w.nota}</span>
                        <span className="text-muted-foreground">· R$ {w.preco}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Seção Desenvolvedor / Banco de Dados */}
          <section className="px-5">
            <h2 className="font-display text-lg font-semibold mb-3">Administração</h2>
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Como desenvolvedor, você pode inicializar a coleção no Firestore com os 25 vinhos reais padrões.
              </p>
              <button
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-card border border-border text-xs font-semibold hover:bg-muted/40 transition-colors disabled:opacity-50"
              >
                <Database className="h-4 w-4" />
                {seeding ? "Semeando banco..." : "Popular Banco Firestore (25 Vinhos)"}
              </button>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div>
      <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-full bg-primary-foreground/15">
        {icon}
      </div>
      <p className="font-display text-base font-bold leading-none">{value}</p>
      <p className="text-[9px] opacity-75 mt-0.5">{label}</p>
    </div>
  );
}
