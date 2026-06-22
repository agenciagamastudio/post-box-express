# QA CHECKLIST — GamaGit

**Responsável:** @qa (Quinn). **Quando rodar:** toda vez que o executor (@dev ou @data-engineer)
marcar uma task como `🟦 em revisão`.
**Veredito:** **APROVAR** (executor vai para a próxima; quando a story fecha, @devops `*push`) ou
**CORRIGIR** (devolve ao agente executor — @dev para código, @data-engineer para DB/RLS/Storage —
com observação acionável, repete até aprovar). Registrar o resultado no [DEV-GUIDE](DEV-GUIDE.md).
Escalonamento: bloqueio de arquitetura → @architect; bloqueio de credencial/infra → @devops.

---

## 1. Gate genérico (toda task)
- [ ] **Escopo:** a task entrega exatamente o que a Story define (sem a mais, sem a menos).
- [ ] **Boot/compilação:** backend `node -c` OK e sobe; frontend sem erro de HMR/console.
- [ ] **Padrões:** segue o estilo dos arquivos vizinhos (nomes, tokens de design, sem cor hardcoded).
- [ ] **Sem regressão:** telas/fluxos vizinhos continuam funcionando.
- [ ] **Sem segredo no Git:** nada de service_role/App Secret fora de `.env` (que está no `.gitignore`).
- [ ] **Evidência:** DEV anexou o resultado do teste da task (saída de comando, status HTTP, screenshot).

## 2. Gate por área

### Banco / RLS (Epic A)
- [ ] Usuário novo (sem dados) retorna **0** em clients/posts/finance/tasks.
- [ ] Usuário existente vê **apenas** os seus registros.
- [ ] Nenhuma policy com recursão (sem erro `42P17`).

### Storage / Mídia (Epic B)
- [ ] Upload autenticado retorna 200; arquivo acessível via URL pública (200).
- [ ] `cover_url` salvo no post; preview aparece no PostDialog.

### Frontend (Epics B, C, E-UI)
- [ ] Rota responde 200; navegação/sidebar correta.
- [ ] Estados de loading/erro tratados (toast em falha).
- [ ] Sem cor hardcoded (usa tokens do design GAMA).

### Backend / Scheduler (Epics C, E, F)
- [ ] `/health` 200; `/scheduler/run` retorna resumo coerente.
- [ ] Post `agendado` com `scheduled_at<=now` vira `publicado` e gera `publish_log`.
- [ ] Erros caem em `publish_log` com mensagem clara (não silenciosos).

### OAuth / Publicação real (Epics E, F — após D)
- [ ] Conectar cliente → `instagram_connections.status='connected'` com `@usuário` e token.
- [ ] Post real com imagem aparece no **feed do Instagram** de teste.
- [ ] `publish_log.success` com `external_id` real (não `mock`).
- [ ] Token inválido marca conexão como `expired` (não trava o scheduler).
- [ ] Erro transitório é re-tentado (backoff) antes de falhar.

## 3. Veredito (preenchido por @qa)
```
Task: ____   Executor: @____   Resultado: [ ] APROVADO  [ ] CORRIGIR
Observações: ___________________________________________
Devolver para: @dev / @data-engineer / @architect / @devops
Reteste em: ____ (se CORRIGIR)
```

> Regra de ouro: **só passa para a próxima task quando a atual estiver APROVADA por @qa.**
> Em caso de falha, descrever o problema de forma acionável e devolver ao agente executor.
