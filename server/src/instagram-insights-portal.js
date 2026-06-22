// Instagram Insights Portal — Shareable reports with tokens
// Route: /api/instagram/insights/portal/*

import { Router } from "express";
import { admin } from "./supabase.js";
import { fetchInsights } from "./instagram-graph.js";
import crypto from "crypto";

const router = Router();

/**
 * POST /api/instagram/insights/generate-link
 * Gera um novo link compartilhável para um relatório de insights
 */
router.post("/generate-link", async (req, res) => {
  try {
    const { accountId, clientId, period = "30days" } = req.body;

    if (!accountId || !clientId) {
      return res.status(400).json({ error: "accountId e clientId são obrigatórios" });
    }

    // Validar que a conta pertence ao cliente
    const { data: conn } = await admin
      .from("instagram_connections")
      .select("id, client_id, ig_user_id, ig_username")
      .eq("id", accountId)
      .eq("client_id", clientId)
      .single();

    if (!conn) {
      return res
        .status(404)
        .json({ error: "Conta Instagram não encontrada ou não pertence a este cliente" });
    }

    // Gerar token aleatório (32 caracteres)
    const token = crypto.randomBytes(16).toString("hex");

    // Salvar no banco
    const { error } = await admin.from("instagram_report_links").insert({
      client_id: clientId,
      instagram_account_id: accountId,
      token,
      period,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (error) throw error;

    const APP_URL = process.env.APP_URL || "http://localhost:8787";
    const url = `${APP_URL}/api/portal/insights/${token}`;

    res.json({
      token,
      url,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    console.error("[generate-link error]", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/portal/insights/:token
 * Retorna HTML bonito com o relatório de insights
 */
router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Validar token e verificar se expirou
    const { data: link } = await admin
      .from("instagram_report_links")
      .select("client_id, instagram_account_id, period, expires_at, views_count")
      .eq("token", token)
      .single();

    if (!link) {
      return res.status(404).send("<h1>❌ Link inválido ou expirado</h1>");
    }

    if (new Date(link.expires_at) < new Date()) {
      return res.status(404).send("<h1>❌ Este link expirou</h1>");
    }

    // 2. Buscar conexão Instagram
    const { data: conn } = await admin
      .from("instagram_connections")
      .select("id, ig_user_id, access_token, ig_username, client_id")
      .eq("id", link.instagram_account_id)
      .single();

    if (!conn) {
      return res.status(404).send("<h1>❌ Conta não encontrada</h1>");
    }

    // 3. Buscar insights da Graph API
    const insightsResponse = await fetchInsights(conn.ig_user_id, conn.access_token, link.period);
    const insights = insightsResponse.insights || [];

    if (insights.length === 0) {
      return res.status(404).send("<h1>❌ Sem dados de insights disponíveis</h1>");
    }

    // 4. Transformar dados
    const reachData = insights.find((m) => m.name === "reach");
    if (!reachData || !reachData.values) {
      return res.status(404).send("<h1>❌ Dados de alcance não disponíveis</h1>");
    }

    const values = reachData.values;
    const total = values.reduce((sum, v) => sum + v.value, 0);
    const average = Math.round(total / values.length);
    const maxValue = Math.max(...values.map((v) => v.value));

    // 5. Formatar datas
    const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const formattedValues = values.map((v) => ({
      date: dateFormatter.format(new Date(v.end_time)),
      value: v.value,
    }));

    // 6. Gerar HTML com GAMA Design System V3
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Instagram - ${conn.ig_username}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #88CE11;
      --primary-dark: #6ba30d;
      --background: #0a0a0a;
      --surface: #161616;
      --surface-light: #272727;
      --text: #ffffff;
      --text-muted: #a1a1a1;
      --border: #333333;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, var(--background) 0%, var(--surface) 100%);
      color: var(--text);
      padding: 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }

    .header h1 {
      font-size: 32px;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 8px;
      background: linear-gradient(135deg, var(--primary) 0%, #a4d724 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header .account {
      font-size: 18px;
      color: var(--text);
      margin-bottom: 4px;
      font-weight: 600;
    }

    .header .period {
      font-size: 14px;
      color: var(--text-muted);
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .metric {
      background: linear-gradient(135deg, var(--surface-light) 0%, rgba(136, 206, 17, 0.05) 100%);
      border: 1px solid rgba(136, 206, 17, 0.2);
      color: var(--text);
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      transition: all 0.3s ease;
    }

    .metric:hover {
      border-color: var(--primary);
      box-shadow: 0 0 20px rgba(136, 206, 17, 0.1);
    }

    .metric h3 {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .metric .value {
      font-size: 36px;
      font-weight: 800;
      color: var(--primary);
    }

    .chart-section {
      margin-bottom: 40px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chart-container {
      position: relative;
      height: 300px;
      background: var(--surface-light);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }

    .table-section {
      margin-bottom: 40px;
    }

    .table-container {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    thead {
      background: var(--surface-light);
      border-bottom: 2px solid var(--border);
    }

    th {
      padding: 16px;
      text-align: left;
      font-weight: 600;
      color: var(--text);
    }

    td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }

    tbody tr:hover {
      background: rgba(136, 206, 17, 0.05);
    }

    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 12px;
    }

    .badge {
      display: inline-block;
      background: var(--primary);
      color: var(--background);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      margin-top: 12px;
    }

    @media print {
      body { background: var(--background); padding: 0; }
      .container { box-shadow: none; border: none; }
      .metric { page-break-inside: avoid; }
    }

    @media (max-width: 768px) {
      .container { padding: 20px; }
      .header h1 { font-size: 24px; }
      .metric .value { font-size: 28px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Relatório de Alcance</h1>
      <div class="account">@${conn.ig_username}</div>
      <div class="period">${formattedValues[0]?.date} até ${formattedValues[formattedValues.length - 1]?.date}</div>
      <div class="badge">✨ Instagram Insights</div>
    </div>

    <div class="metrics">
      <div class="metric">
        <h3>Alcance Total</h3>
        <div class="value">${total.toLocaleString("pt-BR")}</div>
      </div>
      <div class="metric">
        <h3>Dias Monitorados</h3>
        <div class="value">${values.length}</div>
      </div>
      <div class="metric">
        <h3>Média por Dia</h3>
        <div class="value">${average.toLocaleString("pt-BR")}</div>
      </div>
    </div>

    <div class="chart-section">
      <h2 class="section-title">📈 Evolução Diária</h2>
      <div class="chart-container">
        <canvas id="chart"></canvas>
      </div>
    </div>

    <div class="table-section">
      <h2 class="section-title">📋 Dados Detalhados</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th style="text-align: right;">Alcance</th>
            </tr>
          </thead>
          <tbody>
            ${formattedValues.map((row) => `<tr><td>${row.date}</td><td style="text-align: right; color: #88CE11; font-weight: 600;">${row.value.toLocaleString("pt-BR")}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      Relatório gerado em ${new Date().toLocaleString("pt-BR")} 🔒<br>
      <span style="color: #88CE11;">● Link válido por 30 dias</span>
    </div>
  </div>

  <script>
    const chartData = {
      labels: ${JSON.stringify(formattedValues.map((v) => v.date))},
      datasets: [
        {
          label: "Alcance",
          data: ${JSON.stringify(formattedValues.map((v) => v.value))},
          borderColor: "#88CE11",
          backgroundColor: "rgba(136, 206, 17, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: "#88CE11",
          pointBorderColor: "#161616",
          pointBorderWidth: 2,
          pointHoverRadius: 7,
        },
      ],
    };

    const ctx = document.getElementById("chart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: ${Math.ceil((maxValue * 1.1) / 10) * 10},
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: {
              color: "rgba(255, 255, 255, 0.7)",
              callback: function(value) {
                return value.toLocaleString("pt-BR");
              },
            },
          },
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: 10,
              color: "rgba(255, 255, 255, 0.7)",
            },
          },
        },
      },
    });
  </script>
</body>
</html>
    `;

    // 7. Atualizar views
    await admin
      .from("instagram_report_links")
      .update({
        views_count: (link.views_count || 0) + 1,
        last_viewed: new Date().toISOString(),
      })
      .eq("token", token);

    res.type("text/html").send(html);
  } catch (err) {
    console.error("[portal error]", err.message);
    res.status(500).send("<h1>❌ Erro ao carregar relatório</h1>");
  }
});

export default router;
