import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IdCard, Kanban, AlertTriangle, CheckCircle2 } from "lucide-react";

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
    { label: "Funcionários Ativos", value: data?.active ?? 0, bg: "bg-primary", icon: IdCard },
    { label: "Total de Tarefas", value: data?.total ?? 0, bg: "bg-info", icon: Kanban },
    { label: "Concluídas", value: data?.done ?? 0, bg: "bg-success", icon: CheckCircle2 },
    { label: "Tarefas Atrasadas", value: data?.overdue ?? 0, bg: "bg-destructive", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Painel</h1>
        <p className="text-muted-foreground mt-1">Visão geral da sua operação.</p>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="overflow-hidden pt-0 gap-0">
            <CardHeader className={`${c.bg} text-primary-foreground py-3`}>
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {c.label}
                <c.icon className="h-4 w-4 opacity-80" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-4xl font-semibold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao SGE</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2">
          <p>Use o menu acima para gerenciar funcionários, organizar tarefas em um quadro Kanban e acompanhar relatórios.</p>
        </CardContent>
      </Card>
    </div>
  );
}
