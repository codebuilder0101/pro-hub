import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, Home, IdCard, Kanban, LineChart, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const nav = [
  { to: "/", label: "Início", icon: Home },
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

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-base mr-4">
          <Building2 className="h-5 w-5" />
          <span>Sistema de Gerenciamento Empresarial</span>
        </Link>
        <nav className="flex items-center gap-1 flex-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-white/10 transition-colors [&.active]:bg-white/15"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-md bg-foreground/80 px-3 py-1.5 text-sm">
            <User className="h-4 w-4" /> Olá, {username}!
          </span>
          <Button variant="destructive" size="sm" onClick={handleSignOut} className="gap-1.5">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
