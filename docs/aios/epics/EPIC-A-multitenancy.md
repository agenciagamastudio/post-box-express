# EPIC A — Multi-tenancy (RLS / papéis)

**Status:** ✅ Concluído · **PRD:** [../PRD.md](../PRD.md)
**Executor:** @data-engineer (Dara) · **Decisão:** @architect (Aria) · **Gate:** @qa (Quinn) · **Migração/push:** @devops (Gage)
**Handoff:** `@sm *draft → @po *validate-story-draft → @data-engineer *develop → @qa *qa-gate → @devops *push`

## Objetivo

Garantir que cada usuário/agência veja apenas seus próprios dados (clientes, posts, tarefas, financeiro).

## Contexto

O trigger `handle_new_user` concedia papel `owner` a todo signup e as policies liberam tudo
para owners → vazamento entre agências. O escopo por `owner_id` / `client_members` /
`can_access_client` já existe; bastou parar de conceder `owner` por padrão.

## Dependências

- Banco `ewerfpxniciegagnretb` com schema aplicado e recursão de RLS já corrigida (`is_client_owner`/`is_client_member`).

## Riscos do Epic

- Remover `owner` de todos pode “esconder” dados de quem dependia do papel (mitigado: acesso por `owner_id`).
- Promoção manual mal usada reintroduz acesso amplo.

---

## Story A.1 — Isolamento por usuário/agência

**História:** Como usuário de uma agência, quero ver apenas os meus dados, para não vazar informação entre agências.
**Valor de negócio:** habilita uso multi-cliente/SaaS sem vazamento; pré-requisito legal/LGPD.
**Estimativa:** S (≈2 pts).
**Escopo**

- **IN:** trigger de signup; limpeza de `user_roles`; validação de isolamento; doc de promoção.
- **OUT:** tela de gestão de papéis/equipe (futuro); convites de membros (`client_members` UI).
  **Dependências:** schema + policies existentes.
  **Riscos:** ver “Riscos do Epic”.

**Critérios de aceite (Given/When/Then)**

- **AC1:** Dado um usuário recém-cadastrado, Quando consulta clients/posts/finance/tasks, Então recebe 0 registros.
- **AC2:** Dado o usuário `demo` (dono de 3 clientes), Quando consulta clients, Então vê exatamente os 3 (via `owner_id`).
- **AC3:** Dado um signup, Quando o trigger roda, Então cria `profiles` e **não** insere `user_roles`.
- **AC4:** Dado um admin promovido manualmente, Quando consulta, Então enxerga conforme o papel.

**Definition of Done**

- [ ] AC1–AC4 verdes · [ ] sem erro `42P17` · [ ] doc de promoção presente · [ ] QA aprovado.

### Tasks

#### A.1.1 — `handle_new_user` sem `owner` automático · @data-engineer · ✅

- **Inputs:** definição atual da função `public.handle_new_user`.
- **Outputs:** função que insere só em `profiles`.
- **Passos:** 1) `CREATE OR REPLACE FUNCTION` removendo o `INSERT INTO user_roles`; 2) manter `INSERT INTO profiles`.
- **Pré:** acesso admin ao banco (Management API). **Pós:** novos signups não recebem papel.

#### A.1.2 — Limpar `user_roles` auto-concedidos · @data-engineer · ✅

- **Inputs:** linhas existentes em `user_roles`.
- **Outputs:** tabela sem papéis automáticos.
- **Passos:** 1) `DELETE FROM public.user_roles;`.
- **Pré:** A.1.1 aplicada. **Pós:** acesso passa a ser por `owner_id`/`client_members`.

#### A.1.3 — Teste de isolamento · @qa · ✅ (6/6)

- **Inputs:** token de `demo` e de um usuário novo (via admin API).
- **Outputs:** relatório PASS/FAIL.
- **Passos:** 1) login demo → contar clients(=3)/posts(=6); 2) criar user novo → contar clients/posts/finance/tasks(=0); 3) limpar user de teste.
- **Pré:** A.1.1/A.1.2. **Pós:** isolamento comprovado.

#### A.1.4 — Documentar promoção manual · @data-engineer · ✅

- **Inputs:** papéis válidos do enum `app_role`.
- **Outputs:** snippet SQL documentado.
- **Passos:** registrar comando abaixo.
- **Pré:** —. **Pós:** processo de promoção conhecido.

```sql
INSERT INTO public.user_roles (user_id, role) VALUES ('<uuid-do-usuario>', 'owner');
-- papéis válidos: owner | admin | designer | social | financeiro
```

## Arquivos

- SQL via Management API (Supabase project `ewerfpxniciegagnretb`).

## Verificação

Script de isolamento: usuário novo retorna `[]` em clients/posts/finance/tasks; `demo` vê 3 clientes/6 posts.
