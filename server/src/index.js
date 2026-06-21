import "dotenv/config";
import express from "express";
import cron from "node-cron";
import { runScheduler, runTokenRefresh, publishNow } from "./scheduler.js";
import { exchangeCodeForConnection, buildAuthUrl } from "./instagram.js";
import { instagramAccountsRouter } from "./instagram-accounts.js";
import instagramMonitoringRouter from "./instagram-monitoring.js";
import { admin } from "./supabase.js";

const APP_URL = process.env.APP_URL || "http://localhost:8080";

const app = express();
app.use(express.json());

// CORS — permite o frontend (8080) e páginas públicas chamarem este backend.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const PORT = process.env.PORT || 8787;
const CRON = process.env.SCHEDULER_CRON || "*/1 * * * *";

app.get("/", (_req, res) => {
  const mock = String(process.env.PUBLISH_MOCK).toLowerCase() === "true";
  const metaReady = !!process.env.IG_APP_ID;
  res.type("html").send(`<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<title>GamaGit Server</title><style>
body{font-family:system-ui,sans-serif;background:#161616;color:#fff;margin:0;padding:48px;line-height:1.6}
h1{font-weight:800}b{color:#88ce11}code{background:#272727;padding:2px 6px;border-radius:6px;color:#88ce11}
a{color:#88ce11}.card{background:#272727;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:16px 20px;margin:8px 0;max-width:640px}
.tag{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:700}
.on{background:rgba(136,206,17,.15);color:#88ce11}.off{background:rgba(255,255,255,.08);color:#a1a1aa}
</style></head><body>
<h1>Gama<b>Git</b> · backend</h1>
<p>Serviço de agendamento e publicação no Instagram.</p>
<div class="card">Publicação: <span class="tag ${mock ? "off" : "on"}">${mock ? "MOCK (simulada)" : "REAL"}</span>
&nbsp; Meta App: <span class="tag ${metaReady ? "on" : "off"}">${metaReady ? "configurado" : "pendente (Fase 2)"}</span>
&nbsp; Cron: <code>${process.env.SCHEDULER_CRON || "*/1 * * * *"}</code></div>
<div class="card"><b>Endpoints</b><br>
<code>GET /health</code> — status JSON<br>
<code>POST /scheduler/run</code> — dispara o agendador manualmente<br>
<code>GET /auth/instagram/start?client_id=…</code> — inicia conexão do Instagram (Fase 3)<br>
<code>GET /auth/instagram/callback</code> — retorno do OAuth (Fase 3)</div>
</body></html>`);
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "gamagit-server",
    mock: String(process.env.PUBLISH_MOCK).toLowerCase() === "true",
    cron: CRON,
    time: new Date().toISOString(),
  });
});

// Contas Instagram monitoradas (Fase 1: skeleton — Fase 2 implementa Graph API)
app.use("/api/instagram", instagramAccountsRouter);

// Instagram Monitoring — Fase 2: Insights, Comments, DMs
app.use("/api/instagram/monitoring", instagramMonitoringRouter);

