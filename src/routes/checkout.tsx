import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, CreditCard, QrCode, ShieldCheck, Lock, CheckCircle2, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Finalizar Compra — Vitis" }],
  }),
  component: CheckoutPage,
});

type PaymentMethod = "pix" | "card";

function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [pixTimer, setPixTimer] = useState(600); // 10 minutos

  // Dados do Cartão
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardBrand, setCardBrand] = useState("unknown");

  const frete = cartTotal > 300 ? 0 : 19.9;
  const totalGeral = cartTotal + frete;

  // Redireciona se não houver usuário real ou se o carrinho estiver vazio (e não finalizado)
  useEffect(() => {
    if (!isFinished) {
      if (!user || user.isAnonymous) {
        toast.error("Você precisa estar logado para acessar o checkout.");
        navigate({ to: "/" });
      } else if (cartItems.length === 0) {
        navigate({ to: "/home" });
      }
    }
  }, [user, cartItems, navigate, isFinished]);

  // Timer do Pix
  useEffect(() => {
    if (paymentMethod === "pix" && pixTimer > 0 && !isFinished) {
      const interval = setInterval(() => {
        setPixTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [paymentMethod, pixTimer, isFinished]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    let formatted = "";
    for (let i = 0; i < cleaned.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) formatted += " ";
      formatted += cleaned[i];
    }
    setCardNumber(formatted);

    // Detecta a bandeira (simulação simples)
    if (cleaned.startsWith("4")) {
      setCardBrand("Visa");
    } else if (cleaned.startsWith("5")) {
      setCardBrand("Mastercard");
    } else if (cleaned.startsWith("3")) {
      setCardBrand("Amex");
    } else {
      setCardBrand("unknown");
    }
  };

  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 2) {
      setCardExpiry(cleaned);
    } else {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    }
  };

  const handleCopyPix = () => {
    const pixCode = "00020101021226850014br.gov.bcb.pix2563vitispayments20260707checkoutpixkey5303986540700.005802BR5914VitisCommerce6009SaoPaulo62070503***6304ED2B";
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    toast.success("Código Copia e Cola copiado!");
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === "card") {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        toast.error("Número de cartão inválido.");
        return;
      }
      if (!cardName) {
        toast.error("Preencha o nome impresso no cartão.");
        return;
      }
      if (cardExpiry.length < 5) {
        toast.error("Validade incorreta. Use MM/AA.");
        return;
      }
      if (cardCvv.length < 3) {
        toast.error("Código de segurança (CVV) incompleto.");
        return;
      }
    }

    setIsProcessing(true);

    // Simulação do Gateway de pagamento seguro (Stripe/Mercado Pago)
    setTimeout(async () => {
      if (user) {
        try {
          const itemsSummary = cartItems.map((item) => ({
            wineId: item.wineId,
            nome: item.wine.nome,
            preco: item.wine.preco,
            quantity: item.quantity,
            imagem: item.wine.imagem,
          }));

          await addDoc(collection(db, "users", user.uid, "orders"), {
            items: itemsSummary,
            total: totalGeral,
            paymentMethod: paymentMethod,
            status: "Aprovado",
            createdAt: new Date().toISOString(),
          });
        } catch (e) {
          console.error("Erro ao registrar pedido no Firestore:", e);
        }
      }

      await clearCart();
      setIsProcessing(false);
      setIsFinished(true);
      toast.success("Pagamento confirmado com sucesso!");
    }, 2500);
  };

  if (isFinished) {
    return (
      <div className="app-shell flex flex-col items-center justify-center px-6 py-20 text-center bg-background min-h-screen">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 scale-150 animate-ping" />
          <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white relative">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Pedido Confirmado!</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-xs">
          Obrigado pela sua compra. Seu pagamento foi processado com segurança e estamos preparando seu pedido.
        </p>
        <div className="mt-8 w-full max-w-xs rounded-2xl bg-card border border-border p-4 text-xs text-left space-y-2">
          <p className="font-semibold text-center pb-2 border-b border-border">Resumo da Transação</p>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID do Pedido:</span>
            <span className="font-mono font-medium">#VT-{Math.floor(100000 + Math.random() * 900000)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Forma de Pagamento:</span>
            <span className="font-medium">{paymentMethod === "pix" ? "Pix" : `Cartão de Crédito (${cardBrand})`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status do Gateway:</span>
            <span className="font-medium text-emerald-500 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Aprovado (SSL Secure)
            </span>
          </div>
        </div>
        <Link
          to="/home"
          className="mt-8 inline-flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/10 active:scale-95 transition-transform"
        >
          Voltar para a Home
        </Link>
      </div>
    );
  }

  return (
    <div className="app-shell bg-background min-h-screen text-foreground relative pb-10">
      {/* Topbar */}
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <Link to="/carrinho" className="grid h-10 w-10 place-items-center rounded-full bg-card border border-border">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-semibold">Checkout Seguro</h1>
        <div className="w-10 h-10" />
      </header>

      <form onSubmit={handlePay} className="px-5 space-y-6">
        {/* Segurança Banner */}
        <div className="flex items-center gap-3 rounded-2xl bg-primary/5 border border-primary/10 p-4 text-xs leading-relaxed text-muted-foreground">
          <Lock className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Ambiente 100% Criptografado</p>
            <p>Seus dados sensíveis estão protegidos conforme as regras da LGPD e os padrões da indústria PCI-DSS.</p>
          </div>
        </div>

        {/* Escolha do Método */}
        <div className="space-y-3">
          <p className="font-display text-base font-semibold">Forma de Pagamento</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("pix")}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                paymentMethod === "pix"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border bg-card"
              }`}
            >
              <QrCode className="h-6 w-6" />
              <span className="text-xs font-semibold">PIX (Imediato)</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                paymentMethod === "card"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border bg-card"
              }`}
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-xs font-semibold">Cartão de Crédito</span>
            </button>
          </div>
        </div>

        {/* PIX Interface */}
        {paymentMethod === "pix" && (
          <div className="rounded-3xl bg-card border border-border p-5 text-center space-y-4 animate-fade-in">
            <p className="text-xs text-muted-foreground">
              Escaneie o QR Code abaixo pelo aplicativo do seu banco para pagar.
            </p>
            <div className="mx-auto w-44 h-44 bg-white p-3 rounded-2xl border border-border flex items-center justify-center shadow-sm">
              {/* QR Code Simulado */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                <rect x="0" y="0" width="100" height="100" fill="white" />
                <path
                  d="M10,10 h20 v20 h-20 z M15,15 h10 v10 h-10 z M18,18 h4 v4 h-4 z M70,10 h20 v20 h-20 z M75,15 h10 v10 h-10 z M78,18 h4 v4 h-4 z M10,70 h20 v20 h-20 z M15,75 h10 v10 h-10 z M18,78 h4 v4 h-4 z M45,45 h10 v10 h-10 z M48,48 h4 v4 h-4 z"
                  fill="currentColor"
                />
                <path
                  d="M35,10 h5 v5 h-5 z M45,10 h10 v5 h-10 z M60,10 h5 v5 h-5 z M35,20 h10 v5 h-10 z M50,20 h5 v5 h-5 z M60,20 h5 v10 h-5 z M35,30 h5 v5 h-5 z M45,30 h10 v5 h-10 z M10,35 h5 v5 h-5 z M20,35 h15 v5 h-15 z M40,35 h5 v5 h-5 z M50,35 h5 v10 h-5 z M60,35 h5 v5 h-5 z M70,35 h10 v5 h-10 z M90,35 h5 v15 h-5 z M10,45 h10 v5 h-10 z M25,45 h5 v15 h-5 z M35,45 h5 v5 h-5 z M65,45 h5 v5 h-5 z M75,45 h10 v5 h-10 z M15,55 h5 v5 h-5 z M40,55 h5 v10 h-5 z M50,55 h10 v5 h-10 z M70,55 h5 v5 h-5 z M85,55 h10 v5 h-10 z M10,65 h5 v10 h-5 z M30,65 h5 v5 h-5 z M45,65 h10 v5 h-10 z M60,65 h10 v5 h-10 z M80,65 h15 v5 h-15 z M35,75 h5 v15 h-5 z M45,75 h10 v5 h-10 z M60,75 h5 v10 h-5 z M70,75 h10 v5 h-10 z M90,75 h5 v5 h-5 z M30,85 h5 v5 h-5 z M40,85 h10 v5 h-10 z M65,85 h5 v5 h-5 z M75,85 h15 v5 h-15 z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <p className="text-xs font-semibold text-primary">
              Expira em: <span className="font-mono text-sm">{formatTimer(pixTimer)}</span>
            </p>

            <button
              type="button"
              onClick={handleCopyPix}
              className="mx-auto flex items-center justify-center gap-2 px-4 py-2 border border-border bg-card hover:bg-muted/40 rounded-full text-xs font-medium active:scale-95 transition-transform"
            >
              {copiedPix ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedPix ? "Código Copiado!" : "Copiar Código Pix Copia e Cola"}
            </button>
          </div>
        )}

        {/* Credit Card Interface */}
        {paymentMethod === "card" && (
          <div className="space-y-4 animate-fade-in">
            {/* Visual Card Preview */}
            <div className="relative w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-[oklch(0.24_0.09_20)] to-[oklch(0.18_0.06_20)] p-5 text-white shadow-md flex flex-col justify-between overflow-hidden border border-white/5">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold tracking-widest text-white/60">VITIS CARD</span>
                <span className="text-sm font-bold tracking-wider italic text-white/90">
                  {cardBrand !== "unknown" ? cardBrand : "Credit Card"}
                </span>
              </div>
              <div className="my-2">
                <p className="font-mono text-lg tracking-widest text-white/90">
                  {cardNumber || "•••• •••• •••• ••••"}
                </p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/50">Nome do Titular</p>
                  <p className="text-xs font-semibold tracking-wide uppercase truncate max-w-[180px]">
                    {cardName || "Nome Impresso"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-wider text-white/50">Validade</p>
                  <p className="text-xs font-semibold tracking-wide">{cardExpiry || "MM/AA"}</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="Número do Cartão"
                className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary transition-all"
              />
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Nome impresso no cartão"
                className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary transition-all uppercase"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  placeholder="Validade (MM/AA)"
                  maxLength={5}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary transition-all"
                />
                <input
                  type="text"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="CVV"
                  maxLength={4}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Resumo de Custos e Botão de Ação */}
        <div className="rounded-3xl bg-card border border-border p-5 space-y-4">
          <div className="flex justify-between text-sm font-semibold border-b border-border pb-3">
            <span>Total a Pagar</span>
            <span className="text-primary text-base">R$ {totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/95 active:scale-[0.98] transition-transform disabled:opacity-75"
          >
            {isProcessing ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Processando transação segura...
              </>
            ) : paymentMethod === "pix" ? (
              "Confirmar Pagamento Pix"
            ) : (
              `Pagar R$ ${totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
