import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Building2,
  IdCard,
  Kanban,
  LineChart,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SGE — Sistema de Gerenciamento Empresarial" },
      {
        name: "description",
        content:
          "Gerencie funcionários, organize tarefas em um quadro Kanban e acompanhe relatórios em tempo real — tudo em uma plataforma moderna.",
      },
    ],
  }),
  component: LandingPage,
});

const features = [
  { icon: IdCard, title: "Gestão de Funcionários", desc: "Cadastre, edite e acompanhe toda a sua equipe em um só lugar." },
  { icon: Kanban, title: "Quadro Kanban", desc: "Organize tarefas por status e prioridade com um fluxo visual." },
  { icon: LineChart, title: "Relatórios em Tempo Real", desc: "Métricas de equipe e tarefas atualizadas automaticamente." },
  { icon: ShieldCheck, title: "Seguro por Padrão", desc: "Autenticação e dados protegidos com segurança de nível empresarial." },
  { icon: Zap, title: "Rápido e Moderno", desc: "Interface responsiva e instantânea, construída com tecnologia atual." },
  { icon: Globe, title: "Acesse de Qualquer Lugar", desc: "Funciona em qualquer dispositivo, a qualquer hora." },
];

const steps = [
  { n: "1", title: "Crie sua conta", desc: "Cadastre-se em segundos e acesse o painel imediatamente." },
  { n: "2", title: "Cadastre sua equipe", desc: "Adicione funcionários e organize departamentos e cargos." },
  { n: "3", title: "Gerencie tudo", desc: "Acompanhe tarefas e relatórios em tempo real, num só lugar." },
];

function LandingPage() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  const ctaHref = authed ? "/painel" : "/auth";
  const ctaLabel = authed ? "Ir para o painel" : "Começar agora";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/70 glass">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-primary/30">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="text-base font-bold tracking-tight">SGE</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <a href="#recursos" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">Recursos</a>
            <a href="#como-funciona" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">Como funciona</a>
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {authed ? (
              <Button asChild className="shadow-sm shadow-primary/25">
                <Link to="/painel">Ir para o painel</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button asChild className="shadow-sm shadow-primary/25">
                  <Link to="/auth">Começar</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-app-mesh">
        <div className="container mx-auto grid items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Plataforma de gestão tudo-em-um
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Gerencie sua empresa com <span className="text-brand-gradient">clareza</span> e simplicidade
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Funcionários, tarefas e relatórios em uma única plataforma moderna. Tudo o que sua equipe precisa para trabalhar melhor.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 px-7 text-base shadow-lg shadow-primary/25">
                <Link to={ctaHref}>
                  {ctaLabel} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
                <a href="#recursos">Ver recursos</a>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Sem cartão de crédito</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Pronto em minutos</span>
            </div>
          </div>

          {/* Product preview mockup */}
          <div className="relative">
            <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-2xl shadow-primary/10 backdrop-blur">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-destructive/60" />
                <span className="h-3 w-3 rounded-full bg-warning/70" />
                <span className="h-3 w-3 rounded-full bg-success/70" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Funcionários", value: "24", tint: "bg-primary/10 text-primary", icon: IdCard },
                  { label: "Tarefas", value: "138", tint: "bg-info/10 text-info", icon: Kanban },
                  { label: "Concluídas", value: "92", tint: "bg-success/10 text-success", icon: CheckCircle2 },
                  { label: "Atrasadas", value: "6", tint: "bg-destructive/10 text-destructive", icon: AlertTriangle },
                ].map((c) => (
                  <div key={c.label} className="rounded-xl border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
                      <span className={`grid h-8 w-8 place-items-center rounded-lg ${c.tint}`}>
                        <c.icon className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight">{c.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border bg-card p-4">
                <div className="mb-2 text-xs font-semibold text-muted-foreground">Tarefas por status</div>
                <div className="space-y-2">
                  {[
                    { l: "A Fazer", w: "w-1/3", c: "bg-muted-foreground/60" },
                    { l: "Em Andamento", w: "w-2/3", c: "bg-info" },
                    { l: "Concluído", w: "w-4/5", c: "bg-success" },
                  ].map((b) => (
                    <div key={b.l} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-xs text-muted-foreground">{b.l}</span>
                      <span className="h-2 flex-1 rounded-full bg-muted">
                        <span className={`block h-2 rounded-full ${b.w} ${b.c}`} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-6 -top-6 -z-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 -z-10 h-40 w-40 rounded-full bg-info/20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border/70 bg-card/50">
        <div className="container mx-auto grid grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
          {[
            { k: "100%", v: "Responsivo" },
            { k: "Tempo real", v: "Atualizações" },
            { k: "Seguro", v: "Por padrão" },
            { k: "24/7", v: "Disponível" },
          ].map((s) => (
            <div key={s.v} className="text-center">
              <div className="text-2xl font-bold tracking-tight text-brand-gradient sm:text-3xl">{s.k}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="container mx-auto px-4 py-20 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">Recursos</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Tudo o que sua empresa precisa</h2>
          <p className="mt-3 text-muted-foreground">Ferramentas poderosas em uma interface simples e moderna.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card-hover rounded-2xl border bg-card p-6 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="border-t border-border/70 bg-card/50">
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">Como funciona</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Comece em três passos</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-2xl border bg-card p-6 shadow-sm">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient text-base font-bold text-white shadow-sm shadow-primary/30">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-brand-gradient relative overflow-hidden rounded-3xl px-8 py-16 text-center shadow-xl shadow-primary/20">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Pronto para começar?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/85">
            Crie sua conta gratuitamente e leve a gestão da sua empresa para o próximo nível.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8 h-12 px-8 text-base font-semibold">
            <Link to={ctaHref}>
              {ctaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/70">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-white">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">Sistema de Gerenciamento Empresarial</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <a href="#recursos" className="hover:text-foreground">Recursos</a>
            <a href="#como-funciona" className="hover:text-foreground">Como funciona</a>
            <Link to="/auth" className="hover:text-foreground">Entrar</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 SGE. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
