# EPIC F — Robustez

**Status:** 🟡 Código pronto (verifica após Epic E real) · **PRD:** [../PRD.md](../PRD.md)
**Executor:** @dev (Dex) · **Gate:** @qa (Quinn) · **Deploy:** @devops (Gage)
**Handoff:** `@sm *draft → @po *validate → @dev *develop → @qa *qa-gate → @devops *push`

## Objetivo

Tornar a publicação confiável: tokens renovados, falhas transitórias recuperadas, erros visíveis.

## Contexto

Inspirado no protocolo de auto-healing (circuit breaker + backoff + fallback). Código pronto; verificação real depende do Epic E.

## Dependências

- Epic E real (publicação acontecendo) para verificar refresh/retry/expiração contra a API.

## Riscos do Epic

- Retry indevido em erro permanente (mitigado: só transientes — 5xx/rate-limit).
- Refresh falho marca conexão `expired` → exige reconexão pelo usuário (comportamento desejado).

---

## Story F.1 — Confiabilidade de token

**História:** Como sistema, quero manter tokens válidos, para não falhar publicações por expiração.
**Valor de negócio:** evita interrupções silenciosas do serviço de publicação.
**Estimativa:** M (≈3 pts).
**Escopo**

- **IN:** refresh diário de tokens próximos do vencimento; marcar `expired` em token inválido.
- **OUT:** reconexão automática sem usuário; notificação por e-mail (futuro).
  **Dependências:** Epic E.
  **Riscos:** ver “Riscos do Epic”.

**Critérios de aceite (Given/When/Then)**

- **AC1:** Dado um token que expira em ≤7 dias, Quando o cron diário roda, Então o token é renovado e `token_expires_at` atualizado.
- **AC2:** Dado um token inválido/revogado, Quando uma publicação falha por auth, Então a conexão vira `status='expired'` e o scheduler não trava.
- **AC3:** Dado `META_APP_ID` ausente, Quando o cron roda, Então é no-op (não quebra em modo mock).

**Definition of Done**

- [ ] AC1–AC3 verdes (AC1/AC2 após Epic E real) · [ ] QA aprovado.

### Tasks

#### F.1.1 — `runTokenRefresh` (cron diário 03:00) · @dev · ✅ código

- **Inputs:** conexões `connected` com `token_expires_at <= now+7d`.
- **Outputs:** tokens renovados; `updated_at` setado.
- **Passos:** 1) buscar conexões; 2) `refreshConnectionToken`; 3) update; 4) no-op sem `META_APP_ID`.
- **Pré:** Epic E. **Pós:** tokens mantidos válidos.

#### F.1.2 — Token revogado → `expired` · @dev · ✅ código

- **Inputs:** resultado de `publishPost` com `tokenError`.
- **Outputs:** `instagram_connections.status='expired'`.
- **Passos:** no scheduler, ao detectar `tokenError`, atualizar a conexão.
- **Pré:** Epic E. **Pós:** conexão sinalizada para reconectar.

#### F.1.3 — Verificar refresh/expiração real · @qa · ⛔ após D

- **Inputs:** conta conectada; token forçado inválido.
- **Outputs:** evidência de refresh e de marcação `expired`.
- **Passos:** simular expiração/invalidação → observar cron e scheduler.
- **Pré:** Epic E real. **Pós:** Story F.1 aprovada.

---

## Story F.2 — Resiliência de publicação

**História:** Como sistema, quero retry em erro transitório e erros claros, para maximizar entregas.
**Valor de negócio:** menos falhas por instabilidade; diagnóstico rápido quando falha.
**Estimativa:** M (≈3 pts).
**Escopo**

- **IN:** backoff+jitter em transientes; erro registrado em `publish_log` e na UI; guarda de formato (feed/imagem).
- **OUT:** suporte real a carrossel/reels/story (F.2.4, futuro).
  **Dependências:** Epic E.
  **Riscos:** ver “Riscos do Epic”.

**Critérios de aceite (Given/When/Then)**

- **AC1:** Dado um erro transitório (5xx/rate-limit), Quando publica, Então re-tenta até 3x com backoff exponencial + jitter.
- **AC2:** Dado um erro permanente, Quando publica, Então falha rápido e grava mensagem clara em `publish_log`.
- **AC3:** Dado um formato não suportado (reels/story), Quando publica, Então retorna erro claro sem postar errado.
- **AC4:** Dado um erro, Quando abro `/automacao`, Então vejo a mensagem no histórico.

**Definition of Done**

- [ ] AC1–AC4 verdes (AC1/AC2 após Epic E real) · [ ] QA aprovado.

### Tasks

#### F.2.1 — `withRetry` (backoff + jitter) · @dev · ✅ código

- **Inputs:** chamadas à Graph API (container/publish).
- **Outputs:** re-tentativa só em `isTransient` (5xx, códigos 4/17/32).
- **Passos:** wrapper `withRetry(fn, max=3, base=1000)` com `2^i*base + jitter`.
- **Pré:** Epic E. **Pós:** publicações resilientes a instabilidade.

#### F.2.2 — Erro no `publish_log` + UI · @dev · ✅

- **Inputs:** resultado de `publishPost`.
- **Outputs:** linha em `publish_log` (status/mensagem) exibida em `/automacao`.
- **Passos:** scheduler grava log; tela lista com ícone de erro.
- **Pré:** Epic C. **Pós:** falhas visíveis ao operador.

#### F.2.3 — Guarda de formato (feed/imagem) · @dev · ✅ código

- **Inputs:** `post.format`.
- **Outputs:** erro claro para formatos não suportados.
- **Passos:** permitir só `feed`/`carrossel(imagem única)`; demais → mensagem explicativa.
- **Pré:** Epic E. **Pós:** sem publicação incorreta de reels/story.

#### F.2.4 — Carrossel/Reels/Story real · @dev · ⬜ futuro

- **Inputs:** ativos de vídeo/múltiplas mídias (`post_media`).
- **Outputs:** containers múltiplos / `media_type=REELS`.
- **Passos:** 1) upload de vídeo; 2) container por mídia; 3) container pai (carrossel) ou REELS; 4) publish.
- **Pré:** F.2.1–F.2.3. **Pós:** suporte ampliado de formatos.

## Arquivos

- `server/src/instagram.js` (`withRetry`, `gpost`, `refreshConnectionToken`, guarda de formato)
- `server/src/scheduler.js` (`runTokenRefresh`, marca `expired`) · `server/src/index.js` (cron refresh)

## Verificação

Mock: scheduler 1/1 OK, boot limpo. Real (após D): simular token inválido → `expired`; observar retry em erro transitório.
