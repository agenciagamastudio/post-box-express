# EPIC D — Setup Instagram (ação do usuário)

**Status:** ⛔ Bloqueado (externo) · **PRD:** [../PRD.md](../PRD.md) · **Guia:** [../guides/META-SETUP.md](../guides/META-SETUP.md)
**Fluxo:** Instagram Business Login (Instagram API com login do Instagram — **sem Página do Facebook**).
**Executor:** Usuário (conta Meta/Instagram) · **Configura `.env`:** @devops (Gage)
**Handoff:** `Usuário (app Instagram) → @devops (preenche server/.env + reinicia) → desbloqueia @dev no Epic E`

## Objetivo
Ter um app na Meta com o produto **Instagram (login do Instagram)** e uma conta Instagram
Business/Creator de teste apta a publicar via API.

## Por que é do usuário (não do assistente)
Criar o app e converter/conectar a conta exige login na conta do usuário (navegador + 2FA) e
aceitar o convite de testador dentro do app do Instagram. Não há API para isso em nome de
terceiros. **O assistente não executa este epic** — apenas guia ([guia](../guides/META-SETUP.md)) e valida.

## Dependências
- Conta Instagram do usuário.

## Riscos do Epic
- Convite de testador não aceito → login nega permissão (causa nº 1 de falha).
- IG ainda pessoal → API não conecta (precisa Business/Creator).
- IG_APP_SECRET é sensível — só no `.env`, fora do Git.

---

## Story D.1 — Pré-requisitos Instagram
**História:** Como dono, quero um app com Instagram Login + conta IG Business, para autorizar a publicação automática.
**Valor de negócio:** destrava toda a publicação real (Epics E/F).
**Estimativa:** S–M (esforço do usuário ~15–20 min).
**Escopo**
- **IN:** conta IG Business/Creator; app na Meta; produto Instagram (login do IG); redirect URI; testador; entrega das credenciais.
- **OUT:** App Review (produção); domínio de produção; login via Facebook.
**Dependências:** —.
**Riscos:** ver “Riscos do Epic”.

**Critérios de aceite (Given/When/Then)**
- **AC1:** Dado o IG em conta profissional, Quando abro o app do Instagram, Então a conta é Business/Creator.
- **AC2:** Dado o produto Instagram (login do Instagram) configurado, Quando abro Business login settings, Então obtenho **IG_APP_ID** e **IG_APP_SECRET**.
- **AC3:** Dado o OAuth, Quando inspeciono as redirect URIs, Então consta `http://localhost:8787/auth/instagram/callback`.
- **AC4:** Dado o convite de testador, Quando aceito no app do Instagram, Então a conta fica apta a autorizar.
- **AC5:** Dado o handoff, Quando entrego IG_APP_ID/SECRET, Então @devops preenche `server/.env` e reinicia o backend sem erro.

**Definition of Done**
- [ ] AC1–AC5 verdes · [ ] credenciais no `.env` (não no Git) · [ ] backend reinicia com `IG_APP_ID` setado.

### Tasks

#### D.1.1 — Converter IG em Business/Creator · Usuário · ⛔
- **Inputs:** conta Instagram.
- **Outputs:** conta profissional (Business/Creator).
- **Passos:** IG → Configurações → Conta → Mudar para conta profissional → Empresa/Criador.
- **Pré:** —. **Pós:** conta apta à API (sem precisar de Página FB).

#### D.1.2 — Criar App na Meta · Usuário · ⛔
- **Inputs:** developers.facebook.com.
- **Outputs:** app `GamaGit`.
- **Passos:** Criar app (caso de uso "Outro"/Empresa).
- **Pré:** —. **Pós:** app criado.

#### D.1.3 — Produto Instagram (login do Instagram) · Usuário · ⛔
- **Inputs:** app criado.
- **Outputs:** produto Instagram configurado no modo "API com login do Instagram".
- **Passos:** Adicionar produto → Instagram → "Instagram API setup with Instagram login".
- **Pré:** D.1.2. **Pós:** Business login settings disponível.

#### D.1.4 — IG_APP_ID + IG_APP_SECRET · Usuário · ⛔
- **Inputs:** Instagram → Business login settings.
- **Outputs:** ID e secret do **app do Instagram** copiados.
- **Passos:** copiar "ID do app do Instagram" e "chave secreta do app do Instagram".
- **Pré:** D.1.3. **Pós:** credenciais em mãos.

#### D.1.5 — Redirect URI · Usuário · ⛔
- **Inputs:** Business login settings → OAuth redirect URIs.
- **Outputs:** `http://localhost:8787/auth/instagram/callback` cadastrada.
- **Passos:** colar a URI e salvar.
- **Pré:** D.1.3. **Pós:** callback aceito.

#### D.1.6 — Testador do Instagram · Usuário · ⛔
- **Inputs:** Instagram → Roles → Instagram testers.
- **Outputs:** conta de teste apta (convite aceito).
- **Passos:** 1) adicionar @usuário; 2) aceitar em IG → Apps e sites → Convites de testador.
- **Pré:** D.1.3. **Pós:** login de teste liberado.

#### D.1.7 — Entregar credenciais · Usuário → @devops · ⛔
- **Inputs:** IG_APP_ID + IG_APP_SECRET.
- **Outputs:** `server/.env` preenchido; backend reiniciado.
- **Passos:** 1) usuário envia; 2) @devops seta `IG_APP_ID/SECRET`; 3) reinicia e valida `/health`.
- **Pré:** D.1.4. **Pós:** Epics E/F desbloqueados.

## Entrada para o handoff
```
IG_APP_ID=...
IG_APP_SECRET=...
```
Ao receber, **@devops (Gage)** preenche `server/.env`, reinicia o backend e libera **@dev** nos Epics E/F.
