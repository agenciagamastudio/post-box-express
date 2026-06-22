# EPIC E — OAuth + publicação real

**Status:** 🟡 Código pronto (ativa após Epic D) · **PRD:** [../PRD.md](../PRD.md)
**Executor:** @dev (Dex) · **Integração:** @architect (Aria) · **Secrets/.env/deploy:** @devops (Gage) · **Gate:** @qa (Quinn)
**Handoff:** `@devops (.env após D) → @sm *draft → @po *validate → @dev *develop → @qa *qa-gate → @devops *push`

## Objetivo
Conectar cada cliente à sua conta Instagram (OAuth) e publicar de verdade pelo scheduler.

## Contexto
Fluxo **Instagram Business Login** (`instagram.com/oauth` + `graph.instagram.com`). `/auth/instagram/start`
já monta o OAuth; callback e `publishPost` real implementados, gated por `IG_APP_ID/SECRET` e `PUBLISH_MOCK`.

## Dependências
- **Epic D** (IG_APP_ID/Secret, redirect URI, conta de teste aceita). Sem isto não ativa.
- Epic B (imagem pública em `cover_url`).

## Riscos do Epic
- Token de longa duração expira (~60d) → renovado no Epic F (`ig_refresh_token`).
- Conta não-Business ou testador não aceito → erro claro no callback.
- Conteúdo só publica a partir de URL pública de imagem.

---

## Story E.1 — Conectar conta Instagram
**História:** Como gestor, quero conectar o IG de um cliente, para publicar nele automaticamente.
**Valor de negócio:** cada cliente operável de forma independente; base do multi-cliente.
**Estimativa:** L (≈5 pts).
**Escopo**
- **IN:** rota start (escopos), callback (troca de token), descoberta de Página/IG, upsert da conexão, redirect.
- **OUT:** múltiplas contas por cliente; reconexão automática (Epic F); UI de gestão de conexões além do botão.
**Dependências:** Epic D.
**Riscos:** ver “Riscos do Epic”.

**Critérios de aceite (Given/When/Then)**
- **AC1:** Dado um cliente, Quando clico “Conectar Instagram”, Então sou levado ao login do Facebook com os escopos corretos.
- **AC2:** Dado o consentimento concedido, Quando a Meta chama o callback, Então o `code` é trocado por token de longa duração.
- **AC3:** Dado o token, Quando descubro Página e IG Business, Então gravo `instagram_connections` (status `connected`, `@usuário`, `ig_user_id`, `page_id`, `token_expires_at`).
- **AC4:** Dado o sucesso, Quando o callback termina, Então sou redirecionado a `/clientes?ig=connected` e a UI mostra “Conectado @usuário”.
- **AC5:** Dado erro/sem Página vinculada, Quando o callback falha, Então redireciona com `?ig=error&msg=...` sem quebrar.

**Definition of Done**
- [ ] AC1–AC5 verdes (conta de teste) · [ ] token e expiração salvos · [ ] QA aprovado.

### Tasks

#### E.1.1 — `/auth/instagram/start` (escopos) · @dev · ✅ código
- **Inputs:** `client_id` (query); `META_APP_ID`, redirect, versão.
- **Outputs:** redirect 302 para o dialog OAuth do Facebook.
- **Passos:** 1) validar `client_id`; 2) se sem `META_APP_ID` → 503 explicativo; 3) montar URL com escopos + `state=client_id`.
- **Pré:** Epic D (para 200). **Pós:** usuário no login do Facebook.

#### E.1.2 — Callback: code → token longo → conta IG · @dev · ✅ código
- **Inputs:** `code`, `state`; `IG_APP_ID/SECRET`.
- **Outputs:** objeto de conexão (`ig_user_id`, `ig_username`, `access_token`, `token_expires_at`).
- **Passos:** 1) `POST api.instagram.com/oauth/access_token` (code→token curto + `user_id`); 2) `graph.instagram.com/access_token?grant_type=ig_exchange_token` (curto→longo ~60d); 3) `graph.instagram.com/me?fields=user_id,username`.
- **Pré:** E.1.1; Epic D. **Pós:** dados prontos para upsert (sem Página do Facebook).

