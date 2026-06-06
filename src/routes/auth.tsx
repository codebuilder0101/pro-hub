import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { registerUser } from "@/lib/api/auth.functions";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center gap-2 shadow-md">
        <Building2 className="h-5 w-5" />
        <h1 className="font-semibold">Sistema de Gerenciamento Empresarial</h1>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-muted/50 rounded-t-xl">
            <CardTitle className="text-2xl">{mode === "signup" ? "Criar Nova Conta" : "Entrar"}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input id="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? "Aguarde..." : mode === "signup" ? "Registrar" : "Entrar"}
              </Button>
            </CardContent>
            <CardFooter className="bg-muted/50 rounded-b-xl py-4 text-sm justify-center">
              {mode === "signup" ? (
                <span>
                  Já tem uma conta?{" "}
                  <button type="button" onClick={() => setMode("login")} className="text-primary underline">
                    Faça login aqui
                  </button>
                </span>
              ) : (
                <span>
                  Não tem conta?{" "}
                  <button type="button" onClick={() => setMode("signup")} className="text-primary underline">
                    Criar nova conta
                  </button>
                </span>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
