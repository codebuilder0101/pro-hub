import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IdCard, Kanban, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — SGE" }] }),
  component: ReportsPage,
});

type Task = { id: string; status: "todo" | "doing" | "done"; priority: "low" | "medium" | "high"; assigned_employee_id: string | null; due_date: string | null };
type Employee = { id: string; full_name: string; active: boolean };

const STATUS_LABEL = { todo: "A Fazer", doing: "Em Andamento", done: "Concluído" } as const;
const PRIO_LABEL = { low: "Baixa", medium: "Média", high: "Alta" } as const;

function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const [emp, tasks] = await Promise.all([
        supabase.from("employees").select("id, full_name, active"),
        supabase.from("tasks").select("id, status, priority, assigned_employee_id, due_date"),
      ]);
      if (emp.error) throw emp.error;
      if (tasks.error) throw tasks.error;
      return { employees: emp.data as Employee[], tasks: tasks.data as Task[] };
    },
  });

  const employees = data?.employees ?? [];
  const tasks = data?.tasks ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const active = employees.filter((e) => e.active).length;
  const overdue = tasks.filter((t) => t.due_date && t.due_date < today && t.status !== "done").length;

  const byStatus = (["todo", "doing", "done"] as const).map((s) => ({ label: STATUS_LABEL[s], count: tasks.filter((t) => t.status === s).length }));
  const byPriority = (["low", "medium", "high"] as const).map((p) => ({ label: PRIO_LABEL[p], count: tasks.filter((t) => t.priority === p).length }));
  const perEmployee = employees.filter((e) => e.active).map((e) => ({
    name: e.full_name,
    active: tasks.filter((t) => t.assigned_employee_id === e.id && t.status !== "done").length,
  }));

  const stats = [
    { label: "Funcionários Ativos", value: active, tint: "bg-primary/10 text-primary", icon: IdCard, desc: "Total de funcionários ativos." },
    { label: "Total de Tarefas", value: tasks.length, tint: "bg-info/10 text-info", icon: Kanban, desc: "Total de tarefas cadastradas." },
    { label: "Tarefas Atrasadas", value: overdue, tint: "bg-destructive/10 text-destructive", icon: AlertTriangle, desc: "Tarefas atrasadas e não concluídas." },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">Análises</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Relatórios</h1>
        <p className="mt-1.5 text-muted-foreground">Métricas globais de equipe e tarefas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${s.tint}`}>
                  <s.icon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-2 text-3xl font-bold tracking-tight">{s.value}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Status das Tarefas</CardTitle></CardHeader>
          <CardContent>
            {tasks.length === 0 ? <p className="text-muted-foreground text-sm">Nenhum dado de status de tarefa.</p> : (
              <ul className="space-y-2">
                {byStatus.map((b) => (
                  <li key={b.label} className="flex items-center justify-between text-sm">
                    <span>{b.label}</span>
                    <span className="font-medium">{b.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Prioridade das Tarefas</CardTitle></CardHeader>
          <CardContent>
            {tasks.length === 0 ? <p className="text-muted-foreground text-sm">Nenhum dado de prioridade de tarefa.</p> : (
              <ul className="space-y-2">
                {byPriority.map((b) => (
                  <li key={b.label} className="flex items-center justify-between text-sm">
                    <span>{b.label}</span>
                    <span className="font-medium">{b.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Tarefas Ativas por Funcionário</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead className="text-right">Tarefas Ativas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perEmployee.length === 0 && (
                <TableRow><TableCell colSpan={2} className="text-muted-foreground text-center py-4">Nenhum funcionário ativo.</TableCell></TableRow>
              )}
              {perEmployee.map((e) => (
                <TableRow key={e.name} className="odd:bg-muted/30">
                  <TableCell>{e.name}</TableCell>
                  <TableCell className="text-right">{e.active}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
