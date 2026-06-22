import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app/Logo";
import {
  CheckCircle2,
  Users,
  CalendarClock,
  Wallet,
  Building2,
  KanbanSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GamaGit — Gestão de social media em um único lugar" },
      {
        name: "description",
        content:
          "Aprovação de conteúdo, agendamento, clientes, equipe e financeiro para social medias e agências. Pare de perder briefing no WhatsApp.",
      },
      { property: "og:title", content: "GamaGit" },
      {
        property: "og:description",
        content: "Organize a rotina, acelere aprovações e reduza o trabalho manual.",
      },
    ],
  }),
  component: Landing,
});

const modules = [
  { icon: CheckCircle2, label: "Aprovação de Conteúdo" },
  { icon: Users, label: "Gestão de Equipe" },
  { icon: CalendarClock, label: "Agendamento Automático" },
  { icon: Wallet, label: "Gestão Financeira" },
  { icon: Building2, label: "Organização de Clientes" },
  { icon: KanbanSquare, label: "Quadro de Tarefas" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#recursos" className="hover:text-foreground">
              Recursos
            </a>
            <a href="#fluxo" className="hover:text-foreground">
              Como funciona
            </a>
            <a href="#precos" className="hover:text-foreground">
              Planos
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 text-center">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2">
          {modules.map((m) => (
            <span
              key={m.label}
              className="inline-flex items-center gap-2 rounded-full bg-chip-dark px-4 py-2 text-xs font-medium ring-1 ring-white/5"
            >
              <m.icon className="h-3.5 w-3.5 text-primary" />
              {m.label}
            </span>
          ))}
        </div>

        <h1 className="mt-10 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Ajudamos social medias, agências e equipes a{" "}
          <span className="text-gradient-primary">organizar a rotina</span>, acelerar aprovações e
          reduzir o trabalho manual na hora de publicar.
        </h1>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="h-12 px-6 text-base">
            <Link to="/auth">
              Começar agora <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
            <a href="#fluxo">Ver como funciona</a>
          </Button>
        </div>
      </section>

      {/* Sejamos sinceros */}
      <section className="border-y border-border/60 bg-muted/40 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Sejamos sinceros
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              Criar post nunca foi só sentar e escrever
            </h2>
            <p className="mt-4 text-muted-foreground">
              São briefings soltos no WhatsApp, gambiarra no Trello, links perdidos no Drive e
              feedbacks espalhados por print de conversa. Enquanto isso, o cliente nem sabe onde
              aprovar, pede 7 alterações, e você ainda precisa avisar o designer e ajustar a legenda
              que ficou perdida em uma das 5 abas abertas.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              "WhatsApp lotado",
              "Trello bagunçado",
              "Drive perdido",
              "Prints de feedback",
              "Abas demais",
              "Cliente confuso",
            ].map((t) => (
              <div key={t} className="rounded-xl bg-card p-4 text-sm shadow-card">
                <span className="text-muted-foreground line-through">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agora existe */}
      <section id="recursos" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            A notícia boa é que
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            Agora existe o <span className="text-gradient-primary">GamaGit</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Reunimos tudo o que você precisa em um único lugar: aprovação, agendamento, clientes,
            equipe, tarefas e financeiro.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {modules.map((m) => (
            <div
              key={m.label}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <m.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{m.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{descriptions[m.label]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fluxo */}
      <section id="fluxo" className="border-t border-border/60 bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Do briefing ao publicado
            </h2>
            <p className="mt-3 text-muted-foreground">
              Um fluxo claro que respeita o ritmo do cliente e da equipe.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {["Rascunho", "Em aprovação", "Ajuste", "Aprovado", "Agendado"].map((s, i) => (
              <div key={s} className="rounded-2xl bg-card p-5 shadow-card">
                <div className="text-xs font-medium text-muted-foreground">Etapa {i + 1}</div>
                <div className="mt-1 font-display text-lg font-semibold">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="precos" className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="rounded-3xl bg-chip-dark p-10 md:p-14">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-4 font-display text-3xl font-semibold text-surface-dark-foreground md:text-4xl">
            Pronto para parar de perder briefing no WhatsApp?
          </h2>
          <p className="mt-3 text-surface-dark-foreground/70">
            Crie sua conta grátis em 30 segundos. Sem cartão, sem enrolação.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-8 text-base">
            <Link to="/auth">
              Criar conta agora <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
          <Logo size="sm" />
          <p>© {new Date().getFullYear()} GamaGit. Feito para social medias.</p>
        </div>
      </footer>
    </div>
  );
}

const descriptions: Record<string, string> = {
  "Aprovação de Conteúdo": "Cliente aprova, comenta e pede ajuste em um link só. Adeus prints.",
  "Gestão de Equipe": "Designer, social e financeiro com papéis e tarefas claras.",
  "Agendamento Automático": "Calendário e fila por cliente, com horários certos.",
  "Gestão Financeira": "Contas a receber e a pagar por cliente, sem planilha solta.",
  "Organização de Clientes": "Tudo do cliente em um só lugar — posts, equipe e finanças.",
  "Quadro de Tarefas": "Kanban de demandas com responsável e prazo.",
};
