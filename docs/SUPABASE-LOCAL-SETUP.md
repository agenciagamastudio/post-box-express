# 🐳 Supabase Local Setup — Docker

**Objetivo:** Rodar Supabase completo localmente (sem precisar de conta Pro/Enterprise)  
**Tempo Estimado:** 10-15 minutos  
**Pré-requisitos:** Docker + Docker Compose instalados

---

## ✅ Checklist Pré-Instalação

- [ ] Docker Desktop instalado e rodando
- [ ] Docker Compose v2.0+ (`docker-compose --version`)
- [ ] Porta 5432 (PostgreSQL) disponível
- [ ] Porta 8000 (Kong/API) disponível
- [ ] Porta 3001 (Studio) disponível
- [ ] ~2GB de espaço em disco livre

**Verificar Docker:**
```bash
docker --version
docker-compose --version
docker ps  # Deve mostrar containers rodando (se houver)
```

---

## 🚀 PASSO 1: Clonar/Criar Arquivos

Os arquivos já foram criados:

✅ `docker-compose.yml` — Configuração completa do Supabase  
✅ `.env.supabase.local` — Variáveis de ambiente  
✅ `supabase/migrations/001_create_missing_tables.sql` — Schema (publish_log + post_reviews)

**Verificar que os arquivos estão em:**
```bash
# No projeto root (PLATAFORMA/)
ls -la docker-compose.yml
ls -la .env.supabase.local
ls -la supabase/migrations/001_create_missing_tables.sql
```

---

## 🌳 PASSO 2: Estrutura de Pastas

Crie a estrutura esperada:

```bash
# Crie pasta de funções (Edge Functions)
mkdir -p supabase/functions

# Crie pasta de seeds (dados iniciais)
mkdir -p supabase/seeds

# Crie pasta de backup
mkdir -p supabase/backups
```

---

## 🔧 PASSO 3: Atualizar `.env.local` do Projeto

Copy do `.env.supabase.local` para `.env.local`:

```bash
# Copiar configurações para .env.local
cp .env.supabase.local .env.local

# Editar .env.local com suas credenciais reais:
# - IG_APP_ID (Meta Developers)
# - IG_APP_SECRET (Meta Developers)
# - GOOGLE_CLIENT_ID (Google Cloud Console)
# - GOOGLE_CLIENT_SECRET (Google Cloud Console)
```

**Ou manualmente em `.env.local`:**
```env
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4ODIzNDYwMCwiZXhwIjoxODk2MDk0NjAwfQ.N5Y-hKk05hhTd9ufFdC5WEQvKdKNQq5C_dFGJ5WNr2U
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjg4MjM0NjAwLCJleHAiOjE4OTYwOTQ2MDB9.sL4EJp7PVaX8Kx3PwdE9c5R7f4L5S6K1x9Z2V1B5Y3A
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
IG_APP_ID=your_app_id_here
IG_APP_SECRET=your_app_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

---

## 🐳 PASSO 4: Levantar Supabase com Docker Compose

**Iniciar todos os containers:**
```bash
# No diretório do projeto (onde está docker-compose.yml)
docker-compose up -d

# Ou com output (para debug):
docker-compose up

# Ou rebuild images:
docker-compose up -d --build
```

**Verificar que tudo subiu:**
```bash
# Ver containers rodando
docker-compose ps

# Resultado esperado:
# NAME           STATUS      PORTS
# gama_postgres  Up 2 min    0.0.0.0:5432->5432/tcp
# gama_auth      Up 2 min    0.0.0.0:9999->9999/tcp
# gama_rest      Up 2 min    0.0.0.0:3000->3000/tcp
# gama_realtime  Up 2 min    0.0.0.0:4000->4000/tcp
# gama_storage   Up 2 min    0.0.0.0:5000->5000/tcp
# gama_kong      Up 2 min    0.0.0.0:8000->8000/tcp
# gama_studio    Up 2 min    0.0.0.0:3001->3000/tcp
# gama_mailhog   Up 2 min    0.0.0.0:1025->1025/tcp, 0.0.0.0:8025->8025/tcp
```

---

## ✅ PASSO 5: Verificar Conectividade

**PostgreSQL está rodando?**
```bash
# Conectar direto ao Postgres (password: postgres)
psql -h localhost -U postgres -d postgres -c "SELECT version();"

