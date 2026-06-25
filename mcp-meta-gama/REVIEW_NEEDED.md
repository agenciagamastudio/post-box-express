# Revisão Necessária — Módulos de Credencial

Este arquivo lista os módulos que contêm lógica de credencial e precisam de revisão por Matheus ANTES de merge em main.

## ⚠️ Módulos a revisar

### 1. `mcp_meta_gama/token_store.py`
**Status:** Pronto para revisão
**Conteúdo:** Lógica de leitura de tokens do Supabase

**Pontos a verificar:**
- ✅ Lê `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` via env vars (não hardcoded)
- ✅ Mock mode suportado via `SUPABASE_MOCK=true` (testes sem credencial real)
- ✅ Métodos:
  - `get_account(client_id)` → retorna dados da conta
  - `list_accounts()` → retorna contas ativas
  - `update_account_token()` → atualiza token após refresh
- ⚠️ **Segurança:** Tokens armazenados em texto puro no Supabase (dívida técnica documentada, não bloqueadora)

### 2. `mcp_meta_gama/graph_client.py`
**Status:** Pronto para revisão
**Conteúdo:** Lógica de chamadas Graph API com retry, polling, rate limit

**Pontos a verificar:**
- ✅ `META_APP_ID` e `META_APP_SECRET` via env vars (não hardcoded)
- ✅ Mock mode suportado via `PUBLISH_MOCK=true`
- ✅ Não vaza token em logs/erros (erros sanitizados)
- ✅ Exponential backoff + jitter implementado para retries
- ✅ Polling de containers implementado para reels
- ✅ Métodos:
  - `get_account_insights()`
  - `get_comments()`
  - `get_publish_limit()`
  - `poll_container()` (crítico para reels)
- ✅ Sem chamadas de publicação neste módulo (v1)

## ✅ Testes aprovados (17/17 mock)

```
test_token_store.py::test_get_account_mock PASSED
test_token_store.py::test_get_account_not_found_mock PASSED
test_token_store.py::test_list_accounts_mock PASSED
test_token_store.py::test_update_account_token_mock PASSED
test_graph_client.py::test_get_account_insights_mock PASSED
test_graph_client.py::test_get_comments_mock PASSED
test_graph_client.py::test_poll_container_mock PASSED
test_graph_client.py::test_get_publish_limit_mock PASSED
test_graph_client.py::test_close PASSED
test_tools.py::test_list_connected_accounts PASSED
test_tools.py::test_get_account PASSED
test_tools.py::test_get_account_not_found PASSED
test_tools.py::test_get_ig_insights PASSED
test_tools.py::test_get_ig_insights_not_found PASSED
test_tools.py::test_get_comments PASSED
test_tools.py::test_get_publish_limit PASSED
test_tools.py::test_refresh_tokens PASSED
```

## Checklist de Revisão

- [ ] Nenhum secret encontrado em logs
- [ ] Variáveis de ambiente corretas
- [ ] Tratamento de erros não vaza tokens
- [ ] Mock mode funciona para testes sem credencial real
- [ ] Retry logic está adequada
- [ ] Polling logic para reels está correta
- [ ] Aprovar token_store.py para merge
- [ ] Aprovar graph_client.py para merge

## Próximos passos (após aprovação)

1. Merge para branch feature
2. Commit de `tools/publish.py` (gated — publicação real)
3. App Review para permissões
4. Testes em conta real do Matheus
5. Deploy

