#!/bin/bash

# ============================================
# Supabase Local Setup Script
# ============================================
# Automatiza todo o processo de setup
# Uso: bash scripts/setup-supabase-local.sh

set -e  # Exit on error

echo "🐳 GAMA_CRONOGRAMAS — Supabase Local Setup"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# 1. Check Prerequisites
# ============================================
echo -e "${BLUE}Step 1: Checking Prerequisites${NC}"
echo "--------------------------------"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found!${NC}"
    echo "   Install Docker: https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo -e "${GREEN}✅ Docker${NC}: $(docker --version)"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found!${NC}"
    echo "   Install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose${NC}: $(docker-compose --version)"

# Check Docker daemon is running
if ! docker ps &> /dev/null; then
    echo -e "${RED}❌ Docker daemon is not running!${NC}"
    echo "   Start Docker Desktop or docker daemon"
    exit 1
fi
echo -e "${GREEN}✅ Docker daemon${NC}: running"

# Check required ports
for port in 5432 8000 3001; do
    if nc -z localhost $port 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
    else
        echo -e "${GREEN}✅ Port $port${NC}: available"
    fi
done

echo ""

# ============================================
# 2. Create Directory Structure
# ============================================
echo -e "${BLUE}Step 2: Creating Directory Structure${NC}"
echo "------------------------------------"

mkdir -p supabase/functions
mkdir -p supabase/seeds
mkdir -p supabase/backups
mkdir -p docs

echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# ============================================
# 3. Check Docker Compose Files
# ============================================
echo -e "${BLUE}Step 3: Checking Docker Compose Files${NC}"
echo "-------------------------------------"

if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ docker-compose.yml not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ docker-compose.yml${NC}: found"

if [ ! -f ".env.supabase.local" ]; then
    echo -e "${YELLOW}⚠️  .env.supabase.local not found${NC}"
    echo "   Creating from template..."
    cp .env.supabase.local .env.local 2>/dev/null || echo "   Please create .env.local manually"
fi

echo ""

# ============================================
# 4. Start Docker Containers
# ============================================
echo -e "${BLUE}Step 4: Starting Docker Containers${NC}"
echo "-----------------------------------"

echo "   Pulling latest images..."
docker-compose pull

echo "   Starting services (this may take 1-2 minutes)..."
docker-compose up -d

# Wait for PostgreSQL to be healthy
echo "   Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker exec gama_postgres pg_isready -U postgres &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ PostgreSQL failed to start${NC}"
        echo "   Logs:"
        docker-compose logs postgres
        exit 1
    fi
    echo -n "."
    sleep 2
done

echo ""
sleep 5  # Give other services time to start

# ============================================
# 5. Verify All Containers
# ============================================
echo -e "${BLUE}Step 5: Verifying All Containers${NC}"
echo "--------------------------------"

docker-compose ps

echo ""

# ============================================
# 6. Execute Migrations
# ============================================
echo -e "${BLUE}Step 6: Executing Database Migrations${NC}"
echo "------------------------------------"

if [ -f "supabase/migrations/001_create_missing_tables.sql" ]; then
    echo "   Running migration: 001_create_missing_tables.sql"
    docker exec -i gama_postgres psql -U postgres -d postgres < supabase/migrations/001_create_missing_tables.sql
    echo -e "${GREEN}✅ Migration executed${NC}"
else
    echo -e "${YELLOW}⚠️  No migrations found${NC}"
fi

echo ""

# ============================================
# 7. Verify Tables Were Created
# ============================================
echo -e "${BLUE}Step 7: Verifying Tables${NC}"
echo "------------------------"

