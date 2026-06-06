import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Eye, Trash2, IdCard, Search } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

type Employee = {
  id: string;
  full_name: string;
  position: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  hire_date: string | null;
  active: boolean;
};

export const Route = createFileRoute("/_authenticated/funcionarios")({
  head: () => ({ meta: [{ title: "Funcionários — SGE" }] }),
  component: EmployeesPage,
});

const empty: Partial<Employee> = { full_name: "", position: "", department: "", email: "", phone: "", hire_date: "", active: true };

function EmployeesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Employee>>(empty);
  const [viewing, setViewing] = useState<Employee | null>(null);

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Employee[];
    },
  });

  const save = useMutation({
    mutationFn: async (e: Partial<Employee>) => {
      const payload = { ...e, hire_date: e.hire_date || null };
      if (e.id) {
        const { error } = await supabase.from("employees").update(payload).eq("id", e.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employees").insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      setOpen(false);
      setEditing(empty);
      toast.success("Funcionário salvo com sucesso!");
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Funcionário removido.");
    },
  });

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.full_name.toLowerCase().includes(q) ||
      (e.email ?? "").toLowerCase().includes(q) ||
      (e.position ?? "").toLowerCase().includes(q) ||
      (e.department ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Equipe</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Funcionários</h1>
        <p className="mt-1.5 text-muted-foreground">Cadastre e gerencie os membros da sua equipe.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, email, cargo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-full" />
        </div>
        <Button className="rounded-full gap-2" onClick={() => { setEditing(empty); setOpen(true); }}>
          <IdCard className="h-4 w-4" /> Cadastrar Funcionário
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Nome Completo</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Nenhum funcionário cadastrado.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((e, i) => (
              <TableRow key={e.id} className="odd:bg-muted/30">
                <TableCell className="font-medium">{i + 1}</TableCell>
                <TableCell>{e.full_name}</TableCell>
                <TableCell>{e.department || "—"}</TableCell>
                <TableCell>{e.position || "—"}</TableCell>
                <TableCell>{e.email || "—"}</TableCell>
                <TableCell>{e.phone || "—"}</TableCell>
                <TableCell>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${e.active ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                    {e.active ? "Ativo" : "Inativo"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button size="icon" variant="secondary" className="rounded-full h-8 w-8" onClick={() => { setEditing(e); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" className="rounded-full h-8 w-8 bg-info hover:bg-info/90 text-info-foreground" onClick={() => { setViewing(e); setViewOpen(true); }}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="destructive" className="rounded-full h-8 w-8" onClick={() => { if (confirm("Remover este funcionário?")) remove.mutate(e.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing.id ? "Editar Funcionário" : "Cadastrar Funcionário"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label>Nome Completo *</Label>
              <Input required value={editing.full_name ?? ""} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cargo</Label>
                <Input value={editing.position ?? ""} onChange={(e) => setEditing({ ...editing, position: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Departamento</Label>
                <Input value={editing.department ?? ""} onChange={(e) => setEditing({ ...editing, department: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1.5">
                <Label>Data de Contratação</Label>
                <Input type="date" value={editing.hire_date ?? ""} onChange={(e) => setEditing({ ...editing, hire_date: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch checked={editing.active ?? true} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                <Label>Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.full_name}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted-foreground">Cargo</dt><dd>{viewing.position || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Departamento</dt><dd>{viewing.department || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Email</dt><dd>{viewing.email || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Telefone</dt><dd>{viewing.phone || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Contratação</dt><dd>{viewing.hire_date || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Status</dt><dd>{viewing.active ? "Ativo" : "Inativo"}</dd></div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
