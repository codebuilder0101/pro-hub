import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Search, Pencil } from "lucide-react";
import { toast } from "sonner";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  assigned_employee_id: string | null;
};

type Employee = { id: string; full_name: string };

const STATUSES: { value: Task["status"]; label: string }[] = [
  { value: "todo", label: "A Fazer" },
  { value: "doing", label: "Em Andamento" },
  { value: "done", label: "Concluído" },
];

const PRIORITIES: { value: Task["priority"]; label: string; cls: string }[] = [
  { value: "low", label: "Baixa", cls: "bg-success/20 text-success-foreground border-success/40" },
  { value: "medium", label: "Média", cls: "bg-warning/30 text-foreground border-warning/40" },
  { value: "high", label: "Alta", cls: "bg-destructive/20 text-destructive border-destructive/40" },
];

export const Route = createFileRoute("/_authenticated/projetos")({
  head: () => ({ meta: [{ title: "Projetos — SGE" }] }),
  component: KanbanPage,
});

const empty: Partial<Task> = { title: "", description: "", status: "todo", priority: "low", due_date: "", assigned_employee_id: null };

function KanbanPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Task>>(empty);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees-min"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("id, full_name").eq("active", true);
      if (error) throw error;
      return data as Employee[];
    },
  });

  const save = useMutation({
    mutationFn: async (t: Partial<Task>) => {
      const payload = { ...t, due_date: t.due_date || null, assigned_employee_id: t.assigned_employee_id || null };
      if (t.id) {
        const { error } = await supabase.from("tasks").update(payload).eq("id", t.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tasks").insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); setOpen(false); setEditing(empty); toast.success("Tarefa salva!"); },
    onError: (e) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task["status"] }) => {
      const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); toast.success("Tarefa removida."); },
  });

  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = tasks.filter((t) => t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q));
    return STATUSES.map((s) => ({ ...s, items: filtered.filter((t) => t.status === s.value) }));
  }, [tasks, search]);

  const empMap = useMemo(() => Object.fromEntries(employees.map((e) => [e.id, e.full_name])), [employees]);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Quadro Kanban</h1>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar tarefas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-full" />
        </div>
        <Button className="rounded-full gap-2" onClick={() => { setEditing(empty); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Adicionar Tarefa
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {grouped.map((col) => (
          <div key={col.value} className="space-y-3">
            <div className="bg-primary text-primary-foreground rounded-md px-4 py-3 font-medium shadow-sm">
              {col.label} ({col.items.length})
            </div>
            <div className="space-y-2 min-h-32">
              {col.items.map((t) => {
                const prio = PRIORITIES.find((p) => p.value === t.priority)!;
                return (
                  <Card key={t.id} className="p-3 hover:shadow-md transition-shadow gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm leading-snug">{t.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${prio.cls}`}>{prio.label}</span>
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
                    <div className="text-xs text-muted-foreground flex items-center justify-between gap-2">
                      <span>{t.due_date ? new Date(t.due_date).toLocaleDateString("pt-BR") : "Sem prazo"}</span>
                      <span>{t.assigned_employee_id ? empMap[t.assigned_employee_id] ?? "—" : ""}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <Select value={t.status} onValueChange={(v) => updateStatus.mutate({ id: t.id, status: v as Task["status"] })}>
                        <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(t); setOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Remover tarefa?")) remove.mutate(t.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {col.items.length === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-4">Sem tarefas</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing.id ? "Editar Tarefa" : "Adicionar Nova Tarefa"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Título da Tarefa *</Label>
              <Input required value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as Task["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prioridade</Label>
                <Select value={editing.priority} onValueChange={(v) => setEditing({ ...editing, priority: v as Task["priority"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data de Vencimento</Label>
                <Input type="date" value={editing.due_date ?? ""} onChange={(e) => setEditing({ ...editing, due_date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Responsável</Label>
                <Select value={editing.assigned_employee_id ?? "none"} onValueChange={(v) => setEditing({ ...editing, assigned_employee_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Ninguém —</SelectItem>
                    {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
