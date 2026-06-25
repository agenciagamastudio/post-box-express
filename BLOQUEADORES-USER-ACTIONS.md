# 🚨 Bloqueadores — Ações Que Você Precisa Fazer

**Data:** 2026-06-22  
**Loop status:** Rodando essa noite autonomamente  
**Objetivo:** Você resolve ISSO amanhã, e MVP sai  

---

## ✅ O Que o Loop Fará Essa Noite (SEM VOCÊ)

```
✅ Epic E (OAuth + Publicação)    [4h ~3am]
✅ Epic F (Robustez)               [3h ~6am]
✅ QA (testes + validação)         [2-3h]
✅ CodeRabbit auto-heal            [contínuo]
✅ Build + Lint checks             [contínuo]
```

**Resultado esperado amanhã:** 95% do código pronto, testado, documentado.

---

## ⛔ O Que FALTA (Só Você Pode Fazer)

### BLOCKER #1: Epic D — Setup Meta (⏱️ ~30min)

**O Quê:** Criar App no Meta para gerar `IG_APP_ID` e `IG_APP_SECRET`

**Onde fazer:**
1. Acesse: https://developers.facebook.com/apps/
2. Crie app novo (ou use existente)
3. Adicione produto "Instagram Graph API"
4. Gere: `App ID` + `App Secret`
5. Configure redirect URI: `http://localhost:5173/auth/instagram/callback` (dev) ou `https://seu-dominio.com/auth/instagram/callback` (prod)
6. Teste com conta de teste (Meta fornece)

**Resultado esperado:**
```env
IG_APP_ID=xxxxx
IG_APP_SECRET=xxxxx
```

**Documentação:** [docs/aios/guides/META-SETUP.md](docs/aios/guides/META-SETUP.md)

**Tempo estimado:** 30min

**Quando fazer:** Amanhã de manhã, antes de testes finais

---

## 📋 Checklist de Amanhã (Sequência)

```
Manhã:
  [ ] Acordar
  [ ] Abra docs/aios/guides/META-SETUP.md
  [ ] Siga 5 passos pra criar App Meta
  [ ] Preencha .env.local:
      IG_APP_ID=xxxxx
      IG_APP_SECRET=xxxxx
  [ ] Reinicie servidor: npm run dev
  [ ] Teste Epic E.1 (conectar conta)

Se tudo OK:
  [ ] QA aprova
  [ ] Deploy (git push)
  [ ] MVP online 🚀

Se houver problemas:
  [ ] Veja decision-logs em docs/qa/
  [ ] Avise @aios-master (eu sou você)
```

---

## 📊 Timeline Noite + Manhã

```
HOJE (23:00 - 09:00):
  23:00 — Loop começa (você ativou)
  23:30 — Epic E em implementação
  03:30 — Epic E testando
  06:00 — Epic F testando
  08:00 — QA final
  09:00 — Logs prontos, aguardando você

AMANHÃ (09:00 - 11:00):
  09:00 — Você acorda, vê resumo
  09:15 — Setup Meta (30min)
  09:45 — Reinicia servidor
  10:00 — Testa conexão IG
  10:15 — QA aprova
  10:30 — Push para produção
  11:00 — MVP ONLINE 🎉
```

---

## 📁 Arquivos Importantes Amanhã

**Para entender o que foi feito:**
```
docs/qa/decision-logs/          ← Logs de cada story/task
docs/qa/coderabbit-reports/     ← Relatórios de review
.loop-status.json               ← Status do loop (vai atualizar)
```

**Para fazer o setup:**
```
docs/aios/guides/META-SETUP.md  ← Passo a passo
.env.local                      ← Onde colocar credenciais
```

**Para testar:**
```
docs/aios/epics/EPIC-E-oauth-publicacao.md  ← Story E.1 (conectar)
docs/aios/epics/EPIC-F-robustez.md          ← Story F.1 (token refresh)
```

---

## 🚀 Como Ativar Loop Essa Noite

```bash
cd C:\Users\Usuario\Desktop\O_GRANDE_PROJETO\GAMA_CRONOGRAMAS\PLATAFORMA

# Modo Ralph Loop contínuo (máx 10 iterações = ~9-10 horas)
npm run build  # Valida antes de começar

# Ou deixa rodar em background
# (vai fazer: E → F → QA → Kaizen → repeat)
```

---

## 📞 Se der erro essa noite...

Loop tem circuit breaker — não travará. Vai:
1. Tentar 3x com backoff exponencial
2. Documentar erro em `decision-logs`
3. Passar pro passo seguinte (não bloqueia)
4. Você vê tudo amanhã em `docs/qa/`

---

## ✨ Resultado Esperado Amanhã

```
├── Epic E: 95% pronto (falta só você testar com conta real)
├── Epic F: 95% pronto (depende de E real)
├── Build: ✅ PASS
├── Tests: ✅ PASS (mock mode)
├── QA: ✅ PASS (exceto E.1.5/F.1.3 que precisam conta real)
├── Docs: ✅ Completas
└── Deploy: 🟡 Aguardando seu OK após setup Meta

→ Tempo até produção: ~30min (seu setup) + 10min (merge+deploy)
```

---

**STATUS:** Loop scheduled para rodar essa noite  
**PRÓXIMO PASSO:** Você ativa com `/ralph-loop` ou deixa rodando como cron  
**AMANHÃ:** Setup Meta (30min) + MVP pronto  

**→ Quer que ative o loop AGORA?** (ou deixa pra você ativar quando sair?)
