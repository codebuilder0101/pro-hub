import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IdCard, Kanban, AlertTriangle } from "lucide-react";
// (table view replaced by charts)
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  color: "var(--popover-foreground)",
  fontSize: "0.8rem",
} as const;

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — SGE" }] }),
  component: ReportsPage,
});

type Task = { id: string; status: "todo" | "doing" | "done"; priority: "low" | "medium" | "high"; assigned_employee_id: string | null; due_date: string | null };
type Employee = { id: string; full_name: string; active: boolean };

const STATUS_LABEL = { todo: "A Fazer", doing: "Em Andamento", done: "Concluído" } as const;
const PRIO_LABEL = { low: "Baixa", medium: "Média", high: "Alta" } as const;

function ReportsPage() {
  const { data, isLoading } = useQuery({
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

  const STATUS_COLORS = ["var(--muted-foreground)", "var(--info)", "var(--success)"];
  const PRIO_COLORS = ["var(--success)", "var(--warning)", "var(--destructive)"];
  const byStatus = (["todo", "doing", "done"] as const).map((s, i) => ({ label: STATUS_LABEL[s], count: tasks.filter((t) => t.status === s).length, fill: STATUS_COLORS[i] }));
  const byPriority = (["low", "medium", "high"] as const).map((p, i) => ({ label: PRIO_LABEL[p], count: tasks.filter((t) => t.priority === p).length, fill: PRIO_COLORS[i] }));
  const perEmployee = employees
    .filter((e) => e.active)
    .map((e) => ({ name: e.full_name, active: tasks.filter((t) => t.assigned_employee_id === e.id && t.status !== "done").length }))
    .sort((a, b) => b.active - a.active);

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
              {isLoading ? (
                <Skeleton className="mt-2 h-9 w-14" />
              ) : (
                <div className="mt-2 text-3xl font-bold tracking-tight">{s.value}</div>
              )}
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Status das Tarefas</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : tasks.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">Nenhum dado de status de tarefa.</p>
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={byStatus} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)" }} />
                  <Bar dataKey="count" name="Tarefas" radius={[6, 6, 0, 0]}>
                    {byStatus.map((b) => (
                      <Cell key={b.label} fill={b.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Prioridade das Tarefas</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : tasks.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">Nenhum dado de prioridade de tarefa.</p>
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <PieChart>
                  <Pie data={byPriority} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {byPriority.map((b) => (
                      <Cell key={b.label} fill={b.fill} stroke="var(--card)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "0.8rem" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Tarefas Ativas por Funcionário</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : perEmployee.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Nenhum funcionário ativo.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(220, perEmployee.length * 44)}>
              <BarChart data={perEmployee} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)" }} />
                <Bar dataKey="active" name="Tarefas ativas" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