// Publica um post imediatamente (ação manual da agência).
app.post("/api/posts/:id/publish", async (req, res) => {
  try {
    const result = await publishNow(req.params.id);
    res.status(result.ok ? 200 : 422).json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Dispara o scheduler manualmente (útil para testes)
app.post("/scheduler/run", async (_req, res) => {
  try {
    const summary = await runScheduler();
    res.json({ ok: true, ...summary });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Início do OAuth (Instagram Business Login). Enquanto o app do Instagram não
// estiver configurado (IG_APP_ID vazio), explica o que falta em vez de quebrar.
app.get("/auth/instagram/start", async (req, res) => {
  const clientId = req.query.client_id;
  if (!clientId) return res.status(400).send("Faltou client_id.");
  if (!process.env.IG_APP_ID) {
    // Sem credenciais reais: em modo mock, simula a conexão para testar o fluxo completo.
    if (String(process.env.PUBLISH_MOCK).toLowerCase() === "true") {
      const { error } = await admin.from("instagram_connections").upsert(
        {
          client_id: String(clientId),
          ig_user_id: `mock_${String(clientId).slice(0, 8)}`,
          ig_username: "@conta_demo",
          access_token: "mock-token",
          token_expires_at: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
          status: "connected",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id" }
      );
      const suffix = error ? `error&msg=${encodeURIComponent(error.message)}` : "connected&mock=1";
      return res.redirect(`${APP_URL}/integracoes/${clientId}?ig=${suffix}`);
    }
    return res
      .status(503)
      .send(
        "Conexão com Instagram ainda não disponível: o app do Instagram (IG_APP_ID/SECRET) precisa ser criado e configurado (Epic D)."
      );
  }
  res.redirect(buildAuthUrl(clientId));
});

// Callback do OAuth: troca code por token, descobre a conta IG e salva a conexão.
app.get("/auth/instagram/callback", async (req, res) => {
  const { code, state: clientId, error: oauthErr } = req.query;
  if (oauthErr) return res.redirect(`${APP_URL}/clientes?ig=error`);
  if (!code || !clientId) return res.status(400).send("Faltou code/state.");
  try {
    const conn = await exchangeCodeForConnection(String(code));
    const { error } = await admin.from("instagram_connections").upsert(
      {
        client_id: String(clientId),
        ig_user_id: conn.ig_user_id,
        ig_username: conn.ig_username,
        access_token: conn.access_token,
        token_expires_at: conn.token_expires_at,
        status: "connected",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "client_id" }
    );
    if (error) throw new Error(error.message);
    res.redirect(`${APP_URL}/clientes?ig=connected`);
  } catch (err) {
    console.error("[oauth callback]", err.message);
    res.redirect(`${APP_URL}/clientes?ig=error&msg=${encodeURIComponent(err.message)}`);
  }
});

// ===== Portal do cliente: aprovação de post via link público (sem login) =====
// GET: dados do post para o cliente revisar.
app.get("/api/review/:token", async (req, res) => {
  const { data: rev } = await admin
    .from("post_reviews")
    .select("status,comment,reviewer_name,post_id")
    .eq("token", req.params.token)
    .maybeSingle();
  if (!rev) return res.status(404).json({ error: "Link inválido ou expirado." });
  const { data: post } = await admin
    .from("posts")
    .select("title,caption,cover_url,status,format,network,client_id")
    .eq("id", rev.post_id)
    .maybeSingle();
  let clientName = null;
  if (post) {
    const { data: c } = await admin.from("clients").select("name").eq("id", post.client_id).maybeSingle();
    clientName = c?.name ?? null;
  }
  res.json({
    review: { status: rev.status, comment: rev.comment, reviewer_name: rev.reviewer_name },
    post: post ? { ...post, client_name: clientName } : null,
  });
});

// POST: decisão do cliente (aprovar ou pedir ajuste) + comentário.
app.post("/api/review/:token", async (req, res) => {
  const { decision, comment, reviewer_name } = req.body || {};
  if (!["approved", "changes"].includes(decision)) {
    return res.status(400).json({ error: "Decisão inválida." });
  }
  const { data: rev } = await admin
    .from("post_reviews")
    .select("id,post_id")
    .eq("token", req.params.token)
    .maybeSingle();
  if (!rev) return res.status(404).json({ error: "Link inválido ou expirado." });

  await admin
    .from("post_reviews")
    .update({
      status: decision === "approved" ? "approved" : "changes_requested",
      comment: comment || null,
      reviewer_name: reviewer_name || null,
      decided_at: new Date().toISOString(),
    })
    .eq("id", rev.id);
  await admin
    .from("posts")
    .update({ status: decision === "approved" ? "aprovado" : "ajuste" })
    .eq("id", rev.post_id);
  res.json({ ok: true });
});

// ===== Portal do cliente: calendário + status (somente leitura, via token) =====
app.get("/api/portal/:token", async (req, res) => {
  const { data: link } = await admin
    .from("client_portal_links")
    .select("client_id")
    .eq("token", req.params.token)
    .maybeSingle();
  if (!link) return res.status(404).json({ error: "Link inválido ou expirado." });
  const { data: client } = await admin.from("clients").select("name,handle").eq("id", link.client_id).maybeSingle();
  const { data: posts } = await admin
    .from("posts")
    .select("id,title,status,network,format,scheduled_at,published_at,cover_url")
    .eq("client_id", link.client_id)
    .order("scheduled_at", { ascending: true, nullsFirst: false });
  res.json({ client: client ?? null, posts: posts ?? [] });
});

// Aprovar / pedir ajuste direto do portal (decisão por post, validada pelo token do cliente).
app.post("/api/portal/:token/decision", async (req, res) => {
  const { post_id, decision, comment, reviewer_name } = req.body || {};
  if (!["approved", "changes"].includes(decision)) {
    return res.status(400).json({ error: "Decisão inválida." });
  }
  const { data: link } = await admin
    .from("client_portal_links")
    .select("client_id")
    .eq("token", req.params.token)
    .maybeSingle();
  if (!link) return res.status(404).json({ error: "Link inválido." });
  const { data: post } = await admin.from("posts").select("id,client_id").eq("id", post_id).maybeSingle();
  if (!post || post.client_id !== link.client_id) {
    return res.status(403).json({ error: "Post não pertence a este portal." });
  }
  await admin.from("post_reviews").insert({
    post_id,
    status: decision === "approved" ? "approved" : "changes_requested",
    comment: comment || null,
    reviewer_name: reviewer_name || null,
    decided_at: new Date().toISOString(),
  });
  await admin
    .from("posts")
    .update({ status: decision === "approved" ? "aprovado" : "ajuste" })
    .eq("id", post_id);
  res.json({ ok: true });
});

// Agendador automático
cron.schedule(CRON, async () => {
  const s = await runScheduler();
  if (s.processed) console.log(`[scheduler] ${new Date().toISOString()}`, s);
});

// F.1: refresh diário de tokens (03:00). No-op sem IG_APP_ID.
cron.schedule("0 3 * * *", async () => {
  const r = await runTokenRefresh();
  if (r.refreshed) console.log(`[token-refresh] ${new Date().toISOString()}`, r);
});

app.listen(PORT, () => {
  console.log(`GamaGit server on http://localhost:${PORT} | mock=${process.env.PUBLISH_MOCK} | cron="${CRON}"`);
});
