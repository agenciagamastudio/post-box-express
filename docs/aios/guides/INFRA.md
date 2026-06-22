# Infra — GamaGit (domínio único via ngrok)

**Status:** ✅ Funcionando (dev/protótipo) · **Domínio fixo:** `https://karate-ashes-rewash.ngrok-free.dev`

## Arquitetura (mesma origem)

Tudo é servido sob **uma única URL pública**. O frontend (Vite :8080) faz **proxy** das chamadas
de servidor para o backend Node (:8787):

```
Cliente / Agência
        │  HTTPS
        ▼
ngrok (domínio fixo)  →  Vite :8080 (frontend + páginas /review, /portal)
                              │ proxy
                              ├── /api/*           → Node :8787 (review, portal, ...)
                              ├── /auth/instagram  → Node :8787 (OAuth)
                              ├── /health          → Node :8787
                              └── /scheduler/*      → Node :8787
Node :8787 → Supabase (service role) + Instagram Graph API
```

Proxy definido em `vite.config.ts` (`vite.server.proxy` + `allowedHosts: true`).
API namespeada em `/api/*` para não colidir com as páginas `/review/:token` e `/portal/:token`.

## URLs

| Função                              | URL                                          |
| ----------------------------------- | -------------------------------------------- |
| App (agência)                       | `https://karate-ashes-rewash.ngrok-free.dev` |
| OAuth callback (registrado no Meta) | `…/auth/instagram/callback`                  |
| Link de aprovação (por post)        | `…/review/<token>`                           |
| Portal do cliente                   | `…/portal/<token>`                           |
| Health backend                      | `…/health`                                   |

## Como subir

```
bash start-all.sh    # backend :8787 + frontend :8080 + ngrok no domínio fixo
```

Ou manual: `cd server && node src/index.js` · `bun run dev` · `ngrok http 8080 --url=karate-ashes-rewash.ngrok-free.dev`.

## Variáveis (server/.env)

- `APP_URL=https://karate-ashes-rewash.ngrok-free.dev`
- `IG_OAUTH_REDIRECT=https://karate-ashes-rewash.ngrok-free.dev/auth/instagram/callback`
- `IG_APP_ID` / `IG_APP_SECRET` (produto Instagram do app Meta)
- `PUBLISH_MOCK=false` (publicação real)

## Limitações (por enquanto)

- ngrok grátis: tela de aviso na 1ª visita do cliente + limite de requisições.
- Depende do PC ligado rodando `start-all.sh`.
- **Produção real:** trocar por ngrok pago (sem aviso) ou deploy (Vercel/Fly/VPS). Ao migrar,
  atualizar `APP_URL`, `IG_OAUTH_REDIRECT` e a **redirect URI no Meta** para o novo domínio.

## Se o domínio mudar

Atualizar em 3 lugares: `server/.env` (APP_URL + IG_OAUTH_REDIRECT), `start-all.sh` (DOMAIN),
e a **redirect URI** no app do Meta (Instagram → Business login settings).
