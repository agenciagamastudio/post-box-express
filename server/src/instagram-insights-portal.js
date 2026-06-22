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
      return res.status(404).json({ error: "Conta Instagram não encontrada ou não pertence a este cliente" });
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

    // 6. Gerar HTML
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Instagram - ${conn.ig_username}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }

    .header h1 {
      font-size: 28px;
      color: #333;
      margin-bottom: 8px;
    }

    .header .account {
      font-size: 18px;
      color: #666;
      margin-bottom: 4px;
    }

    .header .period {
      font-size: 14px;
      color: #999;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .metric {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .metric h3 {
      font-size: 13px;
      opacity: 0.9;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric .value {
      font-size: 36px;
      font-weight: 700;
    }

    .chart-section {
      margin-bottom: 40px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
    }

    .chart-container {
      position: relative;
      height: 300px;
      background: #f9f9f9;
      border-radius: 12px;
      padding: 20px;
    }

    .table-section {
      margin-bottom: 40px;
    }

    .table-container {
      overflow-x: auto;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    thead {
      background: #f9f9f9;
    }

    th {
      padding: 16px;
      text-align: left;
      border-bottom: 2px solid #e0e0e0;
      font-weight: 600;
      color: #333;
    }

    td {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      color: #666;
    }

    tbody tr:hover {
      background: #f9f9f9;
    }

    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      color: #999;
      font-size: 12px;
    }

    .badge {
      display: inline-block;
      background: #e8f0fe;
      color: #1967d2;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
    }

    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; padding: 0; }
      .metric { page-break-inside: avoid; }
    }

    @media (max-width: 768px) {
      .container { padding: 20px; }
      .header h1 { font-size: 22px; }
      .metric .value { font-size: 28px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Relatório Instagram</h1>
      <div class="account">${conn.ig_username}</div>
      <div class="period">${formattedValues[0]?.date} até ${formattedValues[formattedValues.length - 1]?.date}</div>
      <div class="badge">Alcance</div>
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
        <h3>Média/Dia</h3>
        <div class="value">${average.toLocaleString("pt-BR")}</div>
      </div>
    </div>

    <div class="chart-section">
      <h2 class="section-title">Evolução Diária</h2>
      <div class="chart-container">
        <canvas id="chart"></canvas>
      </div>
    </div>

    <div class="table-section">
      <h2 class="section-title">Dados Detalhados</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Alcance</th>
            </tr>
          </thead>
          <tbody>
            ${formattedValues.map((row) => `<tr><td>${row.date}</td><td>${row.value.toLocaleString("pt-BR")}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      Relatório gerado em ${new Date().toLocaleString("pt-BR")}
      <br>
      Este link expira em 30 dias
    </div>
  </div>

  <script>
    const chartData = {
      labels: ${JSON.stringify(formattedValues.map((v) => v.date))},
      datasets: [
        {
          label: "Alcance",
          data: ${JSON.stringify(formattedValues.map((v) => v.value))},
          borderColor: "#667eea",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#667eea",
          pointBorderColor: "white",
          pointBorderWidth: 2,
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
            ticks: {
              callback: function(value) {
                return value.toLocaleString("pt-BR");
              },
            },
          },
          x: {
            ticks: {
              maxTicksLimit: 10,
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
