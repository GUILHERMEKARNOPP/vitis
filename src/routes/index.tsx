import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Apple, Mail, LogIn, UserPlus, AlertCircle, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import cellarHero from "@/assets/cellar-hero.jpg";

type SearchParams = {
  redirect?: string;
  reason?: string;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      redirect: typeof search.redirect === "string" ? search.redirect : undefined,
      reason: typeof search.reason === "string" ? search.reason : undefined,
    };
  },
  component: Login,
});

function Login() {
  const { redirect, reason } = useSearch({ from: "/" });
  const navigate = useNavigate();
  const {
    user,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
    loginAnonymously,
  } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Se o usuário já estiver logado (e não for anônimo), ou se for anônimo mas sem motivo de bloqueio, redireciona para a home
  useEffect(() => {
    if (user) {
      if (!user.isAnonymous) {
        navigate({ to: redirect || "/home" });
      } else if (!reason) {
        // Convidado sem bloqueio pode ir direto
        navigate({ to: "/home" });
      }
    }
  }, [user, navigate, redirect, reason]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    if (!email || !password) {
      setErrorMsg("Por favor, preencha todos os campos.");
      setIsLoading(false);
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        await signUpWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate({ to: redirect || "/home" });
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMsg("Este e-mail já está cadastrado.");
      } else if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setErrorMsg("E-mail ou senha incorretos.");
      } else if (err.code === "auth/weak-password") {
        setErrorMsg("A senha precisa ter pelo menos 6 caracteres.");
      } else {
        setErrorMsg("Ocorreu um erro. Tente novamente mais tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (method: () => Promise<void>) => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      await method();
      navigate({ to: redirect || "/home" });
    } catch (err: any) {
      console.error(err);
      if (err.code !== "auth/popup-closed-by-user") {
        setErrorMsg("Falha na autenticação. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      await loginAnonymously();
      navigate({ to: "/home" });
    } catch (err) {
      console.error(err);
      setErrorMsg("Falha ao entrar como convidado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell !pb-0 flex flex-col min-h-screen bg-background text-foreground">
      {/* Imagem Hero Superior */}
      <div className="relative h-[38vh] w-full overflow-hidden shrink-0">
        <img
          src={cellarHero}
          alt="Adega Vitis"
          className="h-full w-full object-cover animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
      </div>

      {/* Marca + Formulário */}
      <div className="-mt-12 relative flex-1 flex flex-col px-6 pb-8 bg-background rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-10">
        <div className="flex flex-col items-center mt-4 mb-6">
          <svg viewBox="0 0 64 80" className="h-14 w-14 text-primary" aria-hidden="true">
            <path
              d="M32 20 C24 22 22 12 30 8 C38 4 44 12 40 20"
              fill="currentColor"
              opacity="0.9"
            />
            <path
              d="M32 22 C32 30 28 34 32 44 C36 34 32 30 32 22 Z"
              fill="currentColor"
            />
            <path
              d="M32 44 Q28 52 32 58 Q36 64 30 70 Q26 74 32 78"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <h1 className="font-display text-4xl font-semibold text-primary leading-none mt-1">
            Vitis
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Sua Adega, Sua Escolha</p>
        </div>

        {/* Motivo de login obrigatório */}
        {reason === "cart_needs_login" && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-xs leading-relaxed animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Login Obrigatório</p>
              <p className="opacity-90">Por favor, acesse com uma conta cadastrada para adicionar vinhos e gerenciar seu carrinho de compras.</p>
            </div>
          </div>
        )}

        {/* Erro de feedback */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-destructive text-xs animate-shake">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulário de E-mail/Senha */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="space-y-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              disabled={isLoading}
              className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary transition-all disabled:opacity-50"
            />
          </div>
          <div className="space-y-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              disabled={isLoading}
              className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          {isRegistering && (
            <div className="space-y-1">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                disabled={isLoading}
                className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary transition-all disabled:opacity-50"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/95 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : isRegistering ? (
              <>
                <UserPlus className="h-4.5 w-4.5" />
                Cadastrar-se
              </>
            ) : (
              <>
                <LogIn className="h-4.5 w-4.5" />
                Entrar com e-mail
              </>
            )}
          </button>
        </form>

        {/* Toggle Login/Registro */}
        <div className="text-center mt-3">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-xs font-medium text-primary hover:underline"
            disabled={isLoading}
          >
            {isRegistering ? "Já tem uma conta? Faça Login" : "Novo por aqui? Crie uma conta"}
          </button>
        </div>

        {/* Separador */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <span className="relative px-3 bg-background text-[10px] uppercase tracking-wider text-muted-foreground">
            Ou acesse com
          </span>
        </div>

        {/* Redes Sociais */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleSocialLogin(loginWithGoogle)}
            disabled={isLoading}
            className="flex h-12 items-center justify-center rounded-xl border border-border bg-card font-medium active:scale-[0.97] transition-transform disabled:opacity-50"
            title="Continuar com Google"
          >
            <GoogleIcon />
          </button>
          <button
            onClick={() => handleSocialLogin(loginWithApple)}
            disabled={isLoading}
            className="flex h-12 items-center justify-center rounded-xl border border-border bg-card font-medium active:scale-[0.97] transition-transform disabled:opacity-50"
            title="Continuar com Apple"
          >
            <Apple className="h-5 w-5" fill="currentColor" />
          </button>
          <button
            onClick={() => handleSocialLogin(loginWithFacebook)}
            disabled={isLoading}
            className="flex h-12 items-center justify-center rounded-xl border border-border bg-card font-medium active:scale-[0.97] transition-transform disabled:opacity-50"
            title="Continuar com Facebook"
          >
            <FacebookIcon />
          </button>
        </div>

        {/* Entrar como Convidado */}
        <div className="mt-5 w-full">
          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-primary text-primary font-medium bg-transparent hover:bg-primary/5 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <Play className="h-4.5 w-4.5 fill-current" />
            Entrar como Convidado
          </button>
        </div>

        <p className="mt-5 text-center text-[10px] text-muted-foreground max-w-xs mx-auto">
          Ao continuar, você concorda com os Termos de Serviço e a Política de Privacidade do Vitis.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.87 11.85v-8.38H7.08V12h3.05V9.36c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87V12h3.33l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12z"/>
    </svg>
  );
}
