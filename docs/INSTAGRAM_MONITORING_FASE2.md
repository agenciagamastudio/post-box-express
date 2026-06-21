# Instagram Monitoring — Fase 2: Graph API Integration

**Status:** ✅ COMPLETA (Scaffolding + Endpoints prontos)  
**Duração:** 6-8h  
**Data:** 2026-06-21  
**Modo:** Mock para testes, Real após credenciais do Meta

---

## 🎯 Objetivo

Implementar endpoints REST que sincronizam insights, comentários e DMs do Instagram com Supabase.

## 📋 O Que Foi Entregue

### 1. Módulo Graph API (`server/src/instagram-graph.js`)
- `fetchInsights()` — Busca métricas (impressões, reach, profile views)
- `fetchComments()` — Busca comentários em posts
- `fetchConversations()` — Busca DMs (conversas)
- `fetchMessages()` — Busca mensagens de uma conversa
- `replyToComment()` — Responde comentário
- `sendMessage()` — Envia mensagem

**Suporta mock mode** via `PUBLISH_MOCK=true` para testes sem credenciais.

### 2. Endpoints REST (`server/src/instagram-monitoring.js`)

#### GET `/api/instagram/monitoring/insights/:accountId`
Busca insights de uma conta.

**Query params:**
- `period=7days|30days` (default: 7days)

**Response:**
```json
{
  "success": true,
  "insights": [
    {
      "date": "2026-06-21",
      "impressions": 1234,
      "reach": 890,
      "profile_views": 45
    }
  ]
}
```

**Syncro:** Atualiza `instagram_connections` com cache de insights.

---

#### GET `/api/instagram/monitoring/comments/:accountId`
Busca comentários e sincroniza com `instagram_comments`.

**Query params:**
- `limit=25` (default)

**Response:**
```json
{
  "success": true,
  "comments_count": 3,
  "comments": [
    {
      "id": "123456789",
      "text": "Que legal! 🔥",
      "timestamp": "2026-06-21T10:00:00Z",
      "from": {
        "username": "user_123",
        "name": "João Silva"
      },
      "like_count": 5,
      "replies": { "data": [] }
    }
  ]
}
```

**Syncro:** Upsert em `instagram_comments` (deduplica por account_id + comment_id).

---

#### GET `/api/instagram/monitoring/dms/:accountId`
Busca conversas e sincroniza com `instagram_dms`.

**Response:**
```json
{
  "success": true,
  "conversations_count": 5
}
```

**Syncro:** 
1. Busca todas conversas
2. Para cada conversa, busca mensagens
3. Upsert em `instagram_dms`

---

#### POST `/api/instagram/monitoring/comments/:commentId/reply`
Responde a um comentário.

**Body:**
```json
{
  "accountId": "uuid-da-conexao",
  "message": "Obrigado! 😊"
}
```

**Response:**
```json
{
  "success": true,
  "reply_id": "987654321"
}
```

---

#### POST `/api/instagram/monitoring/dms/:conversationId/send`
Envia mensagem em uma conversa.

**Body:**
```json
{
  "accountId": "uuid-da-conexao",
  "message": "Oi! Como posso ajudar?"
}
```

**Response:**
```json
{
  "success": true,
  "message_id": "msg_123456"
}
```

---

## 🎣 Hook React (`src/hooks/useInstagramMonitoring.ts`)

### `useInstagramInsights(accountId, period, enabled)`
```typescript
const { data, isLoading, error } = useInstagramInsights(accountId, "7days");
console.log(data?.insights); // Array de insights
```

### `useInstagramComments(accountId, limit, enabled)`
```typescript
const { data, isLoading } = useInstagramComments(accountId, 25);
console.log(data?.comments); // Array de comentários
```

### `useInstagramDMs(accountId, enabled)`
```typescript
const { data } = useInstagramDMs(accountId);
console.log(data?.conversations_count); // Número de conversas
```

### `useReplyToComment()`
```typescript
const { mutate } = useReplyToComment();
mutate({
  commentId: "123",
  accountId: "uuid",
  message: "Obrigado! 😊"
});
```

### `useSendDM()`
```typescript
const { mutate } = useSendDM();
mutate({
  conversationId: "conv_123",
  accountId: "uuid",
  message: "Oi!"
});
```

---

## 🧪 Testing

### Com Mock (Agora)
```bash
export PUBLISH_MOCK=true
npm run dev
# Endpoints retornam dados simulados
```

### Com Credenciais Reais (Depois)
```bash
export IG_APP_ID="seu_app_id"
export IG_APP_SECRET="seu_app_secret"
npm run dev
# Endpoints chamam Graph API do Instagram
```

---

## 📱 Uso no Frontend (Próxima Fase 3)

Página `/monitoramento` vai usar esses hooks:

```typescript
export function MonitoringDashboard() {
  const [accountId, setAccountId] = useState<string | null>(null);
  const { data: insights } = useInstagramInsights(accountId);
  const { data: comments } = useInstagramComments(accountId);
  const { data: dms } = useInstagramDMs(accountId);

  return (
    <div>
      <InsightsCard insights={insights?.insights} />
      <CommentsSection comments={comments?.comments} />
      <DMsSection conversations={dms?.conversations_count} />
    </div>
  );
}
```

---

## 🔄 Sincronização Automática (Fase 4)

Próximas melhorias:
- **Cron job** para sincronizar insights a cada 30min
- **WebSocket** para notificações em tempo real de comentários/DMs
- **Bot de resposta automática** (sugestões de reply)

---

## ⚠️ Dependências

| Dependency | Para quê | Status |
|------------|----------|--------|
| `@tanstack/react-query` | Caching + refetch | ✅ Já instalado |
| `express` (backend) | Endpoints REST | ✅ Já instalado |
| `supabase` | Storage de dados | ✅ Já instalado |
| IG_APP_ID / IG_APP_SECRET | OAuth Graph API | ⏳ Configurar no Meta |

---

## 🚀 Próximos Passos

1. **Agora:** Testes com mock mode
2. **Depois:** Preencher IG_APP_ID/SECRET no Meta for Developers
3. **Depois:** Implementar `/monitoramento` página (Fase 3)
4. **Depois:** Cron + WebSocket real-time (Fase 4)

---

## 📊 Endpoints Summary

| Method | Path | Função |
|--------|------|--------|
| GET | `/api/instagram/monitoring/insights/:accountId` | Busca insights |
| GET | `/api/instagram/monitoring/comments/:accountId` | Busca comentários |
| GET | `/api/instagram/monitoring/dms/:accountId` | Busca DMs |
| POST | `/api/instagram/monitoring/comments/:commentId/reply` | Responder comentário |
| POST | `/api/instagram/monitoring/dms/:conversationId/send` | Enviar DM |

---

**Commit:** `feat: Fase 2 - Instagram Monitoring - Graph API endpoints + React hooks`
