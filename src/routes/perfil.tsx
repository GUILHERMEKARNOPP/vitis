import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Star, Heart, Trophy, Wine as WineIcon, LogIn, UserPlus, Database, ShoppingBag, Calendar, Edit, Trash2, PlusCircle, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useWines } from "@/hooks/useWines";
import { wines as staticWines, type Wine as WineType } from "@/lib/wines";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [{ title: "Perfil — Vitis" }],
  }),
  component: PerfilPage,
});

type TabType = "collection" | "orders" | "manager";

function PerfilPage() {
  const { user, logout, isAnonymous } = useAuth();
  const navigate = useNavigate();
  const { wines: catalogWines, addWine, updateWine, deleteWine, seedFirestore } = useWines();

  const [minhaAdega, setMinhaAdega] = useState<WineType[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("collection");
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // States para gerenciar vinhos (Painel do Gerente)
  const [editingWineId, setEditingWineId] = useState<string | null>(null);
  const [wineId, setWineId] = useState("");
  const [wineName, setWineName] = useState("");
  const [wineProducer, setWineProducer] = useState("");
  const [wineType, setWineType] = useState<"Tinto" | "Branco" | "Rosé" | "Espumante">("Tinto");
  const [wineGrape, setWineGrape] = useState("");
  const [wineRegion, setWineRegion] = useState("");
  const [wineCountry, setWineCountry] = useState("");
  const [winePrice, setWinePrice] = useState("");
  const [wineImage, setWineImage] = useState("");
  const [wineDesc, setWineDesc] = useState("");

  const isManager = user && (user.email === "gerente@vitis.com" || user.email === "admin@vitis.com");

  useEffect(() => {
    if (!user) {
      setMinhaAdega([]);
      setOrders([]);
      setLoading(false);
      return;
    }

    // Carregar Adega
    const cellarRef = collection(db, "users", user.uid, "cellar");
    const unsubscribeCellar = onSnapshot(
      cellarRef,
      (snapshot) => {
        const list: WineType[] = [];
        snapshot.forEach((docSnap) => {
          const wine = catalogWines.find((w) => w.id === docSnap.id) || staticWines.find((w) => w.id === docSnap.id);
          if (wine) {
            list.push(wine);
          }
        });
        setMinhaAdega(list);
        setLoading(false);
      },
      (error) => {
        console.warn("Erro ao buscar adega:", error);
        setLoading(false);
      }
    );

    // Carregar Pedidos
    const ordersRef = collection(db, "users", user.uid, "orders");
    const unsubscribeOrders = onSnapshot(
      ordersRef,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        // Ordenar por mais recente
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(list);
      },
      (error) => {
        console.warn("Erro ao carregar histórico de pedidos:", error);
      }
    );

    return () => {
      unsubscribeCellar();
      unsubscribeOrders();
    };
  }, [user, catalogWines]);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const handleSaveWine = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wineId || !wineName || !wineProducer || !winePrice) {
      toast.error("Por favor, preencha os campos obrigatórios.");
      return;
    }

    const priceNum = parseFloat(winePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Preço inválido.");
      return;
    }

    const wineData: WineType = {
      id: wineId.trim().toLowerCase().replace(/\s+/g, "-"),
      nome: wineName,
      produtor: wineProducer,
      safra: 2022, // Padrão
      regiao: wineRegion || "Mendoza",
      pais: wineCountry || "Argentina",
      tipo: wineType,
      uva: wineGrape || "Uvas Variadas",
      nota: 4.0, // Padrão
      avaliacoes: 1, // Padrão
      preco: priceNum,
      imagem: wineImage || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600",
      sabores: ["Elegante", "Aromático"],
      harmonizacao: ["Aperitivos"],
      descricao: wineDesc || "Vinho cadastrado pela gerência.",
    };

    try {
      if (editingWineId) {
        await updateWine(editingWineId, wineData);
        toast.success("Vinho atualizado com sucesso!");
      } else {
        await addWine(wineData);
        toast.success("Vinho cadastrado com sucesso!");
      }
      resetForm();
    } catch (err) {
      toast.error("Erro ao salvar vinho no banco.");
    }
  };

  const handleEditWine = (wine: WineType) => {
    setEditingWineId(wine.id);
    setWineId(wine.id);
    setWineName(wine.nome);
    setWineProducer(wine.produtor);
    setWineType(wine.tipo);
    setWineGrape(wine.uva);
    setWineRegion(wine.regiao);
    setWineCountry(wine.pais);
    setWinePrice(wine.preco.toString());
    setWineImage(wine.imagem);
    setWineDesc(wine.descricao);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const handleDeleteWine = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este vinho do catálogo?")) {
      try {
        await deleteWine(id);
        toast.success("Vinho removido do catálogo.");
      } catch (err) {
        toast.error("Não foi possível excluir o vinho.");
      }
    }
  };

  const resetForm = () => {
    setEditingWineId(null);
    setWineId("");
    setWineName("");
    setWineProducer("");
    setWineType("Tinto");
    setWineGrape("");
    setWineRegion("");
    setWineCountry("");
    setWinePrice("");
    setWineImage("");
    setWineDesc("");
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedFirestore();
      toast.success("Banco semeado com 25 vinhos reais com sucesso!");
    } catch (e) {
      toast.error("Falha ao semear banco.");
    } finally {
      setSeeding(false);
    }
  };

  // Estatísticas da Adega
  const degustadosCount = minhaAdega.length;
  const notaMedia = () => {
    if (minhaAdega.length === 0) return 0;
    const sum = minhaAdega.reduce((acc, w) => acc + w.nota, 0);
    return (sum / minhaAdega.length).toFixed(1);
  };

  const getProfileName = () => {
    if (!user) return "";
    if (isAnonymous) return "Viticultor Convidado";
    if (isManager) return "Gerente Vitis";
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
            title="Sair da Conta"
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
            Faça login para gerenciar suas conquistas, acompanhar seus pedidos e acessar painéis administrativos.
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
                  <div className="flex items-center gap-2">
                    <p className="font-display text-xl font-semibold">{getProfileName()}</p>
                    {isManager && (
                      <span className="text-[9px] uppercase bg-primary-foreground/20 text-white px-2 py-0.5 rounded-full font-bold">
                        Gerente
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-75">
                    {isAnonymous ? "Sessão temporária" : user.email}
                  </p>
                  <p className="text-[10px] opacity-60 mt-0.5">Membro desde {getMemberDate()}</p>
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

          {/* Navegação por Abas (Tabs) */}
          <div className="flex px-5 border-b border-border">
            <button
              onClick={() => setActiveTab("collection")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "collection" ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground"
              }`}
            >
              Coleção e Badges
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "orders" ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground"
              }`}
            >
              Meus Pedidos ({orders.length})
            </button>
            {isManager && (
              <button
                onClick={() => setActiveTab("manager")}
                className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === "manager" ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground"
                }`}
              >
                Painel do Gerente
              </button>
            )}
          </div>

          {/* ABA 1: Coleção & Conquistas */}
          {activeTab === "collection" && (
            <div className="space-y-6">
              {/* Conquistas */}
              <section className="px-5">
                <h2 className="font-display text-base font-semibold mb-3">Conquistas</h2>
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

              {/* Minha Coleção */}
              <section className="px-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-base font-semibold">Minha Coleção Recente</h2>
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
            </div>
          )}

          {/* ABA 2: Meus Pedidos (Histórico de Compras) */}
          {activeTab === "orders" && (
            <div className="px-5 space-y-4">
              <h2 className="font-display text-base font-semibold">Histórico de Compras</h2>
              {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/20 p-10 text-center text-sm text-muted-foreground">
                  Nenhum pedido finalizado ainda. Faça compras na loja!
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                          {order.status}
                        </span>
                      </div>

                      {/* Itens do pedido */}
                      <div className="space-y-2">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3">
                            <img src={item.imagem} alt={item.nome} className="h-10 w-8 object-cover rounded-lg bg-secondary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold leading-tight truncate">{item.nome}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {item.quantity}x · R$ {item.preco.toLocaleString("pt-BR")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center pt-2 border-t border-border text-xs font-bold">
                        <span className="text-muted-foreground uppercase text-[10px]">Método: {order.paymentMethod === "pix" ? "Pix" : "Cartão"}</span>
                        <span>Total: R$ {order.total?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 3: Painel do Gerente (Admin) */}
          {activeTab === "manager" && isManager && (
            <div className="px-5 space-y-6">
              {/* Formulário de Cadastro/Edição */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <h3 className="font-display font-semibold text-base flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  {editingWineId ? "Editar Vinho Cadastrado" : "Cadastrar Novo Vinho"}
                </h3>
                <form onSubmit={handleSaveWine} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-medium text-muted-foreground">ID do Vinho (Único)*</label>
                      <input
                        type="text"
                        value={wineId}
                        onChange={(e) => setWineId(e.target.value)}
                        placeholder="ex: catena-malbec"
                        disabled={!!editingWineId}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background outline-none focus:border-primary disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-muted-foreground">Preço (R$)*</label>
                      <input
                        type="number"
                        step="0.01"
                        value={winePrice}
                        onChange={(e) => setWinePrice(e.target.value)}
                        placeholder="ex: 249"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-muted-foreground">Nome Completo do Vinho*</label>
                    <input
                      type="text"
                      value={wineName}
                      onChange={(e) => setWineName(e.target.value)}
                      placeholder="ex: Catena Zapata Malbec"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-medium text-muted-foreground">Produtor*</label>
                      <input
                        type="text"
                        value={wineProducer}
                        onChange={(e) => setWineProducer(e.target.value)}
                        placeholder="ex: Catena Zapata"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-muted-foreground">Tipo de Vinho</label>
                      <select
                        value={wineType}
                        onChange={(e: any) => setWineType(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background outline-none focus:border-primary"
                      >
                        <option value="Tinto">Tinto</option>
                        <option value="Branco">Branco</option>
                        <option value="Rosé">Rosé</option>
                        <option value="Espumante">Espumante</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="font-medium text-muted-foreground">Uva</label>
                      <input
                        type="text"
                        value={wineGrape}
                        onChange={(e) => setWineGrape(e.target.value)}
                        placeholder="ex: Malbec"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-muted-foreground">Região</label>
                      <input
                        type="text"
                        value={wineRegion}
                        onChange={(e) => setWineRegion(e.target.value)}
                        placeholder="ex: Mendoza"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-muted-foreground">País</label>
                      <input
                        type="text"
                        value={wineCountry}
                        onChange={(e) => setWineCountry(e.target.value)}
                        placeholder="ex: Argentina"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-muted-foreground">URL da Imagem da Garrafa/Rótulo</label>
                    <input
                      type="text"
                      value={wineImage}
                      onChange={(e) => setWineImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-muted-foreground">Descrição (Legenda/Notas de Prova)</label>
                    <textarea
                      value={wineDesc}
                      onChange={(e) => setWineDesc(e.target.value)}
                      placeholder="Descreva as características sensoriais do vinho..."
                      className="w-full h-16 p-3 rounded-lg border border-border bg-background outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    {editingWineId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 h-10 rounded-full border border-border font-semibold hover:bg-muted/40 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 h-10 rounded-full bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/95 transition-colors"
                    >
                      {editingWineId ? "Salvar Alterações" : "Adicionar ao Catálogo"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista para Edição Rápida */}
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-base">Catálogo Cadastrado ({catalogWines.length})</h3>
                <div className="space-y-2">
                  {catalogWines.map((wine) => (
                    <div key={wine.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-sm">
                      <img src={wine.imagem} alt={wine.nome} className="h-14 w-11 object-cover rounded-lg bg-secondary shrink-0" />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-bold leading-tight truncate">{wine.nome}</p>
                        <p className="text-muted-foreground mt-0.5">{wine.produtor} · R$ {wine.preco.toLocaleString("pt-BR")}</p>
                        <p className="text-[10px] text-primary mt-1 line-clamp-1 italic">{wine.descricao}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleEditWine(wine)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                          title="Editar vinho"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWine(wine.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                          title="Remover do catálogo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botão de Semear Banco */}
              <div className="rounded-2xl border border-dashed border-border bg-card/25 p-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Como administrador, você pode forçar a reinicialização da coleção no Firestore com os 25 vinhos originais (isso irá mesclar e manter os vinhos existentes).
                </p>
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-card border border-border text-xs font-semibold hover:bg-muted/40 transition-colors disabled:opacity-50"
                >
                  <Database className="h-4 w-4" />
                  {seeding ? "Populando Firestore..." : "Sincronizar Banco com 25 Vinhos Padrões"}
                </button>
              </div>
            </div>
          )}
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
