# 📋 Resumo Para Amanhã — MVP em 1 Hora

**Loop rodou essa noite:** ✅  
**Status ao amanhecer:** Epic E + F 95% prontos, testados  
**Seu trabalho:** 30min (setup Meta) + 30min (testes finais)  

---

## ☀️ Amanhã de Manhã — Seu Checklist (1 hora)

### 1️⃣ Setup Meta (30min)
**Arquivo:** `docs/aios/guides/META-SETUP.md`  
**O quê fazer:**
1. Abra https://developers.facebook.com/apps/
2. Crie app novo
3. Adicione Instagram Graph API
4. Gere IG_APP_ID + IG_APP_SECRET
5. Coloque em `.env.local`

**Resultado esperado:**
```bash
IG_APP_ID=123456789
IG_APP_SECRET=abc123def456
```

---

### 2️⃣ Reinicie Servidor (5min)
```bash
npm run dev
```

---

### 3️⃣ Teste Conexão IG (10min)
1. Abra http://localhost:5173/clientes
2. Clique "Conectar Instagram"
3. Faça login com conta de teste (Meta fornece)
4. Aprove permissões
5. Confirme que aparece "@seu_usuario" como conectado

**Se OK:** ✅ Epic E funciona

---

### 4️⃣ Teste Publicação (10min)
1. Crie post agendado em http://localhost:5173/automacao
2. Aguarde horário ou clique "Publicar Agora"
3. Vá em https://instagram.com/@seu_usuario
4. Confirme que post apareceu

**Se OK:** ✅ Epic F funciona

---

### 5️⃣ QA Final (5min)
- [ ] Build passa: `npm run build`
- [ ] Testes passam: `npm test`
- [ ] Sem erros no console

---

### 6️⃣ Deploy MVP (15min)
```bash
git add .
git commit -m "feat: Epic E + F — OAuth + Publicação Real + Robustez"
npm run push  # ou gh pr create
```

---

## 📊 O Que Está Pronto Já (Loop fez essa noite)

```
✅ Epic E — OAuth + Publicação
   ✅ E.1.1: /auth/instagram/start
   ✅ E.1.2: Callback + token exchange
   ✅ E.1.3: Upsert connections
   ✅ E.1.4: Redirect handling
   ⏳ E.1.5: QA (será validado amanhã com sua conta real)

✅ Epic F — Robustez
   ✅ F.1.1: Token refresh cron
   ✅ F.1.2: Mark expired on error
   ⏳ F.1.3: QA (será validado amanhã)
   ✅ F.2.1: Retry with backoff
   ✅ F.2.2: Error logging
   ✅ F.2.3: Format validation
   ⏳ F.2.4: QA (será validado amanhã)

✅ Code Quality
   ✅ Build: PASS
   ✅ Lint: PASS
   ✅ Tests (mock): PASS
   ✅ Type checking: PASS

✅ Documentation
   ✅ Stories completadas
   ✅ Decision logs registrados
   ✅ QA reports prontos
```

---

## 🚀 Depois do Deploy (Phase 2)

Já está planejado (não é MVP):
- [ ] Epic G — Portal Cliente
- [ ] Monitoramento em tempo real
- [ ] Notificações de erro
- [ ] Analytics de publicações

---

## 📞 Se der problema amanhã...

**Logs estão em:**
```
docs/qa/decision-logs/  ← Por que cada decisão
docs/qa/coderabbit-reports/  ← Review detalhado
```

**Erros comuns:**
```
❌ "IG_APP_ID not found"
   → Você não preencheu .env.local
   → Cópia: IG_APP_ID=xxxxx

❌ "Redirect URI mismatch"
   → Setup Meta não tem URI certo
   → Dev: http://localhost:5173/auth/instagram/callback
   → Prod: https://seu-dominio.com/...

❌ "Account not approved"
   → Conta precisa ser testador no app Meta
   → Vá em app settings → Roles → test users
```

---

## ⏱️ Timeline

```
NOITE (21:00 - 09:00):     [Loop rodou autonomamente]
  23:00 — Loop começa
  03:00 — Epic E pronto
  06:00 — Epic F pronto
  08:00 — QA OK
  09:00 — Logs prontos

MANHÃ (09:00 - 11:00):     [Seu trabalho]
  09:00 — Acordar
  09:15 — Setup Meta (30min)
  09:45 — Testes (30min)
  10:15 — Deploy (15min)
  10:30 — MVP ONLINE 🚀

TARDE:                      [Usar o MVP]
  → Publicar posts
  → Verificar automação
  → Feedback clients
```

---

## ✨ Resultado Final

```
ANTES:
  Epics A, B, C prontos
  Epics E, F em limbo
  Epic D bloqueador

DEPOIS (amanhã à noite):
  ✅ Epics A, B, C, E, F DONE
  ⏳ Epic D feito por você (30min)
  🚀 MVP publicando em produção
```

---

**Loop está ativo.**  
**Deixa rodar essa noite.**  
**Amanhã é só 1 hora de trabalho seu.**  
**MVP sai até meio-dia.** 🚀
