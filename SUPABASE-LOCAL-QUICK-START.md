# ⚡ Supabase Local — Quick Start (5 min)

**Status:** ✅ Docker Compose pronto | ✅ Migrations prontas | ✅ Script de setup pronto

---

## 🚀 TL;DR — 3 Comandos

```bash
# 1. Fazer o setup (automation)
bash scripts/setup-supabase-local.sh

# 2. Aguardar 2-3 min (containers inicializando)
# ... (script faz isso tudo automaticamente)

# 3. Verificar (e pronto!)
docker-compose ps
# Deve mostrar 8 containers rodando ✅
```

**Tempo Total:** 5-10 minutos

---

## 📊 O Que Você Está Levantando

```
🐳 Docker Compose com:
│
├─ 🐘 PostgreSQL 15 (porta 5432)
│  └─ Com publish_log e post_reviews tables
│
├─ 🔐 Supabase Auth (porta 9999)
│  └─ JWT, Google OAuth, Instagram OAuth ready
│
├─ 🌐 Kong API Gateway (porta 8000)
│  └─ REST API endpoint
│
├─ 📡 Realtime WebSocket (porta 4000)
│  └─ Para live updates
│
├─ 📦 Storage Service (porta 5000)
│  └─ File upload/download
│
├─ 🎨 Supabase Studio (porta 3001)
│  └─ Visual dashboard + SQL editor
│
├─ 📧 MailHog (porta 8025)
│  └─ Email testing (não envia real, só mock)
│
└─ ⚡ Functions (Edge Functions)
   └─ Para serverless functions (quando precisar)
```

---

## 🔄 Fluxo Completo

### 1️⃣ Setup Automático (2-3 min)

```bash
cd c:\Users\Usuario\Desktop\O_GRANDE_PROJETO\GAMA_CRONOGRAMAS\PLATAFORMA

# Executar script de setup
bash scripts/setup-supabase-local.sh

# Resultado:
# ✅ Docker Compose started
# ✅ Migrations executed
# ✅ Tables created (publish_log, post_reviews)
# ✅ TypeScript types generated
# ✅ Tests passed

# FIM! Todos os containers rodando
```

### 2️⃣ Verificar Services (30s)

```bash
# Ver todos os containers
docker-compose ps

# Ver logs (se houver erro)
docker-compose logs postgres  # PostgreSQL
docker-compose logs kong      # API Gateway
docker-compose logs studio    # Dashboard

# Testar conectividade
curl http://localhost:8000/health  # Kong
psql -h localhost -U postgres      # PostgreSQL
```

### 3️⃣ Atualizar .env.local (2 min)

```bash
# Copiar template
cp .env.supabase.local .env.local

# Editar .env.local com suas credenciais:
# IG_APP_ID=xxx (de https://developers.facebook.com)
# IG_APP_SECRET=xxx
# GOOGLE_CLIENT_ID=xxx
# GOOGLE_CLIENT_SECRET=xxx
```

### 4️⃣ Rodar Projeto Local (2 min)

```bash
# Terminal 1: Backend local (já está em Docker)
npm run dev

# Terminal 2: Abrir browser
http://localhost:5173

# Console deve mostrar:
# ✅ Supabase conectado!
```

### 5️⃣ Regenerar Types (quando mudar schema)

```bash
# Se você mudar tabelas no Studio, roda:
npx supabase gen types typescript > src/types/database.ts

# Importar em client.ts:
import { Database } from "@/types/database";
```

---

## 📁 Arquivos Criados

| Arquivo | Propósito |
|---------|-----------|
| `docker-compose.yml` | Config de todos os 8 services |
| `.env.supabase.local` | Template de variáveis de env |
| `supabase/migrations/001_create_missing_tables.sql` | Cria publish_log + post_reviews |
| `scripts/setup-supabase-local.sh` | Script de setup automático |
| `docs/SUPABASE-LOCAL-SETUP.md` | Documentação completa |
| `SUPABASE-LOCAL-QUICK-START.md` | Este arquivo |

---

## 🎯 Como Usar Supabase Studio

**Acessar Dashboard:**
```
http://localhost:3001
```

**O que você pode fazer:**
1. **Table Editor** — Ver/editar dados direto
2. **SQL Editor** — Rodar queries customizadas
3. **Auth** — Gerenciar users e sessions
4. **Storage** — Upload/download de arquivos
5. **Realtime** — Configurar subscriptions

