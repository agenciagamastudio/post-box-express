# Clone do Pode Postar

SaaS de gestão para social medias / agências: landing institucional + app autenticado com aprovação, agendamento, clientes, equipe e financeiro. Publicação não é real — o sistema gerencia a fila e marca como "publicado" no horário.

## Stack e infraestrutura

- TanStack Start + React + Tailwind (já configurado)
- Lovable Cloud (banco + auth) — ativo
- Auth: email + senha
- Sem integração real com Instagram/TikTok/X (apenas seleção de rede no post)

## Design

Inspirado no site original (roxo `#A78BFA` como cor primária sobre fundo claro, dark surfaces nos chips/cards de destaque, tipografia limpa sans-serif). Sistema de design definido em `src/styles.css` com tokens semânticos (primary, accent, surface, etc.) — nada de cores hardcoded nos componentes.

## Estrutura de rotas

```text
/                       Landing pública (hero, features, CTA)
/auth                   Login / cadastro
/_authenticated/
  app                   Dashboard (overview: kpis, próximos posts, tarefas)
  calendario            Calendário mensal/semanal dos posts
  kanban                Quadro: Rascunho → Em Aprovação → Ajuste → Aprovado → Agendado → Publicado
  clientes              Lista + detalhe de clientes
  clientes/$id          Posts, financeiro e equipe do cliente
  equipe                Membros, papéis e tarefas atribuídas
  tarefas               Quadro de tarefas geral
  financeiro            Contas a receber/pagar, totalizadores
  configuracoes         Workspace e perfil
```

Cada rota pública/leaf com `head()` próprio (title, description, og).

## Modelo de dados (Lovable Cloud)

Tabelas no schema `public`, todas com RLS e `GRANT`s explícitos:

- `profiles` — id (= auth.users.id), nome, avatar
- `app_role` enum: `owner | admin | designer | social | financeiro`
- `user_roles` — user_id, role (separado do profile; checagem via função `has_role` security definer)
- `clients` — id, owner_id, nome, handle, cor, ativo
- `client_members` — client_id, user_id (quem da equipe atende esse cliente)
- `posts` — id, client_id, titulo, legenda, formato (`feed|carrossel|reels|story|video`), rede (`instagram|tiktok|x|outras`), status (`rascunho|aprovacao|ajuste|aprovado|agendado|publicado`), scheduled_at, published_at, created_by
- `post_media` — post_id, url, ordem (Storage bucket `post-media`)
- `post_comments` — post_id, user_id, texto, created_at (feedbacks de aprovação)
- `tasks` — id, client_id?, post_id?, titulo, descricao, status (`a_fazer|fazendo|feito`), assignee_id, due_at
- `finance_entries` — id, client_id, tipo (`receber|pagar`), descricao, valor (numeric), vence_em, pago_em

RLS: usuário só vê dados de clientes onde é `owner` ou consta em `client_members`. Admins/owners do workspace veem tudo via `has_role`.

Storage: bucket `post-media` para imagens/vídeos dos posts (políticas baseadas em client_members).

## Server functions

Em `src/lib/*.functions.ts`, todas com `requireSupabaseAuth`:

- `posts.functions.ts`: list/create/update/delete, mudar status, agendar
- `clients.functions.ts`: CRUD + adicionar membros
- `tasks.functions.ts`: CRUD + atribuir
- `finance.functions.ts`: CRUD + resumo
- `team.functions.ts`: listar membros, atualizar papel (apenas admin)

Cron de "auto-publicação" simulada: server function chamada periodicamente (ou no carregamento) que move posts `agendado` com `scheduled_at <= now()` para `publicado`. Para MVP, faço isso lazy no list (sem cron real) — simples e suficiente.

## Features no MVP

1. **Landing** fiel ao original em PT-BR (hero com chips dos módulos, "sejamos sinceros", "agora existe o Pode Postar", grade de prints, CTA final, footer simples).
2. **Auth** /auth com tabs Entrar / Criar conta, redirect para /app.
3. **Dashboard**: contadores (rascunho/aprovação/ajuste/aprovado), próximos 5 agendamentos, tarefas pendentes.
4. **Kanban de posts** com drag & drop entre colunas (`@dnd-kit/core`), card mostrando thumb, rede, formato, data.
5. **Calendário** mensal com posts por dia (clicar abre modal).
6. **Editor de post** (dialog): título, legenda, rede, formato, upload de mídia (Storage), data/hora de agendamento, cliente, comentários de aprovação.
7. **Clientes**: lista com avatar/cor, detalhe com tabs (posts | tarefas | financeiro | equipe).
8. **Equipe**: convidar (placeholder via email), atribuir papel, lista de tarefas por pessoa.
9. **Financeiro**: lançamentos por cliente, totais a receber/pagar/recebido/pago, marcar como pago.

## Fora do escopo

- Publicação real em redes sociais (precisaria Meta Graph API, TikTok API, OAuth por usuário, aprovação dos apps)
- Convite por email com envio real (apenas cadastro do membro)
- Geração de IA, analytics de performance, white-label

## Entrega

Implemento em uma leva:

1. Ativar Lovable Cloud
2. Migrações (tabelas + RLS + grants + função has_role + bucket)
3. Design system e landing
4. Auth e shell autenticado
5. Módulos: kanban, calendário, editor, clientes, equipe/tarefas, financeiro
6. Smoke test no preview

Posso começar?