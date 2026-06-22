# 🔧 Manutenção & Monitoramento — Instagram Monitoring

## Status Atual (2026-06-22)

✅ **Backend:** Operacional com dados reais  
✅ **Frontend:** Respondendo HTTP 200  
✅ **API Instagram:** Autenticada e funcionando  
✅ **Banco de dados:** Conectado (Supabase)

---

## 🛡️ Melhorias Implementadas

### 1. **Rate Limiting** (middleware.js)

- Máximo 100 requisições por minuto por IP
- Retorna HTTP 429 se limite ultrapassado
- Útil para proteger contra DDoS

### 2. **Logging Estruturado** (middleware.js)

```json
{
  "timestamp": "2026-06-22T02:30:52.250Z",
  "method": "GET",
  "path": "/api/instagram/monitoring/insights/...",
  "status": 200,
  "duration": "245ms",
  "ip": "192.168.1.1"
}
```

### 3. **Validação de Entrada** (middleware.js)

- `period`: apenas "7days" ou "30days"
- `limit`: entre 1 e 100
- Retorna HTTP 400 se inválido

### 4. **Timeout Global** (middleware.js)

- 30 segundos máximo por requisição
- Retorna HTTP 504 se expirar
- Previne requisições travadas

### 5. **Error Handler Global** (middleware.js)

- Centraliza tratamento de erros
- Retorna JSON estruturado
- Inclui timestamp e path

---

## 📊 Endpoints de Monitoramento

### Health Check

```bash
GET http://localhost:8787/health
```

**Response:**

```json
{
  "ok": true,
  "service": "gamagit-server",
  "mock": false,
  "cron": "*/1 * * * *",
  "time": "2026-06-22T02:30:52.250Z"
}
```

### Insights (Dados Reais)

```bash
GET http://localhost:8787/api/instagram/monitoring/insights/:accountId?period=7days
```

### Comentários

```bash
GET http://localhost:8787/api/instagram/monitoring/comments/:accountId?limit=25
```

### Mensagens Diretas

```bash
GET http://localhost:8787/api/instagram/monitoring/dms/:accountId
```

---

## 🧪 Testes Recomendados

### Manual

```bash
# Test 1: Health
curl http://localhost:8787/health

# Test 2: Insights
curl "http://localhost:8787/api/instagram/monitoring/insights/c0074d3e-96e8-4d19-83f2-a56d6d50f42f?period=7days"

# Test 3: Stress (rate limiting)
for i in {1..150}; do curl -s http://localhost:8787/health > /dev/null; done
```

### Automático (TODO)

- [ ] Adicionar testes unitários com Jest
- [ ] Adicionar testes de integração
- [ ] Adicionar testes de carga
- [ ] Setup CI/CD (GitHub Actions)

---

## 📈 Monitoramento Contínuo

### Alertas Recomendados

| Métrica       | Alerta    | Ação                                 |
| ------------- | --------- | ------------------------------------ |
| Response Time | > 5000ms  | Investigar gargalo no Instagram API  |
| Error Rate    | > 5%      | Revisar rate limiting ou credenciais |
| Rate Limits   | > 500/min | Aumentar limite ou implementar queue |
| Uptime        | < 99%     | Verificar saúde da Supabase          |

### Dashboard Recomendado

- Usar Grafana + Prometheus
- Coletar logs em ELK Stack
- Monitorar throughput por endpoint

---

## 🚀 Próximas Melhorias

### Curto Prazo (1-2 semanas)

- [ ] Implementar retry automático com backoff
- [ ] Adicionar cache com TTL
- [ ] Implementar circuit breaker
- [ ] Adicionar métricas Prometheus

### Médio Prazo (1 mês)

- [ ] Setup CI/CD
- [ ] Implementar blue-green deployment
- [ ] Adicionar autoscaling
- [ ] Setup alerting (Slack/Email)

### Longo Prazo (2+ meses)

- [ ] Migration para Kubernetes
- [ ] Implementar API Gateway
- [ ] Multi-region failover
- [ ] Advanced analytics

---

## 🔑 Credenciais & Configuração

**Arquivo:** `server/.env`

```env
SUPABASE_URL=https://ewerfpxniciegagnretb.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
PORT=8787
APP_URL=https://karate-ashes-rewash.ngrok-free.dev
SCHEDULER_CRON=*/1 * * * *
PUBLISH_MOCK=false
IG_APP_ID=2068166410578667
IG_APP_SECRET=42fdd48cc...
IG_OAUTH_REDIRECT=https://karate-ashes-rewash.ngrok-free.dev/auth/instagram/callback
```

⚠️ **NUNCA** commit `.env` para git

---

## 🆘 Troubleshooting

### "Conta Instagram não encontrada"

- Verificar se UUID está correto em Supabase
- Confirmar que token não expirou
- Testar com `PUBLISH_MOCK=true`

### "Graph API Error: metric[0]..."

- Métricas devem estar na lista válida do Instagram
- Remover métricas não suportadas
- Usar apenas: reach, profile_views, followers_count, etc.

### HTTP 504 Timeout

- Aumentar timeout em middleware.js
- Investigar gargalo no Instagram API
- Implementar cache

### HTTP 429 Rate Limited

- Aumentar threshold em rate limiting
- Implementar filas (Bull.js)
- Distribuir requisições

---

## 📝 Documentação Relacionada

- `CLAUDE.md` — Contexto do projeto
- `server/src/instagram-graph.js` — API do Instagram
- `server/src/instagram-monitoring.js` — Endpoints REST
- `src/hooks/useInstagramMonitoring.ts` — Frontend React

---

**Última atualização:** 2026-06-22  
**Versão:** 1.0  
**Status:** Production Ready ✅