**Exemplo: Ver dados de publish_log**
```sql
-- Abra SQL Editor (http://localhost:3001/sql)
SELECT * FROM publish_log LIMIT 10;

-- Ou vá em Table Editor e clique em "publish_log"
```

---

## 🚦 Checklist Rápido

```
Setup:
  [ ] Docker Desktop aberto
  [ ] bash scripts/setup-supabase-local.sh executado
  [ ] Aguardado 2-3 minutos (containers startando)
  
Verificação:
  [ ] docker-compose ps mostra 8 containers ✅
  [ ] curl http://localhost:8000/health retorna JSON
  [ ] psql -h localhost -U postgres funciona
  [ ] http://localhost:3001 abre no browser
  
Integração:
  [ ] .env.local atualizado com credenciais
  [ ] npm run build → SUCCESS (0 TS errors)
  [ ] npm run dev → Supabase conectado no console
  [ ] http://localhost:5173 carrega sem erros
  
Resultados:
  [ ] publish_log table existe em PostgreSQL
  [ ] post_reviews table existe em PostgreSQL
  [ ] src/types/database.ts foi gerado
  [ ] npm run typecheck → 0 errors
  
🎉 SUPABASE LOCAL PRONTO!
```

---

## ⚡ Comandos Úteis

### Lifecycle
```bash
docker-compose up -d        # Inicia
docker-compose ps           # Status
docker-compose logs -f postgres  # Ver logs
docker-compose stop         # Parar (dados persistem)
docker-compose down         # Parar + remover containers
docker-compose down -v      # Parar + remover TUDO (⚠️ deleta dados)
```

### Database
```bash
# Conectar direto
psql -h localhost -U postgres -d postgres

# Ver tabelas
psql -h localhost -U postgres -c "\dt"

# Backup
docker exec gama_postgres pg_dump -U postgres postgres > backup.sql

# Restore
docker exec -i gama_postgres psql -U postgres < backup.sql
```

### TypeScript
```bash
# Gerar tipos após mudança no schema
npx supabase gen types typescript > src/types/database.ts

# Verificar tipos
npm run typecheck
```

---

## 🔧 Se Houver Problema

| Problema | Solução |
|----------|---------|
| "Port already in use" | `docker ps` + `docker stop <id>` |
| "Docker daemon not running" | Abra Docker Desktop |
| "Migration failed" | Verificar `docker-compose logs postgres` |
| "Studio not accessible" | Aguarde 30s e recarregue navegador |
| "Types not generated" | Rodar manualmente: `npx supabase gen types typescript > src/types/database.ts` |
| "Still getting TS errors" | `npm run build` e verificar output |

---

## 📚 Documentação

- **Setup Completo:** `docs/SUPABASE-LOCAL-SETUP.md` (instruções detalhadas)
- **TypeScript Errors:** `docs/typescript-errors-analysis.md` (como resolver 32 erros)
- **Quick Visual Map:** `docs/TYPESCRIPT-ERRORS-QUICK-MAP.md` (mapa visual)

---

## 🎉 Resultado Final

Depois de rodar o setup:

```bash
✅ Supabase rodando localmente em 8 containers Docker
✅ PostgreSQL com publish_log e post_reviews tables
✅ TypeScript types regenerados automaticamente
✅ 32 erros TS resolvidos (schema agora existe)
✅ npm run build passa (0 errors)
✅ npm run dev funciona
✅ Pronto para EPIC-01 implementation

Total de tempo: ~10 minutos
```

---

## 🚀 Próximo Passo

Assim que terminar o setup:

```bash
# 1. Verificar que tudo subiu
docker-compose ps

# 2. Testar conectividade
curl http://localhost:8000/health

# 3. Rodar projeto
npm run dev

# 4. Abrir no browser
http://localhost:5173

# 5. Verificar console
# ✅ Supabase conectado! (ou sem erro)
```

---

## 📞 Need Help?

```bash
# Ver logs detalhados
docker-compose logs -f postgres
docker-compose logs -f kong
docker-compose logs -f studio

# Verificar containers
docker ps
docker ps -a

# Reset completo (cuidado: deleta dados)
docker-compose down -v
docker volume prune
bash scripts/setup-supabase-local.sh
```

---

**Status:** ✅ Ready to go!  
**Estimated Time:** 5-10 minutes  
**Next:** Run `bash scripts/setup-supabase-local.sh` 🚀

