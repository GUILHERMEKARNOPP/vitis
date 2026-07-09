import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { X, Zap, Image as ImageIcon, Search, Sparkles } from "lucide-react";
import { useState, useRef } from "react";
import { useWines } from "@/hooks/useWines";
import { toast } from "sonner";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Escanear rótulo — Vitis" },
      { name: "description", content: "Tire uma foto ou envie uma imagem do rótulo para descobrir o vinho." },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const { wines } = useWines();
  const [scanning, setScanning] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Criar URL local para exibição no viewfinder
    const localUrl = URL.createObjectURL(file);
    setPhotoUrl(localUrl);

    // Iniciar processo de scan simulado
    setScanning(true);
    toast.info("Analisando rótulo com Vitis Vision...");

    setTimeout(() => {
      // Puxar um vinho aleatório da nossa base cadastrada para correspondência dinâmica
      if (wines.length > 0) {
        const randomIdx = Math.floor(Math.random() * wines.length);
        const matchedWine = wines[randomIdx];
        navigate({
          to: "/scan/resultado",
          search: { wineId: matchedWine.id },
        });
      } else {
        navigate({ to: "/scan/resultado" });
      }
    }, 2000);
  };

  // Simulação rápida para quem só clica no botão sem tirar foto real
  const handleMockCapture = () => {
    setScanning(true);
    toast.info("Capturando imagem padrão...");
    setTimeout(() => {
      if (wines.length > 0) {
        const randomIdx = Math.floor(Math.random() * wines.length);
        const matchedWine = wines[randomIdx];
        navigate({
          to: "/scan/resultado",
          search: { wineId: matchedWine.id },
        });
      } else {
        navigate({ to: "/scan/resultado" });
      }
    }, 2000);
  };

  return (
    <div className="app-shell !pb-0 relative overflow-hidden bg-black text-white min-h-screen">
      {/* Input de arquivo invisível para tirar foto ou selecionar da galeria */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Viewfinder background — dark cellar vibe */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black" />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-5 pt-8 z-10">
        <Link
          to="/home"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur"
        >
          <X className="h-5 w-5" />
        </Link>
        <p className="font-display text-lg">Escanear Rótulo</p>
        <button className="grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur">
          <Zap className="h-5 w-5" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="relative mx-auto mt-10 aspect-[3/4] w-[85%] overflow-hidden rounded-3xl z-10">
        {/* Visualizador da foto tirada */}
        {photoUrl ? (
          <img src={photoUrl} alt="Rótulo capturado" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-neutral-950/60 flex flex-col items-center justify-center text-center p-4">
            <Sparkles className="h-10 w-10 text-primary mb-3 animate-pulse" />
            <p className="text-xs text-white/50">Câmera pronta</p>
          </div>
        )}

        <div className="absolute inset-0 rounded-3xl border border-white/20" />
        {/* Corner brackets */}
        {[
          "top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl",
          "top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl",
          "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl",
          "bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl",
        ].map((c, i) => (
          <span key={i} className={`absolute h-16 w-16 border-primary ${c}`} />
        ))}

        {/* Scanning line */}
        {scanning && (
          <div className="absolute inset-x-4 top-0 h-1 animate-[scan_2s_linear_infinite] rounded bg-primary shadow-[0_0_20px_2px_var(--primary)]" />
        )}
        <div className="absolute inset-x-0 bottom-6 text-center text-xs text-white/80 px-4">
          {scanning ? "Analisando rótulo com inteligência artificial..." : "Tire uma foto ou carregue um arquivo do rótulo"}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="relative mt-10 flex items-center justify-around px-8 pb-10 z-10">
        <button
          onClick={handleTriggerFileInput}
          disabled={scanning}
          className="grid h-14 w-14 place-items-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20 active:scale-95 transition-all disabled:opacity-50"
          title="Selecionar da galeria"
        >
          <ImageIcon className="h-6 w-6" />
        </button>
        <button
          onClick={handleMockCapture}
          disabled={scanning}
          className="grid h-20 w-20 place-items-center rounded-full bg-primary ring-4 ring-white/20 active:scale-95 transition-transform disabled:opacity-70"
          aria-label="Capturar rótulo"
        >
          <span className="h-14 w-14 rounded-full bg-primary-foreground/10 border-2 border-primary-foreground" />
        </button>
        <Link
          to="/busca"
          className="grid h-14 w-14 place-items-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20 active:scale-95 transition-all"
          title="Pesquisar vinho"
        >
          <Search className="h-6 w-6" />
        </Link>
      </div>

      <p className="relative pb-8 text-center text-[10px] text-white/40 z-10">
        Powered by Vitis Vision AI · Reconhecimento Inteligente
      </p>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(350px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
