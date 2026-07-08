import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { X, Zap, Image as ImageIcon, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Escanear rótulo — Vitis" },
      { name: "description", content: "Aponte a câmera para o rótulo e descubra o vinho." },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);

  function handleCapture() {
    setScanning(true);
    setTimeout(() => {
      navigate({ to: "/scan/resultado" });
    }, 1400);
  }

  return (
    <div className="app-shell !pb-0 relative overflow-hidden bg-black text-white">
      {/* Viewfinder background — dark cellar vibe */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black" />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-5 pt-8">
        <Link
          to="/home"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur"
        >
          <X className="h-5 w-5" />
        </Link>
        <p className="font-display text-lg">Escanear rótulo</p>
        <button className="grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur">
          <Zap className="h-5 w-5" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="relative mx-auto mt-10 aspect-[3/4] w-[85%]">
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
          <div className="absolute inset-x-8 top-0 h-1 animate-[scan_1.4s_linear] rounded bg-primary shadow-[0_0_20px_2px_var(--primary)]" />
        )}
        <div className="absolute inset-x-0 bottom-6 text-center text-sm text-white/70">
          {scanning ? "Analisando rótulo..." : "Alinhe o rótulo dentro da moldura"}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="relative mt-10 flex items-center justify-around px-8 pb-10">
        <button className="grid h-14 w-14 place-items-center rounded-full bg-white/10 backdrop-blur">
          <ImageIcon className="h-6 w-6" />
        </button>
        <button
          onClick={handleCapture}
          disabled={scanning}
          className="grid h-20 w-20 place-items-center rounded-full bg-primary ring-4 ring-white/20 active:scale-95 transition-transform disabled:opacity-70"
          aria-label="Capturar"
        >
          <span className="h-14 w-14 rounded-full bg-primary-foreground/10 border-2 border-primary-foreground" />
        </button>
        <Link
          to="/busca"
          className="grid h-14 w-14 place-items-center rounded-full bg-white/10 backdrop-blur"
        >
          <Search className="h-6 w-6" />
        </Link>
      </div>

      <p className="relative pb-8 text-center text-xs text-white/50">
        Powered by Vitis Vision · Reconhecimento de rótulos
      </p>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(400px); }
        }
      `}</style>
    </div>
  );
}
