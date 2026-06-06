import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { IdCard, Kanban, AlertTriangle, CheckCircle2, LineChart, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Início — SGE" }] }),
  component: HomePage,
});

function HomePage() {
  const { data } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [emp, tasks, overdue, done] = await Promise.all([
        supabase.from("employees").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("tasks").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }).lt("due_date", today).neq("status", "done"),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "done"),
      ]);
      return {
        active: emp.count ?? 0,
        total: tasks.count ?? 0,
        overdue: overdue.count ?? 0,
        done: done.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Funcionários Ativos", value: data?.active ?? 0, tint: "bg-primary/10 text-primary", icon: IdCard },
    { label: "Total de Tarefas", value: data?.total ?? 0, tint: "bg-info/10 text-info", icon: Kanban },
    { label: "Concluídas", value: data?.done ?? 0, tint: "bg-success/10 text-success", icon: CheckCircle2 },
    { label: "Tarefas Atrasadas", value: data?.overdue ?? 0, tint: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  ];

  const links = [
    { to: "/funcionarios", label: "Funcionários", desc: "Cadastre e gerencie sua equipe.", icon: IdCard },
    { to: "/projetos", label: "Projetos", desc: "Organize tarefas no quadro Kanban.", icon: Kanban },
    { to: "/relatorios", label: "Relatórios", desc: "Acompanhe métricas e desempenho.", icon: LineChart },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">Painel</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Visão geral</h1>
        <p className="mt-1.5 text-muted-foreground">Um resumo rápido da sua operação.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="card-hover">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{c.value}</p>
              </div>
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${c.tint}`}>
                <c.icon className="h-6 w-6" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Atalhos</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="group">
              <Card className="card-hover h-full">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <l.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold">
                      {l.label}
                      <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
