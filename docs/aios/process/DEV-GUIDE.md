# DEV GUIDE — GamaGit (tracker de execução)

**Como usar:** o executor da task (ver coluna **Agente**) pega a próxima `⬜`, implementa, marca
`🟦 em revisão` e chama **@qa**. O @qa roda o [QA-CHECKLIST](QA-CHECKLIST.md). Se **aprovar**,
marca `✅` e segue para a próxima. Se **reprovar**, volta ao executor com a observação até aprovar.
**Ordem obrigatória:** não começar uma task se a anterior da mesma story não estiver `✅` (salvo paralelizáveis).

## Agentes e handoff (AIOS)

| Agente                  | Papel neste projeto                                 |
| ----------------------- | --------------------------------------------------- |
| @pm (Morgan)            | Dono do PRD / epics                                 |
| @sm (River)             | Cria/draft das stories                              |
| @po (Pax)               | Valida story (checklist 10 pontos) Draft→Ready      |
| @architect (Aria)       | Decisões de arquitetura/integração (RLS, OAuth)     |
| @data-engineer (Dara)   | DB: schema, RLS, policies, Storage bucket           |
| @dev (Dex)              | Implementação de código (frontend + backend)        |
| @ux-design-expert (Uma) | Apoio de UI (telas)                                 |
| @qa (Quinn)             | Gate de qualidade por task                          |
| @devops (Gage)          | `.env`/segredos, `git push`, deploy, `PUBLISH_MOCK` |

**Fluxo padrão por story:**

```
@sm *draft → @po *validate-story-draft → [executor] *develop → @qa *qa-gate → @devops *push
```

O **executor** é @data-engineer (DB/RLS/Storage) ou @dev (código), conforme a coluna Agente.

**Legenda:** ⬜ a fazer · 🟦 em revisão (QA) · ✅ aprovado · ⛔ bloqueado · ⬜🔮 futuro

---

## Ordem de execução

A → B → C → **D (usuário)** → E → F. D é pré-requisito de E; E de F (verificação real).

## Tracker de tasks

### EPIC A — Multi-tenancy · executor: @data-engineer · gate: @qa

- [x] A.1.1 `handle_new_user` sem `owner` automático — ✅
- [x] A.1.2 Limpar `user_roles` auto — ✅
- [x] A.1.3 Teste de isolamento (6/6) — ✅
- [x] A.1.4 Doc de promoção manual — ✅

### EPIC B — Mídia/Storage · executores: @data-engineer (bucket) + @dev (upload) · gate: @qa

- [x] B.1.1 Bucket `post-media` + policies — ✅
- [x] B.1.2 Upload no PostDialog → `cover_url` + preview — ✅
- [x] B.1.3 Teste upload/leitura (200/200) — ✅

### EPIC C — Tela Automação · executor: @dev · apoio UI: @ux-design-expert · gate: @qa

- [x] C.1.1 Rota `/automacao` + nav — ✅
- [x] C.1.2 Status backend + botão testar — ✅
- [x] C.1.3 Tabela `publish_log` — ✅

### EPIC D — Setup Instagram (USUÁRIO) · executor: Usuário · configura .env: @devops

- [ ] D.1.1 Converter IG em Business/Creator — ⛔ usuário
- [ ] D.1.2 Criar App na Meta — ⛔ usuário
- [ ] D.1.3 Produto Instagram (login do Instagram) — ⛔ usuário
- [ ] D.1.4 Copiar IG_APP_ID + IG_APP_SECRET — ⛔ usuário
- [ ] D.1.5 Redirect URI cadastrada — ⛔ usuário
- [ ] D.1.6 Aceitar convite de testador do Instagram — ⛔ usuário
- [ ] D.1.7 Entregar IG_APP_ID + Secret — ⛔ usuário

### EPIC E — OAuth + publicação · executor: @dev · secrets/deploy: @devops · gate: @qa

- [x] E.1.1 `/auth/instagram/start` (escopos) — ✅ código
- [x] E.1.2 `/auth/instagram/callback` (code→token→IG) — ✅ código
- [x] E.1.3 Upsert `instagram_connections` — ✅ código
- [x] E.1.4 Redirect `/clientes?ig=connected` — ✅ código
- [ ] E.1.5 Verificar conexão real — ⛔ após D
- [x] E.2.1 `publishPost` real — ✅ código
- [ ] E.2.2 `PUBLISH_MOCK=false` — ⛔ após D
- [ ] E.2.3 Teste post real (feed) — ⛔ após D

### EPIC F — Robustez · executor: @dev · gate: @qa · deploy: @devops

- [x] F.1.1 Refresh diário de token — ✅ código
- [x] F.1.2 Token inválido → `expired` — ✅ código
- [ ] F.1.3 Verificar refresh real — ⛔ após D
- [x] F.2.1 `withRetry` backoff+jitter — ✅ código
- [x] F.2.2 Erro no `publish_log` + UI — ✅
- [x] F.2.3 Guarda de formato (feed/imagem) — ✅ código
- [ ] F.2.4 Carrossel/Reels/Story real — ⬜🔮 futuro

---

## Definition of Done (por task)

1. Código implementado seguindo o padrão do arquivo vizinho.
2. Sem erro de boot/compilação (`node -c` no server; HMR sem erro no front).
3. Verificação da própria task feita (ver coluna "Verificação" no Epic).
4. QA-CHECKLIST aprovado.
5. Marcada `✅` aqui e no documento do Epic.

## Comandos úteis

```bash
# Frontend
cd PLATAFORMA && bun run dev            # http://localhost:8080
# Backend
cd PLATAFORMA/server && node src/index.js   # http://localhost:8787
# Disparar scheduler manualmente
curl -X POST http://localhost:8787/scheduler/run
```
