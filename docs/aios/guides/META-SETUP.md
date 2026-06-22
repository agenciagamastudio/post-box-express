# Guia passo-a-passo — Instagram Business Login (GamaGit)

Objetivo: criar e configurar o app para o GamaGit publicar no Instagram usando
**Instagram API com login do Instagram** (Instagram Business Login) — o mesmo fluxo do
"Pode Postar". **Não exige Página do Facebook.** Ao final você terá **IG_APP_ID** e
**IG_APP_SECRET** para me enviar.

> ⏱️ ~15–20 min. Gratuito. Publicação com **conta de teste** não exige App Review.

---

## Passo 0 — Pré-requisito

- **Instagram Business ou Creator**: no app do Instagram → **Configurações → Conta → Mudar
  para conta profissional** → escolher **Empresa** (Business) ou **Criador**.
  (Não precisa de Página do Facebook neste fluxo.)

---

## Passo 1 — Criar o App na Meta

1. Acesse **https://developers.facebook.com/** → login → aceite os termos de dev.
2. **Meus Apps → Criar app**.
3. Em **Casos de uso**, escolha **"Outro"** → **Avançar** (ou tipo **Empresa**).
4. _Nome:_ `GamaGit` · _e-mail_ de contato → **Criar app**.

---

## Passo 2 — Adicionar o produto Instagram (login do Instagram)

1. No painel → **Adicionar produto** → **Instagram** → **Configurar**.
2. Escolha **"Instagram API configurada com login do Instagram"**
   (_Instagram API setup with Instagram login_) — **não** a opção "com login do Facebook".

---

## Passo 3 — Credenciais (IG_APP_ID / IG_APP_SECRET)

1. Ainda no produto **Instagram → Configuração da API → Login empresarial do Instagram**
   (_Business login settings_).
2. Copie:
   - **ID do app do Instagram** → será o **IG_APP_ID**
   - **Chave secreta do app do Instagram** (_Instagram app secret_) → **IG_APP_SECRET** (clique Mostrar)

> 🔐 O secret é sensível — me envie por aqui que eu coloco no `server/.env` (fica fora do Git).

---

## Passo 4 — Redirect URI

Em **Login empresarial do Instagram → Configurações**, no campo **"URIs de redirecionamento
do OAuth"**, adicione **exatamente**:

```
http://localhost:8787/auth/instagram/callback
```

(Se pedir, preencha também _Deauthorize_ e _Data deletion_ com a mesma base, ex.:
`http://localhost:8787/deauth` e `/delete` — não usados agora, mas alguns formulários exigem.)
**Salvar.**

---

## Passo 5 — Adicionar sua conta como testadora

1. No produto **Instagram → Funções (Roles) → Testadores do Instagram**
   (_Instagram testers_) → **Adicionar pessoas** → digite seu **@usuário** do Instagram.
2. **Aceite o convite no Instagram:** app do IG → **Configurações → Apps e sites → Convites
   de testador (Tester invites)** → **Aceitar**.

> Sem aceitar o convite, o login retorna erro de permissão.

---

## Passo 6 — Escopos (informativo)

O backend já solicita: `instagram_business_basic`, `instagram_business_content_publish`,
`instagram_business_manage_insights`. Em modo de desenvolvimento funcionam para a conta de teste.

---

## Passo 7 — Me enviar

Cole aqui:

```
IG_APP_ID=...
IG_APP_SECRET=...
```

(opcional: o @ da conta Instagram de teste).

### O que eu faço em seguida (@devops → @dev)

1. Preencho `IG_APP_ID`/`IG_APP_SECRET` em `server/.env` e reinicio o backend.
2. Você abre **/clientes** e clica **"Conectar Instagram"** → login do Instagram → autorizar → volta conectado (`@usuário`).
3. Viro `PUBLISH_MOCK=false`.
4. Criamos um post **com imagem**, **Agendado** para ~2 min no futuro.
5. O scheduler publica sozinho → conferimos no **feed real** + `publish_log` com `external_id`.

---

## Erros comuns

| Mensagem                     | Causa                          | Solução                                                         |
| ---------------------------- | ------------------------------ | --------------------------------------------------------------- |
| redirect_uri não corresponde | URI do Passo 4 diferente       | Cole exatamente `http://localhost:8787/auth/instagram/callback` |
| Permissão/login negado       | Convite de testador não aceito | Aceite em IG → Apps e sites → Convites de testador (Passo 5)    |
| Conta inválida               | IG ainda pessoal               | Converta para Business/Creator (Passo 0)                        |
| invalid_client               | IG_APP_ID/SECRET errados       | Use os do **produto Instagram**, não os "Básico" do app         |

## Produção (depois do protótipo)

Publicar em contas de clientes reais exige **App Review** aprovando
`instagram_business_content_publish`. A redirect URI `localhost` é só para testes locais.
