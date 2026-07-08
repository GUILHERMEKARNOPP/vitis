import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, ScanLine, Wine, User } from "lucide-react";

type Tab = {
  to: "/home" | "/busca" | "/scan" | "/adega" | "/perfil";
  icon: typeof Home;
  label: string;
  highlight?: boolean;
};

const tabs: Tab[] = [
  { to: "/home", icon: Home, label: "Início" },
  { to: "/busca", icon: Search, label: "Buscar" },
  { to: "/scan", icon: ScanLine, label: "Scan", highlight: true },
  { to: "/adega", icon: Wine, label: "Adega" },
  { to: "/perfil", icon: User, label: "Perfil" },
];

export function TabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-background/95 backdrop-blur-md">
      <ul className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {tabs.map(({ to, icon: Icon, label, highlight }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          if (highlight) {
            return (
              <li key={to} className="-mt-6">
                <Link
                  to={to}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95"
                  aria-label={label}
                >
                  <Icon className="h-6 w-6" />
                </Link>
              </li>
            );
          }
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className={active ? "font-medium" : ""}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
