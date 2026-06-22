# EPIC G — Portal do Cliente (aprovação por link)

**Status:** 🟡 Story G.1 concluída (aprovação) · demais stories planejadas · **PRD:** [../PRD.md](../PRD.md)
**Executor:** @dev (Dex) · **DB/RLS:** @data-engineer (Dara) · **Gate:** @qa (Quinn)
**Handoff:** `@sm *draft → @po *validate → @dev/@data-engineer *develop → @qa *qa-gate → @devops *push`

## Objetivo
Permitir que o **cliente** (sem login no app) interaja com o conteúdo via **link tokenizado**:
aprovar posts, depois acompanhar calendário, status e métricas.

## Decisões
- **Acesso:** link tokenizado público (sem login). Dados servidos pelo **backend (service role)**, contornando RLS.
- **Métricas:** fase posterior (precisa Instagram Insights API).

## Riscos do Epic
- Link público exige token imprevisível (usamos UUID sem hífens) — não listar/indexar.
- Cliente remoto precisa de **frontend exposto por HTTPS** (hoje localhost; em prod, domínio/ngrok).

---

## Story G.1 — Aprovação de post específico ✅
**História:** Como gestor, quero enviar um link de um post ao cliente, para ele aprovar ou pedir ajuste sem precisar de conta.
**Valor de negócio:** elimina aprovação solta no WhatsApp; acelera o ciclo de publicação.
**Estimativa:** M (≈3 pts).
**Escopo**
- **IN:** gerar token por post; página pública de revisão; aprovar / pedir ajuste + comentário; muda status do post.
- **OUT:** múltiplos revisores; notificação automática ao cliente; histórico de versões.
**Dependências:** posts + status enum (aprovacao/aprovado/ajuste); is_client_owner (RLS).

**Critérios de aceite (Given/When/Then)**
- **AC1:** Dado um post, Quando clico "Link de aprovação" no Kanban, Então um token é criado e o link `/review/{token}` é copiado.
- **AC2:** Dado o link, Quando o cliente abre (sem login), Então vê imagem, legenda, rede/formato e nome do cliente.
- **AC3:** Dado "Aprovar", Quando o cliente confirma, Então `post_reviews.status='approved'` e `posts.status='aprovado'`.
- **AC4:** Dado "Pedir ajuste" com comentário, Quando confirma, Então `status='changes_requested'` e `posts.status='ajuste'` (comentário guardado).
- **AC5:** Dado um link já respondido, Quando reaberto, Então mostra a decisão registrada (não permite responder de novo).

**Definition of Done**
- [x] AC1–AC5 verdes (testado via API: aprovacao→aprovado) · [x] sem login p/ cliente · [ ] @qa formal.

### Tasks
| ID | Task | Agente | Status |
|----|------|--------|--------|
| G.1.1 | Tabela `post_reviews` (token, status, comment) + RLS por dono do post | @data-engineer | ✅ |
| G.1.2 | Backend `GET /review/:token` (service role) — dados do post | @dev | ✅ |
| G.1.3 | Backend `POST /review/:token` — decisão + muda status do post | @dev | ✅ |
| G.1.4 | CORS no backend (frontend/página pública chamam o servidor) | @dev | ✅ |
| G.1.5 | Página pública `/review/$token` (ver post, aprovar/pedir ajuste) | @dev | ✅ |
| G.1.6 | Botão "Link de aprovação" no card do Kanban (cria token + copia) | @dev | ✅ |
| G.1.7 | QA gate formal | @qa | ⬜ |

## Story G.2 — Calendário (versão cliente) ✅
**História:** Como cliente, quero ver os posts por data, para acompanhar o cronograma.
**AC:** Dado o link do portal, Quando abro a aba Calendário, Então vejo os posts agrupados por data (agenda).
### Tasks
| ID | Task | Agente | Status |
|----|------|--------|--------|
| G.2.1 | Tabela `client_portal_links` (token por cliente) + RLS | @data-engineer | ✅ |
| G.2.2 | Backend `GET /portal/:token` (cliente + posts) | @dev | ✅ |
| G.2.3 | Aba Calendário (agrupado por data) na página pública | @dev | ✅ |
| G.2.4 | Botão "Gerar link do portal" na Integrações | @dev | ✅ |

## Story G.3 — Status de cada conteúdo ✅
**História:** Como cliente, quero ver o status de cada post, para saber o que falta.
**AC:** Dado o portal, Quando abro a aba Status, Então cada post mostra um selo (rascunho→publicado).
### Tasks
| ID | Task | Agente | Status |
|----|------|--------|--------|
| G.3.1 | Aba Status com selos por estado (mesma página `/portal/$token`) | @dev | ✅ |

**Verificação G.2/G.3:** `GET /portal/:token` → Gama Studio + 4 posts reais; página `/portal/$token` 200, abas Status/Calendário renderizando.

## Story G.6 — Aprovar pelo portal ✅
**História:** Como cliente, quero aprovar/pedir ajuste direto no portal, sem link separado por post.
**AC:** Dado o portal, Quando abro a aba "Aprovar", Então vejo os posts em aprovação e posso Aprovar/Pedir ajuste; a decisão muda o status e registra comentário (visível no Kanban da agência). Decidir post de outro cliente → 403.
### Tasks
| ID | Task | Agente | Status |
|----|------|--------|--------|
| G.6.1 | Backend `POST /api/portal/:token/decision` (valida post↔cliente) | @dev | ✅ |
| G.6.2 | Aba "Aprovar" no portal com ação por post + comentário | @dev | ✅ |

## Story G.4 — Dashboard do cliente ⬜ planejado
Resumo (contagens, próximos posts) na visão do cliente.

## Story G.5 — Métricas (Instagram Insights) ⬜ fase posterior
Alcance/curtidas/etc. via `instagram_business_manage_insights`.

## Arquivos
- DB: `post_reviews` (Management API) · `server/src/index.js` (CORS + rotas /review) · `src/routes/review.$token.tsx` (público) · `src/routes/_authenticated/kanban.tsx` (gerar link)

## Verificação
API: criar post `aprovacao` → token → `GET /review` ok → `POST approved` → `posts.status='aprovado'` ✅.
UI: Kanban → "Link de aprovação" copia `/review/{token}`; abrir o link → aprovar/pedir ajuste.
