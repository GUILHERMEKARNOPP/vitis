import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [{ title: "Carrinho — Vitis" }],
  }),
  component: CarrinhoPage,
});

function CarrinhoPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const frete = cartTotal > 300 || cartTotal === 0 ? 0 : 19.9;
  const totalGeral = cartTotal + frete;

  const handleCheckout = () => {
    if (!user || user.isAnonymous) {
      toast.error("Você precisa estar logado com uma conta real para finalizar a compra.");
      navigate({
        to: "/",
        search: {
          redirect: "/checkout",
          reason: "cart_needs_login",
        },
      });
      return;
    }
    navigate({ to: "/checkout" });
  };

  return (
    <AppShell>
      <header className="px-5 pt-8 pb-4">
        <h1 className="font-display text-3xl font-semibold">Seu Carrinho</h1>
        <p className="text-sm text-muted-foreground">
          {cartCount} {cartCount === 1 ? "item selecionado" : "itens selecionados"}
        </p>
      </header>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary mb-4">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="font-display text-xl font-semibold">Carrinho vazio</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            Navegue pelo nosso catálogo e descubra rótulos espetaculares para preencher sua adega.
          </p>
          <Link
            to="/busca"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10"
          >
            Explorar Vinhos
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6 px-5 pb-28">
          {/* Listagem de itens */}
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.wineId}
                className="flex items-center gap-4 rounded-2xl bg-card border border-border p-3 shadow-sm animate-fade-in"
              >
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  <img
                    src={item.wine.imagem}
                    alt={item.wine.nome}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {item.wine.produtor}
                  </p>
                  <h3 className="font-display font-semibold text-sm leading-tight truncate">
                    {item.wine.nome}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    R$ {item.wine.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>

                  {/* Seletores de quantidade */}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.wineId, item.quantity - 1)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-card hover:bg-muted/50 active:scale-90 transition-transform"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.wineId, item.quantity + 1)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-card hover:bg-muted/50 active:scale-90 transition-transform"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    removeFromCart(item.wineId);
                    toast.info(`${item.wine.nome} removido.`);
                  }}
                  className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 active:scale-90 transition-colors"
                  aria-label="Remover item"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Resumo de valores */}
          <div className="rounded-3xl bg-card border border-border p-5 shadow-sm space-y-4">
            <h3 className="font-display font-semibold text-lg">Resumo do Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>R$ {cartTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frete</span>
                <span>
                  {frete === 0 ? (
                    <span className="text-primary font-medium">Grátis</span>
                  ) : (
                    `R$ ${frete.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  )}
                </span>
              </div>
              {frete > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  Adicione mais R$ {(300 - cartTotal).toLocaleString("pt-BR")} para ganhar frete grátis!
                </p>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-display font-semibold text-base">
                <span>Total</span>
                <span>R$ {totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:bg-primary/95 active:scale-[0.98] transition-all mt-2"
            >
              Finalizar Compra
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
