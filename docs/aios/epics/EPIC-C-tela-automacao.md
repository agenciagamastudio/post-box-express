# EPIC C — Tela de Automação

**Status:** ✅ Concluído · **PRD:** [../PRD.md](../PRD.md)
**Executor:** @dev (Dex) · **Apoio UI:** @ux-design-expert (Uma) · **Gate:** @qa (Quinn)
**Handoff:** `@sm *draft → @po *validate → @dev *develop → @qa *qa-gate → @devops *push`

## Objetivo

Dar visibilidade do publicador automático e permitir teste manual pela interface.

## Contexto

O scheduler roda no backend (`server/`); faltava uma tela para observar status e histórico.

## Dependências

- Backend com `/health` e `/scheduler/run`; tabela `publish_log`; `VITE_SERVER_URL` no `.env`.

## Riscos do Epic

- Backend offline deixa a tela sem status (mitigação: estado de erro tratado).
- Botão de teste dispara publicação real quando `PUBLISH_MOCK=false` (intencional; avisar no contexto).

---

## Story C.1 — Operar e observar o scheduler

**História:** Como gestor, quero ver o status do publicador e o histórico, para confiar na automação.
**Valor de negócio:** transparência operacional; reduz suporte e aumenta confiança no agendamento.
**Estimativa:** M (≈3 pts).
**Escopo**

- **IN:** rota/nav; cartões de status (online, modo, cron); botão de disparo manual; tabela de log.
- **OUT:** métricas/gráficos; filtros avançados; reprocessar post específico (futuro).
  **Dependências:** Epic A (leitura de `publish_log` por RLS); backend no ar.
  **Riscos:** ver “Riscos do Epic”.

**Critérios de aceite (Given/When/Then)**

- **AC1:** Dado o backend online, Quando abro `/automacao`, Então vejo status Online, modo (mock/real) e o cron.
- **AC2:** Dado o backend offline, Quando abro a tela, Então vejo status “Offline” sem quebrar.
- **AC3:** Dado posts agendados vencidos, Quando clico “Testar publicação agora”, Então o resumo retorna e o histórico atualiza.
- **AC4:** Dado registros em `publish_log`, Quando carrego a tela, Então listo os últimos 50 com status/data/id.

**Definition of Done**

- [ ] AC1–AC4 verdes · [ ] item “Automação” na sidebar · [ ] sem cor hardcoded · [ ] QA aprovado.

### Tasks

#### C.1.1 — Rota `/automacao` + item na sidebar · @dev · ✅

- **Inputs:** estrutura de rotas file-based; `AppShell.tsx`.
- **Outputs:** `src/routes/_authenticated/automacao.tsx`; entrada no array `nav` (ícone `Zap`).
- **Passos:** 1) criar rota via `createFileRoute`; 2) adicionar item de nav; 3) confirmar geração no `routeTree.gen.ts`.
- **Pré:** app rodando (Vite). **Pós:** `/automacao` acessível e linkada.

#### C.1.2 — Status do backend + botão testar · @dev · ✅

- **Inputs:** `VITE_SERVER_URL`; endpoints `/health` e `/scheduler/run`.
- **Outputs:** query de health (refetch 15s); mutation do botão (toast com resumo).
- **Passos:** 1) `useQuery` health; 2) cartões status/modo/cron; 3) `useMutation` POST `/scheduler/run` → invalida log.
- **Pré:** C.1.1; backend no ar. **Pós:** operador dispara e vê o resultado.

#### C.1.3 — Tabela de `publish_log` · @dev · ✅

- **Inputs:** tabela `publish_log` (policy de leitura existente).
- **Outputs:** lista dos últimos 50 (status, mensagem, data, id externo, badge mock).
- **Passos:** 1) `useQuery` select ordenado desc limit 50 (refetch 10s); 2) render com ícone success/erro.
- **Pré:** C.1.1. **Pós:** histórico visível e auto-atualizado.

## Arquivos

- `src/routes/_authenticated/automacao.tsx` (novo) · `src/components/app/AppShell.tsx` (nav)

## Verificação

`/automacao` → 200; cartões de status; “Testar publicação agora” processa agendados e atualiza o histórico (mock: 1/1).