# Ou via psql: postgres@localhost:5432
```

**API Gateway (Kong) está respondendo?**
```bash
curl http://localhost:8000/health

# Resultado esperado: {"message": "service running"}
```

**Studio (Dashboard) está acessível?**
```bash
# Abra em browser:
http://localhost:3001

# Credenciais padrão:
# Email: admin@example.com
# Password: (você defini no docker-compose — default é nenhuma)
```

---

## 🗄️ PASSO 6: Executar Migrations (Criar Tabelas)

**Opção A: Automática (via docker-entrypoint)**

As migrations em `supabase/migrations/` executam automaticamente quando PostgreSQL inicia.

**Opção B: Manual (psql)**
```bash
# Conectar ao PostgreSQL e rodar migration
psql -h localhost -U postgres -d postgres < supabase/migrations/001_create_missing_tables.sql

# Verifica se funcionou:
psql -h localhost -U postgres -d postgres -c "
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name IN ('publish_log', 'post_reviews');
"

# Resultado esperado:
# table_name
# ────────────────
# publish_log
# post_reviews
```

---

## 🔄 PASSO 7: Regenerar Tipos TypeScript

**Gerar tipos do Supabase local:**

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Login (usar token de projeto, ou skip para local)
supabase login

# Gerar tipos a partir do banco local
npx supabase gen types typescript \
  --db-url "postgresql://postgres:postgres@localhost:5432/postgres" \
  > src/types/database.ts

# Ou se tiver supabase CLI:
supabase gen types typescript > src/types/database.ts
```

**Resultado esperado:**
```typescript
// src/types/database.ts
export type Database = {
  public: {
    Tables: {
      publish_log: {
        Row: { id: string; post_id: string; status: string; ... };
        Insert: { ... };
        Update: { ... };
      };
      post_reviews: {
        Row: { id: string; post_id: string; reviewer_id: string; ... };
        Insert: { ... };
        Update: { ... };
      };
      // ... outras tabelas
    };
  };
};
```

---

## 🧪 PASSO 8: Testar Conexão no Projeto

**Atualizar `src/integrations/supabase/client.ts`:**

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Teste rápido:
supabase.auth.getUser().then(({ data }) => {
  console.log("✅ Supabase conectado!", data);
});
```

**Rodar projeto:**
```bash
npm run dev

# Abrir http://localhost:5173 no browser
# Verificar console: "✅ Supabase conectado!"
```

---

## 📊 PASSO 9: Verificar Tabelas no Studio

**Acessar Supabase Studio:**
1. Abra http://localhost:3001
2. Vá para **Table Editor**
3. Você deve ver:
   - ✅ `publish_log` (com 7 colunas)
   - ✅ `post_reviews` (com 7 colunas)
   - ✅ `posts` (com novas colunas: format, status)
   - ✅ Todas as outras tabelas existentes

**Ou via SQL (Studio):**
```sql
-- Abra SQL Editor em http://localhost:3001/sql
SELECT * FROM information_schema.tables WHERE table_schema = 'public';

-- Ver colunas de publish_log:
SELECT * FROM information_schema.columns WHERE table_name = 'publish_log';

-- Ver colunas de post_reviews:
SELECT * FROM information_schema.columns WHERE table_name = 'post_reviews';
```

---

## 🚀 PASSO 10: Atualizar Code (Remover Type Casts)

Agora que tabelas existem, erros TypeScript desaparecem:

**Antes (com erro):**
```typescript
const { data, error } = await supabase
  .from("publish_log")  // ❌ Erro: table doesn't exist
  .select();

const logs = data as LogRow[];  // ❌ Unsafe cast
```

**Depois (sem erro):**
```typescript
const { data, error } = await supabase
  .from("publish_log")  // ✅ Agora existe!
  .select();

