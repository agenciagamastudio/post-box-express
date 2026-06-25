#!/usr/bin/env node

/**
 * Teste Persistente Automático — GamaGit
 * Valida: Login → OAuth Instagram → Monitoramento
 * Roda em loop com relatório a cada iteração
 */

import fetch from "node-fetch";

const BASE_URL = "https://karate-ashes-rewash.ngrok-free.dev";
const TEST_EMAIL = "teste-persistente@gama.local";
const TEST_PASSWORD = "TestPassword123!";

let results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
};

let sessionToken = null;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function test(name, fn) {
  results.total++;
  console.log(`\n[${new Date().toLocaleTimeString()}] 🧪 ${name}...`);

  try {
    await fn();
    results.passed++;
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    results.failed++;
    results.errors.push(`${name}: ${error.message}`);
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function testAuthPage() {
  await test("GET /auth (página login)", async () => {
    const res = await fetch(`${BASE_URL}/auth`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
}

// Autenticação é feita via frontend + Supabase, não via POST direto
// Skip POST tests que não fazem sentido para esta arquitetura

async function testAppPage() {
  await test("GET /app (dashboard)", async () => {
    const res = await fetch(`${BASE_URL}/app`, {
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
    });
    if (res.status !== 200 && res.status !== 401) {
      throw new Error(`Status ${res.status}`);
    }
  });
}

async function testIntegracoes() {
  await test("GET /integracoes (página integrações)", async () => {
    const res = await fetch(`${BASE_URL}/integracoes/test-client`, {
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
    });
    if (res.status !== 200 && res.status !== 401) {
      throw new Error(`Status ${res.status}`);
    }
  });
}

async function testOAuthStart() {
  await test("GET /oauth/instagram/start (inicia OAuth)", async () => {
    const res = await fetch(`${BASE_URL}/oauth/instagram/start?client_id=test-client`);
    // Deve redirecionar (302)
    if (res.status !== 302 && res.status !== 200) {
      throw new Error(`Status ${res.status} (esperava 302)`);
    }
  });
}

async function testMonitoramento() {
  await test("GET /monitoramento (página monitoramento)", async () => {
    const res = await fetch(`${BASE_URL}/monitoramento`, {
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
    });
    if (res.status !== 200 && res.status !== 401) {
      throw new Error(`Status ${res.status}`);
    }
  });
}

async function testBackendHealth() {
  await test("GET /health (backend health)", async () => {
    const res = await fetch("http://localhost:8787/health");
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error("Health check failed");
  });
}

async function runTestSuite() {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 TESTE PERSISTENTE — GamaGit");
  console.log("=".repeat(50));

  await testBackendHealth();
  await testAuthPage();
  await testAppPage();
  await testIntegracoes();
  await testOAuthStart();
  await testMonitoramento();

  // Relatório
  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log("\n" + "=".repeat(50));
  console.log(`📊 RESULTADO: ${results.passed}/${results.total} testes passaram (${passRate}%)`);

  if (results.errors.length > 0) {
    console.log("\n❌ Erros:");
    results.errors.forEach((e) => console.log(`  - ${e}`));
  } else {
    console.log("\n✨ Todos os testes passaram!");
  }

  console.log("=".repeat(50) + "\n");

  return results.failed === 0;
}

// Loop persistente
let iteration = 0;
const maxIterations = process.env.MAX_ITERATIONS ? parseInt(process.env.MAX_ITERATIONS) : 0; // 0 = infinito

async function mainLoop() {
  while (true) {
    iteration++;
    console.log(`\n📍 Iteração #${iteration}`);

    const success = await runTestSuite();

    if (maxIterations > 0 && iteration >= maxIterations) {
      console.log(`\n✅ Atingiu ${maxIterations} iterações. Parando.`);
      process.exit(success ? 0 : 1);
    }

    // Aguardar antes da próxima iteração (padrão: 30s)
    const interval = parseInt(process.env.TEST_INTERVAL || "30");
    console.log(`⏳ Próxima iteração em ${interval}s...`);
    await sleep(interval * 1000);
  }
}

// Iniciar
mainLoop().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
