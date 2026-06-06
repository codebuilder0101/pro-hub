import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { registerUser } from "@/lib/api/auth.functions";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — SGE" }] }),
  component: AuthPage,
});

// Map raw Supabase/auth errors to clear Portuguese messages so users aren't
// confused by generic English text (e.g. the leaked-password warning).
function translateAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  const m = msg.toLowerCase();
  if (m.includes("weak") || m.includes("pwned"))
    return "Senha muito fraca ou vazada. Escolha uma senha mais forte (evite senhas comuns).";
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "Email ou senha incorretos.";
  if (m.includes("email not confirmed"))
    return "Email ainda não confirmado.";
  if (m.includes("already") && m.includes("regist"))
    return "Este email já está cadastrado. Faça login.";
  if (m.includes("password") && m.includes("least"))
    return "A senha deve ter pelo menos 6 caracteres.";
  return msg || "Erro inesperado";
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        // Create the user server-side as already-confirmed, then sign in.
        // (Public signUp would leave the user without a session because email
        // confirmation is enabled, bouncing them back to this page.)
        const result = await registerUser({ data: { email, password, username } });
        if (!result.ok) {
          throw new Error(
            result.code === "user_exists"
              ? "Este email já está cadastrado. Faça login."
              : "Não foi possível criar a conta. Tente novamente.",
          );
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Conta criada! Você já está conectado.");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-app-mesh flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-primary/30">
          <Building2 className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">
          Sistema de <span className="text-brand-gradient">Gerenciamento</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Acesse o painel da sua empresa</p>
      </div>

      <Card className="glass w-full max-w-md border-border/60 shadow-xl shadow-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{mode === "signup" ? "Criar nova conta" : "Bem-vindo de volta"}</CardTitle>
          <CardDescription>
            {mode === "signup" ? "Preencha os dados para começar." : "Entre com seu email e senha."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input id="username" className="h-11" required value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="h-11" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" className="h-11" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" size="lg" className="h-11 w-full text-base shadow-lg shadow-primary/25" disabled={loading}>
              {loading ? "Aguarde..." : mode === "signup" ? "Criar conta" : "Entrar"}
            </Button>
          </CardContent>
          <CardFooter className="justify-center pt-2 text-sm text-muted-foreground">
            {mode === "signup" ? (
              <span>
                Já tem uma conta?{" "}
                <button type="button" onClick={() => setMode("login")} className="font-semibold text-primary hover:underline">
                  Faça login
                </button>
              </span>
            ) : (
              <span>
                Não tem conta?{" "}
                <button type="button" onClick={() => setMode("signup")} className="font-semibold text-primary hover:underline">
                  Criar nova conta
                </button>
              </span>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