#### E.1.3 — Upsert `instagram_connections` · @dev · ✅ código
- **Inputs:** conexão (E.1.2); `state`=client_id; service role.
- **Outputs:** linha `connected` (onConflict `client_id`) — `ig_user_id`, `ig_username`, `access_token`, `token_expires_at`.
- **Passos:** `admin.from('instagram_connections').upsert({...}, {onConflict:'client_id'})`.
- **Pré:** E.1.2. **Pós:** cliente conectado no banco.

#### E.1.4 — Redirect `/clientes?ig=connected` · @dev · ✅ código
- **Inputs:** `APP_URL`.
- **Outputs:** redirect 302 ao app (ou `?ig=error&msg=` em falha).
- **Passos:** redirecionar conforme sucesso/erro.
- **Pré:** E.1.3. **Pós:** UI reflete status (query `ig-connections`).

#### E.1.5 — Verificar conexão real ponta a ponta · @qa · ⛔ após D
- **Inputs:** App Meta real; 1 cliente.
- **Outputs:** evidência `status='connected'` + `@usuário`.
- **Passos:** conectar pela UI → conferir linha em `instagram_connections`.
- **Pré:** Epic D. **Pós:** Story E.1 aprovada.

---

## Story E.2 — Publicar de verdade
**História:** Como gestor, quero que o post agendado seja publicado, para automatizar a rotina.
**Valor de negócio:** entrega o objetivo central do produto (publicação automática).
**Estimativa:** M (≈3 pts).
**Escopo**
- **IN:** `publishPost` real (container→publish) para feed/imagem; ativar `PUBLISH_MOCK=false`; teste real.
- **OUT:** carrossel/reels/story (Epic F.2.4).
**Dependências:** E.1; Epic B (cover_url).
**Riscos:** ver “Riscos do Epic”.

**Critérios de aceite (Given/When/Then)**
- **AC1:** Dado um cliente conectado e um post `agendado` com imagem vencido, Quando o scheduler roda, Então cria o container e publica.
- **AC2:** Dada a publicação, Quando concluída, Então o post vira `publicado` com `published_at` e `publish_log.success` + `external_id` real.
- **AC3:** Dado `PUBLISH_MOCK=false`, Quando publica, Então a imagem aparece no **feed real** do Instagram de teste.

**Definition of Done**
- [ ] AC1–AC3 verdes na conta de teste · [ ] log com id real (não mock) · [ ] QA aprovado.

### Tasks

#### E.2.1 — `publishPost` real (container → media_publish) · @dev · ✅ código
- **Inputs:** `post` (cover_url, caption, format); `conn` (ig_user_id, access_token).
- **Outputs:** `{ok, externalId}` ou erro classificado.
- **Passos:** 1) validar formato/imagem; 2) `POST /{ig}/media` (image_url+caption); 3) `POST /{ig}/media_publish`.
- **Pré:** conexão válida. **Pós:** post publicado no IG.

#### E.2.2 — Virar `PUBLISH_MOCK=false` · @devops · ⛔ após D
- **Inputs:** `server/.env`.
- **Outputs:** modo real ativo.
- **Passos:** setar `PUBLISH_MOCK=false` e reiniciar backend.
- **Pré:** Epic D + E.1 verificada. **Pós:** scheduler publica de verdade.

#### E.2.3 — Teste com 1 post real · @qa · ⛔ após D
- **Inputs:** post agendado com imagem (~2 min no futuro).
- **Outputs:** evidência de publicação real + log.
- **Passos:** agendar → aguardar scheduler → conferir feed do IG + `publish_log`.
- **Pré:** E.2.1/E.2.2. **Pós:** Story E.2 aprovada.

## Arquivos
- `server/src/index.js` (rotas OAuth) · `server/src/instagram.js` (`exchangeCodeForConnection`, `publishPost`) · `server/.env`

## Verificação (após D)
Conectar 1 cliente → `status='connected'`; agendar post com imagem → scheduler publica → conferir no Instagram + `publish_log`.
