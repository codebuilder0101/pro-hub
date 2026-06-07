import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { UserRound } from "lucide-react";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Perfil — SGE" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        setEmail(u.email ?? "");
        setUsername((u.user_metadata?.username as string) ?? u.email?.split("@")[0] ?? "");
      }
      setLoading(false);
    });
  }, []);

  const save = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const id = userData.user?.id;
      if (!id) throw new Error("Sessão expirada. Entre novamente.");
      const { error: authErr } = await supabase.auth.updateUser({ data: { username } });
      if (authErr) throw authErr;
      const { error: profErr } = await supabase.from("profiles").update({ username }).eq("id", id);
      if (profErr) throw profErr;
    },
    onSuccess: () => toast.success("Perfil atualizado com sucesso!"),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar."),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">Conta</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Meu Perfil</h1>
        <p className="mt-1.5 text-muted-foreground">Gerencie suas informações pessoais.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-sm shadow-primary/30">
              <UserRound className="h-7 w-7" />
            </span>
            <div>
              <CardTitle className="text-xl">{loading ? "—" : username || "Usuário"}</CardTitle>
              <CardDescription>{loading ? "" : email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input id="username" className="h-11" required value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" className="h-11" value={email} disabled />
                <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
              </div>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