TABLES=$(docker exec gama_postgres psql -U postgres -d postgres -t -c \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('publish_log', 'post_reviews');")

if [ "$TABLES" -eq 2 ]; then
    echo -e "${GREEN}✅ publish_log table created${NC}"
    echo -e "${GREEN}✅ post_reviews table created${NC}"
else
    echo -e "${YELLOW}⚠️  Tables may not have been created correctly${NC}"
    echo "   Check migration logs above"
fi

echo ""

# ============================================
# 8. Test Connectivity
# ============================================
echo -e "${BLUE}Step 8: Testing Connectivity${NC}"
echo "-----------------------------"

# Test PostgreSQL
if docker exec gama_postgres psql -U postgres -d postgres -c "SELECT version();" &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL${NC}: OK (localhost:5432)"
else
    echo -e "${RED}❌ PostgreSQL${NC}: FAILED"
fi

# Test Kong/API Gateway
if curl -s http://localhost:8000/health &> /dev/null; then
    echo -e "${GREEN}✅ Kong API Gateway${NC}: OK (localhost:8000)"
else
    echo -e "${YELLOW}⚠️  Kong API Gateway${NC}: Not responding yet (may take 30s)"
fi

# Test Studio
if curl -s http://localhost:3001 &> /dev/null; then
    echo -e "${GREEN}✅ Supabase Studio${NC}: OK (http://localhost:3001)"
else
    echo -e "${YELLOW}⚠️  Supabase Studio${NC}: Not responding yet (may take 30s)"
fi

echo ""

# ============================================
# 9. Generate TypeScript Types
# ============================================
echo -e "${BLUE}Step 9: Generating TypeScript Types${NC}"
echo "-----------------------------------"

if command -v supabase &> /dev/null; then
    echo "   Generating types from database..."
    npx supabase gen types typescript \
        --db-url "postgresql://postgres:postgres@localhost:5432/postgres" \
        > src/types/database.ts 2>/dev/null || \
    echo -e "${YELLOW}⚠️  npx supabase gen failed (try manual command)${NC}"

    if [ -f "src/types/database.ts" ]; then
        echo -e "${GREEN}✅ Types generated${NC}: src/types/database.ts"
    fi
else
    echo -e "${YELLOW}⚠️  Supabase CLI not found${NC}"
    echo "   Run manually: npx supabase gen types typescript > src/types/database.ts"
fi

echo ""

# ============================================
# 10. Summary
# ============================================
echo -e "${BLUE}Step 10: Setup Complete!${NC}"
echo "========================"
echo ""
echo -e "${GREEN}✅ Supabase Local is running!${NC}"
echo ""
echo "📊 Services Available:"
echo "  - ${BLUE}PostgreSQL${NC}: localhost:5432 (user: postgres, password: postgres)"
echo "  - ${BLUE}Kong API Gateway${NC}: http://localhost:8000"
echo "  - ${BLUE}Supabase Studio${NC}: http://localhost:3001"
echo "  - ${BLUE}MailHog${NC}: http://localhost:8025 (for email testing)"
echo "  - ${BLUE}Realtime${NC}: ws://localhost:4000"
echo ""
echo "🔧 Next Steps:"
echo "  1. Update .env.local with your credentials:"
echo "     - IG_APP_ID (from Meta Developers)"
echo "     - IG_APP_SECRET (from Meta Developers)"
echo "     - GOOGLE_CLIENT_ID (from Google Cloud)"
echo "     - GOOGLE_CLIENT_SECRET (from Google Cloud)"
echo ""
echo "  2. Copy .env.supabase.local to .env.local:"
echo "     cp .env.supabase.local .env.local"
echo ""
echo "  3. Run the dev server:"
echo "     npm run dev"
echo ""
echo "  4. Verify in browser:"
echo "     http://localhost:5173"
echo ""
echo "📖 Documentation:"
echo "  - Supabase Local: docs/SUPABASE-LOCAL-SETUP.md"
echo "  - TypeScript Errors: docs/typescript-errors-analysis.md"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose down"
echo ""
echo "🔄 To start again:"
echo "   docker-compose up -d"
echo ""

# ============================================
# 11. Cleanup on Exit (optional)
# ============================================
echo -e "${YELLOW}ℹ️  Setup script completed${NC}"
echo ""
echo "If you encounter issues, check:"
echo "  - docker-compose logs postgres"
echo "  - docker-compose logs kong"
echo "  - http://localhost:3001 (Studio)"
echo ""