if (error) throw error;
const logs = data as LogRow[];  // ✅ Still typed
```

**Regenerar types após alterações:**
```bash
# Sempre que mudança o schema do banco
supabase gen types typescript > src/types/database.ts
```

---

## 🛑 PASSO 11: Parar/Cleanup

**Parar containers:**
```bash
# Parar sem deletar dados
docker-compose stop

# Parar e remover containers (dados persistem em volumes)
docker-compose down

# Parar, remover containers E volumes (CUIDADO: deleta dados)
docker-compose down -v

# Ver volumes
docker volume ls | grep gama
```

**Remover tudo (reset completo):**
```bash
# ⚠️ CUIDADO: Isso deleta TUDO
docker-compose down -v --remove-orphans
rm -rf supabase/.postgres  # Se houver arquivo de state
```

---

## 📋 Checklist Final

- [ ] Docker Compose subiu sem erros
- [ ] Todos os 8 containers rodando (`docker-compose ps`)
- [ ] PostgreSQL respondendo (`psql`)
- [ ] Kong respondendo (`curl http://localhost:8000/health`)
- [ ] Studio acessível (`http://localhost:3001`)
- [ ] Migration executada (`publish_log` e `post_reviews` existem)
- [ ] Tipos TypeScript regenerados
- [ ] `npm run build` passa (0 erros TS)
- [ ] `npm run dev` funciona
- [ ] Browser mostra "✅ Supabase conectado!"

---

## 🔧 Troubleshooting

### ❌ "Port 5432 is already in use"
```bash
# Encontre o processo
lsof -i :5432

# Ou stop outro container Postgres
docker stop <container_name>

# Ou use porta diferente em docker-compose.yml:
# ports:
#   - "5433:5432"  # Use 5433 em vez de 5432
```

### ❌ "Cannot connect to Docker daemon"
```bash
# Abra Docker Desktop ou inicie daemon:
sudo systemctl start docker  # Linux
open /Applications/Docker.app  # Mac
```

### ❌ "Migration failed to execute"
```bash
# Ver logs detalhados
docker-compose logs postgres

# Ou conectar ao psql e rodar manual:
psql -h localhost -U postgres -d postgres
\i supabase/migrations/001_create_missing_tables.sql
```

### ❌ "TypeScript still shows errors after migration"
```bash
# Regenerar tipos:
npx supabase gen types typescript > src/types/database.ts

# E reimporte no client.ts:
import { Database } from "@/types/database";

// Ou reset cache TypeScript:
rm -rf node_modules/.vite
npm run build
```

### ❌ "Can't login to Studio"
```bash
# Padrão: admin@example.com, sem senha
# Se precisar resetar, delete volume e recrie:
docker-compose down -v
docker-compose up -d

# E espere a inicialização completa (2-3 min)
```

---

## 💡 Dicas

1. **Backup do Banco:**
   ```bash
   docker exec gama_postgres pg_dump -U postgres postgres > backup.sql
   ```

2. **Restore do Backup:**
   ```bash
   docker exec -i gama_postgres psql -U postgres < backup.sql
   ```

3. **Ver Logs de um Container:**
   ```bash
   docker-compose logs -f postgres
   docker-compose logs -f auth
   docker-compose logs -f kong
   ```

4. **Testar Email (MailHog):**
   ```bash
   # Acessar http://localhost:8025 para ver emails
   ```

5. **Executar SQL no Container:**
   ```bash
   docker exec -it gama_postgres psql -U postgres -c "SELECT COUNT(*) FROM posts;"
   ```

---

## 📚 Referências

- [Supabase Self-Hosting](https://supabase.com/docs/guides/hosting/docker)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Kong API Gateway](https://konghq.com/)
- [Supabase Studio](https://supabase.com/docs/guides/self-hosted-analytics)

---

## ✨ Result

Após completar todos os passos:

```
✅ Supabase local rodando em 8 containers
✅ publish_log e post_reviews tables criadas
✅ Tipos TypeScript regenerados
✅ 32 erros TS resolvidos
✅ npm run build passa
✅ MVP pronto para EPIC-01 implementation
```

**Tempo Total:** ~15 minutos  
**Próximo Passo:** Resolver erros TS restantes (type casts, unions, etc)

