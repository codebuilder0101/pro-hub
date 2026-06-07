import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, Home, IdCard, Kanban, LineChart, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";

const nav = [
  { to: "/painel", label: "Início", icon: Home },
  { to: "/funcionarios", label: "Funcionários", icon: IdCard },
  { to: "/projetos", label: "Projetos", icon: Kanban },
  { to: "/relatorios", label: "Relatórios", icon: LineChart },
] as const;

export function AppHeader() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) setUsername((u.user_metadata?.username as string) ?? u.email?.split("@")[0] ?? "usuário");
    });
  }, []);

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initial = (username || "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 glass">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <Link to="/painel" className="flex items-center gap-2.5 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-primary/30">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-sm font-bold tracking-tight">SGE</span>
            <span className="text-[11px] text-muted-foreground">Gerenciamento Empresarial</span>
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto px-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/painel" }}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-accent-foreground [&.active]:shadow-sm"
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <Link
            to="/perfil"
            className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/60 py-1 pl-1 pr-3 transition-colors hover:bg-accent sm:flex"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">
              {initial}
            </span>
            <span className="text-sm font-medium">{username}</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
